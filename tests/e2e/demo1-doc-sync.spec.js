"use strict";

const crypto = require("node:crypto");
const { spawn, spawnSync } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const docSyncPath = path.join(repositoryRoot, "docSync.js");
const bookFixturePath = path.join(repositoryRoot, "tests", "fixtures", "books.test-data.json");

/**
 * @typedef {{ id: string, title: string, author: string, genre: string, featured: boolean, expectedVisible: boolean }} BookFixture
 */
/**
 * @typedef {{ baselineRead: BookFixture[], positiveMutation: BookFixture[], negativeSecretChecks: string[] }} BookTestData
 */
/** @type {BookTestData} */
const bookTestData = JSON.parse(fs.readFileSync(bookFixturePath, "utf8"));

function validateBookTestData(data) {
  const expectedCollections = ["baselineRead", "negativeSecretChecks", "positiveMutation"];
  if (JSON.stringify(Object.keys(data).sort()) !== JSON.stringify(expectedCollections)) {
    throw new Error("Book test data must contain exactly the required three collections.");
  }

  const expectedFields = ["author", "expectedVisible", "featured", "genre", "id", "title"];
  for (const collectionName of ["baselineRead", "positiveMutation"]) {
    if (!Array.isArray(data[collectionName])) {
      throw new Error(`${collectionName} must be an array.`);
    }
    for (const book of data[collectionName]) {
      if (
        !book ||
        JSON.stringify(Object.keys(book).sort()) !== JSON.stringify(expectedFields) ||
        expectedFields.some((field) => typeof book[field] !== (field === "featured" || field === "expectedVisible" ? "boolean" : "string"))
      ) {
        throw new Error(`${collectionName} contains an invalid book fixture.`);
      }
    }
  }

  if (
    !Array.isArray(data.negativeSecretChecks) ||
    data.negativeSecretChecks.some((marker) => typeof marker !== "string" || !/^[A-Z][A-Z0-9_]*$/.test(marker))
  ) {
    throw new Error("negativeSecretChecks must contain marker names only.");
  }
}

validateBookTestData(bookTestData);

function withTempFolder(run) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "doc-sync-demo1-"));
  try {
    return run(folder);
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForServer(url, serverProcess) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error("Isolated bookstore server exited before becoming ready.");
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for the isolated bookstore server.");
}

async function stopServer(serverProcess) {
  if (serverProcess.exitCode !== null) return;
  serverProcess.kill();
  await Promise.race([
    once(serverProcess, "exit"),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);
}

test("CLI reports the scan and writes redacted Markdown for a markerless README", async () => {
  withTempFolder((temporaryRoot) => {
    const targetFolder = path.join(temporaryRoot, "sample-project");
    const readmeBefore = "# Human project notes\n\nKeep these notes unchanged.\n";
    const secretValue = crypto.randomBytes(16).toString("hex");
    fs.mkdirSync(targetFolder);
    fs.writeFileSync(path.join(targetFolder, "README.md"), readmeBefore);
    fs.writeFileSync(
      path.join(targetFolder, "server.js"),
      `/** Reads the catalog using ${bookTestData.negativeSecretChecks[0]}=${secretValue}. */\n` +
        'export function readBooks() { return []; }\n' +
        'app.get("/api/books", readBooks);\n',
    );

    const result = spawnSync(process.execPath, [docSyncPath, targetFolder], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Scanned 1 JavaScript file(s):");
    expect(result.stdout).toContain("- server.js");
    expect(result.stdout).toContain("Updated README.md generated section.");
    expect(result.stdout).toContain("Created API_DOCS.md generated section.");

    const readme = fs.readFileSync(path.join(targetFolder, "README.md"), "utf8");
    const apiDocs = fs.readFileSync(path.join(targetFolder, "API_DOCS.md"), "utf8");
    expect(readme.startsWith(readmeBefore)).toBe(true);
    expect((readme.match(/<!-- DOC-SYNC-START -->/g) || [])).toHaveLength(1);
    expect(apiDocs).toContain("| GET | /api/books | server.js |");
    expect(apiDocs).toContain("[REDACTED]");
    for (const output of [readme, apiDocs, result.stdout, result.stderr]) {
      expect(output.includes(secretValue)).toBe(false);
    }
  });
});

test("CLI selects its default target relative to an isolated repository copy", async () => {
  withTempFolder((temporaryRoot) => {
    const isolatedTarget = path.join(temporaryRoot, "bookstore-web-app");
    const isolatedCli = path.join(temporaryRoot, "docSync.js");
    fs.copyFileSync(docSyncPath, isolatedCli);
    fs.cpSync(path.join(repositoryRoot, "bookstore-web-app"), isolatedTarget, { recursive: true });
    const readmeBefore = fs.readFileSync(path.join(isolatedTarget, "README.md"), "utf8");
    const humanPrefix = readmeBefore.slice(0, readmeBefore.indexOf("<!-- DOC-SYNC-START -->"));

    const result = spawnSync(process.execPath, [isolatedCli], {
      cwd: temporaryRoot,
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`Target folder: ${isolatedTarget}`);
    expect(result.stdout).toContain("Scanned 2 JavaScript file(s):");
    expect(result.stdout).toContain("Updated README.md generated section.");
    expect(result.stdout).toContain("Updated API_DOCS.md generated section.");

    const readmeAfter = fs.readFileSync(path.join(isolatedTarget, "README.md"), "utf8");
    expect(readmeAfter.startsWith(humanPrefix)).toBe(true);
    expect((readmeAfter.match(/<!-- DOC-SYNC-START -->/g) || [])).toHaveLength(1);
  });
});

test("bookstore HTML preview and featured mutation stay in an isolated copy", async ({ page }) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bookstore-demo1-isolated-"));
  const temporaryApp = path.join(temporaryRoot, "bookstore-web-app");
  fs.cpSync(path.join(repositoryRoot, "bookstore-web-app"), temporaryApp, { recursive: true });

  const baseline = bookTestData.baselineRead[0];
  const mutation = bookTestData.positiveMutation[0];
  const toAppBook = (book) => ({
    title: book.title,
    author: book.author,
    category: book.genre,
    color: "#d8dfcc",
    textColor: "#17211b",
    isNewArrival: book.featured,
  });
  fs.writeFileSync(
    path.join(temporaryApp, "data", "books.json"),
    `${JSON.stringify([toAppBook(baseline)], null, 2)}\n`,
  );

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const serverProcess = spawn(
    process.execPath,
    [path.join(temporaryApp, "server.js")],
    {
      cwd: temporaryApp,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
      windowsHide: true,
    },
  );

  try {
    await waitForServer(baseUrl, serverProcess);
    await page.goto(baseUrl);
    await expect(page).toHaveTitle("Bookstore");
    await expect(page.getByRole("heading", { name: baseline.title })).toBeVisible();
    await expect(page.locator(".book-card")).toHaveCount(1);

    await page.getByLabel("Title").fill(mutation.title);
    await page.getByLabel("Author").fill(mutation.author);
    await page.getByLabel("Category").fill(mutation.genre);
    if (mutation.featured) {
      await page.getByLabel("Featured / New Arrival").check();
    }
    await page.getByRole("button", { name: "Add book" }).click();

    const addedBook = page
      .locator(".book-card")
      .filter({ has: page.getByRole("heading", { name: mutation.title }) });
    await expect(addedBook).toBeVisible();
    if (mutation.expectedVisible) await expect(addedBook.getByText("Featured / New Arrival")).toBeVisible();
    await expect(page.locator(".book-card")).toHaveCount(2);
    await page.reload();
    await expect(addedBook).toBeVisible();

    const catalog = JSON.parse(fs.readFileSync(path.join(temporaryApp, "data", "books.json"), "utf8"));
    expect(catalog).toHaveLength(2);
    expect(catalog.find((book) => book.title === mutation.title)).toMatchObject({
      author: mutation.author,
      category: mutation.genre,
      isNewArrival: mutation.featured,
    });
  } finally {
    await stopServer(serverProcess);
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const {
  collectJavaScriptFiles,
  generateDocumentation,
  redactSensitive,
  renderDocument,
} = require("../docSync");
const cliPath = path.join(__dirname, "..", "docSync.js");

function withTempFolder(run) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "doc-sync-demo-"));
  try {
    run(folder);
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

test("recursively discovers JavaScript and extracts documented functions and routes", () => {
  withTempFolder((folder) => {
    fs.mkdirSync(path.join(folder, "public"));
    fs.writeFileSync(
      path.join(folder, "server.js"),
      `/** Finds a book.
       * @param {string} id Book identifier
       * @returns {object} Matching book
       */
      function findBook(id) {}
      module.exports = { findBook };
      /** Searches the catalog.
       * @param {string} term Search term
       * @returns {Array} Matching books
       */
      export const searchBooks = (term) => [];
      app.get("/api/books", findBook);
      if (request.method === "POST" && url.pathname === "/api/books") {}
      router.put("/api/books/:id", updateBook);
      router.delete("/api/books/:id", deleteBook);
      `,
    );
    fs.writeFileSync(path.join(folder, "public", "app.js"), "function renderBooks() {}");
    fs.mkdirSync(path.join(folder, "node_modules"));
    fs.writeFileSync(path.join(folder, "node_modules", "vendor.js"), "function vendor() {}");

    const files = collectJavaScriptFiles(folder);
    const docs = generateDocumentation(files, folder);

    assert.deepEqual(files.map((file) => path.relative(folder, file).split(path.sep).join("/")), [
      "public/app.js",
      "server.js",
    ]);
    assert.match(docs.apiDocs, /findBook/);
    assert.match(docs.apiDocs, /Book identifier/);
    assert.match(docs.apiDocs, /Matching book/);
    assert.match(docs.apiDocs, /searchBooks/);
    assert.match(docs.apiDocs, /Search term/);
    assert.match(docs.apiDocs, /GET \| \/api\/books/);
    assert.match(docs.apiDocs, /POST \| \/api\/books/);
    assert.match(docs.apiDocs, /PUT \| \/api\/books\/:id/);
    assert.match(docs.apiDocs, /DELETE \| \/api\/books\/:id/);
  });
});

test("replaces only generated marker content and preserves surrounding notes", () => {
  withTempFolder((folder) => {
    const file = path.join(folder, "README.md");
    const before = "# Human title\n\nNotes stay exactly here.\n";
    const after = "\n\nMore human notes.\n";
    const original = `${before}<!-- DOC-SYNC-START -->\nold output\n<!-- DOC-SYNC-END -->${after}`;
    fs.writeFileSync(file, original);

    const result = renderDocument(file, "README", "new output");
    assert.equal(result.status, "updated");
    assert.equal(result.content.slice(0, result.content.indexOf("<!-- DOC-SYNC-START -->")), before);
    assert.equal(result.content.slice(result.content.indexOf("<!-- DOC-SYNC-END -->") + "<!-- DOC-SYNC-END -->".length), after);
    assert.match(result.content, /new output/);
  });
});

test("appends a generated marker block to existing markerless documents", () => {
  withTempFolder((folder) => {
    const file = path.join(folder, "README.md");
    const original = "# Human README\nKeep all notes.";
    fs.writeFileSync(file, original);
    const result = renderDocument(file, "README", "generated");
    assert.equal(result.status, "updated");
    assert.ok(result.content.startsWith(original));
    assert.match(
      result.content.slice(original.length),
      /^\n\n<!-- DOC-SYNC-START -->\ngenerated\n<!-- DOC-SYNC-END -->\n$/,
    );
    fs.writeFileSync(file, result.content);
    const rerun = renderDocument(file, "README", "updated");
    assert.ok(rerun.content.startsWith(original));
    assert.equal((rerun.content.match(/<!-- DOC-SYNC-START -->/g) || []).length, 1);
    assert.match(rerun.content, /<!-- DOC-SYNC-START -->\nupdated\n<!-- DOC-SYNC-END -->/);
  });
});

test("preserves CRLF content when initializing a markerless document", () => {
  withTempFolder((folder) => {
    const file = path.join(folder, "README.md");
    const original = "# Human README\r\nKeep all notes.\r\n";
    fs.writeFileSync(file, original);
    const result = renderDocument(file, "README", "generated");
    assert.ok(result.content.startsWith(original));
    assert.match(
      result.content.slice(original.length),
      /^\r\n<!-- DOC-SYNC-START -->\r\ngenerated\r\n<!-- DOC-SYNC-END -->\r\n$/,
    );
  });
});

test("skips existing documents with malformed marker pairs", () => {
  withTempFolder((folder) => {
    const file = path.join(folder, "README.md");
    const original = "# Human README\n<!-- DOC-SYNC-START -->\npartial";
    fs.writeFileSync(file, original);
    const result = renderDocument(file, "README", "generated");
    assert.equal(result.status, "skipped");
    assert.equal(result.content, original);
  });
});

test("creates missing documents with starter title and marker pair", () => {
  withTempFolder((folder) => {
    const result = renderDocument(path.join(folder, "API_DOCS.md"), "Sample API Docs", "generated");
    assert.equal(result.status, "created");
    assert.match(result.content, /^# Sample API Docs/);
    assert.match(result.content, /<!-- DOC-SYNC-START -->[\s\S]*<!-- DOC-SYNC-END -->/);
  });
});

test("redacts configured secrets without retaining their values", () => {
  const result = redactSensitive(
    'const DB_PASSWORD = "db-private"; const STORE_ADMIN_KEY="store-private"; const JWT_SECRET=\'jwt-private\'; API_TOKEN: "api-private"',
  );
  assert.equal(result, 'const DB_PASSWORD = "[REDACTED]"; const STORE_ADMIN_KEY="[REDACTED]"; const JWT_SECRET="[REDACTED]"; API_TOKEN: "[REDACTED]"');
  for (const secret of ["db-private", "store-private", "jwt-private", "api-private"]) {
    assert.equal(result.includes(secret), false);
  }
});

test("missing target reports an error without throwing a stack trace", () => {
  const missingPath = path.join(os.tmpdir(), `doc-sync-missing-${process.pid}`);
  const result = spawnSync(process.execPath, [cliPath, missingPath], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Target folder does not exist/);
  assert.doesNotMatch(result.stderr, /at Object\./);
});

test("empty target reports an empty scan and initializes missing documents", () => {
  withTempFolder((folder) => {
    const result = spawnSync(process.execPath, [cliPath, folder], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Scanned 0 JavaScript file/);
    assert.equal(fs.existsSync(path.join(folder, "README.md")), true);
    assert.equal(fs.existsSync(path.join(folder, "API_DOCS.md")), true);
  });
});

test("secret values are absent from generated docs and CLI output", () => {
  withTempFolder((folder) => {
    fs.writeFileSync(
      path.join(folder, "secret.js"),
      `/** Uses DB_PASSWORD=private-db-value.
       * @returns {string} Token JWT_SECRET: "private-jwt-value"; STORE_ADMIN_KEY: "private-store-value"
       */
      export function readSecret() {}
      const API_TOKEN = "private-api-value";
      `,
    );
    const result = spawnSync(process.execPath, [cliPath, folder], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const docs = fs.readFileSync(path.join(folder, "API_DOCS.md"), "utf8");
    for (const secret of [
      "private-db-value",
      "private-jwt-value",
      "private-api-value",
      "private-store-value",
    ]) {
      assert.equal(docs.includes(secret), false);
      assert.equal(result.stdout.includes(secret), false);
      assert.equal(result.stderr.includes(secret), false);
    }
    assert.match(docs, /\[REDACTED\]/);
  });
});

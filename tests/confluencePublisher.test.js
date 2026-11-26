"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const test = require("node:test");
const { markdownToStorage, prepareContent } = require("../scripts/confluencePublisher");
const publisherPath = path.join(__dirname, "..", "scripts", "confluencePublisher.js");

test("turns Mermaid fences into Confluence attachment embeds", () => {
  const markdown = "# Diagram\n\n```mermaid\nflowchart LR\n  A --> B\n```\n";
  const storage = markdownToStorage(markdown, ["mermaid-diagram-1.svg"]);

  assert.match(storage, /<ac:image ac:alt="Mermaid diagram 1">/);
  assert.match(storage, /<ri:attachment ri:filename="mermaid-diagram-1\.svg" \/>/);
  assert.doesNotMatch(storage, /flowchart LR/);
  assert.throws(() => markdownToStorage(markdown), /must be rendered/);
});

test("escapes XML special characters in headings, paragraphs, and code blocks", () => {
  const markdown = "# Books & <Store>\n\nA & B < C > D.\n\n```js\nconst label = '<>&';\n```\n";
  const storage = markdownToStorage(markdown);

  assert.equal(
    storage,
    "<h1>Books &amp; &lt;Store&gt;</h1>\n" +
      "<p>A &amp; B &lt; C &gt; D.</p>\n" +
      "<pre><code>const label = &#39;&lt;&gt;&amp;&#39;;</code></pre>",
  );
});

test("create updates an existing page in its space and increments the version", async () => {
  const title = "[Demo-1] QA Test Plan";
  const markdown = "# QA Plan\n\nExisting <content> & rules.\n";
  const requests = [];
  let updatePayload;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    requests.push(`${request.method} ${url.pathname}`);
    response.setHeader("Content-Type", "application/json");

    if (request.method === "GET" && url.pathname === "/wiki/rest/api/content") {
      requests.push(`title=${url.searchParams.get("title")}`);
      requests.push(`spaceKey=${url.searchParams.get("spaceKey")}`);
      response.end(JSON.stringify({ results: [{ id: "123", title }] }));
      return;
    }
    if (request.method === "GET" && url.pathname === "/wiki/rest/api/content/123") {
      response.end(JSON.stringify({
        id: "123",
        title,
        version: { number: 7 },
        _links: { base: "https://example.atlassian.net/wiki", webui: "/pages/123/QA-Test-Plan" },
      }));
      return;
    }
    if (request.method === "PUT" && url.pathname === "/wiki/rest/api/content/123") {
      const chunks = [];
      request.on("data", (chunk) => chunks.push(chunk));
      request.on("end", () => {
        updatePayload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        response.end(JSON.stringify({
          id: "123",
          title: updatePayload.title,
          version: updatePayload.version,
          _links: { base: "https://example.atlassian.net/wiki", webui: "/pages/123/QA-Test-Plan" },
        }));
      });
      return;
    }
    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Unexpected mock request." }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "confluence-upsert-test-"));
  const filePath = path.join(temporaryDirectory, "qa.md");
  fs.writeFileSync(filePath, markdown);

  try {
    const port = server.address().port;
    const result = await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [
          publisherPath,
          "create",
          "--title",
          "QA Test Plan",
          "--file",
          filePath,
          "--parent-id",
          "8454160",
          "--demo",
          "Demo-1",
          "--approved",
        ],
        {
          cwd: temporaryDirectory,
          env: {
            ...process.env,
            CONFLUENCE_URL: `http://127.0.0.1:${port}/wiki`,
            CONFLUENCE_EMAIL: "qa@example.invalid",
            CONFLUENCE_API_TOKEN: "local-test-token",
            CONFLUENCE_SPACE_KEY: "TEST",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let stdout = "";
      let stderr = "";
      child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
      child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
      child.once("error", reject);
      child.once("close", (status) => resolve({ status, stdout, stderr }));
    });

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.status, "updated");
    assert.equal(output.title, title);
    assert.equal(output.version, 8);
    assert.equal(output.url, "https://example.atlassian.net/wiki/pages/123/QA-Test-Plan");
    assert.deepEqual(requests, [
      "GET /wiki/rest/api/content",
      `title=${title}`,
      "spaceKey=TEST",
      "GET /wiki/rest/api/content/123",
      "PUT /wiki/rest/api/content/123",
    ]);
    assert.equal(updatePayload.version.number, 8);
    assert.equal(updatePayload.body.storage.value, markdownToStorage(markdown));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("renders Mermaid diagrams to SVG and cleans temporary files", () => {
  const prepared = prepareContent(
    "```mermaid\nflowchart LR\n  A[Manager] --> B[Storefront]\n```\n",
  );
  const [diagram] = prepared.diagrams;

  try {
    assert.equal(prepared.diagrams.length, 1);
    assert.match(fs.readFileSync(diagram.filePath, "utf8"), /<svg[\s>]/);
    assert.match(prepared.storage, /mermaid-diagram-1\.svg/);
  } finally {
    prepared.cleanup();
  }
  assert.equal(fs.existsSync(diagram.filePath), false);
});

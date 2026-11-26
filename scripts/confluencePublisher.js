#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const MERMAID_FENCE = /^```mermaid[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;
const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = (match[2] || "").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    process.env[match[1]] = value;
  }
}

function option(args, name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function required(value, name) {
  if (!value) throw new Error(`Missing required configuration or argument: ${name}`);
  return value;
}

function pageId(value, name) {
  const id = required(value, name);
  if (!/^\d+$/.test(id)) {
    throw new Error(`${name} must be a numeric Confluence page ID, not a URL.`);
  }
  return id;
}

function demoSession(args) {
  const supplied = option(args, "--demo") || process.env.DEMO_SESSION;
  if (!supplied) {
    throw new Error(
      "Please provide your Demo session number such as Demo-1 or Demo-2 before we begin",
    );
  }
  if (!/^Demo-[1-9]\d*$/.test(supplied)) {
    throw new Error("DEMO_SESSION must use the format Demo-1, Demo-2, or another positive integer suffix.");
  }
  return supplied;
}

function demoTitle(args, title) {
  const prefix = `[${demoSession(args)}]`;
  return title.startsWith(prefix) ? title : `${prefix} ${title}`;
}

function getConfig() {
  const baseUrlValue = required(
    process.env.CONFLUENCE_URL || process.env.CONFLUENCE_BASE_URL,
    "CONFLUENCE_URL",
  ).trim();
  let normalizedBaseUrl;
  try {
    const url = new URL(baseUrlValue);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname.endsWith("/wiki") ? pathname : `${pathname}/wiki`;
    url.search = "";
    url.hash = "";
    normalizedBaseUrl = url.toString().replace(/\/+$/, "");
  } catch {
    throw new Error("CONFLUENCE_URL must be a valid absolute HTTP(S) URL.");
  }
  return {
    baseUrl: normalizedBaseUrl,
    email: required(process.env.CONFLUENCE_EMAIL, "CONFLUENCE_EMAIL"),
    token: required(
      process.env.CONFLUENCE_API_TOKEN || process.env.JIRA_SSO_PAT,
      "CONFLUENCE_API_TOKEN (or JIRA_SSO_PAT)",
    ),
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToStorage(markdown, diagramFilenames = []) {
  let diagramIndex = 0;
  const withDiagramMarkers = markdown.replace(MERMAID_FENCE, () => {
    const marker = `__DOCSYNC_MERMAID_IMAGE_${diagramIndex}__`;
    diagramIndex += 1;
    return `\n\n${marker}\n\n`;
  });
  if (diagramIndex !== diagramFilenames.length) {
    throw new Error("Every Mermaid diagram must be rendered before converting the page.");
  }

  const lines = withDiagramMarkers.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listType = null;
  let codeLines = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(inlineMarkdown).join("<br />")}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      blocks.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const line of lines) {
    const diagram = line.match(/^__DOCSYNC_MERMAID_IMAGE_(\d+)__$/);
    if (diagram) {
      flushParagraph();
      closeList();
      const index = Number(diagram[1]);
      const filename = diagramFilenames[index];
      if (!filename) throw new Error(`Missing rendered Mermaid attachment for diagram ${index + 1}.`);
      blocks.push(
        `<ac:image ac:alt="Mermaid diagram ${index + 1}"><ri:attachment ri:filename="${escapeHtml(filename)}" /></ac:image>`,
      );
      continue;
    }

    if (line.startsWith("```")) {
      flushParagraph();
      closeList();
      if (codeLines) {
        blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines = [];
      }
      continue;
    }
    if (codeLines) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const item = line.match(/^\s*(?:[-*]\s+|(\d+)\.\s+)(.+)$/);
    if (item) {
      flushParagraph();
      const nextListType = item[1] ? "ol" : "ul";
      if (listType !== nextListType) {
        closeList();
        blocks.push(`<${nextListType}>`);
        listType = nextListType;
      }
      blocks.push(`<li><p>${inlineMarkdown(item[2])}</p></li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  if (codeLines) {
    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  return blocks.join("\n");
}

function mermaidCliPath() {
  let packageDir;
  try {
    packageDir = path.resolve(path.dirname(require.resolve("@mermaid-js/mermaid-cli")), "..");
  } catch {
    throw new Error("Mermaid rendering requires @mermaid-js/mermaid-cli; run npm install.");
  }
  const packageJsonPath = path.join(packageDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const executable = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.mmdc;
  if (!executable) throw new Error("@mermaid-js/mermaid-cli does not expose the mmdc executable.");
  return path.resolve(packageDir, executable);
}

function prepareContent(markdown) {
  const diagrams = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-sync-mermaid-"));
  const sources = [...markdown.matchAll(MERMAID_FENCE)];
  try {
    const cliPath = sources.length ? mermaidCliPath() : null;
    sources.forEach((match, index) => {
      const inputPath = path.join(tempDir, `diagram-${index + 1}.mmd`);
      const outputPath = path.join(tempDir, `diagram-${index + 1}.svg`);
      fs.writeFileSync(inputPath, match[1], "utf8");
      try {
        execFileSync(process.execPath, [cliPath, "-i", inputPath, "-o", outputPath], {
          stdio: "pipe",
          windowsHide: true,
        });
      } catch (error) {
        const detail = error.stderr?.toString("utf8").trim() || error.message;
        throw new Error(`Failed to render Mermaid diagram ${index + 1}: ${detail}`);
      }
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error(`Mermaid CLI produced no SVG for diagram ${index + 1}.`);
      }
      diagrams.push({
        filePath: outputPath,
        filename: `mermaid-diagram-${index + 1}.svg`,
      });
    });

    return {
      storage: markdownToStorage(markdown, diagrams.map((diagram) => diagram.filename)),
      diagrams,
      cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
    };
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

async function errorResponse(response) {
  const body = await response.text();
  const detail = body || "(empty response body)";
  throw new Error(`Confluence API returned HTTP ${response.status}: ${detail}`);
}

async function request(config, method, endpoint, { payload, body, headers = {} } = {}) {
  const url = new URL(`${config.baseUrl}/rest/api/${endpoint}`);
  const requestHeaders = {
    Authorization: `Basic ${Buffer.from(`${config.email}:${config.token}`).toString("base64")}`,
    Accept: "application/json",
    ...headers,
  };
  const options = { method, headers: requestHeaders };
  if (payload !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  } else if (body !== undefined) {
    options.body = body;
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Unable to reach Confluence; check the URL and network connection.");
  }
  if (!response.ok) await errorResponse(response);
  const responseBody = await response.text();
  return {
    data: responseBody ? JSON.parse(responseBody) : {},
    status: response.status,
  };
}

async function api(config, method, pageId, payload) {
  const result = await request(
    config,
    method,
    `content/${encodeURIComponent(pageId)}?expand=body.storage,version`,
    { payload },
  );
  return { ...result.data, _httpStatus: result.status };
}

async function findExistingPage(config, title, spaceKey) {
  const query = new URLSearchParams({
    title,
    spaceKey,
    type: "page",
    status: "current",
  });
  const result = await request(config, "GET", `content?${query}`);
  if (!Array.isArray(result.data.results)) {
    throw new Error("Confluence page search returned an invalid response.");
  }
  const matches = result.data.results.filter((page) => page.title === title);
  if (matches.length > 1) {
    throw new Error(`Multiple current pages titled "${title}" were found in space ${spaceKey}.`);
  }
  return matches[0];
}

async function uploadAttachment(config, pageId, diagram) {
  const pagePath = `content/${encodeURIComponent(pageId)}/child/attachment`;
  const existing = await request(
    config,
    "GET",
    `${pagePath}?filename=${encodeURIComponent(diagram.filename)}`,
  );
  const attachment = existing.data.results?.find((item) => item.title === diagram.filename);
  const endpoint = attachment
    ? `${pagePath}/${encodeURIComponent(attachment.id)}/data`
    : pagePath;
  const form = new FormData();
  form.append(
    "file",
    new Blob([fs.readFileSync(diagram.filePath)], { type: "image/svg+xml" }),
    diagram.filename,
  );
  await request(config, "POST", endpoint, {
    body: form,
    headers: { "X-Atlassian-Token": "no-check" },
  });
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env"));
  const [command, ...args] = process.argv.slice(2);
  if (command === "read") {
    const config = getConfig();
    const id = pageId(
      option(args, "--page-id") || process.env.CONFLUENCE_STORY_PAGE_ID,
      "CONFLUENCE_STORY_PAGE_ID or --page-id",
    );
    const page = await api(config, "GET", id);
    process.stdout.write(
      `${JSON.stringify({
        id: page.id,
        title: page.title,
        http_status: page._httpStatus,
        version: page.version?.number,
        url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
        content: page.body?.storage?.value,
      }, null, 2)}\n`,
    );
    return;
  }

  if (command === "publish") {
    if (!args.includes("--approved")) {
      throw new Error("Confluence writes require explicit approval and the --approved flag.");
    }
    const config = getConfig();
    const id = pageId(option(args, "--page-id"), "--page-id");
    const title = demoTitle(args, required(option(args, "--title"), "--title"));
    const file = required(option(args, "--file"), "--file");
    const prepared = prepareContent(fs.readFileSync(path.resolve(file), "utf8"));
    try {
      const current = await api(config, "GET", id);
      for (const diagram of prepared.diagrams) await uploadAttachment(config, id, diagram);
      const page = await api(config, "PUT", id, {
        id,
        type: "page",
        title,
        version: { number: current.version.number + 1 },
        body: { storage: { value: prepared.storage, representation: "storage" } },
      });
      process.stdout.write(
        `${JSON.stringify({
          id: page.id,
          title: page.title,
          version: page.version?.number,
          url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
          status: "published",
          attached_diagrams: prepared.diagrams.map((diagram) => diagram.filename),
        }, null, 2)}\n`,
      );
    } finally {
      prepared.cleanup();
    }
    return;
  }

  if (command === "create") {
    if (!args.includes("--approved")) {
      throw new Error("Confluence writes require explicit approval and the --approved flag.");
    }
    const config = getConfig();
    const title = demoTitle(args, required(option(args, "--title"), "--title"));
    const file = required(option(args, "--file"), "--file");
    const parentId = pageId(
      option(args, "--parent-id") || process.env.CONFLUENCE_STORY_PAGE_ID,
      "CONFLUENCE_STORY_PAGE_ID or --parent-id",
    );
    const spaceKey = required(
      process.env.CONFLUENCE_SPACE_KEY,
      "CONFLUENCE_SPACE_KEY",
    );
    const prepared = prepareContent(fs.readFileSync(path.resolve(file), "utf8"));
    try {
      const existingPage = await findExistingPage(config, title, spaceKey);
      let page;
      let status;
      let resultParentId;
      if (existingPage) {
        const current = await api(config, "GET", existingPage.id);
        if (!Number.isInteger(current.version?.number)) {
          throw new Error("Existing Confluence page has no valid version number.");
        }
        page = await api(config, "PUT", existingPage.id, {
          id: existingPage.id,
          type: "page",
          title,
          version: { number: current.version.number + 1 },
          body: { storage: { value: prepared.storage, representation: "storage" } },
        });
        status = "updated";
      } else {
        const created = await request(config, "POST", "content", {
          payload: {
            type: "page",
            title,
            ancestors: [{ id: parentId }],
            space: { key: spaceKey },
            body: {
              storage: {
                value: prepared.storage,
                representation: "storage",
              },
            },
          },
        });
        page = created.data;
        status = "created";
        resultParentId = parentId;
      }
      for (const diagram of prepared.diagrams) await uploadAttachment(config, page.id, diagram);
      process.stdout.write(
        `${JSON.stringify({
          id: page.id,
          title: page.title,
          version: page.version?.number,
          status,
          ...(resultParentId ? { parent_id: resultParentId } : {}),
          url: `${page._links?.base || config.baseUrl}${page._links?.webui || ""}`,
          attached_diagrams: prepared.diagrams.map((diagram) => diagram.filename),
        }, null, 2)}\n`,
      );
    } finally {
      prepared.cleanup();
    }
    return;
  }

  throw new Error(
    "Usage: node scripts/confluencePublisher.js read [--page-id ID]\n" +
      "   or: node scripts/confluencePublisher.js publish --page-id ID --title TITLE --file FILE --demo Demo-1 --approved\n" +
      "   or: node scripts/confluencePublisher.js create --title TITLE --file FILE --parent-id ID --demo Demo-1 --approved",
  );
}

module.exports = { markdownToStorage, prepareContent };

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`ERROR: ${error.message}\n`);
    process.exitCode = 1;
  });
}

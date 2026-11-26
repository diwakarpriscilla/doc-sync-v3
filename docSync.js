"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_TARGET = path.join(__dirname, "bookstore-web-app");
const START_MARKER = "<!-- DOC-SYNC-START -->";
const END_MARKER = "<!-- DOC-SYNC-END -->";
const SECRET_KEYS = ["DB_PASSWORD", "STORE_ADMIN_KEY", "JWT_SECRET", "API_TOKEN"];
const EXCLUDED_DIRECTORIES = new Set([".git", "node_modules"]);
const HTTP_METHODS = new Set(["GET", "POST", "PUT", "DELETE"]);

function redactSensitive(text) {
  const keys = SECRET_KEYS.join("|");
  const assignment = new RegExp(
    `\\b((?:process\\.env\\.)?(?:${keys}))\\b(\\s*[:=]\\s*)(?:"(?:\\\\.|[^"])*"|'(?:\\\\.|[^'])*'|\`(?:\\\\.|[^\`])*\`|[^\\s,;)}]+)`,
    "gi",
  );
  return text.replace(assignment, '$1$2"[REDACTED]"');
}

function collectJavaScriptFiles(targetFolder) {
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
          visit(path.join(directory, entry.name));
        }
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        files.push(path.join(directory, entry.name));
      }
    }
  };
  visit(targetFolder);
  return files.sort((left, right) => left.localeCompare(right));
}

function precedingJsDoc(source, index) {
  const prefix = source.slice(0, index);
  const comment = prefix.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
  return comment ? comment[1] : "";
}

function parseJsDoc(comment) {
  const lines = comment
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim());
  const summary = [];
  const params = [];
  let returns = "";
  let inSummary = true;

  for (const line of lines) {
    if (!line) continue;
    const param = line.match(/^@param\s+(?:\{([^}]+)\}\s*)?(\[[^\]]+\]|\S+)?\s*(.*)$/);
    const result = line.match(/^@returns?\s+(?:\{([^}]+)\}\s*)?(.*)$/);
    if (param) {
      inSummary = false;
      const name = (param[2] || "").replace(/^\[|\]$/g, "");
      params.push(`${name}${param[1] ? `: ${param[1]}` : ""}${param[3] ? ` - ${param[3]}` : ""}`);
    } else if (result) {
      inSummary = false;
      returns = `${result[1] ? `${result[1]} - ` : ""}${result[2]}`.trim();
    } else if (line.startsWith("@")) {
      inSummary = false;
    } else if (inSummary) {
      summary.push(line);
    }
  }

  return {
    summary: redactSensitive(summary.join(" ")),
    params: params.map(redactSensitive),
    returns: redactSensitive(returns),
  };
}

function isExported(name, declaration, source) {
  if (/^\s*export\b/.test(declaration)) return true;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const directExport = new RegExp(`\\b(?:module\\.)?exports\\s*(?:\\.\\s*${escaped}|\\[\\s*['"]${escaped}['"]\\s*\\])\\s*=`);
  if (directExport.test(source)) return true;
  const exportObject = source.match(/module\.exports\s*=\s*\{([\s\S]*?)\}/);
  return Boolean(exportObject && new RegExp(`(?:^|[,\\s])${escaped}(?:\\s*[,}]|\\s*:)`).test(exportObject[1]));
}

function extractFunctions(source, relativePath) {
  const functions = new Map();
  const patterns = [
    /(?:^|[;\n])\s*((?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\))/gm,
    /(?:^|[;\n])\s*((?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>)/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const declaration = match[1];
      const name = match[2];
      const parameters = match[3] || match[4] || "";
      const doc = parseJsDoc(precedingJsDoc(source, match.index));
      const exported = isExported(name, declaration, source);
      if (!exported && !doc.summary && doc.params.length === 0 && !doc.returns) continue;
      functions.set(`${relativePath}:${name}`, {
        file: relativePath,
        name,
        exported,
        summary: doc.summary,
        params: doc.params.length ? doc.params.join("; ") : parameters.trim(),
        returns: doc.returns,
      });
    }
  }
  return [...functions.values()];
}

function extractEndpoints(source, relativePath) {
  const endpoints = [];
  const expressRoute = /\b(?:app|router)\.(get|post|put|delete)\s*\(\s*(['"`])([^'"`]+)\2/gi;
  let match;
  while ((match = expressRoute.exec(source)) !== null) {
    endpoints.push({
      file: relativePath,
      method: match[1].toUpperCase(),
      path: redactSensitive(match[3]),
    });
  }

  const quote = "(['\"`])";
  const methodPath = new RegExp(
    `\\b(?:req|request)\\.method\\s*={2,3}\\s*${quote}(GET|POST|PUT|DELETE)\\1[\\s\\S]{0,200}?\\b(?:url\\.pathname|(?:req|request)\\.url)\\s*={2,3}\\s*${quote}([^'\\"\\x60]+)\\3`,
    "gi",
  );
  while ((match = methodPath.exec(source)) !== null) {
    endpoints.push({
      file: relativePath,
      method: match[2].toUpperCase(),
      path: redactSensitive(match[4]),
    });
  }
  const pathMethod = new RegExp(
    `\\b(?:url\\.pathname|(?:req|request)\\.url)\\s*={2,3}\\s*${quote}([^'\\"\\x60]+)\\1[\\s\\S]{0,200}?\\b(?:req|request)\\.method\\s*={2,3}\\s*${quote}(GET|POST|PUT|DELETE)\\3`,
    "gi",
  );
  while ((match = pathMethod.exec(source)) !== null) {
    endpoints.push({
      file: relativePath,
      method: match[3].toUpperCase(),
      path: redactSensitive(match[2]),
    });
  }

  const unique = new Map();
  for (const endpoint of endpoints) {
    if (HTTP_METHODS.has(endpoint.method)) {
      unique.set(`${endpoint.method} ${endpoint.path} ${endpoint.file}`, endpoint);
    }
  }
  return [...unique.values()];
}

function markdownCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function markdownTable(headers, rows, emptyMessage) {
  if (rows.length === 0) return emptyMessage;
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function generateDocumentation(files, targetFolder) {
  const functions = [];
  const endpoints = [];
  for (const file of files) {
    const relativePath = path.relative(targetFolder, file).split(path.sep).join("/");
    const source = redactSensitive(fs.readFileSync(file, "utf8"));
    functions.push(...extractFunctions(source, relativePath));
    endpoints.push(...extractEndpoints(source, relativePath));
  }

  functions.sort((a, b) => `${a.file}:${a.name}`.localeCompare(`${b.file}:${b.name}`));
  endpoints.sort((a, b) => `${a.file}:${a.method}:${a.path}`.localeCompare(`${b.file}:${b.method}:${b.path}`));

  const functionTable = markdownTable(
    ["File", "Function", "Exported", "Summary", "Parameters", "Returns"],
    functions.map((item) => [item.file, item.name, item.exported ? "Yes" : "No", item.summary, item.params, item.returns]),
    "No exported or JSDoc-documented functions found.",
  );
  const endpointTable = markdownTable(
    ["Method", "Path", "Source"],
    endpoints.map((item) => [item.method, item.path, item.file]),
    "No supported HTTP endpoints found.",
  );

  return {
    functions,
    endpoints,
    apiDocs: `## HTTP Endpoints\n\n${endpointTable}\n\n## JavaScript Functions\n\n${functionTable}`,
    readme: `## Generated API Overview\n\n${endpointTable}`,
  };
}

function renderDocument(filePath, title, generatedContent) {
  if (!fs.existsSync(filePath)) {
    return {
      status: "created",
      content: `# ${title}\n\n${START_MARKER}\n${generatedContent}\n${END_MARKER}\n`,
    };
  }

  const original = fs.readFileSync(filePath, "utf8");
  const startIndex = original.indexOf(START_MARKER);
  const endIndex = original.indexOf(END_MARKER);
  if (startIndex === -1 && endIndex === -1) {
    const lineEnding = original.includes("\r\n") ? "\r\n" : "\n";
    const hasBlankLine = /(?:\r?\n){2}$/.test(original);
    let separator = "";
    if (original.length > 0 && !hasBlankLine) {
      separator = original.endsWith("\n") ? lineEnding : `${lineEnding}${lineEnding}`;
    }
    const generated = generatedContent.replace(/\r?\n/g, lineEnding);
    return {
      status: "updated",
      content: `${original}${separator}${START_MARKER}${lineEnding}${generated}${lineEnding}${END_MARKER}${lineEnding}`,
    };
  }
  if (
    startIndex === -1 ||
    endIndex === -1 ||
    startIndex >= endIndex ||
    original.indexOf(START_MARKER, startIndex + START_MARKER.length) !== -1 ||
    original.indexOf(END_MARKER, endIndex + END_MARKER.length) !== -1
  ) {
    return { status: "skipped", content: original };
  }

  const contentStart = startIndex + START_MARKER.length;
  return {
    status: "updated",
    content: `${original.slice(0, contentStart)}\n${generatedContent}\n${original.slice(endIndex)}`,
  };
}

function atomicWrite(filePath, content) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    try {
      fs.rmSync(temporaryPath, { force: true });
    } catch {}
    throw error;
  }
}

function run(targetArgument) {
  const targetFolder = path.resolve(targetArgument || DEFAULT_TARGET);
  if (!fs.existsSync(targetFolder) || !fs.statSync(targetFolder).isDirectory()) {
    console.error(`ERROR: Target folder does not exist or is not a directory: ${targetFolder}`);
    return 1;
  }

  try {
    const files = collectJavaScriptFiles(targetFolder);
    const generated = generateDocumentation(files, targetFolder);
    const documents = [
      {
        file: path.join(targetFolder, "README.md"),
        title: `${path.basename(targetFolder)} README`,
        content: generated.readme,
      },
      {
        file: path.join(targetFolder, "API_DOCS.md"),
        title: `${path.basename(targetFolder)} API Documentation`,
        content: generated.apiDocs,
      },
    ];

    const results = documents.map((document) => ({
      ...document,
      ...renderDocument(document.file, document.title, document.content),
    }));

    for (const result of results) {
      if (result.status !== "skipped") atomicWrite(result.file, redactSensitive(result.content));
    }

    console.log(`Target folder: ${targetFolder}`);
    console.log(`Scanned ${files.length} JavaScript file(s):`);
    if (files.length === 0) console.log("  (no JavaScript files found)");
    for (const file of files) console.log(`  - ${path.relative(targetFolder, file).split(path.sep).join("/")}`);
    console.log(`Discovered ${generated.endpoints.length} endpoint(s) and ${generated.functions.length} function(s).`);
    for (const result of results) {
      const relativePath = path.relative(targetFolder, result.file).split(path.sep).join("/");
      if (result.status === "skipped") {
        console.warn(`WARNING: ${relativePath} has no valid DOC-SYNC marker pair; preserved and skipped.`);
      } else {
        console.log(`${result.status === "created" ? "Created" : "Updated"} ${relativePath} generated section.`);
      }
    }
    return 0;
  } catch (error) {
    console.error(`ERROR: Documentation sync failed: ${error.message}`);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = run(process.argv[2]);
}

module.exports = {
  collectJavaScriptFiles,
  extractEndpoints,
  extractFunctions,
  generateDocumentation,
  redactSensitive,
  renderDocument,
  run,
};

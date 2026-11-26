const { execSync } = require("child_process");
const staged = execSync("git diff --cached --name-only", { encoding: "utf8" });
if (staged.includes(".env") || staged.includes("node_modules/")) {
  console.error("BLOCKED: Do not commit .env or node_modules/!");
  process.exit(1);
}
console.log("Pre-commit safety check passed.");

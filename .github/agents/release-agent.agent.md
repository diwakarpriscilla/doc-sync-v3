---
name: release-agent
description: Performs local deployment and prepares release artifacts and a pull request under human approval gates.
---

# Release Agent

Own Step 8 only. Follow `.github/copilot-instructions.md`. Never skip or combine approval checkpoints.

## Required release document standards

- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants in code examples. If Mermaid diagrams are used, label the user role exactly `Bookstore Storefront Manager`.
- `BUILD_AND_LOCAL_DEPLOYMENT_GUIDE.md` must use these exact headings, in order: `# Build & Local Deployment Guide`, `## Status`, `## Prerequisites`, `## Build`, `## Local Deployment`, `## Verification Results`, and `## Local Stop and Rollback`.
- `RELEASE_NOTES.md` must use these exact headings, in order: `# Release Notes`, `## Release Summary`, `## Scope`, `## Changes`, `## Validation`, `## Known Limitations`, and `## Deployment Notes`.
- Include only verified results. Do not include credentials, tokens, key contents, or `.env` values.

## Step 8: Local deployment, publication, PR, and final release

1. Perform deployment locally only; do not deploy to a shared or production environment. From the repository root, start the app with `node bookstore-web-app/server.js`, verify that `http://localhost:3000/` and `http://localhost:3000/api/books` respond successfully, record the results, and stop the process you started when verification is complete.
2. Generate a **Build & Local Deployment Guide** and **Release Notes** from verified repository behavior. Exclude credentials and other secrets.
3. Preview the documents and the exact Confluence targets, tracked-file commit plan, branch, and PR body. Ensure `node_modules/` and `.env` are not staged or committed. Include these five PR sections: **Summary**, **Requirements and Acceptance Criteria**, **Architecture**, **QA Test Plan and Execution Summary**, and **Build/Deployment Guide and Release Notes**.
4. Ask **Do you approve Step 8, or would you like changes?** Do not publish, create a branch, commit, push, or create a PR until explicit Step 8 approval.
5. After approval, publish the approved documents using `scripts/confluencePublisher.js` with `--approved`, then create the branch, commit only approved tracked files, push, and create the PR. Report confirmed publication URLs, commit identifiers, and PR URL. Never claim unconfirmed actions succeeded.
6. Present the PR state, checks, release summary, and merge consequences. Ask for separate explicit approval to merge; merge only after that approval. If declined, leave the PR open.
7. After explicit merge approval, confirm that the current branch and PR match the approved PR with `gh pr view`, then execute `gh pr merge --merge --delete-branch` in the terminal. Do not rely on an MCP merge tool. Confirm the merged state and merge commit with `gh pr view` and report only verified results. If the GitHub CLI is unavailable, unauthenticated, or the PR cannot be merged, report the sanitized error and stop without another merge route.
8. After merge or a decision not to merge, report the confirmed outcome and stop. Step 8 is the final step; do not ask the user to invoke another agent.

The user's **`Approved`** response to Step 8 authorizes only the previewed Step 8 work. It does not authorize merging; keep the separate merge approval in item 6.

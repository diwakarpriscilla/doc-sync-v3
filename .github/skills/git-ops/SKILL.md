---
name: git-ops
description: Manage Git branches, clean commits, GitHub Pull Requests, merges, and demo-baseline resets.
---
# Git Operations Skill
**Use-when:** Creating `feat/demo-x-*` branches, opening/merging PRs, or resetting the workspace to `demo-baseline`.
- Never commit `.env` or `node_modules/`.

## Step 8 release operations

- For local deployment verification, start the bookstore from the repository root with `node bookstore-web-app/server.js`. Verify that the homepage and `/api/books` respond successfully, record the results, and stop the process you started when verification is complete.
- Merge only after the user separately approves merging the exact Step 8 PR. Confirm the current branch and PR with `gh pr view`, then run `gh pr merge --merge --delete-branch` in the terminal. Do not rely on an MCP merge tool.
- Confirm the merged state and merge commit with `gh pr view` after the command. If the GitHub CLI is unavailable, unauthenticated, or the PR cannot be merged, report the sanitized error and stop without attempting another merge route.

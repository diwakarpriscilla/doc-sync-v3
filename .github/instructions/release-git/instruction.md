---
name: release-git-instruction
description: Git branching, PR 5-section template, and Confluence release publishing rules.
applyTo: "**/*RELEASE*,**/*DEPLOYMENT*"
---
# Release & Git Conventions
- Exclude `node_modules/` and `.env` from all commits.
- Include Summary, Changes Made, Test Evidence, Known Limitations, and Reviewer Checklist in every PR.
- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants in release-related code examples. If Mermaid diagrams are included, label the user role exactly `Bookstore Storefront Manager`.
- `BUILD_AND_LOCAL_DEPLOYMENT_GUIDE.md` must use these exact headings, in this order:
  1. `# Build & Local Deployment Guide`
  2. `## Status`
  3. `## Prerequisites`
  4. `## Build`
  5. `## Local Deployment`
  6. `## Verification Results`
  7. `## Local Stop and Rollback`
- `RELEASE_NOTES.md` must use these exact headings, in this order:
  1. `# Release Notes`
  2. `## Release Summary`
  3. `## Scope`
  4. `## Changes`
  5. `## Validation`
  6. `## Known Limitations`
  7. `## Deployment Notes`
- Report only verified validation and deployment outcomes. Never include credentials, tokens, secret values, or `.env` contents.

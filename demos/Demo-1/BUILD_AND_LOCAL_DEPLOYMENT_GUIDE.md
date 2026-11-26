# Build & Local Deployment Guide

## Status

- **Demo:** Demo-1 Automated Documentation Sync
- **Deployment:** Local workstation only; no staging or production deployment performed.
- **Local smoke result:** Homepage returned HTTP 200; `GET /api/books` returned HTTP 200 with three books.
- **Catalog banner:** `Version 1.0 - Baseline`.
- **Release controls:** Local deployment only; Confluence publication and PR creation are approval-gated, and merge requires separate explicit approval.
- **Known limitation:** Step 6 finding CR-1 remains open; see [code-review.md](./code-review.md).

## Prerequisites

- Node.js and npm installed. Validation was performed with Node.js `v26.12.0`.
- Repository dependencies installed with `npm ci` when setting up a fresh checkout.
- Port `3000` available for the bookstore server.
- For the headed browser checks, the Playwright browser installed for the repository's `@playwright/test` dependency.

The bookstore app has no separate runtime package dependencies. Root development dependencies provide Playwright and local Mermaid rendering.

## Build

The bookstore is a Node.js server and static HTML application; it has no compilation step. From the repository root, run the focused validation commands:

```powershell
npm run test:unit
npm run test:e2e -- --headed tests/e2e/demo1-doc-sync.spec.js
npm run test:e2e -- --headed tests/e2e/bookstore.spec.js --grep "manual reset restores baseline data in an isolated copy"
```

Verified results for this release preparation:

- Unit tests: 14 passed, 0 failed.
- Headed Demo-1 Playwright checks: 3 passed, 0 failed.
- Headed isolated reset check: 1 passed, 0 failed.

The Playwright configuration starts `npm start --prefix bookstore-web-app` at `http://localhost:3000` when the port is available. The publisher upsert and storage-format escaping are also covered by focused local unit tests using a local mock server.

## Local Deployment

From the repository root:

1. Confirm port `3000` is available:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
   ```
2. Start the bookstore app:
   ```powershell
   npm start --prefix bookstore-web-app
   ```
3. Open `http://localhost:3000/`.
4. Verify the catalog API from another PowerShell window:
   ```powershell
   Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing
   Invoke-RestMethod -Uri 'http://localhost:3000/api/books'
   ```

The Step 8 smoke check started `node server.js` from `bookstore-web-app`, received HTTP 200 from the homepage and catalog API, observed three books and the baseline banner, then stopped the exact server process. The Playwright web-server configuration separately verified the npm start command.

Documentation synchronization runs locally from the repository root:

```powershell
node docSync.js
```

The default target is `./bookstore-web-app`. Use `node docSync.js <targetFolder>` to scan a different project. The tool writes generated content to `README.md` and `API_DOCS.md` under the target.

## Verification Results

| Verification | Result |
|---|---|
| Local homepage | HTTP 200 |
| `GET /api/books` | HTTP 200; 3 books |
| Current banner | `Version 1.0 - Baseline` |
| `npm run test:unit` | 14 passed, 0 failed |
| Headed Demo-1 Playwright checks | 3 passed, 0 failed |
| Headed isolated `resetDemo.js` check | 1 passed, 0 failed |
| Repository catalog during QA | Unchanged by automated checks |

The QA Test Plan and Execution Summary was published under the user story and updated to version 3:

https://diwakarpriscilla.atlassian.net/wiki/spaces/DocSync/pages/8487170/Demo-1+Automated+Documentation+Sync+-+QA+Test+Plan+and+Execution+Summary

The architecture page was previously published under the same story:

https://diwakarpriscilla.atlassian.net/wiki/spaces/DocSync/pages/9371657/Demo-1+Automated+Documentation+Sync+-+Architecture

## Local Stop and Rollback

- Stop the local server with `Ctrl+C` in the terminal running `npm start`.
- The Step 8 smoke process was stopped after verification; no server was left running.
- Automated book-addition and reset checks use isolated temporary app copies and do not alter the repository catalog.
- If you intentionally change the repository demo catalog, `node resetDemo.js` restores the three starter books and baseline banner. It preserves the documentation files. Do not run it against a shared or live audience catalog.
- No remote application deployment or rollback was performed.

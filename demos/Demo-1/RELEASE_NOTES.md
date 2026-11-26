# Release Notes

## Release Summary

Demo-1 delivers the approved local documentation-sync workflow for the Bookstore Web App. The release includes the synchronizer behavior, implementation and QA evidence, and a locally verified deployment procedure. No remote application deployment has been performed.

## Scope

- Default target: `./bookstore-web-app`, with an optional custom folder.
- Recursive JavaScript discovery and bounded function/JSDoc and HTTP route extraction.
- Generated README and API documentation using DOC-SYNC markers while preserving ordinary existing notes.
- Redaction for `DB_PASSWORD`, `STORE_ADMIN_KEY`, `API_TOKEN`, and `JWT_SECRET`.
- Local bookstore startup, focused tests, and approval-gated Confluence documentation.

The approved requirements and design are in [requirements.md](./requirements.md) and [architecture.md](./architecture.md); implementation tasks are recorded in [impl-plan.md](./impl-plan.md).

## Changes

- Updated `docSync.js` to add a generated section to markerless existing documentation without replacing ordinary human text, and to redact the approved four secret-key names.
- Added focused synchronizer regressions for extraction, supported HTTP methods, marker handling, target validation, and redaction.
- Added Demo-1 Gherkin and headed Playwright checks, including an isolated bookstore mutation and isolated `resetDemo.js` run.
- Updated `scripts/confluencePublisher.js` to update an exact-title page already in the configured Confluence space, incrementing its version, instead of attempting a duplicate create.
- Made XHTML entity escaping explicit for ampersands, angle brackets, quotes, and apostrophes, with regression coverage.
- Published the QA Test Plan and Execution Summary under the user story; the page was updated to version 3:
  [Demo-1 QA Test Plan and Execution Summary](https://diwakarpriscilla.atlassian.net/wiki/spaces/DocSync/pages/8487170/Demo-1+Automated+Documentation+Sync+-+QA+Test+Plan+and+Execution+Summary).
- No bookstore server, UI, or `resetDemo.js` implementation changes were part of the release.

## Validation

- `npm run test:unit` — 14 passed, 0 failed.
- `npm run test:e2e -- --headed tests/e2e/demo1-doc-sync.spec.js` — 3 passed, 0 failed.
- `npm run test:e2e -- --headed tests/e2e/bookstore.spec.js --grep "manual reset restores baseline data in an isolated copy"` — 1 passed, 0 failed.
- Local homepage smoke check — HTTP 200.
- Local `GET /api/books` smoke check — HTTP 200 with three books.
- The smoke check observed `Version 1.0 - Baseline`; the server was stopped afterward.
- Automated catalog changes and reset checks ran in isolated temporary copies; the repository catalog remained unchanged.

Detailed scenarios and limitations are in [QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md](./QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md).

## Known Limitations

- Step 6 finding **CR-1** remains unresolved: the final redaction pass can change assignment-like sensitive text in a markerless document's human-authored prefix, conflicting with strict preservation. This edge case is recorded in [code-review.md](./code-review.md) and is not claimed as passing.
- The full existing Playwright suite was not run because it includes a test that mutates the repository catalog. Focused headed checks and isolated mutation/reset fixtures were used.
- No fresh third-party dependency advisory audit was performed.
- Deployment is local only. Step 8 Confluence publication and PR creation are approval-gated; merge requires separate explicit approval. No merge has been performed.

## Deployment Notes

- Start locally with `npm start --prefix bookstore-web-app`; the app serves at `http://localhost:3000`.
- The synchronization command is `node docSync.js` from the repository root; the default target is `./bookstore-web-app`.
- `node resetDemo.js` restores the three starter books and baseline banner while preserving documentation. Do not run it against a shared or live audience catalog.
- Confluence publication targets for this step are the user story page `8454160`:
  - `[Demo-1] Automated Documentation Sync - Build & Local Deployment Guide`
  - `[Demo-1] Automated Documentation Sync - Release Notes`
- These are the Step 8 publication targets under the user story; publishing documentation does not deploy the application.

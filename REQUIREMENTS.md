# Automated Documentation Sync Requirements

## Story Summary

**User Story:** As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that the team's endpoint documentation remains accurate after code changes without manual editing.

**Source:** Confluence page `8454160`, “User Story: Automated Documentation Sync (Bookstore API)”, read successfully at Step 1.

## Repository Context

- The repository contains a dependency-light Node.js bookstore catalog application in `./bookstore-web-app`.
- `docSync.js` provides recursive JavaScript discovery, endpoint/function extraction, marker-based documentation updates, and secret redaction.
- `README.md` and `API_DOCS.md` already exist in the default target folder.
- Existing unit tests cover scanning, marker preservation, missing-document creation, secret redaction, and missing/empty folders.

## Scope

Implement or complete the automated documentation synchronization CLI for the selected project folder. The tool will:

- Recursively scan JavaScript files.
- Extract exported functions, JSDoc summaries and metadata, and supported HTTP endpoints.
- Generate or refresh `README.md` and `API_DOCS.md`.
- Produce a clear console report.
- Handle missing and empty folders safely.

Out of scope for Step 1: implementation, Confluence publication, pull requests, deployments, commits, and later SDLC steps.

## Selected Decisions

The four standardized selections default to option A as explicitly directed:

1. **Target Project Folder:** Option A — scan the Default Bookstore Web App at `./bookstore-web-app`.
2. **Missing Documentation Files:** Option A — automatically create `README.md` and `API_DOCS.md` if absent.
3. **Protecting Manual Notes:** Option A — update only content inside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` markers.
4. **Security & Secret Handling:** Option A — replace passwords and API keys with `[REDACTED]`.

These are assumptions, not user-specific custom choices.

## Functional Requirements

1. The CLI shall use `./bookstore-web-app` as the target folder when no custom folder is supplied.
2. The CLI shall recursively discover files ending in `.js`, excluding `.git` and `node_modules`.
3. The CLI shall extract exported functions and JSDoc descriptions, parameters, and return values.
4. The CLI shall extract Express-style routes and equivalent `request.method`/`url.pathname` endpoint patterns.
5. The CLI shall support `GET`, `POST`, `PUT`, and `DELETE` methods.
6. The CLI shall generate deterministic Markdown documentation for discovered functions and endpoints.
7. The CLI shall refresh only content bounded by a valid start/end marker pair.
8. The CLI shall preserve all content outside valid marker pairs.
9. If a selected documentation file is missing, the CLI shall create it with a title and valid marker pair.
10. If an existing documentation file lacks valid markers, the CLI shall skip it and report the skip.
11. The CLI shall redact sensitive values such as `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` before writing documentation or printing CLI output.
12. The CLI shall report the number and names of scanned JavaScript files and the created, updated, or skipped documentation sections.
13. The CLI shall handle a missing or empty target folder without an unhandled stack trace.

## Non-Functional Requirements

1. The tool shall run locally with Node.js.
2. Output shall be deterministic for unchanged source inputs.
3. Documentation writes shall avoid partial marker-section updates.
4. Secrets shall not be retained in source updates, generated files, logs, reports, or console output.
5. Existing application behavior outside documentation synchronization shall remain unchanged.

## Assumptions

- Documentation files are located in the selected target folder.
- A missing documentation file may be initialized with a Markdown title and a valid DOC-SYNC marker pair.
- Existing files without valid marker pairs are protected and will not be overwritten.
- The default target is `./bookstore-web-app`.
- Sensitive environment-key values shall be represented as `[REDACTED]`.

## Open Questions

- None of the four standardized selections remains unresolved because option A was selected explicitly as the default.
- The story does not specify additional JSDoc fields beyond descriptions, parameters, and return values.

## Measurable Acceptance Criteria

1. With no folder argument, the CLI scans `./bookstore-web-app`.
2. Every nested `.js` file in the target is discovered unless it is under `.git` or `node_modules`.
3. Exported functions and JSDoc metadata are represented in generated API documentation.
4. `GET`, `POST`, `PUT`, and `DELETE` endpoints are represented with their method and path.
5. Updating a marked file leaves text before the start marker and after the end marker byte-for-byte unchanged.
6. A missing `README.md` or `API_DOCS.md` is created with a title and a valid marker pair.
7. An existing file without valid markers is skipped and named in the console report.
8. `DB_PASSWORD`, `JWT_SECRET`, `API_TOKEN`, and their values do not appear in generated documentation or console output.
9. A missing or empty target folder produces a clear report and exits without an unhandled exception.
10. The console report identifies scanned files and each documentation file as created, updated, or skipped.

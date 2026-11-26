# Requirements

## User Story Summary

As a Backend Engineering Lead, the Confluence user story (page `8454160`) requires an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation remains accurate after code updates without manual editing.

The repository context includes `./bookstore-web-app`, existing marker-based `README.md` and `API_DOCS.md` files, and `docSync.js`. The CLI is expected to extract exported functions, JSDoc comments, and `GET`, `POST`, `PUT`, and `DELETE` API endpoints.

## Scope

- **In scope:** Local Node.js CLI behavior for the Demo-1 target folder `./bookstore-web-app`.
- **In scope:** Discovery of `.js` files and extraction of exported functions, JSDoc comments, and `GET`, `POST`, `PUT`, and `DELETE` endpoints.
- **In scope:** Automatic creation of missing `README.md` or `API_DOCS.md` files, updates only inside valid DOC-SYNC marker pairs, secret redaction, and a clear console report.
- **Out of scope:** Architecture, implementation, test execution, release documentation, Confluence publication, pull requests, merges, and code changes. These belong to later SDLC steps.

Human selections:

1. **Target Project Folder:** Option A — `./bookstore-web-app`.
2. **Missing Documentation Files:** Option A — create missing `README.md` and `API_DOCS.md` automatically.
3. **Protecting Manual Notes:** Option A — update only content between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
4. **Security & Secret Handling:** Option A — redact passwords and API keys as `[REDACTED]`.

## Functional Requirements

- **FR-1 — Target selection:** The CLI shall use `./bookstore-web-app` as the Demo-1 target project folder.
- **FR-2 — JavaScript discovery:** The CLI shall discover `.js` files in the target folder recursively and report each discovered file.
- **FR-3 — Function extraction:** The CLI shall extract exported JavaScript functions and their JSDoc comments.
- **FR-4 — Endpoint extraction:** The CLI shall extract HTTP API endpoints for `GET`, `POST`, `PUT`, and `DELETE`.
- **FR-5 — Documentation synchronization:** The CLI shall update generated function and endpoint documentation in `README.md` and `API_DOCS.md`.
- **FR-6 — Missing-file handling:** The CLI shall automatically create `README.md` or `API_DOCS.md` when it is missing.
- **FR-7 — Manual-note protection:** The CLI shall update only content between valid `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` markers.
- **FR-8 — Secret redaction:** The CLI shall replace password and API-key values with `[REDACTED]` before source-derived values are written or printed.
- **FR-9 — Console reporting:** The CLI shall report the number and names of scanned files and each file created or updated.
- **FR-10 — Safe folder handling:** The CLI shall handle a missing or empty target folder with a clear report and no unhandled exception.
- **FR-11 — Invalid-marker handling:** When an existing output file does not contain exactly one valid marker pair, the CLI shall skip that file and name it in the console report.

## Non-Functional Requirements

- **NFR-1 — Local execution:** The CLI shall run locally using Node.js and shall not require an external service for synchronization.
- **NFR-2 — Secret safety:** No password or API-key value found in source data shall appear in generated documentation or console output.
- **NFR-3 — Marker integrity:** Exactly one valid generated section shall be maintained per synchronized output file.
- **NFR-4 — Determinism:** For unchanged source inputs and configuration, generated Markdown and console file status shall be deterministic.
- **NFR-5 — Update safety:** A failed processing or write operation shall not leave a partially written generated section.
- **NFR-6 — Traceability:** Every acceptance criterion shall reference at least one functional or non-functional requirement, and every functional requirement shall have at least one acceptance criterion.

## Assumptions

- Demo-1 uses the user-selected target `./bookstore-web-app`.
- Missing `README.md` and `API_DOCS.md` files are to be created automatically.
- Content outside valid DOC-SYNC marker pairs is human-authored and must remain unchanged.
- Password and API-key values are to be represented as `[REDACTED]`.
- The Confluence story at page `8454160` is the requirements source of truth for Step 1.
- Nested JavaScript files below the target folder are in scope for discovery.

## Acceptance Criteria

- **AC-1 (FR-1, NFR-1):** A Demo-1 run with no custom path resolves to `./bookstore-web-app`; 100% of test scans use that resolved folder.
- **AC-2 (FR-2):** All `.js` files below `./bookstore-web-app`, including nested folders, are listed once in the run report; the report states `0` for an empty folder.
- **AC-3 (FR-3):** For every exported function in the scanned `.js` files, generated documentation identifies the function and any JSDoc summary; a source with no exported functions produces an explicit empty-result entry.
- **AC-4 (FR-4):** Every discovered `GET`, `POST`, `PUT`, and `DELETE` route appears once with its HTTP method and path, or the report explicitly states that no endpoints were found.
- **AC-5 (FR-5):** After a successful run, `README.md` and `API_DOCS.md` contain generated sections derived from the discovered functions and endpoints.
- **AC-6 (FR-6, NFR-3):** When a documentation file is missing, the same run creates that file and it contains exactly one complete DOC-SYNC marker pair.
- **AC-7 (FR-7, NFR-3):** A byte-for-byte comparison confirms that content before the start marker and after the end marker is unchanged after synchronization.
- **AC-8 (FR-8, NFR-2):** In 100% of test inputs containing password or API-key values, those original values are absent from generated files and console output and appear as `[REDACTED]`.
- **AC-9 (FR-9):** The run report identifies the discovered `.js` file count and names every output file created or updated.
- **AC-10 (FR-10):** A missing or empty target folder produces a clear report and exits without an unhandled stack trace.
- **AC-11 (FR-11):** An existing output file with missing or duplicate DOC-SYNC markers is named in the report and is not modified.
- **AC-12 (NFR-4):** Two runs against unchanged source inputs produce identical generated Markdown and file statuses.
- **AC-13 (NFR-5):** If processing or writing fails, no output file contains a partial generated section.
- **AC-14 (NFR-6):** This section references an FR or NFR for every item, and each FR-1 through FR-11 has at least one referenced acceptance criterion.

## Open Questions

- What exact JSDoc fields beyond comments and exported-function names must be rendered?
- What additional endpoint metadata, if any, must accompany method and path?
- Which environment-key names beyond repository-known sensitive keys must trigger redaction?

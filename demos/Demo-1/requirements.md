# Requirements

## User Story Summary

As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation remains accurate after code changes without manual editing.

The repository already contains `./bookstore-web-app/server.js`, `public/app.js`, and existing marker-based documentation for `API_DOCS.md` and `README.md`. The Node.js implementation area includes `docSync.js`, with unit and Playwright test support in `tests/` and `package.json`.

## Scope

- In scope: requirements for a local Node.js CLI that scans `./bookstore-web-app` and synchronizes generated documentation into `README.md` and `API_DOCS.md`.
- In scope: discovery of `.js` files, exported functions, JSDoc comments, and HTTP endpoints for `GET`, `POST`, `PUT`, and `DELETE`.
- In scope: automatic creation of missing documentation files, marker-based updates, secret redaction, and console reporting.
- Out of scope for Step 1: architecture, implementation, test execution, release documentation, external publishing, pull requests, merges, and code changes.
- All human-authored content outside a valid `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` marker pair must be preserved.

## Functional Requirements

- **FR-1 — Target selection:** The CLI shall use `./bookstore-web-app` as the Demo-1 target project folder.
- **FR-2 — JavaScript discovery:** The CLI shall scan JavaScript source files ending in `.js` in the target folder and report the files attempted or scanned.
- **FR-3 — Function extraction:** The CLI shall extract exported JavaScript functions and JSDoc comments from scanned source files.
- **FR-4 — Endpoint extraction:** The CLI shall extract HTTP API endpoints that use `GET`, `POST`, `PUT`, or `DELETE`.
- **FR-5 — Documentation synchronization:** The CLI shall synchronize extracted functions and endpoints into `README.md` and `API_DOCS.md` under generated sections.
- **FR-6 — Missing-file handling:** When `README.md` or `API_DOCS.md` is absent, the CLI shall create it automatically with a valid generated-content marker pair.
- **FR-7 — Manual-note protection:** When a valid marker pair exists, the CLI shall update only content between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`; it shall not overwrite content outside those markers.
- **FR-8 — Secret redaction:** The CLI shall replace passwords and API keys found in source, generated documentation, or console output with `[REDACTED]`; repository-listed keys include `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`.
- **FR-9 — Console reporting:** The CLI shall print a clear run report that identifies scanned files and each documentation file created or updated.
- **FR-10 — Safe folder handling:** The CLI shall handle a missing or empty target folder with a clear report and no unhandled exception.

## Non-Functional Requirements

- **NFR-1 — Local execution:** The CLI shall run locally using Node.js and shall not require an external service for synchronization.
- **NFR-2 — Secret safety:** No original password or API-key value shall appear in generated documentation or console output.
- **NFR-3 — Marker integrity:** A valid marker pair shall remain intact and exactly one generated section shall be synchronized per output file.
- **NFR-4 — Traceability:** Every acceptance criterion shall reference at least one functional or non-functional requirement, and every functional requirement shall have at least one acceptance criterion.
- **NFR-5 — Update safety:** A failed processing or write operation shall not leave a partially written marker section.

## Assumptions

- Demo-1 uses the user-selected target `./bookstore-web-app`.
- Missing `README.md` and `API_DOCS.md` files are to be created automatically.
- Content outside valid DOC-SYNC marker pairs is human-authored and must remain unchanged.
- Password and API-key values are to be represented as `[REDACTED]`.
- The Confluence story at page ID `8454160` is the requirements source of truth for this step.

## Acceptance Criteria

- **AC-1 (FR-1, NFR-1):** A Demo-1 run with no custom path resolves to `./bookstore-web-app` and uses only that folder.
- **AC-2 (FR-2):** For a folder containing 1 or more `.js` files, the run report lists each discovered `.js` file; for a folder containing none, it reports `0` files found.
- **AC-3 (FR-3):** Generated documentation includes each discovered exported function and JSDoc summary or explicitly reports that no items were found.
- **AC-4 (FR-4):** Every discovered `GET`, `POST`, `PUT`, or `DELETE` route is represented in generated documentation with its HTTP method and path, or the report explicitly says that no endpoints were found.
- **AC-5 (FR-5):** After a successful run, `README.md` and `API_DOCS.md` contain synchronized generated sections derived from the scanned source.
- **AC-6 (FR-6, NFR-3):** When a documentation file is missing, it is created in the same run and contains exactly one complete DOC-SYNC marker pair.
- **AC-7 (FR-7, NFR-3):** In an existing file, a byte comparison confirms that content outside the start and end markers is unchanged after synchronization.
- **AC-8 (FR-8, NFR-2):** In 100% of test inputs containing `DB_PASSWORD`, `JWT_SECRET`, or `API_TOKEN`, the original values are absent from generated files and console output and are represented as `[REDACTED]`.
- **AC-9 (FR-9):** The run report lists the scanned-file count and explicitly names each output file created or updated.
- **AC-10 (FR-10):** A missing or empty target folder produces a clear report and does not emit an unhandled stack trace.
- **AC-11 (NFR-4):** This acceptance-criteria section contains a requirement ID reference for every item, and each FR-1 through FR-10 has at least one referenced criterion.
- **AC-12 (NFR-5):** If source processing or output writing fails, no output file is left with a partial generated section.

## Open Questions

- Should `.js` discovery include nested subfolders or only files directly in `./bookstore-web-app`?
- If an existing documentation file lacks one or both DOC-SYNC markers, should it be skipped with a warning or should a marker pair be added?
- What exact JSDoc fields and endpoint metadata must appear in generated sections?
- How should password and API-key values be detected generally, and beyond `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`?

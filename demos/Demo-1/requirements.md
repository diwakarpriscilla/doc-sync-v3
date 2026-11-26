# Requirements

## User Story Summary

As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation stays accurate after code changes without manual editing.

## Scope

- Build a local Node.js CLI for the demo repository's `./bookstore-web-app` project.
- Scan JavaScript source files in the selected target folder and extract exported functions, JSDoc comments, and HTTP endpoints using `GET`, `POST`, `PUT`, and `DELETE`.
- Update or create `README.md` and `API_DOCS.md` for the target project.
- Preserve human-written content outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- Detect and redact passwords and API keys in documentation output and console reporting, using `[REDACTED]`.
- Report scanned files, updated sections, missing folders, and empty folders safely.
- Leave this work at the requirements stage; architecture, implementation, QA, publication, PR, and merge steps are out of scope for Step 1.

## Functional Requirements

- **FR-1 — Target selection:** Use `./bookstore-web-app` as the target project folder; do not use a custom folder unless one is later supplied and recorded.
- **FR-2 — Source discovery:** Scan `.js` files in the selected target folder. Nested-folder recursion is unresolved.
- **FR-3 — Code extraction:** Extract exported JavaScript functions and JSDoc comments from scanned source files.
- **FR-4 — Endpoint extraction:** Extract `GET`, `POST`, `PUT`, and `DELETE` HTTP API endpoints.
- **FR-5 — Documentation update:** Update generated content in `README.md` and `API_DOCS.md` for the target project.
- **FR-6 — Manual-note protection:** When both DOC-SYNC markers exist, change only text between them and leave all text outside them unchanged.
- **FR-7 — Missing documentation:** If `README.md` or `API_DOCS.md` is missing, create the file automatically with a generated-content section.
- **FR-8 — Secret protection:** Replace password and API-key values with `[REDACTED]` before writing documentation or printing a console report. Repository guidance specifically protects `STORE_ADMIN_KEY`, `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`.
- **FR-9 — Console reporting:** Report scanned files and documentation sections updated or skipped.
- **FR-10 — Folder safety:** Handle missing or empty target folders without an unhandled exception.

## Non-Functional Requirements

- **NFR-1 — Local execution:** The CLI is implemented in Node.js and runs locally.
- **NFR-2 — Data protection:** Original secret values are not written to documentation or emitted by the CLI report.
- **NFR-3 — Update safety:** A file update must not leave the documentation partially written when processing or writing fails.
- **NFR-4 — Traceability:** Generated results and acceptance evidence must be traceable to the functional requirements.

## Assumptions

- For Demo-1, the target project is `./bookstore-web-app`.
- Missing `README.md` or `API_DOCS.md` files will be created automatically.
- Existing content outside valid DOC-SYNC marker pairs is human-authored and must remain unchanged.
- Passwords and API keys found in generated output or console reporting will be redacted as `[REDACTED]`.
- The repository may contain live source and existing documentation; no external service other than local Confluence story discovery is used during Step 1.

## Acceptance Criteria

- **AC-1 (FR-1):** Running the CLI without a target path resolves `./bookstore-web-app`; any later custom path is used only after it is explicitly supplied and recorded.
- **AC-2 (FR-2, FR-9):** The CLI produces a successful run report naming each `.js` file scanned, or a clear report naming why no files could be scanned.
- **AC-3 (FR-3, FR-4, FR-5):** Generated documentation contains each discovered exported function, JSDoc comment, and endpoint using `GET`, `POST`, `PUT`, or `DELETE`, or records an explicit no-items-found result.
- **AC-4 (FR-6):** In a file with a valid marker pair, a 100% byte comparison shows text before the start marker and text after the end marker remains unchanged.
- **AC-5 (FR-7):** For each missing output file, the CLI creates that file during the same run and includes exactly one valid DOC-SYNC marker pair.
- **AC-6 (FR-8, NFR-2):** `STORE_ADMIN_KEY`, `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` values do not appear in generated documentation or CLI report output; their displayed representation is `[REDACTED]`.
- **AC-7 (FR-9):** The report identifies the set of files scanned and each documentation section created or updated.
- **AC-8 (FR-10):** A missing or empty target folder produces a clear report and no unhandled exception.
- **AC-9 (NFR-1):** The CLI completes a basic run using the repository's Node.js runtime.
- **AC-10 (NFR-3):** If processing or writing fails, all documentation outputs remain byte-for-byte unchanged.
- **AC-11 (NFR-4):** Each acceptance criterion is mapped to at least one requirement ID and each functional requirement has at least one mapped acceptance criterion.

## Open Questions

- Should `.js` discovery include nested subfolders or only files directly in `./bookstore-web-app`?
- If an existing documentation file lacks one or both DOC-SYNC markers, should it be skipped with a warning or should a marker pair be added?
- What exact JSDoc fields and endpoint metadata must appear in generated sections?
- How should secret values be detected, and should redaction extend beyond the four repository-listed key names?
- Should an empty target folder be a successful no-op or return a non-zero CLI exit status?

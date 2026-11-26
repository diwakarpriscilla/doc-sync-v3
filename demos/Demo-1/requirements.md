# Requirements

## User Story Summary

As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation stays accurate after code changes without manual editing.

## Scope

- Implement a local Node.js CLI that scans `.js` files in a selected target folder.
- Use `./bookstore-web-app` as the default target and allow a custom folder path.
- Extract exported functions, JSDoc comments, and HTTP API endpoints using `GET`, `POST`, `PUT`, and `DELETE`.
- Update `README.md` and `API_DOCS.md` in the selected target folder while preserving human-written content outside the generated section.
- Automatically create either documentation file when it is missing.
- Redact values for `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`.
- Report scanned files and updated documentation sections, and safely handle missing or empty target folders.

## Functional Requirements

- **FR-1 — Target selection:** When no target path is supplied, scan `./bookstore-web-app`. Accept a supplied custom target path.
- **FR-2 — Source discovery:** Scan `.js` files in the selected target folder. Whether discovery is recursive remains an open question.
- **FR-3 — API and code extraction:** Extract exported functions, their JSDoc comments, and HTTP endpoints for `GET`, `POST`, `PUT`, and `DELETE`.
- **FR-4 — Documentation outputs:** Update `README.md` and `API_DOCS.md` inside the selected target folder.
- **FR-5 — Preserve human-authored text:** For an existing document containing `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`, update generated content only between those markers and leave content outside them unchanged.
- **FR-6 — Create missing documents:** If either output document is absent, create it with a starter title and a generated-content marker pair.
- **FR-7 — Redact sensitive values:** Before writing generated documentation or printing report output, replace values associated with `DB_PASSWORD`, `JWT_SECRET`, or `API_TOKEN` with `[REDACTED]`.
- **FR-8 — Report results:** Print a clear console report identifying scanned files and updated documentation sections.
- **FR-9 — Handle target-folder conditions:** Handle missing or empty target folders safely and report the condition clearly.

## Non-Functional Requirements

- **NFR-1 — Local execution:** Implement the CLI in Node.js and support local execution.
- **NFR-2 — Data protection:** Never print or store the original values of the specified sensitive keys in generated documentation or CLI report output.
- **NFR-3 — Safe updates:** Avoid leaving partially written documentation if scanning or generation fails.

## Assumptions

- The selected folder contains the project source files and the two documentation outputs.
- The default target is `./bookstore-web-app`; users may provide a custom folder path.
- Missing `README.md` or `API_DOCS.md` files are created automatically with a starter title and marker pair.
- Existing human-written content is protected by limiting generated-content changes to the marker range.
- The user selected option A for each standardized question: default Bookstore Web App target, create missing documentation files, update only between markers, and redact sensitive values.

## Acceptance Criteria

- **AC-1 (FR-1):** Invoking the CLI without a target path selects `./bookstore-web-app`; invoking it with a custom path selects that folder.
- **AC-2 (FR-2, FR-8):** The CLI scans `.js` files in the selected folder and identifies the processed files in its report.
- **AC-3 (FR-3, FR-4):** Generated documentation includes discovered exported functions, JSDoc comments, and endpoints using `GET`, `POST`, `PUT`, and `DELETE` in the selected folder's `README.md` and `API_DOCS.md`.
- **AC-4 (FR-5):** For each existing output file with a valid marker pair, content before and after the pair remains unchanged after an update.
- **AC-5 (FR-6):** If either output file is absent, the CLI creates it with a starter title and exactly one valid generated-content marker pair.
- **AC-6 (FR-7, NFR-2):** Values associated with `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` do not appear in generated documentation or report output; their documented representation is `[REDACTED]`.
- **AC-7 (FR-8):** The report identifies scanned files and the documentation sections updated.
- **AC-8 (FR-9):** For a missing or empty target folder, the CLI reports the condition without an unhandled exception.
- **AC-9 (NFR-1):** The CLI can be run locally with Node.js.
- **AC-10 (NFR-3):** If scanning or generation fails, neither documentation output is left partially written.

## Open Questions

- Should `.js` discovery include nested subfolders or only files directly in the target folder?
- If an existing documentation file lacks one or both generated-content markers, should the CLI skip it with a warning or add a marker section?
- What exact JSDoc fields and endpoint metadata should the generated sections contain?
- How should the CLI identify sensitive values in source files (for example, assignment syntax, quoted values, or values loaded from environment variables), and should redaction cover other secret key names beyond the three specified?
- Should an empty target folder be treated as a successful no-op with a report, or as a non-zero CLI result?

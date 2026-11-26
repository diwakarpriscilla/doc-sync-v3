# Requirements

## User Story Summary

Source: Confluence page 8454160, “User Story: Automated Documentation Sync (Bookstore API)” (version 1).

As a Backend Engineering Lead, I want a local CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation stays accurate after code changes without manual editing. The story calls for extracting exported functions, JSDoc comments, and `GET`, `POST`, `PUT`, and `DELETE` endpoints; preserving human-written notes outside generated sections; redacting `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`; reporting scanned files and updated sections; and safely handling missing or empty folders.

Repository context: the project includes `bookstore-web-app` Node.js server and public app files, along with `docSync.js`, `resetDemo.js`, and this Demo-1 requirements document.

## Scope

- **In scope:** Synchronize generated API and project documentation from JavaScript sources under the selected target folder.
- **In scope:** Report discovered source files and documentation sections that were created or updated.
- **Out of scope for Step 1:** Architecture, implementation, tests, release materials, Confluence publication, Git commits, and pull requests. These remain later SDLC steps.
- **Recorded choices:**
  1. **Target project folder:** A — Default Bookstore Web App (`./bookstore-web-app`).
  2. **Missing documentation files:** A — Create `README.md` and `API_DOCS.md` automatically.
  3. **Protecting human notes:** A — Only update inside DOC-SYNC markers.
  4. **Security & secret handling:** A — Automatically redact secrets as `[REDACTED]`.

## Functional Requirements

- **FR-1 — Target folder:** By default, the CLI shall use `./bookstore-web-app` as its target folder.
- **FR-2 — JavaScript discovery:** The CLI shall scan JavaScript (`.js`) source files in the target folder.
- **FR-3 — Function documentation:** The CLI shall extract exported functions and their JSDoc comments for documentation.
- **FR-4 — Endpoint documentation:** The CLI shall extract HTTP API endpoints using `GET`, `POST`, `PUT`, and `DELETE`.
- **FR-5 — Documentation outputs:** The CLI shall synchronize the extracted documentation into `README.md` and `API_DOCS.md`.
- **FR-6 — Missing outputs:** If either documentation output is missing, the CLI shall create it automatically.
- **FR-7 — Generated-section boundaries:** The CLI shall update generated content only within DOC-SYNC markers and preserve content outside those markers.
- **FR-8 — Sensitive-value redaction:** Before writing generated content or reporting source-derived values, the CLI shall redact values for `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` as `[REDACTED]`.
- **FR-9 — Run report:** The CLI shall clearly report scanned files and documentation sections that it created or updated.
- **FR-10 — Safe folder handling:** The CLI shall handle missing or empty target folders safely and provide a clear report.

## Non-Functional Requirements

- **NFR-1 — Local operation:** Synchronization shall run locally and update the documentation files without requiring a remote service.
- **NFR-2 — Secret safety:** Values associated with the story's sensitive keys (`DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`) shall not be exposed in generated documentation or the run report.
- **NFR-3 — Human-content preservation:** Existing content outside valid DOC-SYNC markers shall remain unchanged during synchronization.
- **NFR-4 — Safe failure reporting:** Missing or empty target folders shall not result in an unhandled exception.

## Assumptions

- The target folder for this Demo-1 run is `./bookstore-web-app`, per the recorded selection.
- Missing `README.md` and `API_DOCS.md` outputs are to be created, per the recorded selection.
- Generated sections use DOC-SYNC markers; content outside those sections is human-authored and must be preserved.
- The sensitive values explicitly identified by the story are values for `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`.
- The Confluence story at page 8454160 is the source of truth for the requested behavior.

## Acceptance Criteria

- **AC-1 (FR-1):** With no custom target supplied, the CLI selects `./bookstore-web-app`.
- **AC-2 (FR-2):** A run reports the `.js` files it scanned in the selected target folder; an empty folder is reported as having no files to scan.
- **AC-3 (FR-3):** For each discovered exported function, generated documentation includes its name and any associated JSDoc comment.
- **AC-4 (FR-4):** Each discovered `GET`, `POST`, `PUT`, or `DELETE` endpoint is represented in generated documentation with its method and route information.
- **AC-5 (FR-5):** A successful synchronization updates generated sections in both `README.md` and `API_DOCS.md`.
- **AC-6 (FR-6):** If either output file is absent before a run, that file is created by the run.
- **AC-7 (FR-7, NFR-3):** Comparing content outside DOC-SYNC markers before and after a run shows no changes to that content.
- **AC-8 (FR-8, NFR-2):** For source values associated with each of `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`, the original sensitive value does not appear in generated documentation or the run report; its generated representation is `[REDACTED]`.
- **AC-9 (FR-9):** The run report identifies the scanned files and names each documentation output it created or updated.
- **AC-10 (FR-10, NFR-4):** A missing or empty target folder results in a clear report and no unhandled exception.
- **AC-11 (NFR-1):** Synchronization of local source files and documentation completes without requiring a remote synchronization service.

## Open Questions

- Which JSDoc fields beyond the comment text and exported function name need structured output?
- Which route frameworks or endpoint declaration patterns must the scanner recognize?
- What should happen when an existing documentation file has missing or malformed DOC-SYNC markers?
- Should sensitive keys beyond `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` also be redacted?

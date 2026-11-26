# Part A: QA Test Plan

## Scope

This Demo-1 QA run covers the approved local documentation-sync behavior and its bookstore preview:

- CLI scanning, captured console output, default-target resolution, document creation/update, markerless README preservation, endpoint/function output, and secret redaction.
- Browser-rendered bookstore HTML and a featured-book mutation performed only in an isolated temporary app copy.
- `resetDemo.js` execution only in the isolated temporary fixture used by the existing reset Playwright test.
- Focused documentation-sync and Confluence publication-guard unit checks.

The Gherkin scenarios are in [`demo-1-qa.feature`](./demo-1-qa.feature). Executable Playwright checks are in [`demo1-doc-sync.spec.js`](../../tests/e2e/demo1-doc-sync.spec.js), with the isolated reset check in [`bookstore.spec.js`](../../tests/e2e/bookstore.spec.js).

## Test Environment

- Platform: Windows; Node.js `v26.12.0`.
- Playwright Test: `1.65.1`.
- Browser mode: headed (`--headed`).
- The repository Playwright configuration starts the bookstore server at `http://localhost:3000`. The browser mutation scenario starts a separate server on a temporary available port against a copied app.
- CLI target folders, browser mutation data, and reset data are temporary fixtures. The repository's `bookstore-web-app/data/books.json` was not changed.
- No remote services or credentials are used by these QA checks.

## Test Data Matrix

| Data set | Purpose | Expected result |
| --- | --- | --- |
| Temporary `server.js` with a documented `GET /api/books` route | Exercise captured CLI output and generated Markdown | One JavaScript file is reported; the endpoint and function are documented. |
| Markerless temporary README with ordinary human notes | Exercise document initialization | The original text remains an unchanged prefix and one DOC-SYNC block is appended. |
| Runtime-generated synthetic value associated with `STORE_ADMIN_KEY` | Exercise source-derived redaction without recording a value | The value is absent from both generated documents and captured CLI output; generated documentation shows `[REDACTED]`. |
| `baselineRead`: Atomic Habits | Verify the isolated bookstore baseline renders | The baseline book is visible in the HTML preview. |
| `positiveMutation`: The Pragmatic Programmer by Andrew Hunt | Verify isolated featured-book addition and persistence | The book and featured badge appear and remain after reload in the temporary copy. |
| `negativeSecretChecks`: `STORE_ADMIN_KEY` marker name only | Identify the redaction marker under test | No secret value is stored in the fixture. |
| Temporary reset fixture | Exercise `resetDemo.js` without touching the repository catalog | Three starter books and baseline banner are restored; temporary human README remains unchanged. |

Shared book data is stored in [`books.test-data.json`](../../tests/fixtures/books.test-data.json), and the Playwright test validates its collection and record shapes when loaded.

## FR/NFR Traceability Matrix

| Requirement | Verification |
| --- | --- |
| FR-1 / AC-1 — default target | Headed Playwright runs the copied CLI without an argument and verifies it targets the adjacent copied bookstore folder. |
| FR-2 / AC-2 — JavaScript discovery | CLI scenarios verify the reported source-file names and counts; unit tests cover empty targets. |
| FR-3 / AC-3 — function/JSDoc extraction | Focused unit test verifies documented named/arrow functions, export status, parameters, and returns. |
| FR-4 / AC-4 — endpoint extraction | Headed CLI scenario checks `GET`; focused unit tests check `GET`, `POST`, `PUT`, and `DELETE`. |
| FR-5 / AC-5 — both documentation outputs | CLI scenarios verify README and API documentation are created or updated. |
| FR-6 / AC-6 — missing outputs | CLI scenario verifies creation of missing `API_DOCS.md`; focused unit tests cover missing outputs. |
| FR-7 / AC-7 — marker boundaries and human content | Headed CLI scenario checks the markerless README's original prefix and one appended block; unit tests cover marker updates, malformed markers, and CRLF initialization. See the known limitation under Part B. |
| FR-8 / AC-8 — secret redaction | Headed CLI scenario checks `STORE_ADMIN_KEY`; focused unit tests cover all four approved keys and absence of sample values in generated output and CLI streams. |
| FR-9 / AC-9 — run report | Headed CLI checks captured file lists, discovery counts, and document statuses. |
| FR-10 / AC-10 — safe folder handling | Focused unit tests verify clear missing-target reporting and safe empty-target handling. |
| NFR-1 / AC-11 — local operation | All sync and reset checks run locally against temporary files; no remote sync service is used. |
| NFR-2 — secret safety | Unit and headed CLI checks verify synthetic secret values are not emitted. |
| NFR-3 — human-content preservation | Markerless ordinary notes and valid marker regions are tested; the sensitive-assignment edge case remains open as noted below. |
| NFR-4 — safe failure reporting | Missing and empty target cases are covered by the focused unit suite. |

## Entry/Exit Criteria

- **Entry:** Approved requirements, implementation, and Step 6 review are available; Playwright and the reset script are present.
- **Isolation:** Never reset or mutate the repository's live catalog during these checks. Positive mutation and reset run only against temporary copies.
- **Exit for this execution:** All listed automated checks complete; actual outcomes and limitations are recorded; no secret values are included.
- **Acceptance caveat:** The Step 6 finding CR-1 remains unresolved. Therefore, passing the scenarios below does not establish full compliance for the sensitive-assignment edge case in AC-7/NFR-3.

# Part B: QA Execution Summary

## Execution Metadata

- **Demo:** Demo-1
- **Execution date:** 2026-11-26
- **Browser mode:** Headed (`--headed`)
- **Confluence publication:** Not performed; awaiting Step 7 approval.
- **Exact Confluence title:** `[Demo-1] Automated Documentation Sync - QA Test Plan and Execution Summary`
- **Parent page:** `User Story: Automated Documentation Sync (Bookstore API)` — page ID `8454160`.
- **Source document:** [`demos/Demo-1/QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md`](./QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md).
- **Gherkin source:** [`demos/Demo-1/demo-1-qa.feature`](./demo-1-qa.feature).

## Exact Commands Run

| Command | Actual result |
| --- | --- |
| `npm run test:unit` | **Passed** — 12 tests passed, 0 failed. |
| `npm run test:e2e -- --headed tests/e2e/demo1-doc-sync.spec.js` | **Passed** — 3 headed Playwright tests passed, 0 failed. |
| `npm run test:e2e -- --headed tests/e2e/bookstore.spec.js --grep "manual reset restores baseline data in an isolated copy"` | **Passed** — 1 headed Playwright reset test passed, 0 failed. |
| `node --check tests/e2e/demo1-doc-sync.spec.js` | **Passed** — syntax check completed successfully. |
| `git diff --check` | **Passed** — no whitespace errors. |

## Pass/Fail Metrics Table

| Check group | Passed | Failed | Blocked |
| --- | ---: | ---: | ---: |
| Gherkin scenario groups executed | 5 | 0 | 0 |
| Headed Playwright tests | 4 | 0 | 0 |
| Focused Node unit tests | 12 | 0 | 0 |
| Total automated tests | 16 | 0 | 0 |

The known CR-1 acceptance risk below is not counted as a passing or failing test in these execution metrics; it was previously reproduced and recorded during Step 6.

## Scenario-by-Scenario Result Log

| Gherkin scenario | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| CLI reports scanned files and creates redacted Markdown | Report lists the source and document statuses; generated Markdown includes the endpoint, preserves ordinary README notes, and omits the synthetic secret value. | Headed Playwright captured the expected scan/update output, checked the generated route and `[REDACTED]`, confirmed the original README prefix, and found no synthetic value in the output streams or documents. | **Passed** |
| CLI default target resolves beside an isolated copy | No-argument execution scans and updates the copied `bookstore-web-app`, not another directory. | Headed Playwright confirmed the copied path, two scanned JavaScript files, and both updated documents; the copied README prefix remained unchanged. | **Passed** |
| Bookstore HTML preview and book mutation use an isolated copy | Baseline HTML renders; the featured mutation is visible and persists after reload; repository catalog remains unchanged. | Headed Playwright rendered the baseline book, added The Pragmatic Programmer by Andrew Hunt in the temporary copy, verified its featured state after reload, and confirmed the temporary data file contained the mutation. The repository catalog remained unchanged. | **Passed** |
| Reset restores only an isolated bookstore fixture | Reset returns the temporary catalog/banner to baseline and leaves its human README unchanged. | The headed Playwright reset check passed using its temporary fixture; it verified three starter books, the baseline banner, and unchanged README content. | **Passed** |
| Focused unit checks cover documentation sync behavior | Extraction, endpoint, marker, redaction, and target-folder checks pass. | `npm run test:unit` reported 12 passed and 0 failed. | **Passed** |

## Failures/Limitations

- **Execution failures:** None in the commands listed above.
- **Known unresolved acceptance risk — Step 6 CR-1:** The final whole-document redaction pass can modify sensitive-assignment-looking text in a markerless document's human-authored prefix. The ordinary-note markerless scenario passed, but it does not cover this edge case. The finding was reproduced during Step 6; it is not claimed as passed here and remains relevant to AC-7/NFR-3.
- The bookstore application has no in-app Markdown renderer. The generated Markdown was inspected from temporary `README.md` and `API_DOCS.md` files, while the HTML preview was rendered in the headed browser.
- The full existing E2E suite was not run because it includes a test that mutates the repository catalog. Targeted Playwright tests were used instead; the add-book and reset checks ran only in isolated temporary copies.
- The repository catalog was not reset or changed by automated tests. No Confluence publication or Git commit has been performed for Step 7.

# Implementation Plan

## Goal and Scope

Implement and verify the approved local documentation-sync behavior for `./bookstore-web-app`, using [`docSync.js`](../../docSync.js) and its existing focused test suite as the primary implementation surface.

The plan preserves the existing bookstore website, catalog API, and [`resetDemo.js`](../../resetDemo.js) behavior unless a confirmed requirement demonstrates a direct dependency. It does not add bookstore `PUT` or `DELETE` endpoints merely to exercise the synchronizer; those methods will be covered with isolated source fixtures.

Three scope gates must be resolved before implementation changes:

1. The supported JavaScript function/export, JSDoc, and route declaration patterns are still open from the design review.
2. The selected target's `README.md` exists without DOC-SYNC markers, while its `API_DOCS.md` has a valid pair. The approved “only update inside DOC-SYNC markers” choice and the requirement to update both documents need a consistent behavior for this markerless README.
3. The implementation instruction names `STORE_ADMIN_KEY`, `API_TOKEN`, and `JWT_SECRET`, while the approved requirements name `DB_PASSWORD`, `API_TOKEN`, and `JWT_SECRET`. The exact redaction key set must be reconciled before changing it.

## Requirements and Architecture References

- Approved requirements: [`requirements.md`](./requirements.md)
- Approved architecture: [`architecture.md`](./architecture.md)
- Step 3 design review: [`design-review.md`](./design-review.md)
- Existing synchronizer: [`docSync.js`](../../docSync.js)
- Existing focused tests: [`tests/docSync.test.js`](../../tests/docSync.test.js)
- Default project inputs and documentation: [`bookstore-web-app/`](../../bookstore-web-app)
- Demo reset behavior: [`resetDemo.js`](../../resetDemo.js)

## Ordered Tasks

| ID | Task | Prerequisites | Verifiable outcome |
| --- | --- | --- | --- |
| P-01 | Confirm supported extraction contract | None | An approved, explicit list defines supported function/export forms, JSDoc fields, route declaration patterns, and intentional exclusions. It covers the four required HTTP methods without implying universal JavaScript parsing. |
| P-02 | Resolve markerless README behavior | None | An approved decision reconciles preserving content outside markers with the existing markerless `bookstore-web-app/README.md` and the requirement to update both documentation outputs. The decision is reflected in requirements/acceptance criteria before code changes. |
| P-03 | Reconcile the sensitive-key set | None | The approved list resolves the `STORE_ADMIN_KEY` versus `DB_PASSWORD` mismatch and is consistent across the requirements, architecture, tests, and implementation instructions. |
| P-04 | Map the confirmed contract to current code | P-01, P-02, P-03 | A gap checklist maps each approved FR and AC to current behavior and a test. It records which parts of `docSync.js` already satisfy the contract and identifies only confirmed gaps. |
| P-05 | Add or adjust focused regression tests | P-04 | `tests/docSync.test.js` covers the agreed function/export and route forms, `GET`/`POST`/`PUT`/`DELETE`, approved secret keys, marker behavior, missing outputs, missing/empty targets, and report outcomes as applicable. Each new test has a specific requirement or confirmed gap. |
| P-06 | Implement only confirmed synchronizer gaps | P-05 | `docSync.js` changes satisfy the approved contract and focused tests, while retaining local operation, deterministic ordering, marker preservation, and current error/reporting conventions. |
| P-07 | Validate synchronization on an isolated repository copy | P-06, P-02 | A disposable repository copy containing `docSync.js` and `bookstore-web-app` runs without a target argument and produces the expected output; byte comparisons show human-authored content is preserved according to P-02; sensitive values are absent from files and console output; created/updated/skipped statuses match the decision. |
| P-08 | Verify bookstore and reset behavior remain in scope | P-06 | The existing catalog/API and `resetDemo.js` are unchanged unless a confirmed direct dependency exists. No live demo data or banner is reset as part of synchronization validation. |
| P-09 | Complete acceptance and change-scope review | P-07, P-08 | A final checklist reports results for AC-1 through AC-11, the focused test outcome, any remaining limitations, and the exact implementation files changed. |

## Dependencies

- P-01, P-02, and P-03 are independent decision gates and all must finish before P-04.
- P-04 depends on all three scope decisions so tests do not encode assumptions.
- P-05 depends on the gap checklist; P-06 depends on the tests.
- P-07 depends on P-06 and the markerless-file decision in P-02.
- P-08 depends on P-06 and verifies that unrelated bookstore/reset behavior stays unchanged.
- P-09 depends on both integration validation and the no-scope-creep check.

Dependency order: `P-01 + P-02 + P-03 -> P-04 -> P-05 -> P-06 -> P-07 + P-08 -> P-09`.

## Validation

- Run the focused suite with `node --test tests/docSync.test.js`.
- Use temporary project fixtures for source-pattern coverage, all four HTTP methods, secret redaction, marker edge cases, and missing/empty target handling.
- In an isolated copy of the repository, run the CLI without a target argument and verify the default target, scanned file names/count, and each output status.
- Compare bytes before and after outside generated sections according to the approved markerless README decision.
- Search generated files and captured stdout/stderr for test secret values; assert each approved sensitive value is absent and represented as `[REDACTED]` where applicable.
- Do not use the live `resetDemo.js` script for tests; it rewrites catalog data and the app banner.

## Risks and Mitigations

- **Unbounded parser expectations:** Unspecified source patterns could be silently missed. Resolve P-01, then encode the agreed cases in fixtures and document exclusions.
- **Markerless README conflict:** The current README has no markers; silently adding or overwriting content could violate the approved preservation choice. Resolve P-02 before integrating against the tracked target.
- **Redaction-key mismatch:** Changing only one of the competing lists could leave a required key unredacted or expand scope without approval. Resolve P-03 and test every approved key.
- **False positives from testing app methods:** The current bookstore API implements `GET` and `POST`; the CLI's `PUT`/`DELETE` extraction should be tested with fixtures, not unrelated app changes.
- **Live demo reset side effects:** `resetDemo.js` rewrites `data/books.json` and `public/index.html`. Keep it out of synchronization test commands and verify the working tree instead.
- **Multi-file partial update:** Each documentation file is written independently. Keep the existing per-file temporary-write behavior and verify each output status; do not claim a cross-file transaction.

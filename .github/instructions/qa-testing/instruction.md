---
name: qa-testing-instruction
description: Prescriptive Gherkin, Playwright locator, fixture, and QA report standards.
applyTo: "**/*test*,**/*.feature,**/*.spec.js"
---
# QA & Playwright BDD Conventions

## Locator naming
- Name every reusable Playwright locator with the `loc_` prefix or a semantic control suffix: `Input`, `Button`, or `List`.
- Use `camelCase` names, such as `loc_search`, `searchInput`, `addBookButton`, and `bookList`. Do not use ambiguous names such as `element` or `item`.
- Use `camelCase` for functions and `UPPER_SNAKE_CASE` for constants.

## Typed book test data
- Keep shared book test data in `tests/fixtures/books.test-data.json`; do not duplicate book records inline in specs.
- Define and use this record shape in tests with JSDoc: `@typedef {{ id: string, title: string, author: string, genre: string, featured: boolean, expectedVisible: boolean }} BookFixture`. Validate fixture records against these required fields when loading the JSON.
- Type the fixture object with JSDoc as `@typedef {{ baselineRead: BookFixture[], positiveMutation: BookFixture[], negativeSecretChecks: string[] }} BookTestData`. The JSON top level must contain exactly these three collections. The first two contain records of the required shape; `negativeSecretChecks` contains marker names only, never secret values.
- Include a baseline read record for **Atomic Habits**, a positive mutation record for **The Pragmatic Programmer** by **Andrew Hunt**, and a negative secret check for **STORE_ADMIN_KEY**. Do not use the baseline record as mutation input.
- Keep test mutations isolated and restore application state using the repository's reset flow where applicable.

## QA report structure
- Write the QA deliverable as two distinct, ordered parts. Do not mix execution results into the plan or replace either part with a prose-only summary.
- Part A must have exactly these required headings:
  - `# Part A: QA Test Plan`
  - `## Scope`
  - `## Test Environment`
  - `## Test Data Matrix`
  - `## FR/NFR Traceability Matrix`
  - `## Entry/Exit Criteria`
- Part B must have exactly these required headings:
  - `# Part B: QA Execution Summary`
  - `## Execution Metadata`
  - `## Exact Commands Run`
  - `## Pass/Fail Metrics Table`
  - `## Scenario-by-Scenario Result Log`
  - `## Failures/Limitations`
- The scenario log must report each scenario's expected and actual result, and clearly identify pass, fail, or blocked status. Metrics must agree with the log.
- Report zero secret values: never include credentials, tokens, key contents, or other sensitive values. Secret checks may identify the marker name only.

## Gherkin example
```gherkin
Feature: Bookstore Catalog Live Search and Add Book
  Scenario: Add a new book and verify catalog update
    Given the Bookstore app is running at "http://localhost:3000"
    When the user adds "The Pragmatic Programmer" by "Andrew Hunt"
    Then the catalog displays 4 books including "The Pragmatic Programmer"
```

## Playwright Data Types & Locators
- Use typed Playwright fixtures: `/** @param {{ page: import("@playwright/test").Page }} param0 */`, `Locator`, and the complete `BookFixture` shape specified above.
- Leave the newly added test book visible post-run until `node resetDemo.js` is executed.

---
name: qa-testing-instruction
description: Gherkin BDD feature file standards and Playwright TypeScript/JavaScript data types and locators.
applyTo: "**/*test*,**/*.feature,**/*.spec.js"
---
# QA & Playwright BDD Conventions

## Gherkin Example
```gherkin
Feature: Bookstore Catalog Live Search and Add Book
  Scenario: Add a new book and verify catalog update
    Given the Bookstore app is running at "http://localhost:3000"
    When the user adds "The Pragmatic Programmer" by "Andrew Hunt"
    Then the catalog displays 4 books including "The Pragmatic Programmer"
```

## Playwright Data Types & Locators
- Use typed Playwright fixtures: `/** @param {{ page: import("@playwright/test").Page }} param0 */`, `Locator`, and structured JSON book objects `{ title: string, author: string, genre: string, featured: boolean }`.
- Leave the newly added test book visible post-run until `node resetDemo.js` is executed.

---
name: gherkin-playwright-qa
description: Writes Gherkin feature files, executes Playwright checks, and produces an approval-gated QA report.
---

# Gherkin and Playwright QA

1. Write every test case in `.feature` files using Gherkin `Feature`, `Scenario`, and `Given`/`When`/`Then` steps.
2. Execute automated checks with Playwright, covering:
   - CLI behavior and captured CLI output;
   - the generated HTML/Markdown preview;
   - the `resetDemo.js` flow using an isolated temporary fixture, never resetting the live audience catalog during automated tests.
3. Do not claim a scenario passed unless the Playwright run produced evidence. If `resetDemo.js` or another target/fixture is absent, mark that check blocked and request approval before adding a scoped fixture or implementation.
4. Create a **QA Test Plan + Execution Summary** with scope, scenarios, commands, execution results, failures, and limitations. Exclude credentials and other secrets.
5. Preview the report and the exact title `[Demo-x] Automated Documentation Sync - QA Test Plan and Execution Summary`, parent page, and source file. Ask **Do you approve Step 7, or would you like changes?** Stop.
6. When the user replies **`Approved`**, publish the previewed report with `node scripts/confluencePublisher.js create --title "Automated Documentation Sync - QA Test Plan and Execution Summary" --file QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md --parent-id <story-page-id> --demo Demo-4 --approved`, replacing the parent ID and `Demo-4` with the configured story page ID and actual supplied session. Report the confirmed page URL. Do not request a second publication approval.
7. Commit only Step 7's work after successful publication. Do not start Step 8. Stop and output exactly: `Step 7 is complete. Immediately proceed to the next step if running under orchestrator-sdlc.`

Never publish or commit before Step 7 approval; never create a PR or merge without the relevant explicit approval.

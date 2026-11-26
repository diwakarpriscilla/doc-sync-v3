---
name: orchestrator-sdlc
description: Executes all eight SDLC steps directly, in sequence, in one chat thread with human approval gates.
user-invocable: true
---
# SDLC Orchestrator

## Operating mode

- Execute Steps 1 through 8 yourself, directly and sequentially in this same chat thread.
- Never spawn, invoke, or hand work off to isolated specialist agents. Their agent files may be read as reference, but do not delegate execution to them.
- At the start of each step, read and follow the phase instruction and skill file(s) listed in the step map below. Also follow applicable repository-wide instructions and the referenced skill's complete workflow.
- Complete only the current step, show what was completed and what remains planned, preview the step's work, then pause for explicit user approval.
- At the end of every step, ask exactly: **Do you approve Step [X], or would you like changes?**
- If the user requests changes, revise only the current step, show the revised preview, and ask again.
- As soon as the user replies **`Approved`**, finish the current step's approval-gated actions, commit only that step's approved work as specified by its instructions, and immediately begin the next numbered step in this same chat. Never tell the user to invoke another agent manually.
- Step 8 is the final step. Keep its separate merge-approval gate; an approval to Step 8 does not authorize merging.
- Do not claim that a file change, test, publication, deployment, commit, push, PR, or merge succeeded unless it was actually completed and confirmed.

## Step map

| Step | Work | Phase instruction | Skill file(s) |
|---|---|---|---|
| 1 | Requirements | `.github/instructions/requirements/instruction.md` | `.github/skills/confluence-ops/SKILL.md` |
| 2 | Architecture | `.github/instructions/architecture/instruction.md` | `.github/skills/create-architecture-diagram/SKILL.md`, `.github/skills/confluence-ops/SKILL.md` |
| 3 | Architecture design review | `.github/instructions/architecture/instruction.md` | `.github/skills/create-architecture-diagram/SKILL.md`, `.github/skills/git-ops/SKILL.md` |
| 4 | Implementation plan | `.github/instructions/implementation/instruction.md` | `.github/skills/git-ops/SKILL.md` |
| 5 | Implementation | `.github/instructions/implementation/instruction.md` | `.github/skills/git-ops/SKILL.md` |
| 6 | Seven-point peer code review | `.github/instructions/implementation/instruction.md`, `.github/instructions/qa-testing/instruction.md` | `.github/skills/git-ops/SKILL.md` |
| 7 | QA plan and execution | `.github/instructions/qa-testing/instruction.md` | `.github/skills/gherkin-playwright-qa/SKILL.md`, `.github/skills/qa-playwright-skill/SKILL.md`, `.github/skills/confluence-ops/SKILL.md` |
| 8 | Local release and PR | `.github/instructions/release-git/instruction.md` | `.github/skills/git-ops/SKILL.md`, `.github/skills/confluence-ops/SKILL.md` |

Use the step map to load and apply the actual file contents; this table does not replace them. For steps with multiple files, follow all listed instructions and skills where applicable. Keep each step's scope limited to its defined deliverables.

## Step 1: Requirements

Read the User Story from Confluence using `node scripts/confluencePublisher.js read`, following the requirements instruction and `confluence-ops` skill. Summarize the story and repository context, then display all four questions below with their complete option labels. Do not abbreviate choices to just `A` or `B`, and do not substitute technical questions:

1. **Target project folder**
   - `A: Default Bookstore Web App (./bookstore-web-app)`
   - `B: Custom folder path`
2. **Missing documentation files**
   - `A: Create README.md & API_DOCS.md automatically`
   - `B: Skip and show a warning`
3. **Protecting human notes**
   - `A: Only update inside DOC-SYNC markers`
   - `B: Overwrite the entire file`
4. **Security & secret handling**
   - `A: Automatically redact secrets as [REDACTED]`
   - `B: Include secrets as-is`

Tell the user: **You can reply All A's or pick A/B for each.** Interpret `All A's` as selecting A for all four questions. Record the answers; if a custom folder was selected without a path, ask only for that path. Create `requirements.md` using the required headings and measurable, traceable acceptance criteria. Preview it and the recorded choices before the Step 1 approval question.

## Step 2: Architecture

Use the approved requirements and repository evidence. Create `architecture.md` with the required headings and two Mermaid `flowchart LR` diagrams, each labeling the actor exactly `Bookstore Storefront Manager`. Render and preview the diagrams as SVG. Preview the exact Confluence title `[Demo-x] Automated Documentation Sync - Architecture`, parent page, source document, and image attachments. After Step 2 approval, publish that exact preview using `scripts/confluencePublisher.js` with `--approved`, then commit only Step 2's work. Confirm the page URL and attachment names before beginning Step 3.

## Step 3: Architecture design review

Review the approved architecture against the approved requirements and repository evidence. Save `design-review.md` with actionable severity-rated findings, evidence, impact, recommendations, open questions, and a clear conclusion; make only minimal directly related architecture corrections if required and record them. Preview the report and any correction. After approval, commit only Step 3's review work and directly related approved corrections, then begin Step 4.

## Step 4: Implementation plan

Create `impl-plan.md` as a dependency-ordered task list based on the approved requirements, architecture, and design review. Give each task a stable ID, explicit prerequisites, and a verifiable outcome. Preview the plan. After approval, commit only Step 4's plan and begin Step 5.

## Step 5: Implementation

Implement the approved `impl-plan.md` in the Bookstore Web App, `docSync.js`, and `resetDemo.js` as scoped by the plan. Preserve existing behavior beyond approved changes, follow implementation conventions, and run focused validation. Preview the changes and test evidence. After approval, commit only Step 5's implementation work and begin Step 6.

## Step 6: Seven-point peer code review

Review the in-scope implementation and relevant diff against the approved requirements, architecture, and plan. Save `code-review.md` covering correctness, security, error handling, test coverage, code clarity, DRY principle, and dependency safety. Include severity, file/line evidence, impact, and recommendations for findings; state explicitly when an area has no findings. Do not edit implementation code or mark findings resolved. Preview the report and checks actually run. After approval, commit only Step 6's review report and begin Step 7.

## Step 7: QA plan and execution

Create Gherkin `.feature` tests, execute the required Playwright checks, and produce the two-part QA plan and execution summary using the exact headings in the QA instruction. Report expected and actual results for each scenario and reconcile metrics with the scenario log; do not claim unverified passes. Preview the report, exact Confluence title `[Demo-x] Automated Documentation Sync - QA Test Plan and Execution Summary`, parent page, and source file. After Step 7 approval, publish the previewed report using `scripts/confluencePublisher.js` with `--approved`, then commit only Step 7's work. Confirm the page URL before beginning Step 8.

## Step 8: Release

Deploy locally only. Create the required deployment guide and release notes from verified outcomes. Preview both documents, exact Confluence targets, tracked-file commit plan, branch, and PR body; exclude `.env` and `node_modules/`. After Step 8 approval, perform only those previewed and approved publication, Git, and PR actions, following the release instruction and `git-ops`/`confluence-ops` skills. Report confirmed outcomes. Present the PR state and merge consequences, then request separate explicit approval before merging. Do not merge without it.

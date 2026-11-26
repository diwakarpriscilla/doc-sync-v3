---
name: architect-agent
description: Produces a Mermaid architecture design and publishes it only after approval.
---

# Architect Agent

Own Step 2 only. Follow `.github/copilot-instructions.md` and the `create-architecture-diagram` skill. Begin only after Step 1 is approved.

## Required architecture document

- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants when naming code elements.
- Create `architecture.md` with these exact headings, in order: `# Architecture`, `## Overview`, `## Goals and Constraints`, `## Components`, `## Component Diagram`, `## Data-Flow Diagram`, `## Interfaces`, `## Data Flows`, `## Failure Handling`, `## Security and Privacy`, `## Design Decisions`, and `## Requirements Traceability`.
- Include Mermaid `flowchart LR` source for both diagrams. In each diagram, label the user/actor exactly `Bookstore Storefront Manager`. Render both diagrams locally to SVG; preview the renders and confirm that they match the source.

1. Read the approved `requirements.md` and relevant repository context.
2. Create the document following the exact headings above, with concise design decisions, interfaces, and failure handling.
3. Render each Mermaid diagram locally to SVG with `@mermaid-js/mermaid-cli`; preview the rendered diagrams and explain any rendering limitations. Preview the exact Confluence title `[Demo-x] Automated Documentation Sync - Architecture`, parent page, source file, and diagram attachments. Ask **Do you approve Step 2, or would you like changes?** Stop until approved.
4. When the user replies **`Approved`**, treat that as approval to finish Step 2 and publish the previewed architecture. Use `scripts/confluencePublisher.js` with `--approved` to create the page under `CONFLUENCE_STORY_PAGE_ID`, using the title `Automated Documentation Sync - Architecture` and the actual supplied Demo session token (for example `--demo Demo-4`; do not pass the literal `Demo-x`). The publisher must render and attach the Mermaid SVG image(s) and embed them in the page. Confirm the page URL and attached diagram names; if publication fails, report a sanitized error and do not retry with other credentials.
5. Commit only Step 2's architecture work after successful publication. Do not start or invoke Step 3. Stop and output exactly: `Step 2 is complete. If invoked in single-agent mode, stop here; if coordinated by orchestrator-sdlc, immediately proceed to the next step.`

Do not create a PR or merge.

---
name: requirements-instruction
description: Rules and conventions for gathering requirements from Confluence and asking standardized A/B questions.
applyTo: "**/*requirements*"
---
# Requirements Phase Conventions
- Fetch the User Story from Confluence using `confluencePublisher.js`.
- Present the 4 standardized non-technical A/B multiple-choice questions.
- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants in any code identifiers included in the requirements.
- If requirements reference Mermaid diagrams, label the user role exactly `Bookstore Storefront Manager`.
- Create `requirements.md` with these exact headings, in this order:
  1. `# Requirements`
  2. `## User Story Summary`
  3. `## Scope`
  4. `## Functional Requirements`
  5. `## Non-Functional Requirements`
  6. `## Assumptions`
  7. `## Acceptance Criteria`
  8. `## Open Questions`
- Make acceptance criteria measurable and traceable to functional or non-functional requirements. Put unresolved decisions under `Open Questions`; do not silently assume answers.

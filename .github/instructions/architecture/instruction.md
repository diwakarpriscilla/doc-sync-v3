---
name: architecture-instruction
description: Architecture rules, Mermaid.js diagram standards, and Bookstore Storefront Manager role conventions.
applyTo: "**/*architecture*"
---
# Architecture Phase Conventions
- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants when naming code elements in architecture artifacts.
- Use Mermaid.js `flowchart LR` for both component and data-flow diagrams. Label the user/actor role exactly `Bookstore Storefront Manager` in each diagram; do not abbreviate or rename it.
- Render Mermaid diagrams to visual images (PNG/SVG) before embedding in Confluence.
- Create `architecture.md` with these exact headings, in this order:
  1. `# Architecture`
  2. `## Overview`
  3. `## Goals and Constraints`
  4. `## Components`
  5. `## Component Diagram`
  6. `## Data-Flow Diagram`
  7. `## Interfaces`
  8. `## Data Flows`
  9. `## Failure Handling`
  10. `## Security and Privacy`
  11. `## Design Decisions`
  12. `## Requirements Traceability`
- Include both diagrams as Mermaid source in the document and ensure their rendered images correspond to that source.

---
name: implementation-instruction
description: Node.js coding standards, marker preservation, and secret redaction rules.
applyTo: "**/*.js"
---
# Implementation Conventions
- Use clean, zero-dependency or minimal Node.js modules.
- Name functions and variables in `camelCase`; name constants in `UPPER_SNAKE_CASE`.
- For any Mermaid diagrams included in implementation documentation, use the exact user role label `Bookstore Storefront Manager`.
- Preserve manual text outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- Redact sensitive keys (`STORE_ADMIN_KEY`, `API_TOKEN`, `JWT_SECRET`) as `[REDACTED]`.
- Create `IMPLEMENTATION_PLAN.md` with these exact headings, in this order:
  1. `# Implementation Plan`
  2. `## Goal and Scope`
  3. `## Requirements and Architecture References`
  4. `## Ordered Tasks`
  5. `## Dependencies`
  6. `## Validation`
  7. `## Risks and Mitigations`
- Order tasks by dependency, identify prerequisites explicitly, and give each task a stable ID and verifiable outcome.

---
name: implementation-instruction
description: Node.js coding standards, marker preservation, and secret redaction rules.
applyTo: "**/*.js"
---
# Implementation Conventions
- Use clean, zero-dependency or minimal Node.js modules.
- Preserve manual text outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- Redact sensitive keys (`STORE_ADMIN_KEY`, `API_TOKEN`, `JWT_SECRET`) as `[REDACTED]`.

---
name: create-architecture-diagram
description: Creates, previews, and approval-gates architecture.md with Mermaid component and data-flow diagrams.
---

# Create Architecture Diagram

1. Use the approved `requirements.md` and repository evidence; do not invent components or integrations.
2. Create or update `architecture.md` with:
   - a Mermaid `flowchart` or `graph` component diagram;
   - a Mermaid data-flow diagram showing actors, boundaries, and relevant data movement;
   - concise design decisions and failure handling.
3. Check Mermaid syntax, label the user/actor role **Bookstore Storefront Manager**, and render/preview both diagrams locally as SVG using `@mermaid-js/mermaid-cli`. If rendering fails, report the error and do not claim a visual preview.
4. Preview the exact title `[Demo-x] Automated Documentation Sync - Architecture`, parent page, source file, and visual attachments. Summarize the file and preview, then ask **Do you approve Step 2, or would you like changes?** Stop until approved.
5. When the user replies **`Approved`**, publish the previewed page with `node scripts/confluencePublisher.js create --title "Automated Documentation Sync - Architecture" --file architecture.md --parent-id <story-page-id> --demo Demo-4 --approved`, replacing the parent ID and `Demo-4` with the configured story page ID and actual supplied session. The publisher renders Mermaid SVGs, attaches them to the new page, and embeds them in storage-format XHTML. Report the confirmed page URL and attachment names. Do not request a second publication approval.
6. Commit only Step 2's work after successful publication. Do not start Step 3. Stop and output exactly: `Step 2 is complete. Immediately proceed to the next step if running under orchestrator-sdlc.`

Never publish or commit before Step 2 approval; never create a PR or merge without the relevant explicit approval.

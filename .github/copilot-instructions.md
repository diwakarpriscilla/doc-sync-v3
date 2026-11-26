# Automated Documentation Sync & Bookstore Catalog (v3)

## Overview
This project provides a local Node.js Bookstore Catalog Web App (`bookstore-web-app/`) paired with an Automated Documentation Sync CLI (`docSync.js`), Confluence integration (`confluencePublisher.js`), and a 1-click demo reset (`resetDemo.js`).

## Services & Components
- `docSync.js`: Scans JavaScript files, extracts JSDoc/routes, and updates `README.md` / `API_DOCS.md` strictly between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- `bookstore-web-app/`: Express/HTTP web interface (`http://localhost:3000`) with live search and add-book catalog features.
- `confluencePublisher.js`: Publishes Markdown and rendered Mermaid diagrams to Confluence using `.env`.
- `resetDemo.js`: Restores `books.json` and `README.md` to baseline state.

## Global Rules & Constraints
- **Secret Protection:** Always redact `STORE_ADMIN_KEY`, `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` as `[REDACTED]`.
- **Protected Sections:** Never modify manual notes outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- **Demo Session Tagging:** Require a `[Demo-x]` session prefix on all Confluence pages, Git branches, and PRs.
- **Human-in-the-Loop:** Pause at every SDLC checkpoint for explicit user `Approved` sign-off before committing, publishing, or merging.

# Bookstore Web App

**Version 2.0 - Live Demo**

A dependency-light bookstore web app that runs at http://localhost:3000 with four live books.

The live catalog includes *The Pragmatic Programmer* as a featured new arrival.
The new book remains in the catalog until you manually run `node resetDemo.js`.

## Run

```powershell
cd bookstore-web-app
npm start
```

## Reset demo data

```powershell
node resetDemo.js
```

This restores the three starter books and changes the banner back to `Version 1.0 - Baseline`.
Documentation files are preserved.
<!-- DOC-SYNC-START -->
## Generated API Overview

| Method | Path | Source |
| --- | --- | --- |
| GET | /api/books | server.js |
| POST | /api/books | server.js |
<!-- DOC-SYNC-END -->

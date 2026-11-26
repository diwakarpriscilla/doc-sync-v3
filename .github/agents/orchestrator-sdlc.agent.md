---
name: orchestrator-sdlc
description: Master SDLC orchestrator that coordinates Requirements, Architecture, Review, Implementation, QA Playwright, and Release agents end-to-end with Human-in-the-Loop approval gates.
user-invocable: true
---
# SDLC Master Orchestrator

## Shared output and naming standards

- Use `camelCase` for function names and `UPPER_SNAKE_CASE` for constants.
- Every Mermaid architecture diagram must label the user role exactly `Bookstore Storefront Manager`.
- Enforce these required artifact headings when coordinating agents:
  - `requirements.md`: `# Requirements`, `## User Story Summary`, `## Scope`, `## Functional Requirements`, `## Non-Functional Requirements`, `## Assumptions`, `## Acceptance Criteria`, `## Open Questions`.
  - `architecture.md`: `# Architecture`, `## Overview`, `## Goals and Constraints`, `## Components`, `## Component Diagram`, `## Data-Flow Diagram`, `## Interfaces`, `## Data Flows`, `## Failure Handling`, `## Security and Privacy`, `## Design Decisions`, `## Requirements Traceability`.
  - QA report: exactly `# Part A: QA Test Plan` with `## Scope`, `## Test Environment`, `## Test Data Matrix`, `## FR/NFR Traceability Matrix`, `## Entry/Exit Criteria`, followed by `# Part B: QA Execution Summary` with `## Execution Metadata`, `## Exact Commands Run`, `## Pass/Fail Metrics Table`, `## Scenario-by-Scenario Result Log`, `## Failures/Limitations`.
  - `BUILD_AND_LOCAL_DEPLOYMENT_GUIDE.md`: `# Build & Local Deployment Guide`, `## Status`, `## Prerequisites`, `## Build`, `## Local Deployment`, `## Verification Results`, `## Local Stop and Rollback`.
  - `RELEASE_NOTES.md`: `# Release Notes`, `## Release Summary`, `## Scope`, `## Changes`, `## Validation`, `## Known Limitations`, `## Deployment Notes`.

Coordinate Steps 1 through 8 across specialist agents (`requirements-agent`, `architect-agent`, `reviewer-agent`, `qa-agent`, `release-agent`) using `confluence-ops` and `git-ops` skills. Always require a `[Demo-x]` prefix and pause for explicit `Approved` sign-off after every step.

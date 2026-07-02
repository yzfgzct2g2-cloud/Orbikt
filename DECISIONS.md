# Orbikt Product Decisions

This document records all product decisions that have been finalized.

Claude Code must treat these decisions as immutable unless explicitly changed by the project owner.

---

## Product

Product Name

Orbikt

Mission

Plan Once.
Build Through.
Finish Completely.

---

## Product Philosophy

Orbikt is a Professional Workspace.

It is NOT:

- a portal
- a dashboard collection
- a collection of independent systems

Everything revolves around the Case Workspace.

---

## Architecture

Blueprint First Development.

No redesign during implementation.

Blueprint has the highest priority.

---

## Navigation

Homepage = Command Center

Command Center answers:

"What should I do today?"

NOT

"What functions are available?"

---

## Workspace

Every case has ONE Workspace.

All work must happen inside Workspace.

Workspace contains:

- Overview
- AA01
- FA310
- Dispatch
- Visit
- Genogram
- Attachments
- Timeline

---

## Module Rules

AA01 is NOT an independent homepage.

FA310 is NOT an independent homepage.

Dispatch is NOT an independent homepage.

Visit Manager is NOT an independent homepage.

Genogram is NOT an independent homepage.

All modules live inside Workspace.

---

## Source of Truth

Visit warning

SSOT = Visit Manager (Google Apps Script)

Dashboard must never create another visit warning algorithm.

---

Dispatch

SSOT = Existing Dispatch System

Dashboard displays dispatch status only.

---

Knowledge

Knowledge must preserve traceable sources.

AI answers must always reference the knowledge base.

---

## Development Rules

Existing systems should be integrated.

Do NOT rewrite completed systems.

Wrap first.

Refactor later.

---

## Stop Conditions

Claude Code may stop ONLY when:

- API key is missing
- External authorization is required
- Blueprint conflict exists
- Source system is missing
- Data loss may occur

Otherwise continue automatically.

---

## Release Goal

One planning.

Continuous implementation.

Release Orbikt V1.
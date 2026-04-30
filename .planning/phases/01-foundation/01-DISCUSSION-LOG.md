# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 1-Foundation
**Areas discussed:** Storage schema, Options page layout, Sample prompts, Delete UX

---

## Storage Schema

### Storage key structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single array key | `{ prompts: [{id, title, category, body}, ...] }` — one read/write for the whole list | ✓ |
| Object map by ID | `{ prompts: { 'abc123': {...} } }` — efficient single-item updates | |

**User's choice:** Single array key

---

### Prompt ID format

| Option | Description | Selected |
|--------|-------------|----------|
| Short random ID | 8-char hex via `crypto.randomUUID()` or `Math.random().toString(16)` | ✓ |
| Timestamp-based ID | `Date.now().toString(36)` — sortable but collision-prone | |
| Sequential integer | 1, 2, 3... with a separate `maxId` counter | |

**User's choice:** Short random ID

---

### First-install seed location

| Option | Description | Selected |
|--------|-------------|----------|
| background.js onInstalled | Fires once on first install — clean, runs before any popup opens | ✓ |
| options.js / popup.js on load | Check if empty each open, seed if empty | |

**User's choice:** background.js onInstalled

---

### Sample prompts file location

| Option | Description | Selected |
|--------|-------------|----------|
| Separate data file | `prompts/sample-prompts.js` as a global loaded before background.js | ✓ |
| Inline in background.js | Array defined at the top of background.js | |

**User's choice:** Separate data file

---

## Options Page Layout

### Page structure

| Option | Description | Selected |
|--------|-------------|----------|
| Split panel | List on left, edit form on right — click to populate | ✓ |
| Form below list | Full-width list at top, form below | |

**User's choice:** Split panel

---

### New prompt interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Clear form + deselect list | [+ New] clears the form, deselects highlighted item | ✓ |
| Blank row in list | New empty item appears at top of list, pre-selected | |

**User's choice:** Clear form + deselect list

---

### Category input

| Option | Description | Selected |
|--------|-------------|----------|
| Free-text input | Plain `<input type="text">` — no constraint on names | ✓ |
| `<datalist>` with suggestions | Shows existing categories as you type | |

**User's choice:** Free-text input

---

### Options page search/filter

| Option | Description | Selected |
|--------|-------------|----------|
| No — list only | Search lives in popup (Phase 2), keeps Phase 1 focused | ✓ |
| Basic title search | Simple filter input above list | |

**User's choice:** No search or filter on options page

---

## Sample Prompts

### Categories

| Option | Description | Selected |
|--------|-------------|----------|
| Coding, Explaining, Writing | Three concrete categories for the target audience | ✓ |
| Dev, Learning, Communication | Slightly broader set | |

**User's choice:** Coding, Explaining, Writing

---

### Body style

| Option | Description | Selected |
|--------|-------------|----------|
| Short + practical | 2–4 sentences, genuinely reusable daily, no placeholders | ✓ |
| Full template-style | Longer with [PLACEHOLDERS] and structured sections | |

**User's choice:** Short + practical

---

## Delete UX

### Confirmation pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Inline two-step | Delete → "Are you sure?" on first click; second click confirms; click elsewhere resets | ✓ |
| Browser confirm() dialog | `confirm('Delete this prompt?')` — one line of code | |

**User's choice:** Inline two-step confirmation

---

## Claude's Discretion

None — all presented areas had a user-selected answer.

## Deferred Ideas

None raised during this discussion.

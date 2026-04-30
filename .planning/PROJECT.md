# Prompt Pal

## What This Is

A Chrome extension that gives you a searchable prompt library in a browser popup — click any prompt and it injects directly into the AI chat input on ChatGPT, Gemini, or Claude. Prompts are stored locally with a built-in editor, and optionally synced from a GitHub repo for version control and sharing. Built for self-learners, junior devs, and non-native English speakers who repeat the same detailed prompts across AI tools daily.

## Core Value

One click from prompt library to AI chat input — no copy-paste, no memory required.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Chrome extension popup with prompt search and category browse
- [ ] Click a prompt → it injects into the active AI chat input field
- [ ] Works on chat.openai.com, gemini.google.com, and claude.ai
- [ ] Prompts stored in chrome.storage.local (works offline, no account needed)
- [ ] Built-in editor: add, edit, delete prompts from the extension options page
- [ ] Prompts have title, category, and body (with optional [PLACEHOLDER] variables)
- [ ] Inject prompt as-is — placeholders remain, user edits them in the chat box
- [ ] Optional GitHub sync: paste a repo URL to fetch and import prompts

### Out of Scope

- Fill-in modal for placeholders — adds complexity; inject-as-is is simpler and enough
- Tags/multi-label system for v1 — category + search is enough to start; add when library grows
- Firefox or other browsers — Chrome only for v1
- Backend/server/accounts — fully local, no backend needed
- Build system or bundler — vanilla JS, no build step

## Context

- User has prior Chrome extension experience (built Daily Vocab extension) — understands manifest.json, popup, content scripts
- Each AI site (ChatGPT, Gemini, Claude) uses React or similar — `textarea.value = text` silently fails; content scripts must dispatch synthetic input events after setting value. Claude uses a contenteditable div, not a textarea — requires separate injection strategy
- Prompt format: markdown files with YAML frontmatter (`title`, `category`) and body text
- GitHub sync is for technical users; non-technical users use the built-in editor only
- Open-source goal: others fork the repo and point the extension at their own GitHub repo URL

## Constraints

- **Tech stack**: Vanilla JS, HTML, CSS only — user knows these, no unnecessary complexity, no build step
- **Compatibility**: Chrome Manifest V3 (current standard, required for Chrome Web Store)
- **Dependencies**: Minimal — no npm packages in the extension itself; a markdown frontmatter parser may be acceptable if lightweight (or hand-rolled)
- **Scope**: v1 targets 3 AI sites (ChatGPT, Gemini, Claude); adding more sites is additive in later phases

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Inject as-is (no placeholder fill-in modal) | Simpler UX; user is already in the chat box and can edit there | — Pending |
| Local storage + built-in editor as default | Non-technical users can't manage GitHub repos; local-first is accessible to everyone | — Pending |
| GitHub sync as optional power feature | Technical users (and the author) want version control and sharing without forcing it on others | — Pending |
| Vanilla JS, no build step | User already knows it; Chrome extensions don't need a bundler; keeps onboarding easy for open-source contributors | — Pending |
| Category + text search (no tags) for v1 | Avoid over-engineering; flat structure is fine when you're the primary user | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-30 after initialization*

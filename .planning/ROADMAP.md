# Roadmap: Prompt Pal

**Milestone:** v1.0 — Core Extension
**Total phases:** 4
**Requirements covered:** 18/18

## Phases

- [x] **Phase 1: Foundation** — Data model, chrome.storage, options page CRUD, sample prompts
- [x] **Phase 2: Popup UI** — Searchable prompt list, category filter, keyboard nav, inject trigger
- [x] **Phase 3: Injection** — Site-specific content scripts for Claude, ChatGPT, Gemini + error handling
- [ ] **Phase 4: Import & Sync** — File import for non-technical users + GitHub sync for developers

---

## Phase Details

### Phase 1: Foundation

**Goal:** Prompts can be stored, edited, and retrieved so every other phase has real data to work with.
**Depends on:** Nothing
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, OPT-01, OPT-02, OPT-03
**UI hint:** yes

**Success criteria:**
1. User installs the extension and opens the options page to see 5-8 pre-loaded sample prompts — the prompt list is never empty on first launch.
2. User can create a new prompt with a title, category, and body — the prompt appears in the list immediately and survives a browser restart.
3. User can edit an existing prompt's fields and delete one after confirming — changes persist without any account or sign-in.
4. The markdown frontmatter parser correctly extracts `title` and `category` from a `.md` file body (validated via a console test or options page import preview).

**Plans:** TBD

---

### Phase 2: Popup UI

**Goal:** Users can find any prompt in seconds and trigger injection from the popup without touching a mouse.
**Depends on:** Phase 1
**Requirements:** POP-01, POP-02, POP-03, POP-04
**UI hint:** yes

**Success criteria:**
1. User types into the search box and the prompt list filters live — results update as each character is typed across both title and body.
2. User selects a category from the filter and only prompts in that category are shown — switching back to "All" restores the full list.
3. User clicks a prompt while on a supported AI chat page — the popup closes and the prompt text appears in the chat input.
4. User opens the popup, presses arrow keys to move through the list, and presses Enter to inject — no mouse interaction required.

**Plans:** TBD

---

### Phase 3: Injection

**Goal:** Clicking a prompt in the popup reliably populates the chat input on Claude, ChatGPT, and Gemini so the AI can actually receive and send it.
**Depends on:** Phase 2
**Requirements:** INJ-01, INJ-02, INJ-03, INJ-04
**UI hint:** no

**Success criteria:**
1. User clicks a prompt while on `chat.openai.com` — the text appears in the chat textarea and submitting the message works (React state is updated, not just the DOM value).
2. User clicks a prompt while on `claude.ai` — the text appears in the ProseMirror contenteditable editor and the Send button becomes active.
3. User clicks a prompt while on `gemini.google.com` — the text appears in the contenteditable input and the site recognizes it as ready to send.
4. User clicks a prompt while on a non-AI page or after a site DOM update breaks detection — a visible error message appears rather than silent failure.

**Plans:** TBD

---

### Phase 4: Import & Sync

**Goal:** Any user — technical or not — can bulk-import prompts. Non-technical users upload a formatted file; developers point the extension at a GitHub repo.
**Depends on:** Phase 1
**Requirements:** SYNC-01, SYNC-02, SYNC-03 + new FILE-01
**UI hint:** yes

**Two tracks:**

**Track A — File import (non-technical users):**
- User clicks "Import from file" on the options page and picks one or more `.md` files
- Each file follows the existing frontmatter format (`title`, `category`, body)
- Extension parses them with the existing `parseFrontmatter()` utility and appends to storage (dedup by title)
- We provide a downloadable template file so users know the exact format to follow

**Track B — GitHub sync (developers):**
- User pastes a public GitHub repo URL and clicks Sync
- Extension fetches `.md` files from the repo via GitHub Contents API and imports them
- Dedup by title: existing prompts are skipped, only new ones added
- Re-sync blocked for 30 minutes to stay within GitHub's unauthenticated rate limit (60 req/hour)

**Success criteria:**
1. Non-technical user downloads the template, fills in prompts, clicks "Import from file" — prompts appear in the library without typing them one by one.
2. Developer pastes a GitHub repo URL and clicks Sync — all `.md` prompts from that repo are imported.
3. Running either import again does not create duplicates — titles already in storage are skipped.
4. GitHub re-sync is blocked for 30 minutes after the last successful sync.

**Plans:** TBD

---

## Progress

| Phase | Name | Plans Complete | Status | Completed |
|-------|------|----------------|--------|-----------|
| 1 | Foundation | 2/2 | Complete | 2026-05-04 |
| 2 | Popup UI | 1/1 | Complete | 2026-05-06 |
| 3 | Injection | 1/1 | Complete | 2026-05-06 |
| 4 | Import & Sync | 0/? | Not started | — |

---
*Roadmap created: 2026-04-30*
*Last updated: 2026-05-06 — Phase 3 complete; Phase 4 scope expanded to include file import*

# Roadmap: Prompt Pal

**Milestone:** v1.0 — Core Extension
**Total phases:** 4
**Requirements covered:** 18/18

## Phases

- [ ] **Phase 1: Foundation** — Data model, chrome.storage, options page CRUD, sample prompts
- [ ] **Phase 2: Popup UI** — Searchable prompt list, category filter, keyboard nav, inject trigger
- [ ] **Phase 3: Injection** — Site-specific content scripts for Claude, ChatGPT, Gemini + error handling
- [ ] **Phase 4: GitHub Sync** — Import prompts from a GitHub repo URL with dedup and rate limiting

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

### Phase 4: GitHub Sync

**Goal:** Technical users can point the extension at any GitHub repo URL and import its prompts without duplicating ones they already have.
**Depends on:** Phase 1
**Requirements:** SYNC-01, SYNC-02, SYNC-03
**UI hint:** yes

**Success criteria:**
1. User pastes a GitHub repo URL into the options page and clicks Sync — prompts from that repo are fetched and added to the local library.
2. Running sync again on a repo that was already imported does not create duplicate prompts — only new titles are added; existing ones are skipped.
3. User who just synced cannot trigger another sync for 30 minutes — the UI shows a disabled state or countdown so the rate-limit behavior is transparent.

**Plans:** TBD

---

## Progress

| Phase | Name | Plans Complete | Status | Completed |
|-------|------|----------------|--------|-----------|
| 1 | Foundation | 0/? | Not started | — |
| 2 | Popup UI | 0/? | Not started | — |
| 3 | Injection | 0/? | Not started | — |
| 4 | GitHub Sync | 0/? | Not started | — |

---
*Roadmap created: 2026-04-30*
*Last updated: 2026-04-30 after initial roadmap creation*

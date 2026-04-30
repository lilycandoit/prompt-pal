# Requirements: Prompt Pal

**Defined:** 2026-04-30
**Core Value:** One click from prompt library to AI chat input — no copy-paste, no memory required.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Extension stores prompts with title, category, and body as structured data in `chrome.storage.local`
- [ ] **FOUND-02**: Prompts persist across browser restarts and extension updates without any user account
- [ ] **FOUND-03**: Extension parses markdown files with YAML frontmatter (`title`, `category`) and body text for the GitHub sync import path
- [ ] **FOUND-04**: Extension ships with 5–8 sample prompts on first install so the popup is never empty on first launch

### Popup

- [ ] **POP-01**: User can search prompts by title and body text as they type, with results updating live
- [ ] **POP-02**: User can filter the prompt list by category
- [ ] **POP-03**: User can click a prompt to inject it into the active AI chat input field, after which the popup closes
- [ ] **POP-04**: User can navigate the prompt list with keyboard (search auto-focused on open, arrow keys to move, Enter to inject)

### Options Page

- [ ] **OPT-01**: User can create a new prompt by filling in title, category, and body fields
- [ ] **OPT-02**: User can edit an existing prompt's title, category, or body
- [ ] **OPT-03**: User can delete a prompt after confirming via a confirmation dialog

### Injection

- [ ] **INJ-01**: Prompt text is injected into the ChatGPT chat input (`chat.openai.com`) and is recognized by the React-controlled textarea so that sending the message works
- [ ] **INJ-02**: Prompt text is injected into the Claude chat input (`claude.ai`) and is recognized by the ProseMirror contenteditable editor so that sending the message works
- [ ] **INJ-03**: Prompt text is injected into the Gemini chat input (`gemini.google.com`) and is recognized by the contenteditable editor so that sending the message works
- [ ] **INJ-04**: When the extension cannot find or inject into the chat input (site updated, wrong page, content script not loaded), the user sees a clear error message rather than silent failure

### GitHub Sync

- [ ] **SYNC-01**: User can paste a GitHub repository URL in the options page to import prompts from that repo
- [ ] **SYNC-02**: Imported prompts are merged with existing local prompts using append-and-deduplicate (prompts with matching titles are skipped; new prompts are added)
- [ ] **SYNC-03**: The extension throttles sync requests — re-sync is blocked for 30 minutes after the last successful sync to stay within GitHub's 60 unauthenticated requests/hour limit

## v2 Requirements

### Extended Site Support

- **SITES-01**: Prompt injection works on Perplexity AI (`perplexity.ai`)
- **SITES-02**: Prompt injection works on Grok (`x.com/i/grok`)
- **SITES-03**: Prompt injection works on Mistral (`chat.mistral.ai`)
- **SITES-04**: Architecture supports adding new AI sites without modifying the core extension structure

### Enhanced Sync

- **SYNC-04**: User can authenticate with a GitHub personal access token to increase rate limit to 5,000 requests/hour
- **SYNC-05**: User can configure sync to auto-refresh on popup open (with rate limit guard)

### UX Improvements

- **UX-01**: User sees a prompt preview on hover before injecting
- **UX-02**: User can duplicate an existing prompt as a starting point for a new one

## Out of Scope

| Feature | Reason |
|---------|--------|
| Placeholder fill-in modal | Added complexity; inject-as-is is simpler and sufficient — user edits placeholders directly in the chat box |
| Tags / multi-label system | Category + text search is enough for v1; add when the library grows beyond what one person manages |
| Backend / user accounts | Fully local by design; no server required, no sign-up friction |
| Firefox / Safari / Edge | Chrome-only for v1; extension manifest differs enough to warrant a separate effort |
| Build system / npm / bundler | Vanilla JS, no build step — keeps the project simple and contributor-friendly |
| Cloud sync (non-GitHub) | GitHub covers the version-control use case; other sync services add backend complexity |
| AI-assisted prompt generation | Out of scope for a prompt *manager* — users provide their own prompts |

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | — | Pending |
| FOUND-02 | — | Pending |
| FOUND-03 | — | Pending |
| FOUND-04 | — | Pending |
| POP-01 | — | Pending |
| POP-02 | — | Pending |
| POP-03 | — | Pending |
| POP-04 | — | Pending |
| OPT-01 | — | Pending |
| OPT-02 | — | Pending |
| OPT-03 | — | Pending |
| INJ-01 | — | Pending |
| INJ-02 | — | Pending |
| INJ-03 | — | Pending |
| INJ-04 | — | Pending |
| SYNC-01 | — | Pending |
| SYNC-02 | — | Pending |
| SYNC-03 | — | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0 (updated after roadmap)
- Unmapped: 18 ⚠️

---
*Requirements defined: 2026-04-30*
*Last updated: 2026-04-30 after initial definition*

# Phase 1: Foundation - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the data layer and options page CRUD so every other phase has real, persistent data to work with. Deliverables: chrome.storage.local schema, first-install sample prompt seed, and a split-panel options page (list + create/edit/delete form). No search, no popup, no injection — those are Phase 2 and 3.

</domain>

<decisions>
## Implementation Decisions

### Storage Schema
- **D-01:** Prompts live under a single `prompts` key in `chrome.storage.local` as a flat array: `{ prompts: [{id, title, category, body}, ...] }`. Read/write the whole array atomically.
- **D-02:** Each prompt gets an 8-char hex ID generated at creation time (e.g., `crypto.randomUUID().slice(0,8)` or `Math.random().toString(16).slice(2,10)`). Stable across edits; never reused after deletion.
- **D-03:** First-install seed runs in `background.js` inside `chrome.runtime.onInstalled` with `reason === 'install'`. Sets `{ prompts: SAMPLE_PROMPTS }` once.
- **D-04:** Sample prompts are defined in a separate file (`prompts/sample-prompts.js`) as a `const SAMPLE_PROMPTS = [...]` global, declared in `manifest.json` before `background.js` so it's available as a global.

### Options Page Layout
- **D-05:** Split-panel layout — prompt list on the left, edit form on the right. Clicking a list item populates the form.
- **D-06:** `[+ New]` button clears the right-side form and deselects the highlighted list item. No blank row inserted into the list. User fills the form and saves.
- **D-07:** Category field is a plain `<input type="text">` — free text, no `<datalist>` or dropdown. No enforcement of a fixed category set.
- **D-08:** No search or filter on the options page. The list shows all prompts. Search belongs in the popup (Phase 2).

### Sample Prompts
- **D-09:** Three categories: `Coding`, `Explaining`, `Writing`. These become the default vocabulary users see across the extension.
- **D-10:** Prompt bodies are short and practical — 2–4 sentences, genuinely reusable daily by junior devs, self-learners, and non-native English speakers. No `[PLACEHOLDER]` template style. Aim for 5–8 prompts distributed across the three categories.

### Delete UX
- **D-11:** Inline two-step confirmation. First click on `[Delete]` changes the button label/style to `[Are you sure?]`. Second click on the same button confirms deletion. Clicking anywhere else resets the button to `[Delete]`. No browser `confirm()` dialog.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-04 (data model, persistence, frontmatter parsing, sample prompts) and OPT-01 through OPT-03 (create, edit, delete)
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and dependencies

### Extension Constraints
- `CLAUDE.md` — Tech stack constraints (Vanilla JS, MV3, no build step), storage guidance (`chrome.storage.local` only, no `localStorage`), injection patterns (informational for later phases), and what NOT to use

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — codebase does not exist yet. Phase 1 creates the initial file structure from scratch.

### Established Patterns
- None yet. Phase 1 establishes the patterns that later phases follow.

### Integration Points
- `prompts/sample-prompts.js` → loaded as a global before `background.js` via `manifest.json` `background.scripts` order
- `chrome.storage.local` → the single shared data store for popup (Phase 2), options page (Phase 1), and any future sync logic (Phase 4)

</code_context>

<specifics>
## Specific Ideas

- The split-panel layout mockup from discussion: list left (`[+ New]` at top, prompt titles below), form right (Title, Category, Body fields + `[Save]` and `[Delete → Are you sure?]` buttons).
- Sample prompts should feel like something the target audience would bookmark — e.g., "Explain this error to me like I'm a junior developer. What caused it and how do I fix it?" over anything academic or template-heavy.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-04-30*

# Prompt Pal

A Chrome extension that gives you a searchable prompt library in a browser popup — click any prompt and it injects directly into the AI chat input on ChatGPT, Gemini, or Claude.

Prompts are stored locally with a built-in editor, and optionally imported from a file or synced from a GitHub repo. Built for self-learners, junior devs, and non-native English speakers who repeat the same detailed prompts across AI tools daily.

**Core value:** One click from prompt library to AI chat input — no copy-paste, no memory required.

---

## Features

- Search and browse your prompt library from the browser popup
- Click any prompt to inject it directly into the active chat input — newlines and formatting preserved
- Works on ChatGPT (`chatgpt.com`), Claude (`claude.ai`), and Gemini (`gemini.google.com`)
- Prompts stored in `chrome.storage.local` — works offline, no account needed
- Built-in editor: add, edit, and delete prompts with title, category, and body
- **Import from file**: upload `.md` or `.csv` files to bulk-add prompts
- **GitHub sync**: paste a public repo URL to import all `.md` prompts from it
- Duplicate detection: re-importing skips prompts that already exist by title

---

## Installation (development)

1. Clone this repo
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this repo folder
5. The extension appears in your toolbar — click to open the popup

No build step required.

---

## Tech stack

- Vanilla JS, HTML, CSS — no framework, no bundler
- Chrome Manifest V3
- `chrome.storage.local` for all data persistence

---

## Project structure

```
/
├── manifest.json          # MV3 manifest
├── background.js          # Service worker — seeds sample prompts on install
├── options.html           # Prompt editor + import page
├── options.js
├── popup.html             # Search + inject popup
├── popup.js
├── template.md            # Downloadable prompt template (MD format)
├── template.csv           # Downloadable prompt template (CSV format)
├── styles/
│   └── main.css           # Shared design tokens and component styles
├── utils/
│   ├── frontmatter.js     # Markdown frontmatter parser (single + multi-prompt)
│   └── csv.js             # CSV parser (RFC-4180, Google Sheets compatible)
└── content/
    └── injector.js        # Content script — site-specific injection logic
```

---

## Prompt formats

### Markdown (`.md`) — single prompt

```markdown
---
title: Explain this error
category: Coding
---
I got this error and I'm not sure what it means. Can you explain what caused it and show me how to fix it step by step?
```

### Markdown (`.md`) — multiple prompts in one file

Use `===` on its own line to separate prompts:

```markdown
---
title: First Prompt
category: Coding
---
Body of first prompt.

===

---
title: Second Prompt
category: Writing
---
Body of second prompt.
```

### CSV (`.csv`) — Google Sheets compatible

```
title,category,body
Explain this error,Coding,"I got this error..."
Improve my writing,Writing,"Please improve this text..."
```

Header row required. Columns can be in any order. Matches Google Sheets **File → Download → CSV** directly.

Download the bundled templates from the Options page to get started.

---

## GitHub sync

Paste any public GitHub repo URL into the Options page and click Sync. The extension fetches all `.md` files from the repo root and imports any prompts not already in your library.

- Only `.md` files at the repo root are read — subdirectories are not traversed
- Re-sync is rate-limited to once every 30 minutes (GitHub unauthenticated API limit)
- Duplicate titles are skipped automatically

---

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| 1 — Foundation | Storage schema, options page CRUD, sample prompts | ✅ Complete |
| 2 — Popup UI | Search, filter, keyboard nav, inject trigger | ✅ Complete |
| 3 — Injection | Site-specific content scripts for Claude, ChatGPT, Gemini | ✅ Complete |
| 4 — Import & Sync | File import (MD + CSV) and GitHub sync | ✅ Complete |

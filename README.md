# Prompt Pal

A Chrome extension that gives you a searchable prompt library in a browser popup — click any prompt and it injects directly into the AI chat input on ChatGPT, Gemini, or Claude.

Prompts are stored locally with a built-in editor, and optionally synced from a GitHub repo for version control and sharing. Built for self-learners, junior devs, and non-native English speakers who repeat the same detailed prompts across AI tools daily.

**Core value:** One click from prompt library to AI chat input — no copy-paste, no memory required.

---

## Features

- Search and browse your prompt library from the browser popup
- Click any prompt to inject it directly into the active chat input
- Works on ChatGPT (`chatgpt.com`), Claude (`claude.ai`), and Gemini (`gemini.google.com`)
- Prompts stored in `chrome.storage.local` — works offline, no account needed
- Built-in editor on the options page: add, edit, and delete prompts
- Each prompt has a title, category, and body
- Optional GitHub sync: paste a public repo URL to import prompts

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
├── manifest.json         # MV3 manifest
├── background.js         # Service worker — seeds sample prompts on install
├── options.html          # Prompt editor page (Phase 1)
├── options.js
├── popup.html            # Search + inject popup (Phase 2)
├── popup.js
├── styles/
│   └── main.css          # Shared design tokens and component styles
├── utils/
│   └── frontmatter.js    # Markdown frontmatter parser (parseFrontmatter)
└── content/
    └── injector.js       # Content script — site-specific injection (Phase 3)
```

---

## Prompt format (for GitHub sync)

Prompts imported via GitHub sync are `.md` files with YAML frontmatter:

```markdown
---
title: Explain this error
category: Coding
---
I got this error and I'm not sure what it means. Can you explain what caused it and show me how to fix it step by step?
```

---

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| 1 — Foundation | Storage schema, options page CRUD, sample prompts | ✅ Complete |
| 2 — Popup UI | Search, filter, keyboard nav, inject trigger | ✅ Complete |
| 3 — Injection | Site-specific content scripts for Claude, ChatGPT, Gemini | ✅ Complete |
| 4 — GitHub Sync | Import prompts from a public GitHub repo URL | In progress |

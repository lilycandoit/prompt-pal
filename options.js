'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let allPrompts = [];      // in-memory mirror of chrome.storage.local prompts
let selectedId = null;    // currently selected prompt ID (null = new prompt mode)
let openCategory = null;  // which category accordion is currently expanded

// ── DOM refs ───────────────────────────────────────────────────────────────
const promptList  = document.getElementById('prompt-list');
const btnNew      = document.getElementById('btn-new');
const promptForm  = document.getElementById('prompt-form');
const formHeading = document.getElementById('form-heading');
const emptyState  = document.getElementById('empty-state');
const fieldTitle  = document.getElementById('field-title');
const fieldCat    = document.getElementById('field-category');
const fieldBody   = document.getElementById('field-body');
const btnSave     = document.getElementById('btn-save');
const btnDelete   = document.getElementById('btn-delete');

// Import section refs
const btnImportFile = document.getElementById('btn-import-file');
const fileInput     = document.getElementById('file-input');
const fileStatus    = document.getElementById('file-status');
const githubUrl     = document.getElementById('github-url');
const btnSync       = document.getElementById('btn-sync');
const syncStatus    = document.getElementById('sync-status');

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadPrompts();
  bindEvents();
});

// ── Storage helpers ────────────────────────────────────────────────────────
function loadPrompts() {
  chrome.storage.local.get(['prompts'], (result) => {
    allPrompts = Array.isArray(result.prompts) ? result.prompts : [];
    renderList();
    updateEmptyState();
  });
}

function savePrompts(cb) {
  chrome.storage.local.set({ prompts: allPrompts }, () => {
    if (chrome.runtime.lastError) {
      console.error('Prompt Pal: storage write failed:', chrome.runtime.lastError);
    }
    if (typeof cb === 'function') cb();
  });
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderList() {
  while (promptList.firstChild) {
    promptList.removeChild(promptList.firstChild);
  }

  const groups = new Map();
  allPrompts.forEach((prompt) => {
    const cat = prompt.category || 'Uncategorized';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(prompt);
  });

  const fragment = document.createDocumentFragment();
  const sortedCategories = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  sortedCategories.forEach((cat) => {
    const isOpen = openCategory === cat;

    // Category header row (always visible)
    const header = document.createElement('li');
    header.className = 'prompt-list__category' + (isOpen ? ' prompt-list__category--open' : '');

    const chevron = document.createElement('span');
    chevron.className = 'prompt-list__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = cat;

    const count = document.createElement('span');
    count.className = 'prompt-list__count';
    count.textContent = groups.get(cat).length;

    header.appendChild(chevron);
    header.appendChild(label);
    header.appendChild(count);
    header.addEventListener('click', () => {
      openCategory = isOpen ? null : cat;
      renderList();
    });
    fragment.appendChild(header);

    // Prompt items — only rendered when this category is open
    if (isOpen) {
      groups.get(cat).forEach((prompt) => {
        const li = document.createElement('li');
        li.className = 'prompt-list__item';
        li.dataset.id = prompt.id;
        li.textContent = prompt.title || '(untitled)';
        if (prompt.id === selectedId) {
          li.classList.add('prompt-list__item--active');
          li.setAttribute('aria-current', 'true');
        }
        li.addEventListener('click', () => selectPrompt(prompt.id));
        fragment.appendChild(li);
      });
    }
  });

  promptList.appendChild(fragment);
}

function updateEmptyState() {
  const isEmpty = allPrompts.length === 0;
  emptyState.hidden = !isEmpty || selectedId !== null;
  promptForm.hidden = isEmpty && selectedId === null;
}

function populateForm(prompt) {
  // XSS-safe: value assignment to input/textarea is always safe (not innerHTML)
  fieldTitle.value = prompt.title;
  fieldCat.value   = prompt.category;
  fieldBody.value  = prompt.body;
  formHeading.textContent = 'Edit Prompt';
  btnDelete.hidden = false;
  btnDelete.textContent = 'Delete';
  btnDelete.className = 'btn btn--secondary';
  btnDelete.removeAttribute('data-armed');
}

function clearForm() {
  fieldTitle.value = '';
  fieldCat.value   = '';
  fieldBody.value  = '';
  formHeading.textContent = 'New Prompt';
  btnDelete.hidden = true;
  btnDelete.textContent = 'Delete';
  btnDelete.className = 'btn btn--secondary';
  btnDelete.removeAttribute('data-armed');
}

// ── Selection ──────────────────────────────────────────────────────────────
function selectPrompt(id) {
  selectedId = id;
  const prompt = allPrompts.find((p) => p.id === id);
  if (!prompt) return;
  populateForm(prompt);
  renderList(); // re-render to update active class
  promptForm.hidden = false;
  emptyState.hidden = true;
}

// ── Events ─────────────────────────────────────────────────────────────────
function bindEvents() {
  // + New button
  btnNew.addEventListener('click', () => {
    selectedId = null;
    clearForm();
    renderList(); // deselect all
    promptForm.hidden = false;
    emptyState.hidden = true;
    fieldTitle.focus();
  });

  // Save
  promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title    = fieldTitle.value.trim();
    const category = fieldCat.value.trim();
    const body     = fieldBody.value.trim();

    if (!title) {
      fieldTitle.focus();
      return;
    }

    if (selectedId) {
      // Edit existing
      const idx = allPrompts.findIndex((p) => p.id === selectedId);
      if (idx !== -1) {
        allPrompts[idx] = { id: selectedId, title, category, body };
      }
    } else {
      // Create new
      const newPrompt = {
        id: crypto.randomUUID().slice(0, 8),
        title,
        category,
        body
      };
      allPrompts.push(newPrompt);
      selectedId = newPrompt.id;
    }

    openCategory = category || 'Uncategorized';
    savePrompts(() => {
      renderList();
      updateEmptyState();
      formHeading.textContent = 'Edit Prompt';
      btnDelete.hidden = false;
    });
  });

  // Delete (two-step inline confirmation)
  btnDelete.addEventListener('click', () => {
    if (btnDelete.dataset.armed !== 'true') {
      // First click: arm the button
      btnDelete.dataset.armed = 'true';
      btnDelete.textContent = 'Are you sure?';
      btnDelete.className = 'btn btn--destructive';
      btnDelete.setAttribute('aria-pressed', 'true');
    } else {
      // Second click: execute delete
      allPrompts = allPrompts.filter((p) => p.id !== selectedId);
      selectedId = null;
      savePrompts(() => {
        clearForm();
        renderList();
        updateEmptyState();
        promptForm.hidden = allPrompts.length === 0;
        emptyState.hidden = allPrompts.length !== 0;
      });
    }
  });

  // Disarm delete button on any outside click
  document.addEventListener('click', (e) => {
    if (e.target !== btnDelete && btnDelete.dataset.armed === 'true') {
      btnDelete.dataset.armed = 'false';
      btnDelete.removeAttribute('data-armed');
      btnDelete.textContent = 'Delete';
      btnDelete.className = 'btn btn--secondary';
      btnDelete.removeAttribute('aria-pressed');
    }
  });

  // Track A: file import
  btnImportFile.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileImport);

  // Track B: GitHub sync
  btnSync.addEventListener('click', handleGitHubSync);
}

// ── Import helpers ─────────────────────────────────────────────────────────

function dedupeAndAppend(incoming) {
  const existingTitles = new Set(allPrompts.map((p) => p.title));
  const toAdd = incoming.filter((p) => !existingTitles.has(p.title));
  allPrompts.push(...toAdd);
  return toAdd.length;
}

function showStatus(el, message, type) {
  el.textContent = message;
  el.className = 'import-status import-status--' + type;
  el.hidden = false;
}

// ── Track A: File import ───────────────────────────────────────────────────

async function handleFileImport() {
  const files = Array.from(fileInput.files);
  if (files.length === 0) return;

  const parsed = [];
  const errors = [];

  await Promise.all(files.map(async (file) => {
    const text = await file.text();
    const ext = file.name.split('.').pop().toLowerCase();
    const results = ext === 'csv' ? parseCSVPrompts(text) : parseMultiFrontmatter(text);
    if (results.length === 0) {
      errors.push(file.name + ': no valid prompts found');
      return;
    }
    for (const result of results) {
      parsed.push({
        id: crypto.randomUUID().slice(0, 8),
        title: result.title,
        category: result.category || '',
        body: result.body || ''
      });
    }
  }));

  const added = dedupeAndAppend(parsed);
  savePrompts(() => {
    renderList();
    updateEmptyState();
    let msg = added + ' prompt' + (added === 1 ? '' : 's') + ' imported.';
    if (errors.length) msg += ' ' + errors.length + ' file' + (errors.length === 1 ? '' : 's') + ' skipped.';
    const skipped = parsed.length - added;
    if (skipped > 0) msg += ' ' + skipped + ' duplicate' + (skipped === 1 ? '' : 's') + ' skipped.';
    showStatus(fileStatus, msg, 'success');
  });

  // Reset so the same file can be re-selected
  fileInput.value = '';
}

// ── Track B: GitHub sync ───────────────────────────────────────────────────

const SYNC_THROTTLE_MS = 30 * 60 * 1000;

async function handleGitHubSync() {
  const url = githubUrl.value.trim();
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (!match) {
    showStatus(syncStatus, 'Enter a valid GitHub URL: https://github.com/owner/repo', 'error');
    return;
  }
  const owner = match[1];
  const repo  = match[2];

  const stored = await chrome.storage.local.get(['lastSyncTimestamp']);
  const last = stored.lastSyncTimestamp || 0;
  const remaining = SYNC_THROTTLE_MS - (Date.now() - last);
  if (remaining > 0) {
    const minutes = Math.ceil(remaining / 60000);
    showStatus(syncStatus, 'Re-sync available in ' + minutes + ' minute' + (minutes === 1 ? '' : 's') + '.', 'error');
    return;
  }

  btnSync.disabled = true;
  showStatus(syncStatus, 'Syncing…', 'success');

  try {
    const listRes = await fetch(
      'https://api.github.com/repos/' + owner + '/' + repo + '/contents/'
    );
    if (!listRes.ok) {
      const msg = listRes.status === 404
        ? 'Repository not found. Make sure the URL is correct and the repo is public.'
        : 'GitHub API error: ' + listRes.status;
      showStatus(syncStatus, msg, 'error');
      return;
    }

    const items = await listRes.json();
    const mdFiles = items.filter(
      (item) => item.type === 'file' && item.name.endsWith('.md')
    );

    if (mdFiles.length === 0) {
      showStatus(syncStatus, 'No .md files found at the root of this repo.', 'error');
      return;
    }

    const parsed = [];
    const errors = [];

    await Promise.all(mdFiles.map(async (item) => {
      try {
        const fileRes = await fetch(item.download_url);
        if (!fileRes.ok) {
          errors.push(item.name + ': fetch failed (' + fileRes.status + ')');
          return;
        }
        const text = await fileRes.text();
        const results = parseMultiFrontmatter(text);
        if (results.length === 0) {
          errors.push(item.name + ': no valid prompts found');
          return;
        }
        for (const result of results) {
          parsed.push({
            id: crypto.randomUUID().slice(0, 8),
            title: result.title,
            category: result.category || '',
            body: result.body || ''
          });
        }
      } catch (err) {
        errors.push(item.name + ': ' + err.message);
      }
    }));

    const added = dedupeAndAppend(parsed);

    await chrome.storage.local.set({ lastSyncTimestamp: Date.now() });

    savePrompts(() => {
      renderList();
      updateEmptyState();
      let msg = added + ' prompt' + (added === 1 ? '' : 's') + ' synced.';
      const skipped = parsed.length - added;
      if (skipped > 0) msg += ' ' + skipped + ' duplicate' + (skipped === 1 ? '' : 's') + ' skipped.';
      if (errors.length) msg += ' ' + errors.length + ' file' + (errors.length === 1 ? '' : 's') + ' had errors.';
      showStatus(syncStatus, msg, 'success');
    });

  } catch (err) {
    showStatus(syncStatus, 'Network error: ' + err.message, 'error');
  } finally {
    btnSync.disabled = false;
  }
}

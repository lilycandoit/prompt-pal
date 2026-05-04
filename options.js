'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let allPrompts = [];      // in-memory mirror of chrome.storage.local prompts
let selectedId = null;    // currently selected prompt ID (null = new prompt mode)

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
  // Clear existing items
  while (promptList.firstChild) {
    promptList.removeChild(promptList.firstChild);
  }

  const fragment = document.createDocumentFragment();
  allPrompts.forEach((prompt) => {
    const li = document.createElement('li');
    li.className = 'prompt-list__item';
    li.dataset.id = prompt.id;
    // XSS-safe: textContent only
    li.textContent = prompt.title || '(untitled)';
    if (prompt.id === selectedId) {
      li.classList.add('prompt-list__item--active');
      li.setAttribute('aria-current', 'true');
    }
    li.addEventListener('click', () => selectPrompt(prompt.id));
    fragment.appendChild(li);
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

    savePrompts(() => {
      renderList();
      updateEmptyState();
      // Update form heading to "Edit Prompt" and show delete button after save
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
}

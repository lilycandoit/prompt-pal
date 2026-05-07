'use strict';

// ── DOM refs ───────────────────────────────────────────────────────────────
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');
const promptList = document.getElementById('prompt-list');
const resultCount = document.getElementById('result-count');
const errorBanner = document.getElementById('error-banner');
const emptyMsg = document.getElementById('empty-msg');
const btnOptions = document.getElementById('btn-options');

// ── State ──────────────────────────────────────────────────────────────────
let allPrompts = [];
let filtered = [];

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['prompts'], (result) => {
    allPrompts = Array.isArray(result.prompts) ? result.prompts : [];
    populateCategories();
    applyFilters();
    searchInput.focus();
  });

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('keydown', onSearchKeydown);
  btnOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());
});

// ── Category select ────────────────────────────────────────────────────────
function populateCategories() {
  const cats = [
    ...new Set(allPrompts.map((p) => p.category).filter(Boolean)),
  ].sort();
  cats.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

// ── Filtering ──────────────────────────────────────────────────────────────
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;

  filtered = allPrompts.filter((p) => {
    const matchesCat = !cat || p.category === cat;
    const matchesSearch =
      !query ||
      (p.title || '').toLowerCase().includes(query) ||
      (p.body || '').toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  renderList();
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderList() {
  while (promptList.firstChild) promptList.removeChild(promptList.firstChild);
  hideError();

  if (allPrompts.length === 0) {
    resultCount.hidden = true;
    showEmpty('No prompts yet — open Options to add one.');
    return;
  }
  if (filtered.length === 0) {
    resultCount.hidden = true;
    const q = searchInput.value.trim();
    showEmpty(
      q ? `No results for "${q}"` : 'No prompts match the selected category.',
    );
    return;
  }

  hideEmpty();

  // Show result count
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'prompt' : 'prompts'} found`;
  resultCount.hidden = false;

  const fragment = document.createDocumentFragment();
  filtered.forEach((prompt, idx) => {
    const li = document.createElement('li');
    li.className = 'popup-list__item';
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '-1');
    li.dataset.id = prompt.id;
    li.dataset.idx = idx;

    const titleEl = document.createElement('span');
    titleEl.className = 'popup-list__title';
    titleEl.textContent = prompt.title || '(untitled)';

    const bodyEl = document.createElement('span');
    bodyEl.className = 'popup-list__body';
    bodyEl.textContent = (prompt.body || '').trim();

    const catEl = document.createElement('span');
    catEl.className = 'popup-list__category';
    catEl.textContent = prompt.category || '';

    li.appendChild(titleEl);
    if (bodyEl.textContent) li.appendChild(bodyEl);
    li.appendChild(catEl);

    li.addEventListener('click', () => injectPrompt(prompt));
    li.addEventListener('keydown', (e) => onItemKeydown(e, prompt, idx));
    li.addEventListener('focus', () => setFocused(li));
    li.addEventListener('blur', () =>
      li.classList.remove('popup-list__item--focused'),
    );

    fragment.appendChild(li);
  });
  promptList.appendChild(fragment);
}

// ── Focus helpers ──────────────────────────────────────────────────────────
function setFocused(li) {
  promptList.querySelectorAll('.popup-list__item--focused').forEach((el) => {
    el.classList.remove('popup-list__item--focused');
  });
  li.classList.add('popup-list__item--focused');
}

function getItems() {
  return [...promptList.querySelectorAll('.popup-list__item')];
}

// ── Keyboard navigation ────────────────────────────────────────────────────
function onSearchKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const items = getItems();
    if (items.length) items[0].focus();
  } else if (e.key === 'Escape') {
    if (searchInput.value) {
      searchInput.value = '';
      applyFilters();
    } else {
      window.close();
    }
  }
}

function onItemKeydown(e, prompt, idx) {
  const items = getItems();
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (idx + 1 < items.length) items[idx + 1].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (idx === 0) {
      searchInput.focus();
    } else {
      items[idx - 1].focus();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    injectPrompt(prompt);
  } else if (e.key === 'Escape') {
    searchInput.focus();
  }
}

// ── Injection ──────────────────────────────────────────────────────────────
function injectPrompt(prompt) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      showError('No active tab found.');
      return;
    }
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'INJECT_PROMPT', text: prompt.body },
      (response) => {
        if (chrome.runtime.lastError) {
          showError('Could not connect to page. Try refreshing it.');
          return;
        }
        if (response && response.success === false) {
          showError(response.error || 'Injection failed.');
          return;
        }
        showSuccessToast();
      },
    );
  });
}

// ── Success toast ──────────────────────────────────────────────────────────
function showSuccessToast() {
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    z-index: 9999;
    pointer-events: none;
  `;
  toast.textContent = '✓ Prompt injected!';
  document.body.appendChild(toast);

  // Close popup after brief delay
  setTimeout(() => {
    window.close();
  }, 150);
}

// ── Empty / error state ────────────────────────────────────────────────────
function showEmpty(text) {
  emptyMsg.textContent = text;
  emptyMsg.hidden = false;
}

function hideEmpty() {
  emptyMsg.hidden = true;
}

function showError(text) {
  errorBanner.textContent = text;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.hidden = true;
}

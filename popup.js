'use strict';

// ── DOM refs ───────────────────────────────────────────────────────────────
const searchInput        = document.getElementById('search');
const categoryFilterWrap = document.getElementById('category-filter-wrap');
const categoryFilterBtn  = document.getElementById('category-filter-btn');
const categoryFilterLbl  = document.getElementById('category-filter-label');
const categoryFilterList = document.getElementById('category-filter-list');
const promptList         = document.getElementById('prompt-list');
const resultCount        = document.getElementById('result-count');
const errorBanner        = document.getElementById('error-banner');
const emptyMsg           = document.getElementById('empty-msg');
const btnOptions         = document.getElementById('btn-options');
const previewModal       = document.getElementById('preview-modal');
const previewModalTitle  = document.getElementById('preview-modal-title');
const previewModalBody   = document.getElementById('preview-modal-body');
const previewModalClose  = document.getElementById('preview-modal-close');
const previewModalBack   = document.getElementById('preview-modal-back');
const previewModalInject = document.getElementById('preview-modal-inject');

// ── State ──────────────────────────────────────────────────────────────────
let allPrompts = [];
let filtered = [];
let selectedCategory = '';

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['prompts'], (result) => {
    allPrompts = Array.isArray(result.prompts) ? result.prompts : [];
    populateCategories();
    applyFilters();
    searchInput.focus();
  });

  searchInput.addEventListener('input', applyFilters);
  searchInput.addEventListener('keydown', onSearchKeydown);
  btnOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

  categoryFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryFilterList.hidden ? openFilterDropdown() : closeFilterDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!categoryFilterWrap.contains(e.target)) closeFilterDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFilterDropdown();
  });

  // Modal event listeners
  previewModalClose.addEventListener('click', closePreviewModal);
  previewModalBack.addEventListener('click', closePreviewModal);
  previewModalInject.addEventListener('click', () => {
    if (currentModalPrompt) {
      const prompt = currentModalPrompt;
      // Move focus to a visible element before hiding the modal so the popup
      // stays open — then call the same injectPrompt used by direct list clicks.
      searchInput.focus();
      closePreviewModal();
      injectPrompt(prompt);
    }
  });

  // Close modal on backdrop click
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) closePreviewModal();
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !previewModal.hidden) {
      closePreviewModal();
    }
  });
});

// ── Category dropdown ──────────────────────────────────────────────────────
function populateCategories() {
  const cats = [...new Set(allPrompts.map((p) => p.category).filter(Boolean))].sort();
  while (categoryFilterList.firstChild) categoryFilterList.removeChild(categoryFilterList.firstChild);

  [{ value: '', label: 'All categories' }, ...cats.map((c) => ({ value: c, label: c }))].forEach(
    ({ value, label }) => {
      const li = document.createElement('li');
      li.className = 'popup-filter-option' + (value === selectedCategory ? ' popup-filter-option--selected' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', value === selectedCategory ? 'true' : 'false');
      li.dataset.value = value;
      li.textContent = label;
      li.addEventListener('click', () => pickCategory(value, label));
      categoryFilterList.appendChild(li);
    }
  );
}

function pickCategory(value, label) {
  selectedCategory = value;
  categoryFilterLbl.textContent = label;
  categoryFilterList.querySelectorAll('.popup-filter-option').forEach((el) => {
    const sel = el.dataset.value === value;
    el.classList.toggle('popup-filter-option--selected', sel);
    el.setAttribute('aria-selected', sel ? 'true' : 'false');
  });
  closeFilterDropdown();
  applyFilters();
}

function openFilterDropdown() {
  categoryFilterList.hidden = false;
  categoryFilterBtn.setAttribute('aria-expanded', 'true');
}

function closeFilterDropdown() {
  categoryFilterList.hidden = true;
  categoryFilterBtn.setAttribute('aria-expanded', 'false');
}

// ── Filtering ──────────────────────────────────────────────────────────────
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const cat = selectedCategory;

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
    if (bodyEl.textContent) {
      li.appendChild(bodyEl);

      // Add "Show more" link and category together
      const footerEl = document.createElement('div');
      footerEl.className = 'popup-list__footer';

      const showMoreEl = document.createElement('span');
      showMoreEl.className = 'popup-list__show-more';
      showMoreEl.innerHTML = '<span class="popup-list__ellipsis">…</span><button type="button" class="popup-list__show-more-btn">Show more</button>';
      footerEl.appendChild(showMoreEl);

      if (catEl.textContent) {
        footerEl.appendChild(catEl);
      }

      li.appendChild(footerEl);

      // Attach prompt data for modal
      li.dataset.promptBody = prompt.body;
      li.dataset.promptTitle = prompt.title;
    } else if (catEl.textContent) {
      li.appendChild(catEl);
    }

    li.addEventListener('click', (e) => {
      // If click is on "Show more" button, open modal instead of injecting
      if (e.target.closest('.popup-list__show-more-btn')) {
        e.stopPropagation();
        openPreviewModal(prompt);
      } else {
        injectPrompt(prompt);
      }
    });
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
          showError('Not available on this page. Try ChatGPT, Claude, or Gemini.');
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

// ── Preview modal ──────────────────────────────────────────────────────────
let currentModalPrompt = null;

function openPreviewModal(prompt) {
  currentModalPrompt = prompt;
  previewModalTitle.textContent = prompt.title || '(untitled)';
  previewModalBody.textContent = prompt.body || '';
  previewModal.hidden = false;
  previewModalInject.focus();
}

function closePreviewModal() {
  previewModal.hidden = true;
  currentModalPrompt = null;
}

// ── Success toast ──────────────────────────────────────────────────────────
function showSuccessToast() {
  window.close();
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

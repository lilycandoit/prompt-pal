'use strict';

// ── Helpers ────────────────────────────────────────────────────────────────

function injectChatGPT(text) {
  // New chatgpt.com UI uses a contenteditable div, not a textarea.
  const contentSelectors = [
    '#prompt-input div[contenteditable="true"]',
    'div[contenteditable="true"][data-placeholder]',
    'div[contenteditable="true"][role="textbox"]',
    'div.ProseMirror[contenteditable="true"]',
  ];

  const contentEl = contentSelectors.reduce((found, sel) => found || document.querySelector(sel), null);
  if (contentEl) {
    contentEl.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    return { success: true };
  }

  // Fallback: older chat.openai.com textarea interface.
  const textareaSelectors = [
    '#prompt-textarea',
    'textarea[data-id="root"]',
  ];

  const textareaEl = textareaSelectors.reduce((found, sel) => found || document.querySelector(sel), null);
  if (textareaEl) {
    // React controls this textarea via fiber — native setter bypasses React's
    // synthetic event system so the Send button activates correctly.
    const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    if (nativeSetter) {
      nativeSetter.call(textareaEl, text);
      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      textareaEl.focus();
      return { success: true };
    }
  }

  return { success: false, error: 'Could not find the ChatGPT input. Try refreshing the page.' };
}

function injectClaude(text) {
  const selectors = [
    'div.ProseMirror[contenteditable="true"]',
    '[data-testid="composer-input"]',
    'div[contenteditable="true"].ProseMirror',
  ];

  const el = selectors.reduce((found, sel) => found || document.querySelector(sel), null);
  if (!el) return { success: false, error: 'Could not find the Claude input. Try refreshing the page.' };

  el.focus();
  // execCommand is deprecated but is the most reliable way to feed text into
  // ProseMirror without direct access to its editor instance.
  const ok = document.execCommand('insertText', false, text);
  if (!ok) return { success: false, error: 'Claude input did not accept the text. The page may have changed.' };
  return { success: true };
}

function injectGemini(text) {
  const selectors = [
    'div.ql-editor[contenteditable="true"]',
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"][data-placeholder]',
  ];

  const el = selectors.reduce((found, sel) => found || document.querySelector(sel), null);
  if (!el) return { success: false, error: 'Could not find the Gemini input. Try refreshing the page.' };

  el.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, text);
  return { success: true };
}

// ── Dispatch ───────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'INJECT_PROMPT') return false;

  try {
    const host = window.location.hostname;
    let result;

    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) {
      result = injectChatGPT(message.text);
    } else if (host.includes('claude.ai')) {
      result = injectClaude(message.text);
    } else if (host.includes('gemini.google.com')) {
      result = injectGemini(message.text);
    } else {
      result = { success: false, error: 'Prompt Pal only works on ChatGPT, Claude, and Gemini.' };
    }

    sendResponse(result);
  } catch (err) {
    sendResponse({ success: false, error: 'Unexpected error during injection.' });
  }

  return false;
});

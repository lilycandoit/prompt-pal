'use strict';

// ── Helpers ────────────────────────────────────────────────────────────────

function injectChatGPT(text) {
  const selectors = [
    '#prompt-textarea',
    'textarea[data-id="root"]',
    'textarea[placeholder]',
  ];

  const el = selectors.reduce((found, sel) => found || document.querySelector(sel), null);
  if (!el) return { success: false, error: 'Could not find the ChatGPT input. Try refreshing the page.' };

  // React controls this textarea via fiber — must use the native setter to
  // trigger React's synthetic event system, otherwise Send stays disabled.
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  nativeSetter.call(el, text);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.focus();
  return { success: true };
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
  // Set textContent so the DOM reflects the value, then fire the InputEvent
  // that Gemini's framework uses to sync its internal state.
  el.textContent = text;
  el.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: text, bubbles: true }));
  return { success: true };
}

// ── Dispatch ───────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'INJECT_PROMPT') return false;

  try {
    const host = window.location.hostname;
    let result;

    if (host.includes('chat.openai.com')) {
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

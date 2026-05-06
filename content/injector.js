'use strict';

// Stub — real injection logic added in Phase 3.
// Receives INJECT_PROMPT messages from the popup and will inject text into the active AI chat input.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'INJECT_PROMPT') return false;
  sendResponse({ success: false, error: 'Injection not yet implemented.' });
  return false;
});

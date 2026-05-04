const SAMPLE_PROMPTS = [
  {
    id: 'a1b2c3d4',
    title: 'Explain this error',
    category: 'Coding',
    body: 'I got this error and I\'m not sure what it means. Can you explain what caused it and show me how to fix it step by step? Please use simple language — I\'m still learning.'
  },
  {
    id: 'e5f6a7b8',
    title: 'Review my code',
    category: 'Coding',
    body: 'Please review this code. Point out any bugs, bad practices, or things that could break later. Explain why each issue is a problem and how to fix it in plain English.'
  },
  {
    id: 'c9d0e1f2',
    title: 'Write a test for this function',
    category: 'Coding',
    body: 'Write unit tests for this function. Cover the normal case, edge cases, and error cases. Use simple assertions and explain what each test is checking.'
  },
  {
    id: 'g3h4i5j6',
    title: 'Explain this concept simply',
    category: 'Explaining',
    body: 'Can you explain this concept in plain English? Assume I know the basics but I\'m not an expert. Use a real-world analogy if it helps, and keep it concise.'
  },
  {
    id: 'k7l8m9n0',
    title: 'What does this code do?',
    category: 'Explaining',
    body: 'Walk me through what this code does, line by line if needed. I want to understand the logic, not just get a summary. Highlight anything tricky or non-obvious.'
  },
  {
    id: 'o1p2q3r4',
    title: 'Improve my writing',
    category: 'Writing',
    body: 'Please improve this text. Make it clearer and more natural-sounding in English. Keep my original meaning — just fix awkward phrases, grammar issues, and anything that sounds unnatural to a native speaker.'
  },
  {
    id: 's5t6u7v8',
    title: 'Write a professional message',
    category: 'Writing',
    body: 'Help me write a professional message for this situation. Keep the tone polite and clear. I\'ll describe what I need to say and you can help me phrase it well.'
  }
];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return;

  chrome.storage.local.set({ prompts: SAMPLE_PROMPTS }, () => {
    if (chrome.runtime.lastError) {
      console.error('Prompt Pal: failed to seed sample prompts:', chrome.runtime.lastError);
    }
  });
});

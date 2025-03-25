// content.js
import { generateRandomValue } from './js/generator.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    const fields = message.config.fields || [];

    fields.forEach(field => {
      const el = document.querySelector(field.selector);
      if (!el) return;

      const value = generateRandomValue(field);
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    sendResponse({ status: 'filled' });
  }
});

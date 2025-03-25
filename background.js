// background.js

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['profiles'], ({ profiles }) => {
    if (!profiles) {
      chrome.storage.local.set({ profiles: [] });
    }
  });
});

// Message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProfileForUrl') {
    chrome.storage.local.get(['profiles'], ({ profiles = [] }) => {
      const profile = profiles.find(p =>
        p.urlPatterns.some(pattern => message.url.includes(pattern))
      );
      sendResponse({ profile });
    });
    return true; // keep channel open for async sendResponse
  }

  if (message.action === 'fillForm') {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: 'fillForm',
      config: message.config
    });
    sendResponse({ status: 'dispatched' });
  }
});

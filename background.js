// background.js  ⟶  REPLACE ENTIRE FILE
console.log("[DataFiller][BG] service-worker started");

/* ---------- on install: seed storage ---------- */
chrome.runtime.onInstalled.addListener(() => {
  console.log("[DataFiller][BG] onInstalled");
  chrome.storage.local.get(["profiles"], ({ profiles }) => {
    if (!profiles) chrome.storage.local.set({ profiles: [] });
  });
});

/* ---------- message router ---------- */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[DataFiller][BG] incoming:", msg);

  /* profile lookup */
  if (msg.action === "getProfileForUrl") {
    chrome.storage.local.get(["profiles"], ({ profiles = [] }) => {
      const profile =
        profiles.find((p) =>
          p.urlPatterns.some((pat) => msg.url.includes(pat))
        ) || null;
      console.log("[DataFiller][BG] matched profile:", profile);
      sendResponse({ profile });
    });
    return true;
  }

  /* dispatch fillForm to the correct tab */
  if (msg.action === "fillForm") {
    const targetTabId = msg.tabId ?? sender.tab?.id;
    if (targetTabId === undefined) {
      console.error("[DataFiller][BG] No tabId to send fillForm");
      sendResponse({ ok: false, error: "No tabId" });
      return;
    }
    chrome.tabs.sendMessage(targetTabId, {
      action: "fillForm",
      config: msg.config,
    });
    sendResponse({ ok: true, dispatchedTo: targetTabId });
    return;
  }

  /* proxyFetch (optional) */
  if (msg.action === "proxyFetch") {
    fetch(msg.endpoint)
      .then((r) => r.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) =>
        sendResponse({ ok: false, err: String(err.message || err) })
      );
    return true;
  }
});

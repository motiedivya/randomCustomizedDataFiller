// popup/popup.js  ⟶  REPLACE ENTIRE FILE
console.log("[DataFiller][POPUP] popup.js loaded");

document.getElementById("fillBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) return alert("No active tab?");
    const { id: tabId, url } = tabs[0];

    console.log("[DataFiller][POPUP] Active tab id:", tabId, "url:", url);

    chrome.runtime.sendMessage({ action: "getProfileForUrl", url }, (res) => {
      const profile = res?.profile || {};
      console.log("[DataFiller][POPUP] Profile reply:", profile);

      chrome.runtime.sendMessage(
        { action: "fillForm", tabId, config: profile },
        (ack) => console.log("[DataFiller][POPUP] fillForm ack:", ack)
      );
      window.close();
    });
  });
});

// popup/popup.js

document.getElementById('fillBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    chrome.runtime.sendMessage({ action: 'getProfileForUrl', url }, (response) => {
      if (response.profile) {
        chrome.runtime.sendMessage({ action: 'fillForm', config: response.profile });
        window.close();
      } else {
        alert('No profile configured for this page.');
      }
    });
  });
});

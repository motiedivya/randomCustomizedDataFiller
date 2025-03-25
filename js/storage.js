// js/storage.js

// Retrieve all profiles, then filter by URL matching.
function getProfilesForUrl(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profiles'], (data) => {
        const profiles = data.profiles || [];
        // Simple URL matching (can later extend to regex/glob)
        const profile = profiles.find((p) => p.urlPatterns.some(pattern => url.includes(pattern)));
        resolve(profile);
      });
    });
  }
  
  // Save a new or updated profile
  function saveProfile(profile) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profiles'], (data) => {
        let profiles = data.profiles || [];
        const index = profiles.findIndex(p => p.id === profile.id);
        if (index > -1) {
          profiles[index] = profile;
        } else {
          profiles.push(profile);
        }
        chrome.storage.local.set({ profiles }, () => resolve(true));
      });
    });
  }
  
  // Delete a profile by id
  function deleteProfile(id) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profiles'], (data) => {
        let profiles = data.profiles || [];
        profiles = profiles.filter(p => p.id !== id);
        chrome.storage.local.set({ profiles }, () => resolve(true));
      });
    });
  }
  
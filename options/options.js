// Helper storage functions
function getProfiles() {
    return new Promise(resolve => {
      chrome.storage.local.get({ profiles: [] }, ({ profiles }) => resolve(profiles));
    });
  }
  
  function saveProfiles(profiles) {
    return new Promise(resolve => {
      chrome.storage.local.set({ profiles }, () => resolve());
    });
  }
  
  // Render existing profiles list
  async function renderProfiles() {
    const listEl = document.getElementById('profileList');
    const profiles = await getProfiles();
    if (!profiles.length) {
      listEl.innerHTML = '<i>No profiles created.</i>';
      return;
    }
  
    listEl.innerHTML = profiles.map(p =>
      `<div>
         <strong>${p.name}</strong> — ${p.urlPatterns.join(', ')}
         <button class="editBtn" data-id="${p.id}">Edit</button>
         <button class="deleteBtn" data-id="${p.id}">Delete</button>
       </div>`
    ).join('');
  }
  
  // Populate form for editing
  async function editProfile(id) {
    const profiles = await getProfiles();
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
  
    document.getElementById('formTitle').textContent = 'Edit Profile';
    document.getElementById('profileId').value = profile.id;
    document.getElementById('profileName').value = profile.name;
    document.getElementById('urlPatterns').value = profile.urlPatterns.join(', ');
    document.getElementById('fields').value = JSON.stringify(profile.fields, null, 2);
    document.getElementById('cancelEdit').style.display = 'inline';
  }
  
  // Delete a profile
  async function deleteProfile(id) {
    const profiles = await getProfiles();
    await saveProfiles(profiles.filter(p => p.id !== id));
    renderProfiles();
  }
  
  // Clear form & reset UI
  function resetForm() {
    document.getElementById('formTitle').textContent = 'New Profile';
    document.getElementById('profileForm').reset();
    document.getElementById('profileId').value = '';
    document.getElementById('cancelEdit').style.display = 'none';
  }
  
  // Form submission handler
  document.getElementById('profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('profileId').value || Date.now().toString();
    const name = document.getElementById('profileName').value.trim();
    const urlPatterns = document.getElementById('urlPatterns').value.split(',').map(s => s.trim());
    let fields;
  
    try {
      fields = JSON.parse(document.getElementById('fields').value);
    } catch {
      return alert('Invalid JSON in “Fields”.');
    }
  
    const profiles = await getProfiles();
    const existingIndex = profiles.findIndex(p => p.id === id);
    const profileObj = { id, name, urlPatterns, fields };
  
    if (existingIndex >= 0) profiles[existingIndex] = profileObj;
    else profiles.push(profileObj);
  
    await saveProfiles(profiles);
    resetForm();
    renderProfiles();
  });
  
  // Cancel edit
  document.getElementById('cancelEdit').addEventListener('click', resetForm);
  
  // Handle edit/delete button clicks
  document.getElementById('profileList').addEventListener('click', e => {
    if (e.target.classList.contains('editBtn')) {
      editProfile(e.target.dataset.id);
    }
    if (e.target.classList.contains('deleteBtn')) {
      deleteProfile(e.target.dataset.id);
    }
  });
  
  // Initial render
  renderProfiles();
  
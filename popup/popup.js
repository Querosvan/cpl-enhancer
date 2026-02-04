const DEFAULTS = { enabled: true };

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

async function loadSettings() {
  const data = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById("enabled").checked = !!data.enabled;
  setStatus(data.enabled ? "Enhancements enabled." : "Enhancements disabled.");
}

async function saveSetting(key, value) {
  await chrome.storage.sync.set({ [key]: value });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();

  document.getElementById("enabled").addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    await saveSetting("enabled", enabled);
    setStatus(enabled ? "Enhancements enabled." : "Enhancements disabled.");

    // Ask current tab to refresh behavior (we’ll implement later)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "SET_ENABLED", enabled });
  });

  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

});

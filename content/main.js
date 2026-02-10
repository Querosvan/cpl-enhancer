(async function () {
  const api = window.CPLEnhancer;
  if (!api) return;

  let started = false;
  let currentEnabled = null;

  function startFeatures(settings) {
    if (started) return;
    started = true;

    // Always initialize features. They will activate only on matching pages.
    if (typeof api.initTransferTabs === "function") api.initTransferTabs(settings);
    if (typeof api.initTransferBadges === "function") api.initTransferBadges(settings);
    if (typeof api.initTryoutsHighlights === "function") api.initTryoutsHighlights(settings);
    if (typeof api.initSkillWhatEmbed === "function") api.initSkillWhatEmbed(settings);
    if (typeof api.initRolePicker === "function") api.initRolePicker(settings);

    if (typeof api.initAgeHighlights === "function") api.initAgeHighlights(settings);
    if (typeof api.initAbilityBorders === "function") api.initAbilityBorders(settings);
  }

  async function setEnabled(enabled) {
    if (enabled === currentEnabled) return;
    currentEnabled = enabled;

    if (!enabled) {
      // Reload to remove injected UI/inline styles cleanly.
      location.reload();
      return;
    }

    const settings = await api.getSettings();
    if (settings?.enabled) startFeatures(settings);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "SET_ENABLED") {
      setEnabled(!!message.enabled);
    }
  });

  const settings = await api.getSettings();
  currentEnabled = !!settings.enabled;
  if (currentEnabled) startFeatures(settings);
})();


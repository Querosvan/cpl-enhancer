(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const SKILLS = [
    "Aim",
    "Handling",
    "Quickness",
    "Determination",
    "Awareness",
    "Teamplay",
    "Gamesense",
    "Movement"
  ];

  const DEFAULTS = {
    enabled: true,
    transferFilters: {
      current: Object.fromEntries(SKILLS.map(s => [s, 85])),
      limit: Object.fromEntries(SKILLS.map(s => [s, 90]))
    },
    tryouts: {
      enabled: true,
      minSkill: 70
    }
  };

  window.CPLEnhancer.getSettings = async function getSettings() {
    const data = await chrome.storage.sync.get(DEFAULTS);
    return {
      ...DEFAULTS,
      ...data,
      transferFilters: data.transferFilters ?? DEFAULTS.transferFilters,
      tryouts: data.tryouts ?? DEFAULTS.tryouts
    };
  };
})();

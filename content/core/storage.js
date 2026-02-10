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

  const DEFAULT_ROLES = [
    { id: "entry", label: "Entry" },
    { id: "support", label: "Support" },
    { id: "igl", label: "IGL" },
    { id: "lurker", label: "Lurker" },
    { id: "flex", label: "Flex" }
  ];

  const DEFAULT_ROLE_SKILLS = Object.fromEntries(SKILLS.map(s => [s, 0]));
  const DEFAULT_ROLE_PROFILES = Object.fromEntries(
    DEFAULT_ROLES.map(role => [role.id, { skills: { ...DEFAULT_ROLE_SKILLS } }])
  );

  const DEFAULTS = {
    enabled: true,
    transferFilters: {
      current: {
        ...Object.fromEntries(SKILLS.map(s => [s, 85])),
        ageMin: 13,
        ageMax: 44
      },
      limit: {
        ...Object.fromEntries(SKILLS.map(s => [s, 90])),
        ageMin: 13,
        ageMax: 25
      }
    },
    tryoutsFilters: Object.fromEntries(SKILLS.map(s => [s, 90])),
    rolesRosterOnly: true,
    rolesCatalog: DEFAULT_ROLES,
    roleProfiles: DEFAULT_ROLE_PROFILES
  };

  window.CPLEnhancer.getSettings = async function getSettings() {
    const data = await chrome.storage.sync.get(DEFAULTS);
    return {
      ...DEFAULTS,
      ...data,
      transferFilters: data.transferFilters ?? DEFAULTS.transferFilters,
      tryoutsFilters: data.tryoutsFilters ?? DEFAULTS.tryoutsFilters,
      rolesCatalog: data.rolesCatalog ?? DEFAULTS.rolesCatalog,
      roleProfiles: data.roleProfiles ?? DEFAULTS.roleProfiles
    };
  };
})();

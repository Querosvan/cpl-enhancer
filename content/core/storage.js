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

  const DEFAULT_ROLE_LIMITS = {
    entry: {
      Aim: 85,
      Handling: 80,
      Quickness: 80,
      Movement: 75,
      Gamesense: 70,
      Awareness: 70,
      Teamplay: 60,
      Determination: 70
    },
    support: {
      Teamplay: 85,
      Awareness: 80,
      Gamesense: 80,
      Determination: 80,
      Movement: 70,
      Aim: 70,
      Handling: 70,
      Quickness: 65
    },
    igl: {
      Gamesense: 85,
      Awareness: 85,
      Teamplay: 80,
      Determination: 85,
      Movement: 65,
      Aim: 65,
      Handling: 65,
      Quickness: 60
    },
    lurker: {
      Gamesense: 85,
      Awareness: 80,
      Movement: 80,
      Aim: 75,
      Handling: 70,
      Quickness: 70,
      Teamplay: 65,
      Determination: 70
    },
    flex: {
      Aim: 75,
      Handling: 75,
      Quickness: 75,
      Determination: 75,
      Awareness: 75,
      Teamplay: 75,
      Gamesense: 75,
      Movement: 75
    }
  };

  const DEFAULT_ROLE_SKILLS = Object.fromEntries(SKILLS.map(s => [s, 0]));
  const DEFAULT_ROLE_PROFILES = Object.fromEntries(
    DEFAULT_ROLES.map(role => [
      role.id,
      { skills: { ...DEFAULT_ROLE_SKILLS, ...(DEFAULT_ROLE_LIMITS[role.id] || {}) } }
    ])
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

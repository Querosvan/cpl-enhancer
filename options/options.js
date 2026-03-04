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

function buildDefaultRoleProfiles(roles) {
  const defaults = Object.fromEntries(SKILLS.map(s => [s, 0]));
  return Object.fromEntries(
    roles.map(role => [
      role.id,
      { skills: { ...defaults, ...(DEFAULT_ROLE_LIMITS[role.id] || {}) } }
    ])
  );
}

// Reasonable defaults (tweak later if you want)
// - current: for "good now"
// - limit: for "potential"
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
  roleProfiles: buildDefaultRoleProfiles(DEFAULT_ROLES)
};

const el = (id) => document.getElementById(id);

function clamp100(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampAge(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 13;
  return Math.max(13, Math.min(44, Math.round(n)));
}

function normalizeRoleId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function normalizeRolesCatalog(list) {
  if (!Array.isArray(list)) return DEFAULT_ROLES;
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (!item) continue;
    const label = String(item.label || item.name || item.id || "").trim();
    let id = String(item.id || item.key || "").trim();
    if (!id) id = normalizeRoleId(label);
    if (!label || !id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label });
  }
  return out.length ? out : DEFAULT_ROLES;
}

function normalizeRoleProfiles(raw, roles) {
  const out = {};
  const source = raw && typeof raw === "object" ? raw : {};

  for (const role of roles) {
    const roleEntry = source[role.id] || {};
    const skills = {};
    for (const skill of SKILLS) {
      const val = roleEntry.skills?.[skill] ?? roleEntry[skill] ?? 0;
      skills[skill] = clamp100(val);
    }
    out[role.id] = { skills };
  }

  return out;
}

function uniqueRoleId(base, taken) {
  let id = base || "role";
  if (!taken.has(id)) return id;
  let i = 2;
  while (taken.has(`${id}-${i}`)) i += 1;
  return `${id}-${i}`;
}
function setStatus(text) {
  const status = el("saveStatus");
  if (status) status.textContent = text;
}

function createSkillInputs(container, groupKey) {
  if (!container) return;
  container.innerHTML = "";
  for (const skill of SKILLS) {
    const row = document.createElement("div");
    row.className = "skillRow";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = skill;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.inputMode = "numeric";
    input.dataset.group = groupKey;
    input.dataset.skill = skill;

    const range = document.createElement("div");
    range.className = "range";
    range.textContent = "0-100";

    input.addEventListener("change", (e) => {
      e.target.value = String(clamp100(e.target.value));
    });

    row.appendChild(name);
    row.appendChild(input);
    row.appendChild(range);

    container.appendChild(row);
  }
}

function setActiveSection(section) {
  // buttons
  document.querySelectorAll(".nav__item").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.section === section);
  });

  // panels
  const sections = ["general", "transfer", "tryouts", "roles"];
  for (const key of sections) {
    const panel = el(`section-${key}`);
    if (panel) panel.classList.toggle("is-hidden", key !== section);
  }
}

function readTransferInputs() {
  const current = {};
  const limit = {};

  document.querySelectorAll('input[type="number"][data-group="current"]').forEach(inp => {
    current[inp.dataset.skill] = clamp100(inp.value);
  });

  document.querySelectorAll('input[type="number"][data-group="limit"]').forEach(inp => {
    limit[inp.dataset.skill] = clamp100(inp.value);
  });

  const currentAgeMin = clampAge(el("currentAgeMin")?.value);
  const currentAgeMax = clampAge(el("currentAgeMax")?.value);
  current.ageMin = Math.min(currentAgeMin, currentAgeMax);
  current.ageMax = Math.max(currentAgeMin, currentAgeMax);

  const limitAgeMin = clampAge(el("limitAgeMin")?.value);
  const limitAgeMax = clampAge(el("limitAgeMax")?.value);
  limit.ageMin = Math.min(limitAgeMin, limitAgeMax);
  limit.ageMax = Math.max(limitAgeMin, limitAgeMax);

  return { current, limit };
}

function fillTransferInputs(filters) {
  for (const inp of document.querySelectorAll('input[type="number"][data-group]')) {
    const group = inp.dataset.group; // current | limit
    const skill = inp.dataset.skill;
    inp.value = String(clamp100(filters?.[group]?.[skill] ?? 0));
  }

  const currentMin = clampAge(filters?.current?.ageMin ?? DEFAULTS.transferFilters.current.ageMin);
  const currentMax = clampAge(filters?.current?.ageMax ?? DEFAULTS.transferFilters.current.ageMax);
  const limitMin = clampAge(filters?.limit?.ageMin ?? DEFAULTS.transferFilters.limit.ageMin);
  const limitMax = clampAge(filters?.limit?.ageMax ?? DEFAULTS.transferFilters.limit.ageMax);

  if (el("currentAgeMin")) el("currentAgeMin").value = String(currentMin);
  if (el("currentAgeMax")) el("currentAgeMax").value = String(currentMax);
  if (el("limitAgeMin")) el("limitAgeMin").value = String(limitMin);
  if (el("limitAgeMax")) el("limitAgeMax").value = String(limitMax);
}

function readTryoutsFilters() {
  const out = {};
  document.querySelectorAll('input[type="number"][data-group="tryouts"]').forEach(inp => {
    out[inp.dataset.skill] = clamp100(inp.value);
  });
  return out;
}

function fillTryoutsInputs(filters) {
  for (const inp of document.querySelectorAll('input[type="number"][data-group="tryouts"]')) {
    const skill = inp.dataset.skill;
    inp.value = String(clamp100(filters?.[skill] ?? 0));
  }
}

function createRoleSkillInputs(container, roleId, roleProfiles) {
  if (!container) return;
  container.innerHTML = "";
  const skills = roleProfiles?.[roleId]?.skills || {};
  for (const skill of SKILLS) {
    const row = document.createElement("div");
    row.className = "role-skill-row";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = skill;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.inputMode = "numeric";
    input.dataset.roleId = roleId;
    input.dataset.skill = skill;
    input.value = String(clamp100(skills[skill] ?? 0));
    input.addEventListener("change", (e) => {
      e.target.value = String(clamp100(e.target.value));
    });

    row.appendChild(name);
    row.appendChild(input);
    container.appendChild(row);
  }
}

function createRoleCard(role, roleProfiles) {
  const card = document.createElement("div");
  card.className = "role-card";
  card.dataset.roleCard = "1";
  if (role?.id) card.dataset.roleId = role.id;

  const header = document.createElement("div");
  header.className = "role-header";

  const nameWrap = document.createElement("div");
  nameWrap.className = "role-name";

  const nameLabel = document.createElement("div");
  nameLabel.className = "label";
  nameLabel.textContent = "Role name";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Role name";
  nameInput.dataset.roleName = "1";
  nameInput.value = String(role?.label || "");

  nameWrap.appendChild(nameLabel);
  nameWrap.appendChild(nameInput);

  const actions = document.createElement("div");
  actions.className = "role-actions";

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn btn--danger";
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    card.remove();
  });

  actions.appendChild(removeBtn);

  header.appendChild(nameWrap);
  header.appendChild(actions);

  const skillsWrap = document.createElement("div");
  skillsWrap.className = "role-skills";
  createRoleSkillInputs(skillsWrap, role?.id || "", roleProfiles);

  card.appendChild(header);
  card.appendChild(skillsWrap);

  return card;
}

function renderRolesList(rolesCatalog, roleProfiles) {
  const list = el("rolesList");
  if (!list) return;
  list.innerHTML = "";

  rolesCatalog.forEach((role) => {
    const card = createRoleCard(role, roleProfiles);
    list.appendChild(card);
  });
}

function readRolesFromUI() {
  const cards = Array.from(document.querySelectorAll("[data-role-card='1']"));
  const roles = [];
  const profiles = {};
  const seen = new Set();

  for (const card of cards) {
    const nameInput = card.querySelector("input[data-role-name='1']");
    const label = String(nameInput?.value || "").trim();
    if (!label) continue;

    let id = String(card.dataset.roleId || "").trim();
    if (!id) id = normalizeRoleId(label);
    if (!id) id = "role";
    id = uniqueRoleId(id, seen);
    seen.add(id);
    card.dataset.roleId = id;

    const skills = {};
    for (const skill of SKILLS) {
      const input = card.querySelector(`input[data-skill="${skill}"]`);
      skills[skill] = clamp100(input?.value ?? 0);
    }

    roles.push({ id, label });
    profiles[id] = { skills };
  }

  if (!roles.length) {
    return {
      rolesCatalog: DEFAULT_ROLES,
      roleProfiles: buildDefaultRoleProfiles(DEFAULT_ROLES)
    };
  }

  return { rolesCatalog: roles, roleProfiles: profiles };
}

async function notifyEnabledChanged(enabled) {
  try {
    const tabs = await chrome.tabs.query({
      url: ["https://cplmanager.com/*", "https://www.cplmanager.com/*"]
    });
    for (const tab of tabs) {
      if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "SET_ENABLED", enabled });
    }
  } catch (_) {}
}

async function loadSettings() {
  const data = await chrome.storage.sync.get(DEFAULTS);

  // General
  if (el("enabled")) el("enabled").checked = !!data.enabled;

  // Transfer filters
  fillTransferInputs(data.transferFilters);

  // Tryouts
  fillTryoutsInputs(data.tryoutsFilters);

  // Roles
  const rolesCatalog = normalizeRolesCatalog(data.rolesCatalog);
  const roleProfiles = normalizeRoleProfiles(data.roleProfiles, rolesCatalog);
  renderRolesList(rolesCatalog, roleProfiles);
  if (el("rolesRosterOnly")) el("rolesRosterOnly").checked = data.rolesRosterOnly !== false;

  setStatus("Loaded.");
}

async function saveSettings() {
  const enabled = !!el("enabled")?.checked;
  const transferFilters = readTransferInputs();
  const tryoutsFilters = readTryoutsFilters();
  const rolesRosterOnly = !!el("rolesRosterOnly")?.checked;
  const { rolesCatalog, roleProfiles } = readRolesFromUI();

  await chrome.storage.sync.set({
    enabled,
    transferFilters,
    tryoutsFilters,
    rolesRosterOnly,
    rolesCatalog,
    roleProfiles
  });
  setStatus("Saved OK");
  await notifyEnabledChanged(enabled);
}

async function resetDefaults() {
  await chrome.storage.sync.set(DEFAULTS);
  await loadSettings();
  setStatus("Reset to defaults OK");
  await notifyEnabledChanged(DEFAULTS.enabled);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Build inputs
  createSkillInputs(el("currentSkills"), "current");
  createSkillInputs(el("limitSkills"), "limit");
  createSkillInputs(el("tryoutsSkills"), "tryouts");

  // Sidebar nav
  document.querySelectorAll(".nav__item").forEach(btn => {
    btn.addEventListener("click", () => setActiveSection(btn.dataset.section));
  });
  setActiveSection("general");

  // Actions
  const saveButtons = ["saveBtn", "saveBtnTryouts", "saveBtnRoles"];
  for (const id of saveButtons) {
    const btn = el(id);
    if (btn) btn.addEventListener("click", saveSettings);
  }

  const resetButtons = ["resetDefaults", "resetDefaultsTryouts", "resetDefaultsRoles"];
  for (const id of resetButtons) {
    const btn = el(id);
    if (btn) btn.addEventListener("click", resetDefaults);
  }

  const addRoleBtn = el("addRoleBtn");
  if (addRoleBtn) {
    addRoleBtn.addEventListener("click", () => {
      const list = el("rolesList");
      if (!list) return;
      const card = createRoleCard({ id: "", label: "" }, {});
      list.appendChild(card);
    });
  }

  // Save enabled immediately
  const enabled = el("enabled");
  if (enabled) {
    enabled.addEventListener("change", async () => {
      const value = !!enabled.checked;
      await chrome.storage.sync.set({ enabled: value });
      setStatus("Saved OK");
      await notifyEnabledChanged(value);
    });
  }

  const tryoutsInputs = document.querySelectorAll('input[type="number"][data-group="tryouts"]');
  tryoutsInputs.forEach(inp => {
    inp.addEventListener("change", (e) => {
      e.target.value = String(clamp100(e.target.value));
    });
  });

  ["currentAgeMin", "currentAgeMax", "limitAgeMin", "limitAgeMax"].forEach((id) => {
    const input = el(id);
    if (!input) return;
    input.addEventListener("change", (e) => {
      e.target.value = String(clampAge(e.target.value));
    });
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;

    if (changes.enabled && el("enabled")) {
      el("enabled").checked = !!changes.enabled.newValue;
    }

    if (changes.transferFilters) {
      fillTransferInputs(changes.transferFilters.newValue || DEFAULTS.transferFilters);
    }

    if (changes.tryoutsFilters) {
      fillTryoutsInputs(changes.tryoutsFilters.newValue || DEFAULTS.tryoutsFilters);
    }

    if (changes.rolesCatalog || changes.roleProfiles || changes.rolesRosterOnly) {
      const rolesCatalog = normalizeRolesCatalog(
        changes.rolesCatalog?.newValue || DEFAULTS.rolesCatalog
      );
      const roleProfiles = normalizeRoleProfiles(
        changes.roleProfiles?.newValue || DEFAULTS.roleProfiles,
        rolesCatalog
      );
      renderRolesList(rolesCatalog, roleProfiles);
      if (el("rolesRosterOnly")) {
        el("rolesRosterOnly").checked =
          (changes.rolesRosterOnly?.newValue ?? DEFAULTS.rolesRosterOnly) !== false;
      }
    }
  });

  await loadSettings();
});







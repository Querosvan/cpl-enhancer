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

// Reasonable defaults (tweak later if you want)
// - current: for "good now"
// - limit: for "potential"
const DEFAULTS = {
  enabled: true,
  transferFilters: {
    current: Object.fromEntries(SKILLS.map(s => [s, 85])),
    limit: Object.fromEntries(SKILLS.map(s => [s, 90]))
  },
  tryoutsFilters: Object.fromEntries(SKILLS.map(s => [s, 90]))
};

const el = (id) => document.getElementById(id);

function clamp100(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
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
const sections = ["general", "transfer", "tryouts"];
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

  return { current, limit };
}

function fillTransferInputs(filters) {
  for (const inp of document.querySelectorAll('input[type="number"][data-group]')) {
    const group = inp.dataset.group; // current | limit
    const skill = inp.dataset.skill;
    inp.value = String(clamp100(filters?.[group]?.[skill] ?? 0));
  }
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

  setStatus("Loaded.");
}

async function saveSettings() {
  const enabled = !!el("enabled")?.checked;
  const transferFilters = readTransferInputs();
  const tryoutsFilters = readTryoutsFilters();

  await chrome.storage.sync.set({ enabled, transferFilters, tryoutsFilters });
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
  const saveButtons = ["saveBtn", "saveBtnTryouts"];
  for (const id of saveButtons) {
    const btn = el(id);
    if (btn) btn.addEventListener("click", saveSettings);
  }

  const resetButtons = ["resetDefaults", "resetDefaultsTryouts"];
  for (const id of resetButtons) {
    const btn = el(id);
    if (btn) btn.addEventListener("click", resetDefaults);
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
  });

  await loadSettings();
});

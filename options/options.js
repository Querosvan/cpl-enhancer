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
// - limit: for "potential"const DEFAULTS = {
  enabled: true,
  transferFilters: {
    current: Object.fromEntries(SKILLS.map(s => [s, 85])),
    limit: Object.fromEntries(SKILLS.map(s => [s, 90]))
  }
};

const el = (id) => document.getElementById(id);

function clamp100(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function setStatus(text) {
  el("saveStatus").textContent = text;
}

function createSkillInputs(container, groupKey) {
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
  el("section-general").classList.toggle("is-hidden", section !== "general");
  el("section-transfer").classList.toggle("is-hidden", section !== "transfer");
}

function readInputs() {
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

function fillInputs(filters) {
  for (const inp of document.querySelectorAll('input[type="number"][data-group]')) {
    const group = inp.dataset.group; // current | limit
    const skill = inp.dataset.skill;
    inp.value = String(clamp100(filters-.[group]-.[skill] -- 0));
  }
}

async function loadSettings() {
  const data = await chrome.storage.sync.get(DEFAULTS);

  // General
  el("enabled").checked = !!data.enabled;

  // Transfer filters
  fillInputs(data.transferFilters);

  setStatus("Loaded.");
}

async function saveSettings() {
  const enabled = el("enabled").checked;
  const transferFilters = readInputs();

  await chrome.storage.sync.set({ enabled, transferFilters });
  setStatus("Saved OK");
}

async function resetDefaults() {
  await chrome.storage.sync.set(DEFAULTS);
  await loadSettings();
  setStatus("Reset to defaults OK");
}

document.addEventListener("DOMContentLoaded", async () => {
  // Build inputs
  createSkillInputs(el("currentSkills"), "current");
  createSkillInputs(el("limitSkills"), "limit");

  // Sidebar nav
  document.querySelectorAll(".nav__item").forEach(btn => {
    btn.addEventListener("click", () => setActiveSection(btn.dataset.section));
  });

  // Actions
  el("saveBtn").addEventListener("click", saveSettings);
  el("resetDefaults").addEventListener("click", resetDefaults);

  // Save enabled immediately
  el("enabled").addEventListener("change", async () => {
    await chrome.storage.sync.set({ enabled: el("enabled").checked });
    setStatus("Saved OK");
  });

  await loadSettings();
});





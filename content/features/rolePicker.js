(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const ROLE_STORAGE_KEY = "roleAssignments";
  const ROLE_SOURCE_MANUAL = "manual";

  // Default list (easy to swap later when CPL exposes official roles)
  const DEFAULT_ROLES = [
    { id: "entry", label: "Entry" },
    { id: "support", label: "Support" },
    { id: "igl", label: "IGL" },
    { id: "lurker", label: "Lurker" },
    { id: "flex", label: "Flex" }
  ];

  const EMPTY_ROLE_LABEL = "No role";

  let roles = DEFAULT_ROLES;
  let rolesById = new Map(DEFAULT_ROLES.map((r) => [r.id, r.label]));
  let assignments = {};

  function normalizeRoleId(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();
  }

  function normalizeRoles(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    const seen = new Set();

    for (const item of list) {
      let id = "";
      let label = "";

      if (typeof item === "string") {
        label = item.trim();
        id = normalizeRoleId(label);
      } else if (item && typeof item === "object") {
        label = String(item.label || item.name || item.id || "").trim();
        id = normalizeRoleId(item.id || item.key || label);
      }

      if (!label || !id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label });
    }

    return out;
  }

  function getRolesFromSettings(settings) {
    const custom = settings?.rolesCatalog || settings?.roles;
    const normalized = normalizeRoles(custom || []);
    return normalized.length ? normalized : normalizeRoles(DEFAULT_ROLES);
  }

  function setRoles(nextRoles) {
    roles = nextRoles.length ? nextRoles : DEFAULT_ROLES;
    rolesById = new Map(roles.map((r) => [r.id, r.label]));
    refreshAllSelects();
  }

  function normalizeAssignment(entry) {
    if (!entry) return null;
    if (typeof entry === "string") {
      return { roleId: entry, source: ROLE_SOURCE_MANUAL };
    }
    if (typeof entry === "object") {
      const roleId = entry.roleId || entry.role || entry.id || "";
      if (!roleId) return null;
      return {
        roleId,
        source: entry.source || ROLE_SOURCE_MANUAL,
        updatedAt: entry.updatedAt || null
      };
    }
    return null;
  }

  async function loadAssignments() {
    try {
      const data = await chrome.storage.local.get({ [ROLE_STORAGE_KEY]: {} });
      const raw = data?.[ROLE_STORAGE_KEY] || {};
      const next = {};
      for (const [playerId, entry] of Object.entries(raw)) {
        const normalized = normalizeAssignment(entry);
        if (normalized) next[playerId] = normalized;
      }
      assignments = next;
    } catch (err) {
      assignments = {};
    }
  }

  async function persistAssignments() {
    try {
      await chrome.storage.local.set({ [ROLE_STORAGE_KEY]: assignments });
    } catch (err) {
      console.warn("[CPL Enhancer] Failed to save role assignments:", err);
    }
  }

  function getPlayerIdFromHref(href) {
    if (!href) return null;
    try {
      const url = new URL(href, location.origin);
      const match = url.pathname.match(/\/players\/(\d+)/i);
      if (match) return match[1];
      const queryId = url.searchParams.get("id");
      if (queryId) return queryId;
    } catch (_) {
      const match = String(href).match(/\/players\/(\d+)/i);
      if (match) return match[1];
    }
    return null;
  }

  function isNameAnchor(anchor) {
    if (!anchor) return false;
    const text = (anchor.textContent || "").trim();
    if (text.length < 2 || text.length > 40) return false;
    if (!/[a-z]/i.test(text)) return false;
    return true;
  }

  function findPlayerAnchors() {
    const anchors = Array.from(document.querySelectorAll("a[href*='/players/']"));
    return anchors.filter((anchor) => isNameAnchor(anchor));
  }

  function isRosterPage() {
    const path = String(location.pathname || "").toLowerCase();
    if (/^\/cpl\/teams\/\d+\/players\/?$/.test(path)) return true;
    if (path.includes("/roster")) return true;
    if (path.includes("/squad")) return true;

    const title = String(document.title || "").toLowerCase();
    if (title.includes("roster") || title.includes("plantilla")) return true;

    const headingText = Array.from(document.querySelectorAll("h1, h2"))
      .map((h) => (h.textContent || "").toLowerCase())
      .join(" ");
    if (headingText.includes("roster") || headingText.includes("plantilla")) return true;

    return false;
  }

  function shouldShowOnPage(settings) {
    if (settings?.rolesRosterOnly === false) return true;
    return isRosterPage();
  }

  function removeRolePickers() {
    const nodes = document.querySelectorAll("[data-cpl-role-picker='1']");
    nodes.forEach((node) => node.remove());
  }

  function applyRoleToSelect(select, assignment) {
    if (!select) return;
    const roleId = assignment?.roleId || "";
    select.value = roleId;
    select.classList.toggle("is-empty", !roleId);

    if (!roleId) {
      select.title = "Role not set";
      select.dataset.roleSource = "";
      return;
    }

    const label = rolesById.get(roleId) || roleId;
    select.title = `Role: ${label}`;
    select.dataset.roleSource = assignment?.source || ROLE_SOURCE_MANUAL;
  }

  function refreshSelectsForPlayer(playerId) {
    const assignment = assignments[playerId] || null;
    const selector = `[data-cpl-role-select="1"][data-player-id="${playerId}"]`;
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((select) => applyRoleToSelect(select, assignment));
  }

  function refreshAllSelects() {
    const nodes = document.querySelectorAll(`[data-cpl-role-select="1"]`);
    nodes.forEach((select) => {
      const playerId = select.dataset.playerId;
      if (!playerId) return;
      ensureRoleOptions(select);
      applyRoleToSelect(select, assignments[playerId] || null);
    });
  }

  function ensureRoleOptions(select) {
    if (!select) return;
    const existing = select.dataset.rolesVersion || "";
    const version = String(roles.map((r) => r.id).join("|"));
    if (existing === version) return;

    select.dataset.rolesVersion = version;
    select.innerHTML = "";

    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = EMPTY_ROLE_LABEL;
    select.appendChild(noneOpt);

    for (const role of roles) {
      const opt = document.createElement("option");
      opt.value = role.id;
      opt.textContent = role.label;
      select.appendChild(opt);
    }
  }

  async function setAssignment(playerId, roleId) {
    if (!playerId) return;

    if (!roleId) {
      delete assignments[playerId];
      refreshSelectsForPlayer(playerId);
      await persistAssignments();
      return;
    }

    assignments[playerId] = {
      roleId,
      source: ROLE_SOURCE_MANUAL,
      updatedAt: Date.now()
    };

    refreshSelectsForPlayer(playerId);
    await persistAssignments();
  }

  function createRoleSelect(playerId) {
    const select = document.createElement("select");
    select.className = "cpl-role-select";
    select.dataset.cplRoleSelect = "1";
    select.dataset.playerId = playerId;
    select.setAttribute("aria-label", "Role");

    ensureRoleOptions(select);
    applyRoleToSelect(select, assignments[playerId] || null);

    select.addEventListener("change", async (event) => {
      const value = String(event.target.value || "");
      await setAssignment(playerId, value);
    });

    return select;
  }

  function ensureRolePicker(anchor) {
    if (!anchor) return;

    const host = anchor.closest("h1, h2, h3, h4, h5, h6") || anchor.parentElement || anchor;
    if (host.querySelector("[data-cpl-role-picker='1']")) return;

    const playerId = getPlayerIdFromHref(anchor.getAttribute("href"));
    if (!playerId) return;

    const wrap = document.createElement("span");
    wrap.className = "cpl-role-wrap";
    wrap.dataset.cplRolePicker = "1";
    wrap.dataset.playerId = playerId;

    const select = createRoleSelect(playerId);
    wrap.appendChild(select);

    // Insert next to player name
    if (host) {
      host.appendChild(wrap);
      return;
    }

    anchor.insertAdjacentElement("afterend", wrap);
  }

  function scanAndInsert() {
    const anchors = findPlayerAnchors();
    anchors.forEach((anchor) => ensureRolePicker(anchor));
  }

  window.CPLEnhancer.initRolePicker = function initRolePicker(settings) {
    if (!settings || !settings.enabled) return;

    setRoles(getRolesFromSettings(settings));

    loadAssignments().then(() => {
      if (shouldShowOnPage(settings)) {
        scanAndInsert();
        refreshAllSelects();
      } else {
        removeRolePickers();
      }
    });

    let scheduled = false;
    const run = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        try {
          if (!shouldShowOnPage(settings)) {
            removeRolePickers();
            return;
          }
          scanAndInsert();
        } catch (err) {
          console.warn("[CPL Enhancer] role picker failed:", err);
        }
      }, 120);
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else if (typeof window.CPLEnhancer.observe === "function") {
      window.CPLEnhancer.observe("body", () => run());
    } else {
      run();
    }

    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run();
      }
    }, 300);

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        if (!changes[ROLE_STORAGE_KEY]) return;
        const raw = changes[ROLE_STORAGE_KEY].newValue || {};
        const next = {};
        for (const [playerId, entry] of Object.entries(raw)) {
          const normalized = normalizeAssignment(entry);
          if (normalized) next[playerId] = normalized;
        }
        assignments = next;
        refreshAllSelects();
      });
    }
  };
})();

(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const SKILL_PARAM_MAP = {
    Aim: "aim",
    Handling: "handling",
    Quickness: "quickness",
    Determination: "determination",
    Awareness: "awareness",
    Teamplay: "teamplay",
    Gamesense: "gamesense",
    Movement: "movement"
  };

  const SKILLS = Object.keys(SKILL_PARAM_MAP);

  function isTransfersPage() {
    return location.pathname.includes("/cpl/office/transfers");
  }

  function clamp(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  function buildNowPresetFromSettings(settings) {
    const current = settings?.transferFilters?.current || {};
    const preset = {};
    for (const skillName of SKILLS) {
      const key = SKILL_PARAM_MAP[skillName];
      preset[key] = { min: clamp(current[skillName] ?? 0), max: 100 };
    }
    return preset;
  }

  function buildPotPresetFromSettings(settings) {
    const limit = settings?.transferFilters?.limit || {};
    const preset = {};
    for (const skillName of SKILLS) {
      const key = SKILL_PARAM_MAP[skillName];
      preset[key] = { min: clamp(limit[skillName] ?? 0), max: 100 };
    }
    return preset;
  }

  function findTabsContainer() {
    // There may be multiple .tabs in the DOM; pick the one that contains Main/Short List/Bids.
    const candidates = Array.from(document.querySelectorAll("div.tabs"));
    return (
      candidates.find((el) => {
        const t = (el.innerText || "").toLowerCase();
        return t.includes("main") && t.includes("short list") && t.includes("bids");
      }) || null
    );
  }

  // =========================
  // Filters (Header) helpers
  // =========================

  function matchesAnyText(el, patterns) {
    const text = (el?.textContent || "").trim().toLowerCase();
    return patterns.some((p) => text.includes(p));
  }

  function findFiltersHeader() {
    // Header that contains the "Apply filter" button (localized-safe)
    const applyPatterns = ["apply filter", "apply", "aplicar filtro", "aplicar", "filter", "filtro"];
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find((b) => matchesAnyText(b, applyPatterns)) || buttons.find((b) => b.querySelector("svg"));
    if (btn) return btn.closest("header") || btn.parentElement || null;

    const headers = Array.from(document.querySelectorAll("header"));
    return (
      headers.find((h) => {
        const btns = Array.from(h.querySelectorAll("button"));
        return btns.some((b) => matchesAnyText(b, applyPatterns));
      }) || null
    );
  }

  function findApplyButton(headerEl) {
    if (!headerEl) return null;

    const btns = Array.from(headerEl.querySelectorAll("button"));
    const textPatterns = ["apply filter", "apply", "aplicar filtro", "aplicar", "filter", "filtro"];

    // Prefer exact/contains text match
    const byText = btns.find((b) => matchesAnyText(b, textPatterns));
    if (byText) return byText;

    // Fallback: type="submit"
    const submit = btns.find((b) => (b.getAttribute("type") || "").toLowerCase() === "submit");
    if (submit) return submit;

    // Fallback: button with filter icon (SVG)
    const withIcon = btns.find((b) => b.querySelector("svg"));
    if (withIcon) return withIcon;

    // Fallback: class or data attribute hints
    return (
      btns.find((b) => /apply|filter|aplicar|filtro/i.test(b.className || "")) ||
      btns.find((b) => Array.from(b.attributes || []).some((a) => /apply|filter/i.test(a.name)))
    );
  }

  function findGroupByLabel(headerEl, labelCandidates) {
    // Groups are: <div class="flex items-center gap-3"><p>Skills</p> <div class="relative"><button>...</button> ...</div></div>
    const groups = Array.from(headerEl.querySelectorAll("div.flex.items-center.gap-3"));
    return (
      groups.find((g) => {
        const label = (g.querySelector("p")?.textContent || "").trim().toLowerCase();
        return labelCandidates.some((c) => label.includes(c));
      }) || null
    );
  }

  function getDropdownButtonFromGroup(groupEl) {
    // The dropdown button is the first button inside the group
    return groupEl.querySelector("button") || null;
  }

  function getDropdownContainerFromGroup(groupEl) {
    // The <button> lives inside <div class="relative"> ... <ul>...</ul>
    return groupEl.querySelector("div.relative") || groupEl;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function waitFor(fn, { timeout = 2000, interval = 50 } = {}) {
    const start = Date.now();
    return new Promise(async (resolve) => {
      while (Date.now() - start < timeout) {
        try {
          const v = fn();
          if (v) return resolve(v);
        } catch (_) {}
        await sleep(interval);
      }
      resolve(null);
    });
  }

  function hasUrlFilterParams(url) {
    for (const key of url.searchParams.keys()) {
      if (key.endsWith("-skill") || key.endsWith("-limit-skill")) return true;
    }
    return false;
  }

  function clearSkillParams(url) {
    const keys = Array.from(url.searchParams.keys());
    for (const key of keys) {
      if (key.endsWith("-skill") || key.endsWith("-limit-skill")) {
        url.searchParams.delete(key);
      }
    }
  }

  function markAutoApply(search) {
    try {
      sessionStorage.setItem("cplEnhancer_autoApply", search || "");
    } catch (_) {}
  }

  function shouldAutoApply(url) {
    try {
      const wanted = sessionStorage.getItem("cplEnhancer_autoApply");
      if (wanted && wanted === url.search) return true;
    } catch (_) {}
    return hasUrlFilterParams(url);
  }

  function clearAutoApply() {
    try {
      sessionStorage.removeItem("cplEnhancer_autoApply");
    } catch (_) {}
  }

  function getTransferCardsSignature() {
    const cards = Array.from(document.querySelectorAll("div.card"));
    if (!cards.length) return "0";
    const first = (cards[0].innerText || "").slice(0, 80);
    return `${cards.length}:${first}`;
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function clickElement(el) {
    if (!el) return false;

    // Make sure the element is interactable.
    try {
      el.scrollIntoView({ block: "center", inline: "center" });
    } catch (_) {}
    try {
      el.focus?.();
    } catch (_) {}

    const rect = el.getBoundingClientRect();
    const base = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      button: 0,
      buttons: 1,
    };

    // Pointer events first (many dropdown libraries rely on these).
    try {
      if (typeof PointerEvent !== "undefined") {
        el.dispatchEvent(new PointerEvent("pointerover", { ...base, pointerType: "mouse", isPrimary: true }));
        el.dispatchEvent(new PointerEvent("pointerenter", { ...base, pointerType: "mouse", isPrimary: true }));
        el.dispatchEvent(new PointerEvent("pointerdown", { ...base, pointerType: "mouse", isPrimary: true }));
        el.dispatchEvent(new PointerEvent("pointerup", { ...base, pointerType: "mouse", isPrimary: true }));
        el.dispatchEvent(new PointerEvent("pointerout", { ...base, pointerType: "mouse", isPrimary: true }));
        el.dispatchEvent(new PointerEvent("pointerleave", { ...base, pointerType: "mouse", isPrimary: true }));
      }
    } catch (_) {}

    // Mouse events fallback.
    try {
      el.dispatchEvent(new MouseEvent("mouseover", base));
      el.dispatchEvent(new MouseEvent("mouseenter", base));
      el.dispatchEvent(new MouseEvent("mousedown", base));
      el.dispatchEvent(new MouseEvent("mouseup", base));
      el.dispatchEvent(new MouseEvent("click", base));
    } catch (_) {}

    // Native click last.
    try {
      el.click();
    } catch (_) {}

    return true;
  }

  function setNumberInput(input, value) {
    if (!input) return;
    // React/Vue controlled inputs often ignore direct `input.value = ...` unless the native setter + events are used.
    const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    const setter = desc && desc.set;
    if (setter) setter.call(input, String(value));
    else input.value = String(value);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function fillSkillsUl(ulEl, preset) {
    const items = Array.from(ulEl.querySelectorAll("li"));
    for (const [skillKey, range] of Object.entries(preset)) {
      const li = items.find((it) => {
        const span = it.querySelector("span");
        return (span?.textContent || "").trim().toLowerCase() === skillKey.toLowerCase();
      });
      if (!li) continue;

      const inputs = Array.from(li.querySelectorAll('input[type="number"]'));
      if (inputs.length >= 2) {
        setNumberInput(inputs[0], range.min);
        setNumberInput(inputs[1], range.max);
      }
    }
  }

  function isSkillsMenuUl(ul, preset) {
    if (!ul) return false;
    // Must have at least 2 number inputs and contain at least one skill label from the preset.
    const hasInputs = ul.querySelectorAll('input[type="number"]').length >= 2;
    if (!hasInputs) return false;

    const labels = Array.from(ul.querySelectorAll("li span")).map((s) => (s.textContent || "").trim().toLowerCase());
    const keys = Object.keys(preset || {});
    return keys.some((k) => labels.includes(String(k).trim().toLowerCase()));
  }

  function distanceBetweenRects(a, b) {
    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  async function openDropdownAndGetUl(groupEl, preset) {
    const dropdownBtn = getDropdownButtonFromGroup(groupEl);
    if (!dropdownBtn) return null;

    const container = getDropdownContainerFromGroup(groupEl) || dropdownBtn;

    // Helper: find the best candidate UL near the button.
    const btnRect = dropdownBtn.getBoundingClientRect();
    const pickBestUl = (uls) => {
      const candidates = uls
        .filter((u) => isVisible(u))
        .filter((u) => isSkillsMenuUl(u, preset));
      if (!candidates.length) return null;
      let best = candidates[0];
      let bestDist = distanceBetweenRects(best.getBoundingClientRect(), btnRect);
      for (const ul of candidates.slice(1)) {
        const d = distanceBetweenRects(ul.getBoundingClientRect(), btnRect);
        if (d < bestDist) {
          best = ul;
          bestDist = d;
        }
      }
      return best;
    };

    // If it's already open, return it.
    {
      const existing = pickBestUl(Array.from(document.querySelectorAll("ul")));
      if (existing) return { ul: existing, dropdownBtn };
    }

    // Snapshot existing ULs (because this menu UL is created only after opening).
    const before = new Set(Array.from(document.querySelectorAll("ul")));

    // Open dropdown (try container first, then button)
    clickElement(container);
    clickElement(dropdownBtn);

    const found = await waitFor(() => {
      const allUls = Array.from(document.querySelectorAll("ul"));
      const newUls = allUls.filter((u) => !before.has(u));
      return pickBestUl(newUls.length ? newUls : allUls);
    }, { timeout: 1200, interval: 50 });

    if (found) return { ul: found, dropdownBtn };

    // Keyboard fallback (some dropdowns open on Enter/Space)
    try {
      dropdownBtn.focus();
      dropdownBtn.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
      dropdownBtn.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true }));
    } catch (_) {}

    const found2 = await waitFor(() => pickBestUl(Array.from(document.querySelectorAll("ul"))), {
      timeout: 1200,
      interval: 50,
    });
    if (found2) return { ul: found2, dropdownBtn };

    try {
      dropdownBtn.focus();
      dropdownBtn.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true }));
      dropdownBtn.dispatchEvent(new KeyboardEvent("keyup", { key: " ", code: "Space", bubbles: true }));
    } catch (_) {}

    const found3 = await waitFor(() => pickBestUl(Array.from(document.querySelectorAll("ul"))), {
      timeout: 1200,
      interval: 50,
    });
    if (found3) return { ul: found3, dropdownBtn };

    return null;
  }

  function maybeAutoApplyFilters() {
    if (!isTransfersPage()) return;

    let url;
    try {
      url = new URL(location.href);
    } catch (_) {
      return;
    }

    if (!shouldAutoApply(url)) return;

    const guardKey = `cplEnhancer_autoApply_${url.search}`;
    const triesKey = `${guardKey}_tries`;
    if (sessionStorage.getItem(guardKey) === "1") return;

    const maxTries = 12;

    const tryClick = () => {
      const tries = Number(sessionStorage.getItem(triesKey) || "0");
      if (tries >= maxTries) return;
      sessionStorage.setItem(triesKey, String(tries + 1));

      const header = findFiltersHeader();
      const btn = header ? findApplyButton(header) : null;

      if (btn && isVisible(btn) && !btn.disabled && btn.getAttribute("aria-disabled") !== "true") {
        const beforeSig = getTransferCardsSignature();
        clickElement(btn);

        setTimeout(() => {
          const afterSig = getTransferCardsSignature();
          if (afterSig !== beforeSig) {
            sessionStorage.setItem(guardKey, "1");
            sessionStorage.removeItem(triesKey);
            clearAutoApply();
            return;
          }
          setTimeout(tryClick, 300);
        }, 600);
        return;
      }

      setTimeout(tryClick, 300);
    };

    tryClick();
  }

  async function applyPreset({ mode, preset }) {
    if (!isTransfersPage()) return false;

    // Prefer URL params (fast + reliable)
    const urlApplied = applyPresetViaUrlParams(preset, mode);
    if (urlApplied) return true;

    const headerEl = findFiltersHeader();
    if (!headerEl) {
      console.warn("[CPL Enhancer] Filters header not found.");
      return false;
    }

    const applyBtn = findApplyButton(headerEl);
    if (!applyBtn) {
      console.warn("[CPL Enhancer] Apply filter button not found.");
      return false;
    }

    // Reset pagination to page=1 (URL only) to avoid applying filters on a later page
    try {
      const url = new URL(location.href);
      url.searchParams.set("page", "1");
      history.replaceState({}, "", url.toString());
    } catch (_) {}

    const label = mode === "now" ? "skills" : "limits";
    const labelCandidates =
      mode === "now"
        ? ["skills", "skill", "habilidades", "habilidad"]
        : ["limits", "limit", "limite", "limites", "cap", "caps"];
    const groupEl = findGroupByLabel(headerEl, labelCandidates);

    if (!groupEl) {
      console.warn(`[CPL Enhancer] Group "${label}" not found.`);
      return false;
    }

    const urlBefore = location.href;
    const opened = await openDropdownAndGetUl(groupEl, preset);
    if (!opened) {
      // Fallback: if we previously learned URL param mapping, apply via query params.
      const ok = applyPresetViaUrlParamsIfKnown(preset);
      if (!ok) {
        console.warn(
          `[CPL Enhancer] Could not open "${label}" dropdown (likely blocks synthetic events). ` +
            `Open it once manually and click Now/Pot so I can learn the URL params, then it will work closed.`
        );
      }
      return ok;
    }

    // Fill values
    fillSkillsUl(opened.ul, preset);

    // Close dropdown (optional but keeps UI clean)
    clickElement(opened.dropdownBtn);

    // Apply
    // Small delay helps some UIs flush state updates before applying.
    await sleep(60);
    clickElement(applyBtn);

    // Learn URL params (if Apply updates query string)
    await learnUrlParamMappingAfterApply(urlBefore, preset);
    return true;
  }

  // =========================
  // URL-param fallback (learned)
  // =========================

  function applyResetViaUrlParams() {
    let url;
    try {
      url = new URL(location.href);
    } catch (_) {
      return false;
    }

    clearSkillParams(url);
    url.searchParams.set("page", "1");

    markAutoApply(url.search);
    location.href = url.toString();
    return true;
  }

  function applyPresetViaUrlParams(preset, mode) {
    let url;
    try {
      url = new URL(location.href);
    } catch (_) {
      return false;
    }

    clearSkillParams(url);
    url.searchParams.set("page", "1");

    // Base param format on current CPLManager URLs:
    // - current skills: aim-skill=85-100
    // - limits/caps:   aim-limit-skill=85-100
    const suffix = mode === "pot" ? "-limit-skill" : "-skill";

    let applied = 0;
    for (const [skillKey, range] of Object.entries(preset)) {
      const key = String(skillKey || "").toLowerCase();
      if (!key) continue;
      url.searchParams.set(`${key}${suffix}`, `${range.min}-${range.max}`);
      applied++;
    }

    if (!applied) return false;

    // Navigate to apply the new params.
    markAutoApply(url.search);
    location.href = url.toString();
    return true;
  }

  function getLearnedParamMap() {
    try {
      const raw = localStorage.getItem("cplEnhancer_transferFilterParamMap");
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setLearnedParamMap(map) {
    try {
      localStorage.setItem("cplEnhancer_transferFilterParamMap", JSON.stringify(map));
    } catch (_) {}
  }

  async function learnUrlParamMappingAfterApply(urlBefore, preset) {
    // If the app doesn't encode filters in the URL, this will do nothing.
    const after = await waitFor(() => (location.href !== urlBefore ? location.href : null), {
      timeout: 1800,
      interval: 50,
    });
    if (!after) return;

    let beforeUrl, afterUrl;
    try {
      beforeUrl = new URL(urlBefore);
      afterUrl = new URL(after);
    } catch (_) {
      return;
    }

    const changed = [];
    const keys = new Set([
      ...Array.from(beforeUrl.searchParams.keys()),
      ...Array.from(afterUrl.searchParams.keys()),
    ]);
    for (const k of keys) {
      const b = beforeUrl.searchParams.get(k);
      const a = afterUrl.searchParams.get(k);
      if (b !== a) changed.push({ k, b, a });
    }
    if (!changed.length) return;

    // Build a lookup of numeric values we set.
    const wanted = [];
    for (const [skill, range] of Object.entries(preset)) {
      wanted.push({ skill, kind: "min", v: String(range.min) });
      wanted.push({ skill, kind: "max", v: String(range.max) });
    }

    const map = getLearnedParamMap() || { min: {}, max: {} };

    // Greedy assignment: for each changed param that is numeric and matches one of our set values, map it.
    for (const { k, a } of changed) {
      if (a == null) continue;
      if (!/^\d+$/.test(String(a).trim())) continue;
      const match = wanted.find((w) => w.v === String(a).trim());
      if (!match) continue;

      if (!map[match.kind][match.skill]) {
        map[match.kind][match.skill] = k;
      }
    }

    // Only persist if we learned at least something.
    const learnedCount = Object.keys(map.min || {}).length + Object.keys(map.max || {}).length;
    if (learnedCount > 0) setLearnedParamMap(map);
  }

  function applyPresetViaUrlParamsIfKnown(preset) {
    const map = getLearnedParamMap();
    if (!map || !map.min || !map.max) return false;

    let url;
    try {
      url = new URL(location.href);
    } catch (_) {
      return false;
    }

    clearSkillParams(url);
    url.searchParams.set("page", "1");

    let applied = 0;
    for (const [skill, range] of Object.entries(preset)) {
      const minKey = map.min[skill];
      const maxKey = map.max[skill];
      if (minKey) {
        url.searchParams.set(minKey, String(range.min));
        applied++;
      }
      if (maxKey) {
        url.searchParams.set(maxKey, String(range.max));
        applied++;
      }
    }

    if (!applied) return false;

    // Navigate to apply the new params.
    markAutoApply(url.search);
    location.href = url.toString();
    return true;
  }

  // =========================
  // Tabs injection
  // =========================

  function ensureTabs(settings) {
    if (!isTransfersPage()) return;

    const tabsContainer = findTabsContainer();
    if (!tabsContainer) return;

    // Avoid duplicates
    if (tabsContainer.querySelector('[data-cpl-enhancer-top-tab="now"]')) return;

    const baseClass = "whitespace-nowrap border-transparent hf:text-hover relative border-b-2";

    const nowPreset = buildNowPresetFromSettings(settings);
    const potPreset = buildPotPresetFromSettings(settings);

    const nowTab = document.createElement("a");
    nowTab.href = "#";
    nowTab.textContent = "Now";
    nowTab.dataset.cplEnhancerTopTab = "now";
    nowTab.className = `${baseClass} cpl-enhancer-top-tab cpl-enhancer-top-tab--now`;
    nowTab.addEventListener("click", (e) => {
      e.preventDefault();
      applyPreset({ mode: "now", preset: nowPreset });
    });

    const potTab = document.createElement("a");
    potTab.href = "#";
    potTab.textContent = "Pot";
    potTab.dataset.cplEnhancerTopTab = "pot";
    potTab.className = `${baseClass} cpl-enhancer-top-tab cpl-enhancer-top-tab--pot`;
    potTab.addEventListener("click", (e) => {
      e.preventDefault();
      applyPreset({ mode: "pot", preset: potPreset });
    });

    const resetTab = document.createElement("a");
    resetTab.href = "#";
    resetTab.textContent = "Reset";
    resetTab.dataset.cplEnhancerTopTab = "reset";
    resetTab.className = `${baseClass} cpl-enhancer-top-tab cpl-enhancer-top-tab--reset`;
    resetTab.addEventListener("click", (e) => {
      e.preventDefault();
      applyResetViaUrlParams();
    });

    const anchors = Array.from(tabsContainer.querySelectorAll("a"));
    const bids = anchors.find((a) => (a.textContent || "").trim().toLowerCase() === "bids");

    if (bids && bids.nextSibling) {
      tabsContainer.insertBefore(nowTab, bids.nextSibling);
      tabsContainer.insertBefore(potTab, nowTab.nextSibling);
      tabsContainer.insertBefore(resetTab, potTab.nextSibling);
    } else {
      tabsContainer.appendChild(nowTab);
      tabsContainer.appendChild(potTab);
      tabsContainer.appendChild(resetTab);
    }
  }

  window.CPLEnhancer.initTransferTabs = function initTransferTabs(settings) {
    let scheduled = false;
    let lastUrl = location.href;

    const run = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        ensureTabs(settings);
        maybeAutoApplyFilters();
      }, 100);
    };

    // 1) DOM mutations (SPA re-renders)
    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else {
      window.CPLEnhancer.observe("body", () => run());
    }

    // 2) URL changes (pagination, internal navigation)
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run();
      }
    }, 300);

    run();
  };
})();

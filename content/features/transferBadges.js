(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const SKILLS = [
    "aim",
    "handling",
    "quickness",
    "determination",
    "awareness",
    "teamplay",
    "gamesense",
    "movement"
  ];

  function clamp99(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(99, Math.round(v)));
  }

  function clampAge(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return 13;
    return Math.max(13, Math.min(44, Math.round(v)));
  }

  function getAgeRangeForMode(settings, mode) {
    const defaults = mode === "now" ? { min: 13, max: 44 } : { min: 13, max: 25 };
    const src = mode === "now" ? settings?.transferFilters?.current : settings?.transferFilters?.limit;
    const min = clampAge(src?.ageMin ?? defaults.min);
    const max = clampAge(src?.ageMax ?? defaults.max);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  function parseAgeFromText(text) {
    const m = String(text || "").match(/(\d{1,2})\s*yo\b/i);
    if (!m) return null;
    const age = Number(m[1]);
    return Number.isFinite(age) ? age : null;
  }

  function readAgeFromCard(card) {
    if (!card) return null;
    return parseAgeFromText(card.innerText || "");
  }

  function withinAgeRange(age, range) {
    if (age == null) return false;
    return age >= range.min && age <= range.max;
  }

  function readThreshold(map, skillKey) {
    const cap = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
    const v = (map && (map[skillKey] ?? map[cap])) ?? 0;
    return clamp99(v);
  }

  function parsePairsFromCardText(card) {
    const text = (card.innerText || "").toLowerCase();
    const out = {};

    for (const skill of SKILLS) {
      const re = new RegExp(`${skill}\\s*[^\\d]{0,20}(\\d{1,2})\\s*\\/\\s*(\\d{1,2})`, "i");
      const m = text.match(re);
      if (!m) return null;
      out[skill] = { current: clamp99(m[1]), limit: clamp99(m[2]) };
    }

    return out;
  }

  function meetsAll(pairs, thresholdsMap, which) {
    return SKILLS.every(skill => {
      const val = which === "current" ? pairs[skill]?.current : pairs[skill]?.limit;
      const thr = readThreshold(thresholdsMap, skill);
      return (val ?? 0) >= thr;
    });
  }

  function getRootTransferCards() {
    const allCards = Array.from(document.querySelectorAll("div.card"));

    // Root card = no ancestor card (excluding itself)
    const rootCards = allCards.filter(c => {
      const parentCard = c.parentElement ? c.parentElement.closest("div.card") : null;
      return !parentCard;
    });

    // Transfer cards heuristic
    return rootCards.filter(c => (c.innerText || "").includes("Primary skills"));
  }

  function applyBadges(settings) {
    if (!location.pathname.includes("/cpl/office/transfers")) return;

    const currentThr = settings?.transferFilters?.current || {};
    const limitThr = settings?.transferFilters?.limit || {};
    const currentAgeRange = getAgeRangeForMode(settings, "now");
    const limitAgeRange = getAgeRangeForMode(settings, "pot");

    const cards = getRootTransferCards();

    for (const card of cards) {
      // Clean up previous highlights/tags inside this card
      for (const el of Array.from(card.querySelectorAll(".cpl-enhancer-badges, .cpl-enhancer-tag"))) {
        el.remove();
      }
      card.classList.remove(
        "cpl-enhancer-highlight",
        "cpl-enhancer-highlight--now",
        "cpl-enhancer-highlight--pot",
        "cpl-enhancer-highlight--both"
      );

      const pairs = parsePairsFromCardText(card);
      if (!pairs) continue;

      const age = readAgeFromCard(card);
      const goodNow = meetsAll(pairs, currentThr, "current") && withinAgeRange(age, currentAgeRange);
      const potential = meetsAll(pairs, limitThr, "limit") && withinAgeRange(age, limitAgeRange);

      if (!goodNow && !potential) continue;

      // Apply whole-card highlight
      card.classList.add("cpl-enhancer-highlight");

      let stateClass = "";
      let pillText = "";
      let pillClass = "";

      if (goodNow && potential) {
        stateClass = "cpl-enhancer-highlight--both";
        pillText = "NOW+POT";
        pillClass = "cpl-enhancer-tag-pill--both";
      } else if (goodNow) {
        stateClass = "cpl-enhancer-highlight--now";
        pillText = "NOW";
        pillClass = "cpl-enhancer-tag-pill--now";
      } else if (potential) {
        stateClass = "cpl-enhancer-highlight--pot";
        pillText = "POT";
        pillClass = "cpl-enhancer-tag-pill--pot";
      }

      card.classList.add(stateClass);

      // Add a top-left tag (very visible)
      const tag = document.createElement("div");
      tag.className = "cpl-enhancer-tag";

      const pill = document.createElement("span");
      pill.className = `cpl-enhancer-tag-pill ${pillClass}`;
      pill.textContent = pillText;

      tag.appendChild(pill);
      card.appendChild(tag);

    }
  }

  window.CPLEnhancer.initTransferBadges = function initTransferBadges(settings) {
    let scheduled = false;
    let lastUrl = location.href;
  
    const run = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        applyBadges(settings);
      }, 200);
    };
  
    // 1) DOM mutations
    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else {
      window.CPLEnhancer.observe("body", () => run());
    }
  
    // 2) URL changes (pagination, internal nav)
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run();
      }
    }, 300);
  
    run();
  };
  
})();




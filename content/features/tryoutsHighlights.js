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

  function isTryoutsPage() {
    return location.pathname.includes("/cpl/academy/tryouts");
  }

  function clamp99(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(99, Math.round(v)));
  }

  function readThreshold(map, skillKey) {
    const cap = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
    const v = (map && (map[skillKey] ?? map[cap])) ?? 0;
    return clamp99(v);
  }

  function parsePairsFromText(text) {
    const t = (text || "").toLowerCase();
    const out = {};

    for (const skill of SKILLS) {
      // Try to capture "skill 85 / 100" or "skill 85/100"
      let m = t.match(new RegExp(`${skill}\\s*[^\\d]{0,20}(\\d{1,2})\\s*\\/\\s*(\\d{1,2})`, "i"));
      if (m) {
        out[skill] = { current: clamp99(m[1]), limit: clamp99(m[2]) };
        continue;
      }

      // Fallback: "skill 85"
      m = t.match(new RegExp(`${skill}\\s*[^\\d]{0,20}(\\d{1,2})`, "i"));
      if (m) {
        out[skill] = { current: clamp99(m[1]) };
      }
    }

    return out;
  }

  function getTryoutCards() {
    const candidates = Array.from(document.querySelectorAll("div.card, li, article, section"));

    // Keep root-level candidates and those that actually look like a tryout block.
    return candidates.filter((el) => {
      if (!el || !el.innerText) return false;

      // Avoid nested duplicates
      const parentMatch = el.parentElement && el.parentElement.closest("div.card, li, article, section");
      if (parentMatch && parentMatch !== el) return false;

      const pairs = parsePairsFromText(el.innerText);
      const count = Object.keys(pairs).length;
      return count >= 3;
    });
  }

  function meetsAll(pairs, thresholds) {
    return SKILLS.every((skill) => {
      const val = pairs[skill]?.limit ?? pairs[skill]?.current ?? 0;
      const thr = readThreshold(thresholds, skill);
      return val >= thr;
    });
  }

  function applyTryouts(settings) {
    if (!isTryoutsPage()) return;

    const thresholds = settings?.tryoutsFilters || {};
    const cards = getTryoutCards();

    for (const card of cards) {
      // Clean up previous tags on this card
      for (const el of Array.from(card.querySelectorAll(".cpl-enhancer-tryout-tag"))) {
        el.remove();
      }
      card.classList.remove("cpl-enhancer-tryout-highlight");

      const pairs = parsePairsFromText(card.innerText || "");
      if (!pairs || !Object.keys(pairs).length) continue;

      const ok = meetsAll(pairs, thresholds);
      if (!ok) continue;

      card.classList.add("cpl-enhancer-tryout-highlight");

      const tag = document.createElement("div");
      tag.className = "cpl-enhancer-tryout-tag";
      tag.textContent = "TRYOUT";
      card.appendChild(tag);
    }
  }

  window.CPLEnhancer.initTryoutsHighlights = function initTryoutsHighlights(settings) {
    let scheduled = false;
    let lastUrl = location.href;

    const run = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        try {
          applyTryouts(settings);
        } catch (e) {
          console.warn("[CPL Enhancer] Tryouts highlight failed:", e);
        }
      }, 120);
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else if (typeof window.CPLEnhancer.observe === "function") {
      window.CPLEnhancer.observe("body", () => run());
    } else {
      const obs = new MutationObserver(() => run());
      obs.observe(document.body, { childList: true, subtree: true });
    }

    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run();
      }
    }, 300);

    run();
  };
})();

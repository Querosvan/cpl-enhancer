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

  const TRYOUT_MAX_AGE = 20;
  const TRYOUT_MIN_AGE = 15;
  const TRYOUT_POINTS_PER_YEAR = 1;

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

  function parseAgeFromText(text) {
    const t = String(text || "");
    const patterns = [
      /(\d{1,2})\s*yo\b/i,
      /\bage\b[^0-9]{0,4}(\d{1,2})\b/i,
      /\bedad\b[^0-9]{0,4}(\d{1,2})\b/i,
      /(\d{1,2})\s*a.os?\b/i
    ];

    for (const re of patterns) {
      const m = t.match(re);
      if (m) {
        const age = Number(m[1]);
        if (Number.isFinite(age)) return age;
      }
    }

    return null;
  }

  function getRemainingPoints(age) {
    if (!Number.isFinite(age)) return (TRYOUT_MAX_AGE - TRYOUT_MIN_AGE) * TRYOUT_POINTS_PER_YEAR;
    const clamped = Math.max(TRYOUT_MIN_AGE, Math.min(TRYOUT_MAX_AGE, Math.round(age)));
    const yearsLeft = Math.max(0, TRYOUT_MAX_AGE - clamped);
    return yearsLeft * TRYOUT_POINTS_PER_YEAR;
  }

  function parsePairsFromText(text) {
    const t = (text || "").toLowerCase();
    const out = {};

    for (const skill of SKILLS) {
      // Try to capture "skill 85 / 100" or "skill 85/100"
      let m = t.match(new RegExp(`${skill}\\s*[^\\d?]{0,20}(\\d{1,3})\\s*\\/\\s*(\\d{1,3})`, "i"));
      if (m) {
        out[skill] = { current: clamp99(m[1]), limit: clamp99(m[2]), known: true };
        continue;
      }

      // Unknown / hidden value
      m = t.match(new RegExp(`${skill}\\s*[^\\d]{0,20}\\?`, "i"));
      if (m) {
        out[skill] = { unknown: true };
        continue;
      }

      // Fallback: "skill 85"
      m = t.match(new RegExp(`${skill}\\s*[^\\d]{0,20}(\\d{1,3})`, "i"));
      if (m) {
        const val = clamp99(m[1]);
        out[skill] = { current: val, limit: val, known: true, approx: true };
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

  function getSkillStatus(entry, threshold, remainingPoints) {
    if (!entry || entry.unknown) return "unknown";
    const val = entry.limit ?? entry.current ?? 0;
    if (val >= threshold) return "met";
    if (val + remainingPoints >= threshold) return "reachable";
    return "nope";
  }

  function summarizeStatuses(statuses) {
    const summary = { met: 0, reachable: 0, nope: 0, unknown: 0, total: SKILLS.length };
    for (const skill of SKILLS) {
      const status = statuses[skill] || "unknown";
      summary[status] += 1;
    }
    return summary;
  }

  // Isolated rating logic so we can tweak it later without touching the DOM work.
  function computeStarRating(summary) {
    const { met, reachable, nope, unknown, total } = summary;
    if (nope > 0) return 1;
    if (unknown === 0 && met === total) return 5;
    if (unknown === 0 && met + reachable === total) return 4;
    if (unknown > 0 && met + reachable + unknown === total) return 3;
    return 2;
  }

  function findNameAnchor(card) {
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      ".player-name",
      ".player__name",
      ".name",
      "strong",
      "b"
    ];
    for (const sel of selectors) {
      const el = card.querySelector(sel);
      if (!el) continue;
      const text = (el.innerText || "").trim();
      if (text.length < 2 || text.length > 40) continue;
      if (!/[a-z]/i.test(text)) continue;
      return el;
    }
    return null;
  }

  function addRating(card, rating) {
    for (const el of Array.from(card.querySelectorAll(".cpl-enhancer-tryout-rating"))) {
      el.remove();
    }

    const wrap = document.createElement("span");
    wrap.className = "cpl-enhancer-tryout-rating";
    wrap.setAttribute("data-stars", String(rating));

    for (let i = 1; i <= 5; i += 1) {
      const star = document.createElement("span");
      star.className = "cpl-enhancer-tryout-star";
      if (i <= rating) star.classList.add("is-on");
      star.textContent = "*";
      wrap.appendChild(star);
    }

    const anchor = findNameAnchor(card);
    if (anchor) {
      anchor.appendChild(wrap);
      return;
    }

    card.prepend(wrap);
  }

  function findSkillNodes(card, skill) {
    const nodes = Array.from(card.querySelectorAll("li, div, span, p, td, th"));
    const matches = nodes.filter((el) => {
      const text = (el.innerText || "").toLowerCase();
      if (!text.includes(skill)) return false;
      if (!/(\d|\?)/.test(text)) return false;
      if (text.length > 140) return false;
      return true;
    });

    return matches.filter((el) => !matches.some((other) => other !== el && el.contains(other)));
  }

  function applyTryouts(settings) {
    if (!isTryoutsPage()) return;

    const thresholds = settings?.tryoutsFilters || {};
    const cards = getTryoutCards();

    for (const card of cards) {
      // Clean up previous tags/marks on this card
      for (const el of Array.from(card.querySelectorAll(".cpl-enhancer-tryout-tag, .cpl-enhancer-tryout-rating"))) {
        el.remove();
      }
      for (const el of Array.from(card.querySelectorAll(".cpl-enhancer-tryout-skill"))) {
        el.classList.remove(
          "cpl-enhancer-tryout-skill",
          "cpl-enhancer-tryout-skill--met",
          "cpl-enhancer-tryout-skill--reachable",
          "cpl-enhancer-tryout-skill--nope",
          "cpl-enhancer-tryout-skill--unknown"
        );
      }
      card.classList.remove("cpl-enhancer-tryout-highlight");

      const pairs = parsePairsFromText(card.innerText || "");
      if (!pairs || !Object.keys(pairs).length) continue;

      const age = parseAgeFromText(card.innerText || "");
      const remainingPoints = getRemainingPoints(age);

      const statuses = {};
      for (const skill of SKILLS) {
        const thr = readThreshold(thresholds, skill);
        statuses[skill] = getSkillStatus(pairs[skill], thr, remainingPoints);
      }

      const summary = summarizeStatuses(statuses);
      const stars = computeStarRating(summary);
      addRating(card, stars);

      for (const skill of SKILLS) {
        const status = statuses[skill];
        const nodes = findSkillNodes(card, skill);
        if (!nodes.length) continue;
        for (const node of nodes) {
          node.classList.add("cpl-enhancer-tryout-skill", `cpl-enhancer-tryout-skill--${status}`);
        }
      }

      const isMust = summary.unknown === 0 && summary.met === summary.total;
      if (!isMust) continue;

      card.classList.add("cpl-enhancer-tryout-highlight");

      const tag = document.createElement("div");
      tag.className = "cpl-enhancer-tryout-tag";
      tag.textContent = "MUST";
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


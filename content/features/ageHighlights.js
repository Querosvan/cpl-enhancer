(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const DEFAULTS = {
    startAge: 28, // orange (friendly)
    endAge: 40,   // red (intense)
    // optional: if you want to also color <= startAge in a neutral tone, set neutralColor
    neutralColor: "", // e.g. "#e5e7eb" (leave empty to keep original)
  };

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function ageToColor(age, cfg) {
    // Gradient from amber-ish to red-ish.
    // Start (28): amber 500-ish  -> #f59e0b (245,158,11)
    // End (40):   red 500-ish    -> #ef4444 (239,68,68)
    const start = { r: 245, g: 158, b: 11 };
    const end = { r: 239, g: 68, b: 68 };

    const tRaw = (age - cfg.startAge) / (cfg.endAge - cfg.startAge);
    const t = clamp01(tRaw);

    const r = lerp(start.r, end.r, t);
    const g = lerp(start.g, end.g, t);
    const b = lerp(start.b, end.b, t);

    return rgbToHex(r, g, b);
  }

  function injectStyles() {
    if (document.getElementById("cpl-enhancer-age-gradient-styles")) return;
    const style = document.createElement("style");
    style.id = "cpl-enhancer-age-gradient-styles";
    style.textContent = `
      .cpl-enhancer-age-gradient {
        /* we set color inline; class helps with specificity if needed */
        font-weight: inherit;
      }
    `;
    document.head.appendChild(style);
  }

  function parseAgeFromText(text) {
    // Matches "22yo (day 17)" or "22 yo"
    const m = String(text || "").match(/(\d{1,2})\s*yo\b/i);
    if (!m) return null;
    const age = Number(m[1]);
    return Number.isFinite(age) ? age : null;
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function applyHighlights(cfg) {
    injectStyles();

    // Find all <p> containing "yo"
    const agePs = Array.from(document.querySelectorAll("p"))
      .filter(p => /\d{1,2}\s*yo\b/i.test(p.textContent || ""))
      .filter(isVisible);

    for (const p of agePs) {
      const age = parseAgeFromText(p.textContent);
      if (age == null) continue;

      // ensure class
      p.classList.add("cpl-enhancer-age-gradient");

      // Color rules:
      // - < startAge: keep original (or use neutralColor if provided)
      // - >= startAge: apply gradient color
      if (age < cfg.startAge) {
        if (cfg.neutralColor) {
          p.style.color = cfg.neutralColor;
        } else {
          // keep original by clearing any previous inline
          p.style.removeProperty("color");
        }
        continue;
      }

      // >= startAge => gradient up to endAge
      const color = ageToColor(age, cfg);
      p.style.color = color;
    }
  }

  window.CPLEnhancer.initAgeHighlights = function initAgeHighlights(userCfg) {
    const cfg = { ...DEFAULTS, ...(userCfg || {}) };

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        try { applyHighlights(cfg); } catch (e) {
          console.warn("[CPL Enhancer] Age gradient failed:", e);
        }
      }, 80);
    };

    // Initial
    schedule();

    // SPA re-renders / pagination / sorting
    const obs = new MutationObserver(() => schedule());
    obs.observe(document.body, { childList: true, subtree: true });

    // URL changes
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        schedule();
      }
    }, 300);
  };
})();

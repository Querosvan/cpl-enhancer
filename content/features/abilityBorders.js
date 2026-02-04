(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const ABILITIES = [
    { name: "Loyal", type: "positive" },
    { name: "Long lived", type: "positive", variants: ["Long-lived", "Longlived"] },
    { name: "Leader", type: "positive" },
    { name: "Fast learner", type: "positive", variants: ["Fast-learner", "Fastlearner"] },
    { name: "Cheap", type: "positive" },
    { name: "Entertaining", type: "positive" },
    { name: "Prodigy", type: "positive" },
    { name: "Small Heart", type: "positive", variants: ["Tiny Heart"] },
    { name: "Medium Heart", type: "positive" },
    { name: "Big Heart", type: "positive" },
    { name: "Golden Heart", type: "positive" },
    { name: "Platinum Heart", type: "positive" },
    { name: "Famous", type: "positive" },
    { name: "Slow learner", type: "negative", variants: ["Slow-learner", "Slowlearner"] },
    { name: "Greedy", type: "negative" },
    { name: "Toxic", type: "negative" },
    { name: "Short Lived", type: "negative", variants: ["Short-lived", "Shortlived"] },
    { name: "Antisocial", type: "negative" },
    { name: "Choker", type: "negative" },
    { name: "Fragger", type: "mixed" },
    { name: "Tryhard", type: "mixed", variants: ["Try hard", "Try-hard"] }
  ];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const ABILITY_MAP = new Map();
  const ABILITY_MATCHERS = [];

  for (const ability of ABILITIES) {
    const names = [ability.name, ...(ability.variants || [])];
    for (const label of names) {
      const key = normalize(label);
      if (!key) continue;
      ABILITY_MAP.set(key, ability.type);
      ABILITY_MATCHERS.push({
        key,
        type: ability.type,
        regex: new RegExp(`\\b${escapeRegex(key)}\\b`, "i")
      });
    }
  }

  function getCandidateStrings(el) {
    const attrs = [
      "title",
      "alt",
      "aria-label",
      "data-tooltip",
      "data-title",
      "data-original-title",
      "data-bs-original-title",
      "data-tooltip-title",
      "data-tippy-content",
      "data-tooltip-content",
      "data-content"
    ];

    const out = [];
    for (const attr of attrs) {
      const val = el.getAttribute && el.getAttribute(attr);
      if (val) out.push(val);
    }

    const text = (el.textContent || "").trim();
    if (text && text.length <= 24) out.push(text);

    if (el.tagName === "IMG") {
      const src = el.getAttribute("src") || "";
      if (src) {
        const file = src.split("/").pop().split("?")[0] || "";
        if (file) {
          const name = file.replace(/\.[a-z0-9]+$/i, "");
          out.push(name);
        }
      }
    }

    return out;
  }

  function resolveAbilityType(el) {
    const candidates = getCandidateStrings(el);
    for (const raw of candidates) {
      const key = normalize(raw);
      if (!key) continue;
      const direct = ABILITY_MAP.get(key);
      if (direct) return direct;

      for (const matcher of ABILITY_MATCHERS) {
        if (matcher.regex.test(key)) return matcher.type;
      }
    }
    return null;
  }

  function applyBorder(el, type) {
    if (!el || !type) return;

    const target =
      el.tagName === "IMG" || el.tagName === "SVG"
        ? el
        : el.querySelector?.("img, svg") || el;

    if (!target) return;

    if (target.dataset.cplAbilityBorder === type) return;

    target.classList.remove(
      "cpl-ability-border--positive",
      "cpl-ability-border--negative",
      "cpl-ability-border--mixed"
    );

    target.classList.add("cpl-ability-border", `cpl-ability-border--${type}`);
    target.dataset.cplAbilityBorder = type;
  }

  function scan(root) {
    const scope = root || document;
    if (!scope.querySelectorAll) return;

    const selector = [
      "img[alt]",
      "img[title]",
      "img[aria-label]",
      "img[data-tooltip]",
      "img[data-title]",
      "img[data-original-title]",
      "img[data-bs-original-title]",
      "img[src*='ability' i]",
      "img[src*='special' i]",
      "img[src*='heart' i]",
      "span[title]",
      "span[aria-label]",
      "span[data-tooltip]",
      "span[data-title]",
      "span[data-original-title]",
      "span[data-bs-original-title]",
      "i[title]",
      "i[aria-label]",
      "i[data-tooltip]",
      "i[data-title]",
      "a[title]",
      "a[aria-label]",
      "a[data-tooltip]",
      "a[data-title]",
      "a[data-original-title]",
      "a[data-bs-original-title]",
      "button[title]",
      "button[aria-label]",
      "button[data-tooltip]",
      "button[data-title]",
      "div[title]",
      "div[aria-label]",
      "div[data-tooltip]",
      "div[data-title]",
      "svg[title]",
      "svg[aria-label]",
      "svg[data-tooltip]",
      "svg[data-title]"
    ].join(",");

    const nodes = scope.querySelectorAll(selector);
    nodes.forEach((el) => {
      const type = resolveAbilityType(el);
      if (type) applyBorder(el, type);
    });
  }

  window.CPLEnhancer.initAbilityBorders = function initAbilityBorders() {
    let scheduled = false;
    let lastUrl = location.href;

    const run = (root) => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        try {
          scan(root);
        } catch (e) {
          console.warn("[CPL Enhancer] ability borders failed:", e);
        }
      }, 120);
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run(document));
    } else if (typeof window.CPLEnhancer.observe === "function") {
      window.CPLEnhancer.observe("body", () => run(document));
    } else {
      run(document);
    }

    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        run(document);
      }
    }, 300);

    run(document);
  };
})();

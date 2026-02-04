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

  const ABILITY_ATTRS = [
    "title",
    "alt",
    "aria-label",
    "data-tooltip",
    "data-title",
    "data-original-title",
    "data-bs-original-title",
    "data-bs-title",
    "data-tooltip-title",
    "data-tooltip-text",
    "data-tooltip-content",
    "data-tippy-content",
    "data-content",
    "data-ability"
  ];

  const ABILITY_ATTR_SELECTOR = ABILITY_ATTRS.map((attr) => `[${attr}]`).join(",");

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
    const out = [];
    for (const attr of ABILITY_ATTRS) {
      const val = el.getAttribute && el.getAttribute(attr);
      if (val) out.push(val);
    }

    const describedBy = el.getAttribute && el.getAttribute("aria-describedby");
    if (describedBy) {
      const tooltip = document.getElementById(describedBy);
      const text = (tooltip?.textContent || "").trim();
      if (text) out.push(text);
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

    if (el.tagName === "SVG") {
      const useEl = el.querySelector && el.querySelector("use");
      const href =
        useEl?.getAttribute?.("href") || useEl?.getAttribute?.("xlink:href") || "";
      if (href) {
        const ref = href.split("#").pop() || "";
        if (ref) out.push(ref);

        const file = href.split("/").pop().split("?")[0] || "";
        if (file) out.push(file.replace(/\.[a-z0-9]+$/i, ""));
      }
    }

    return out;
  }

  function isLabeledElement(el) {
    if (!el || !el.getAttribute) return false;
    return ABILITY_ATTRS.some((attr) => el.hasAttribute(attr));
  }

  function resolveAbilityType(el) {
    const candidates = [];
    const seen = new Set();

    const addCandidates = (node) => {
      if (!node) return;
      for (const raw of getCandidateStrings(node)) {
        const key = normalize(raw);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        candidates.push(key);
      }
    };

    addCandidates(el);

    if (el.closest) {
      const labeledParent = el.closest(ABILITY_ATTR_SELECTOR);
      if (labeledParent && labeledParent !== el) addCandidates(labeledParent);
    }

    if (el.tagName !== "IMG" && el.tagName !== "SVG") {
      const childIcon = el.querySelector?.("img, svg");
      if (childIcon && childIcon !== el) addCandidates(childIcon);
    }

    for (const key of candidates) {
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

    let target = null;
    if (el.tagName === "IMG" || el.tagName === "SVG") {
      target = el;
    } else if (isLabeledElement(el)) {
      target = el;
    } else {
      target = el.querySelector?.("img, svg") || el;
    }

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

    const selector = ["img", "svg", ABILITY_ATTR_SELECTOR].join(",");

    const nodes = scope.querySelectorAll(selector);
    nodes.forEach((el) => {
      if ((el.tagName === "IMG" || el.tagName === "SVG") && el.closest) {
        const labeledParent = el.closest(ABILITY_ATTR_SELECTOR);
        if (labeledParent && labeledParent !== el) return;
      }
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

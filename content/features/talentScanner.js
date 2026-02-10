(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const SCAN_BTN_ATTR = "data-cpl-talent-scan-btn";
  const CATEGORIES = ["combat", "general", "sniper"];
  const TITLE_ATTRS = [
    "title",
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
    "data-content"
  ];

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeId(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();
  }

  function getSvgSignature(svg) {
    if (!svg || (svg.tagName || "").toLowerCase() !== "svg") return "";
    if (svg.dataset?.cplTalentSig) return svg.dataset.cplTalentSig;
    const paths = Array.from(svg.querySelectorAll("path"));
    const parts = paths.map((path) => (path.getAttribute("d") || "").slice(0, 40));
    let sig = "";
    if (parts.length) {
      sig = parts.join("|");
    } else {
      const useEl = svg.querySelector("use");
      const href =
        useEl?.getAttribute?.("href") ||
        useEl?.getAttribute?.("xlink:href") ||
        "";
      sig = href || "";
    }
    if (!sig) return "";
    if (sig) svg.dataset.cplTalentSig = sig;
    return sig;
  }

  function getIconFromStyle(el) {
    if (!el) return "";
    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (!style) return "";
    const bg = style.backgroundImage || "";
    const match = bg.match(/url\\([\"']?(.*?)[\"']?\\)/i);
    return match ? match[1] : "";
  }

  function findIconData(container) {
    if (!container) return { svgSignature: "", iconUrl: "" };
    const candidates = [];
    const addNode = (node) => {
      if (!node) return;
      candidates.push(node);
      const extra = node.querySelectorAll?.("svg,img,div,span");
      if (extra && extra.length) candidates.push(...extra);
    };

    addNode(container);
    addNode(container.parentElement);
    addNode(container.parentElement?.parentElement);

    let prev = container.previousElementSibling;
    for (let i = 0; i < 2 && prev; i += 1) {
      addNode(prev);
      prev = prev.previousElementSibling;
    }

    let next = container.nextElementSibling;
    for (let i = 0; i < 2 && next; i += 1) {
      addNode(next);
      next = next.nextElementSibling;
    }

    for (const node of candidates) {
      const svg = node.querySelector?.("svg") || (node.tagName === "svg" ? node : null);
      const svgSignature = getSvgSignature(svg);
      const img = node.querySelector?.("img") || (node.tagName === "img" ? node : null);
      const imgSrc = img?.getAttribute?.("src") || "";
      const styleUrl = getIconFromStyle(node);
      const iconUrl = imgSrc || styleUrl || "";
      if (svgSignature || iconUrl) {
        return { svgSignature, iconUrl };
      }
    }

    return { svgSignature: "", iconUrl: "" };
  }

  function findBadgeNodes(root) {
    if (!root) return [];
    const nodes = Array.from(root.querySelectorAll("div, span, p"));
    return nodes.filter((node) => /^\d+\s*\/\s*\d+$/.test((node.textContent || "").trim()));
  }

  function collectCategoryRoots(modal) {
    const out = new Map();
    const headings = Array.from(modal.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    for (const heading of headings) {
      const name = normalize(heading.textContent);
      if (!CATEGORIES.includes(name)) continue;
      const root = heading.parentElement || heading;
      const score = findBadgeNodes(root).length;
      const prev = out.get(name);
      if (!prev || score > prev.score) {
        out.set(name, { root, score });
      }
    }
    return new Map(Array.from(out.entries()).map(([key, val]) => [key, val.root]));
  }

  function findTalentModal() {
    const candidates = Array.from(document.querySelectorAll("div, section, article, dialog"));
    let best = null;

    for (const el of candidates) {
      const text = (el.textContent || "").toLowerCase();
      if (!text.includes("talents")) continue;
      if (!text.includes("points left")) continue;
      if (!text.includes("save")) continue;
      if (!text.includes("cancel")) continue;
      if (!best || text.length < (best.textContent || "").length) {
        best = el;
      }
    }

    return best;
  }

  function findPointsLeft(modal) {
    if (!modal) return null;
    const text = modal.textContent || "";
    const match = text.match(/points left:\s*(\d+)/i);
    if (!match) return null;
    return Number(match[1]);
  }

  function findCategoryForNode(node, roots) {
    if (!node || !roots) return null;
    for (const [category, root] of roots.entries()) {
      if (root && root.contains(node)) return category;
    }
    return null;
  }

  function getTitleFromNode(node) {
    if (!node || !node.getAttribute) return "";
    for (const attr of TITLE_ATTRS) {
      const val = node.getAttribute(attr);
      if (val) return val.trim();
    }
    return "";
  }

  function resolveTalentName(container) {
    if (!container) return "";
    let node = container;
    while (node) {
      const title = getTitleFromNode(node);
      if (title) return title;
      node = node.parentElement;
    }
    return "";
  }

  function buildTalentList(modal) {
    const pointsLeft = findPointsLeft(modal);
    const badges = findBadgeNodes(modal);
    const categoryRoots = collectCategoryRoots(modal);
    const talents = [];
    const seen = new Set();

    for (const badge of badges) {
      const value = (badge.textContent || "").trim();
      const match = value.match(/(\d+)\s*\/\s*(\d+)/);
      if (!match) continue;
      const current = Number(match[1]);
      const max = Number(match[2]);

      const container =
        badge.closest("button, [role='button']") ||
        badge.closest("div") ||
        badge.parentElement;
      if (!container) continue;

      const name = resolveTalentName(container);
      const icon = findIconData(container);
      const signature = icon.svgSignature;
      const id = normalizeId(name || signature || icon.iconUrl || "");
      const dedupeKey = `${id}:${current}/${max}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const category = findCategoryForNode(container, categoryRoots);

      talents.push({
        id: id || null,
        name: name || null,
        category: category || null,
        points: { current, max },
        svgSignature: signature || null,
        iconUrl: icon.iconUrl || null
      });
    }

    return { pointsLeft, talents };
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    return false;
  }

  function ensureScanButton(modal) {
    if (!modal || modal.querySelector(`[${SCAN_BTN_ATTR}="1"]`)) return;
    const headerTargets = Array.from(modal.querySelectorAll("h1,h2,h3,h4,h5,h6"))
      .filter((el) => /talents/i.test(el.textContent || ""));
    const header = headerTargets[0] || modal;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cpl-talent-scan-btn";
    btn.textContent = "Copy talents JSON";
    btn.setAttribute(SCAN_BTN_ATTR, "1");

    btn.addEventListener("click", async () => {
      const payload = buildTalentList(modal);
      const json = JSON.stringify(payload, null, 2);
      const ok = await copyToClipboard(json);
      if (!ok) {
        // Fallback: prompt so user can copy
        window.prompt("Copy talents JSON:", json);
        return;
      }
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = "Copy talents JSON";
      }, 1200);
    });

    if (header && header.parentElement) {
      header.parentElement.appendChild(btn);
    } else {
      modal.appendChild(btn);
    }
  }

  window.CPLEnhancer.initTalentScanner = function initTalentScanner(settings) {
    if (!settings || !settings.enabled) return;

    let scheduled = false;
    const run = () => {
      if (scheduled) return;
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        const modal = findTalentModal();
        if (modal) ensureScanButton(modal);
      }, 120);
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else if (typeof window.CPLEnhancer.observe === "function") {
      window.CPLEnhancer.observe("body", () => run());
    } else {
      run();
    }
  };
})();

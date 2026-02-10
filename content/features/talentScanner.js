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
    const parts = Array.from(svg.querySelectorAll("path")).map((path) =>
      (path.getAttribute("d") || "").slice(0, 40)
    );
    if (!parts.length) return "";
    const sig = parts.join("|");
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

    const svg =
      container.querySelector("svg") ||
      container.closest("svg") ||
      container.parentElement?.querySelector?.("svg");
    const svgSignature = getSvgSignature(svg);

    const img =
      container.querySelector("img") ||
      container.closest("img") ||
      container.parentElement?.querySelector?.("img");
    const imgSrc = img?.getAttribute?.("src") || "";

    const styleUrl =
      getIconFromStyle(container) ||
      getIconFromStyle(container.querySelector?.("div")) ||
      getIconFromStyle(container.parentElement);

    const iconUrl = imgSrc || styleUrl || "";
    return { svgSignature, iconUrl };
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

  function findCategoryForNode(node, modal) {
    if (!node || !modal) return null;
    let current = node;
    while (current && current !== modal) {
      const headings = Array.from(current.querySelectorAll("h1,h2,h3,h4,h5,h6,div,span,strong"));
      for (const h of headings) {
        const name = normalize(h.textContent);
        if (CATEGORIES.includes(name)) return name;
      }
      current = current.parentElement;
    }

    // fallback: scan siblings upwards
    current = node;
    while (current && current !== modal) {
      let prev = current.previousElementSibling;
      while (prev) {
        const name = normalize(prev.textContent);
        if (CATEGORIES.includes(name)) return name;
        prev = prev.previousElementSibling;
      }
      current = current.parentElement;
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

  function findBadgeNodes(modal) {
    if (!modal) return [];
    const nodes = Array.from(modal.querySelectorAll("div, span, p"));
    return nodes.filter((node) => /^\d+\s*\/\s*\d+$/.test((node.textContent || "").trim()));
  }

  function buildTalentList(modal) {
    const pointsLeft = findPointsLeft(modal);
    const badges = findBadgeNodes(modal);
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

      const category = findCategoryForNode(container, modal);

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

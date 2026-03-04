(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const LAUNCHER_ID = "cpl-skillwhat-launcher";
  const MODAL_ID = "cpl-skillwhat-modal";
  const IFRAME_ID = "cpl-skillwhat-iframe";
  const LAUNCHER_ATTR = "data-cpl-skillwhat-launcher";
  const LAUNCHER_CLASS = "cpl-skillwhat-launcher";
  const LAUNCHER_INLINE_CLASS = "cpl-skillwhat-launcher--inline";
  const FALLBACK_ICON =
    "data:image/png;base64,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";
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
  const PLAYER_SKILL_LABELS = [
    "Aim",
    "Handling",
    "Quickness",
    "Determination",
    "Awareness",
    "Teamplay",
    "Gamesense",
    "Movement"
  ];

  function safeRuntimeUrl(path) {
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.getURL === "function") {
        return chrome.runtime.getURL(path);
      }
      if (typeof browser !== "undefined" && browser.runtime && typeof browser.runtime.getURL === "function") {
        return browser.runtime.getURL(path);
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  function createLauncherIcon() {
    const iconSrc =
      safeRuntimeUrl("skillwhat/Sbutton.png") ||
      safeRuntimeUrl("skillwhat/favicon.ico") ||
      FALLBACK_ICON;
    if (!iconSrc) return null;
    const icon = document.createElement("span");
    icon.className = "cpl-skillwhat-launcher__icon";
    icon.style.backgroundImage = `url("${iconSrc}")`;
    icon.style.backgroundSize = "cover";
    icon.style.backgroundPosition = "center";
    icon.style.backgroundRepeat = "no-repeat";
    return icon;
  }

  function isTryoutsPage() {
    return location.pathname.includes("/cpl/academy/tryouts");
  }

  function findPlayerCards() {
    const cards = Array.from(document.querySelectorAll(".card.p-0"));
    return cards.filter((card) => {
      if (!card.querySelector("a[href*='/players/']")) return false;
      return hasPlayerSkills(card);
    });
  }

  function parseTryoutSkills(text) {
    const t = (text || "").toLowerCase();
    const out = {};
    for (const skill of SKILLS) {
      const re = new RegExp(`${skill}\\s*[^\\d?]{0,20}(\\?|\\d{1,3})(?:\\s*\\/\\s*(\\?|\\d{1,3}))?`, "i");
      if (re.test(t)) out[skill] = true;
    }
    return out;
  }

  function findTryoutCards() {
    const candidates = Array.from(document.querySelectorAll("div.card, li, article, section"));
    const roots = new Map();
    candidates.forEach((el) => {
      if (!el || !el.innerText) return;

      const parentMatch = el.parentElement && el.parentElement.closest("div.card, li, article, section");
      if (parentMatch && parentMatch !== el) return;

      const pairs = parseTryoutSkills(el.innerText);
      const count = Object.keys(pairs).length;
      if (count < 3) return;

      const root = el.closest("div.card") || el;
      roots.set(root, true);
    });

    return Array.from(roots.keys());
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "cpl-skillwhat-modal";

    const backdrop = document.createElement("div");
    backdrop.className = "cpl-skillwhat-modal__backdrop";
    backdrop.addEventListener("click", () => closeModal());

    const panel = document.createElement("div");
    panel.className = "cpl-skillwhat-modal__panel";

    const closeBtn = document.createElement("button");
    closeBtn.className = "cpl-skillwhat-modal__close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => closeModal());

    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.className = "cpl-skillwhat-modal__iframe";
    iframe.title = "SkillWhat";
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
    const iframeSrc = safeRuntimeUrl("skillwhat/index.html");
    if (!iframeSrc) return null;
    iframe.src = iframeSrc;
    iframe.addEventListener("load", () => {
      iframe.dataset.loaded = "1";
    });

    panel.appendChild(closeBtn);
    panel.appendChild(iframe);
    modal.appendChild(backdrop);
    modal.appendChild(panel);
    document.body.appendChild(modal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });

    return modal;
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  async function getSelectedText() {
    const selection = window.getSelection ? window.getSelection().toString().trim() : "";
    if (selection) return selection;

    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        const clip = (await navigator.clipboard.readText()) || "";
        return clip.trim();
      } catch (err) {
        return "";
      }
    }

    return "";
  }

  function findTryoutNameAnchor(card) {
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      ".player-name",
      ".player__name",
      ".name",
      "a[href*='/players/']",
      "strong",
      "b"
    ];
    for (const sel of selectors) {
      const el = card.querySelector(sel);
      if (!el) continue;
      const text = (el.textContent || "").trim();
      if (text.length < 2 || text.length > 40) continue;
      if (!/[a-z]/i.test(text)) continue;
      return el;
    }
    return null;
  }

  function findTryoutActions(card) {
    const buttons = Array.from(card.querySelectorAll("button"));
    const signBtn = buttons.find((btn) => /\bsign\b/i.test(btn.textContent || ""));
    const rejectBtn = buttons.find((btn) => /\breject\b/i.test(btn.textContent || ""));

    if (signBtn && rejectBtn) {
      const signWrap = signBtn.closest("div");
      if (signWrap && signWrap.contains(rejectBtn)) return signWrap;
      const rejectWrap = rejectBtn.closest("div");
      if (rejectWrap && rejectWrap.contains(signBtn)) return rejectWrap;
    }

    return null;
  }

  function findTryoutAgeLine(text) {
    const t = String(text || "");
    const patterns = [
      /\b\d{1,2}\s*yo\b[^\n]*/i,
      /\bedad\b[^\n]*/i,
      /\bage\b[^\n]*/i,
      /\b\d{1,2}\s*a.os?\b[^\n]*/i
    ];
    for (const re of patterns) {
      const m = t.match(re);
      if (m) return m[0].trim();
    }
    return "";
  }

  function buildTryoutText(card) {
    if (!card) return "";

    const lines = [];
    const rawText = (card.innerText || "").trim();

    const nameAnchor = findTryoutNameAnchor(card);
    const name = nameAnchor ? (nameAnchor.textContent || "").trim() : "";
    if (name) lines.push(name);

    const ageLine = findTryoutAgeLine(rawText);
    if (ageLine) lines.push(ageLine);

    const skillLines = [];
    for (const skill of SKILLS) {
      const re = new RegExp(`${skill}\\s*[^\\d?]{0,20}(\\?|\\d{1,3})(?:\\s*\\/\\s*(\\?|\\d{1,3}))?`, "i");
      const m = rawText.match(re);
      if (!m) continue;
      const current = m[1] || "?";
      const limit = m[2] || "?";
      const label = skill.charAt(0).toUpperCase() + skill.slice(1);
      if (m[2] == null) {
        skillLines.push(`${label} ${current}`);
      } else {
        skillLines.push(`${label} ${current} / ${limit}`);
      }
    }

    if (skillLines.length) {
      lines.push(...skillLines);
    } else if (rawText) {
      lines.push(rawText);
    }

    return lines.join("\n").trim();
  }

  function buildPlayerText(card) {
    if (!card) return "";

    const skillNames = PLAYER_SKILL_LABELS;

    const nameEl =
      card.querySelector("h5 a[href*='/players/']") ||
      card.querySelector("h5 a") ||
      card.querySelector("h5") ||
      card.querySelector("a[href*='/players/']");
    const name = nameEl ? nameEl.textContent.trim() : "";

    const ageEl =
      card.querySelector(".cpl-enhancer-age-gradient") ||
      Array.from(card.querySelectorAll("p")).find((p) => /\b\d+\s*yo\b/i.test(p.textContent || ""));
    let ageLine = ageEl ? ageEl.textContent.trim() : "";

    if (!ageLine) {
      const cardText = (card.innerText || "").trim();
      const ageMatch = cardText.match(/\b\d+\s*yo\b[^\n]*/i);
      ageLine = ageMatch ? ageMatch[0].trim() : "";
    }

    const skillLines = [];
    skillNames.forEach((skill) => {
      const labelEl = Array.from(card.querySelectorAll("p")).find((p) => {
        const text = (p.textContent || "").trim();
        return text.toLowerCase() === skill.toLowerCase();
      });
      if (!labelEl) return;

      const row = labelEl.parentElement;
      if (!row) return;

      const rowDivs = Array.from(row.querySelectorAll("div"));
      const valueEl = rowDivs.find((el) => /^\d+$/.test((el.textContent || "").trim()));
      const maxEl =
        rowDivs.find((el) => /^\/\s*\d+$/i.test((el.textContent || "").trim())) ||
        rowDivs.find((el) => /^\/\s*\?$/i.test((el.textContent || "").trim())) ||
        rowDivs.find((el) => /^\?$/.test((el.textContent || "").trim()));

      const value = valueEl ? valueEl.textContent.trim() : "0";
      let max = maxEl ? maxEl.textContent.trim() : "?";
      if (max && !max.startsWith("/")) max = "/" + max;

      skillLines.push(`${skill} ${value} ${max}`);
    });

    let text = "";
    if (name) text += name + "\n";
    if (ageLine) text += ageLine + "\n";

    if (skillLines.length) {
      text += skillLines.join("\n");
    } else {
      text += (card.innerText || "").trim();
    }

    return text.trim();
  }

  function insertLauncherByTotalLabel(card, launcher) {
    const labelNodes = Array.from(card.querySelectorAll("p"));
    const totalLabel = labelNodes.find((node) => {
      const text = (node.textContent || "").trim().toLowerCase();
      return text === "total skill";
    });

    const totalBox = totalLabel ? totalLabel.parentElement : null;
    if (!totalBox || !totalBox.parentElement) return false;

    const parent = totalBox.parentElement;
    const wrapClass = "cpl-skillwhat-total-wrap";
    const existingWrap = totalBox.closest("." + wrapClass);
    const wrap = existingWrap || document.createElement("div");

    if (!existingWrap) {
      wrap.className = wrapClass;
      parent.insertBefore(wrap, totalBox);
      wrap.appendChild(totalBox);
    }

    wrap.appendChild(launcher);
    return true;
  }

  function hasPlayerSkills(card) {
    if (!card || !card.querySelectorAll) return false;

    const labelSet = new Set(PLAYER_SKILL_LABELS.map((label) => label.toLowerCase()));
    const nodes = Array.from(card.querySelectorAll("p, span, div"));
    let found = 0;

    for (const node of nodes) {
      const text = (node.textContent || "").trim();
      if (!text || text.length > 18) continue;
      const lower = text.toLowerCase();
      if (lower === "total skill") return true;
      if (labelSet.has(lower)) {
        found += 1;
        if (found >= 2) return true;
      }
    }

    return false;
  }

  function openModalWithText(text) {
    const modal = ensureModal();
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    const iframe = modal.querySelector("#" + IFRAME_ID);
    if (!iframe) return;

    const payload = {
      type: "CPLE_SKILLWHAT_LOAD",
      text: text || "",
      autoLoad: !!text
    };

    const sendPayload = () => {
      if (!iframe.contentWindow) return;
      iframe.contentWindow.postMessage(payload, "*");
    };

    if (iframe.dataset.loaded === "1") {
      sendPayload();
    } else {
      const handler = () => {
        sendPayload();
      };
      iframe.addEventListener("load", handler, { once: true });
    }
  }

  function insertLauncher(card) {
    if (!card || card.querySelector("[" + LAUNCHER_ATTR + "='1']")) return;

    const launcher = document.createElement("button");
    launcher.setAttribute(LAUNCHER_ATTR, "1");
    launcher.className = LAUNCHER_CLASS + " " + LAUNCHER_INLINE_CLASS;
    launcher.type = "button";
    launcher.setAttribute("aria-label", "SkillWhat");

    const icon = createLauncherIcon();
    if (icon) {
      launcher.appendChild(icon);
    } else {
      launcher.textContent = "SkillWhat";
    }

    launcher.addEventListener("click", async (event) => {
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      const text = buildPlayerText(card) || (await getSelectedText());
      openModalWithText(text);
    });

    if (insertLauncherByTotalLabel(card, launcher)) return;

    const nameLink =
      card.querySelector("h5 a[href*='/players/']") ||
      card.querySelector("h5 a") ||
      card.querySelector("a[href*='/players/']");
    const nameBlock = nameLink ? nameLink.closest("h5") : null;
    const nameRow = nameBlock ? nameBlock.parentElement : null;

    if (nameRow) {
      nameRow.insertBefore(launcher, nameBlock.nextSibling);
      return;
    }

    const header = card.querySelector("header") || card;
    const actions =
      header.querySelector(".flex.items-center.w-full.justify-end") ||
      header.querySelector(".flex.items-center.justify-end") ||
      header;

    actions.appendChild(launcher);
  }

  function insertTryoutLauncher(card) {
    if (!card || card.querySelector("[" + LAUNCHER_ATTR + "='1']")) return;

    const launcher = document.createElement("button");
    launcher.setAttribute(LAUNCHER_ATTR, "1");
    launcher.className = LAUNCHER_CLASS + " " + LAUNCHER_INLINE_CLASS;
    launcher.type = "button";
    launcher.setAttribute("aria-label", "SkillWhat");

    const icon = createLauncherIcon();
    if (icon) {
      launcher.appendChild(icon);
    } else {
      launcher.textContent = "SkillWhat";
    }

    launcher.addEventListener("click", async (event) => {
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      const text = buildTryoutText(card) || (await getSelectedText());
      openModalWithText(text);
    });

    if (insertLauncherByTotalLabel(card, launcher)) return;

    const nameAnchor = findTryoutNameAnchor(card);
    if (nameAnchor) {
      const heading = nameAnchor.closest("h1, h2, h3, h4, h5, h6") || nameAnchor;
      const row = heading.parentElement;
      if (row) {
        row.appendChild(launcher);
        return;
      }

      heading.appendChild(launcher);
      return;
    }

    const actions = findTryoutActions(card);
    if (actions) {
      actions.insertBefore(launcher, actions.firstChild);
      return;
    }

    const header = card.querySelector("header") || card.querySelector(".card-header") || card;
    header.appendChild(launcher);
  }

  function ensureLaunchersInCards() {
    if (isTryoutsPage()) {
      const cards = findTryoutCards();
      cards.forEach((card) => insertTryoutLauncher(card));
      return cards.length;
    }

    const cards = findPlayerCards();
    cards.forEach((card) => insertLauncher(card));
    return cards.length;
  }

  function removeLaunchers() {
    const launchers = document.querySelectorAll("[" + LAUNCHER_ATTR + "='1']");
    launchers.forEach((launcher) => launcher.remove());

    const legacy = document.getElementById(LAUNCHER_ID);
    if (legacy) legacy.remove();
  }

  window.CPLEnhancer.initSkillWhatEmbed = function initSkillWhatEmbed(settings) {
    if (!settings || !settings.enabled) return;

    const run = () => {
      const count = ensureLaunchersInCards();
      if (!count) {
        removeLaunchers();
        closeModal();
        return;
      }

      ensureModal();
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else {
      run();
    }
  };
})();


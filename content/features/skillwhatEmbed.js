(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const LAUNCHER_ID = "cpl-skillwhat-launcher";
  const MODAL_ID = "cpl-skillwhat-modal";
  const IFRAME_ID = "cpl-skillwhat-iframe";
  const LAUNCHER_ATTR = "data-cpl-skillwhat-launcher";
  const LAUNCHER_CLASS = "cpl-skillwhat-launcher";
  const LAUNCHER_INLINE_CLASS = "cpl-skillwhat-launcher--inline";
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

  function safeRuntimeUrl(path) {
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.getURL === "function") {
        return chrome.runtime.getURL(path);
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  function isTryoutsPage() {
    return location.pathname.includes("/cpl/academy/tryouts");
  }

  function findPlayerCards() {
    const cards = Array.from(document.querySelectorAll(".card.p-0"));
    return cards.filter((card) => card.querySelector("a[href*='/players/']"));
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

    const skillNames = [
      "Aim",
      "Handling",
      "Quickness",
      "Determination",
      "Awareness",
      "Teamplay",
      "Gamesense",
      "Movement"
    ];

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

    const icon = document.createElement("img");
    icon.className = "cpl-skillwhat-launcher__icon";
    const iconSrc = safeRuntimeUrl("skillwhat/favicon.ico");
    if (iconSrc) {
      icon.src = iconSrc;
      icon.addEventListener("error", () => {
        icon.remove();
        if (!launcher.textContent) launcher.textContent = "SkillWhat";
      });
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

    const labelNodes = Array.from(card.querySelectorAll("p"));
    const totalLabel = labelNodes.find((node) => {
      const text = (node.textContent || "").trim().toLowerCase();
      return text === "total skill";
    });

    const totalBox = totalLabel ? totalLabel.parentElement : null;
    if (totalBox && totalBox.parentElement) {
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
      return;
    }

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

    const icon = document.createElement("img");
    icon.className = "cpl-skillwhat-launcher__icon";
    const iconSrc = safeRuntimeUrl("skillwhat/favicon.ico");
    if (iconSrc) {
      icon.src = iconSrc;
      icon.addEventListener("error", () => {
        icon.remove();
        if (!launcher.textContent) launcher.textContent = "SkillWhat";
      });
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


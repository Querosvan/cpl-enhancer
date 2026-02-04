(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const LAUNCHER_ID = "cpl-skillwhat-launcher";
  const MODAL_ID = "cpl-skillwhat-modal";
  const IFRAME_ID = "cpl-skillwhat-iframe";
  const LAUNCHER_ATTR = "data-cpl-skillwhat-launcher";
  const LAUNCHER_CLASS = "cpl-skillwhat-launcher";
  const LAUNCHER_INLINE_CLASS = "cpl-skillwhat-launcher--inline";

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

  function findPlayerCards() {
    const cards = Array.from(document.querySelectorAll(".card.p-0"));
    return cards.filter((card) => card.querySelector("a[href*='/players/']"));
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
    if (iconSrc) icon.src = iconSrc;
    icon.alt = "SkillWhat";
    launcher.appendChild(icon);

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

  function ensureLaunchersInCards() {
    const cards = findPlayerCards();
    cards.forEach((card) => insertLauncher(card));
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
      const cards = findPlayerCards();
      if (!cards.length) {
        removeLaunchers();
        closeModal();
        return;
      }

      ensureModal();
      ensureLaunchersInCards();
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else {
      run();
    }
  };
})();


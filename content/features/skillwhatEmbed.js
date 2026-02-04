(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  const LAUNCHER_ID = "cpl-skillwhat-launcher";
  const MODAL_ID = "cpl-skillwhat-modal";
  const IFRAME_ID = "cpl-skillwhat-iframe";

  function isAcademyListPage() {
    const path = location.pathname || "";
    if (!path.includes("/cpl/academy")) return false;
    if (path.includes("/tryouts")) return false;
    return true;
  }

  function getMountPoint() {
    return (
      document.querySelector("header") ||
      document.querySelector("main") ||
      document.body
    );
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
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => closeModal());

    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.className = "cpl-skillwhat-modal__iframe";
    iframe.title = "SkillWhat";
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
    iframe.src = chrome.runtime.getURL("skillwhat/index.html");

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

  function openModalWithText(text) {
    const modal = ensureModal();
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
        iframe.dataset.loaded = "1";
        sendPayload();
      };
      iframe.addEventListener("load", handler, { once: true });
    }
  }

  function ensureLauncher() {
    let launcher = document.getElementById(LAUNCHER_ID);
    if (launcher) return launcher;

    launcher = document.createElement("button");
    launcher.id = LAUNCHER_ID;
    launcher.className = "cpl-skillwhat-launcher";
    launcher.type = "button";
    launcher.textContent = "SkillWhat";

    launcher.addEventListener("click", async () => {
      const text = await getSelectedText();
      openModalWithText(text);
    });

    const mount = getMountPoint();
    mount.appendChild(launcher);

    return launcher;
  }

  window.CPLEnhancer.initSkillWhatEmbed = function initSkillWhatEmbed(settings) {
    if (!settings || !settings.enabled) return;

    const run = () => {
      if (!isAcademyListPage()) {
        const existing = document.getElementById(LAUNCHER_ID);
        if (existing) existing.remove();
        closeModal();
        return;
      }

      ensureLauncher();
      ensureModal();
    };

    if (typeof window.CPLEnhancer.observeChildren === "function") {
      window.CPLEnhancer.observeChildren("body", () => run());
    } else {
      run();
    }
  };
})();


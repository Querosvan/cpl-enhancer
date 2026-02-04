chrome.runtime.onInstalled.addListener(() => {
  console.log("[CPL Enhancer] Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "APPLY_FILTER") {
    const tabId = sender?.tab?.id;
    if (!tabId || !chrome.scripting) return;

    const selector = message.selector;
    const observe = !!message.observe;

    chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [selector, observe],
      func: (sel, observeMode) => {
        try {
          const matchText = /apply filter|aplicar filtro|aplicar|filter|filtro/i;
          const findBtn = () => {
            let btn = sel ? document.querySelector(sel) : null;
            if (!btn) {
              btn = Array.from(document.querySelectorAll("button.button-primary"))
                .find(b => matchText.test(b.textContent || ""));
            }
            if (!btn) {
              btn = Array.from(document.querySelectorAll("button.button-primary"))
                .find(b => b.querySelector("svg polygon"));
            }
            return btn || null;
          };

          const clickBtn = (btn) => {
            if (!btn) return false;
            btn.click();
            setTimeout(() => btn.click(), 200);
            return true;
          };

          if (clickBtn(findBtn())) return;

          if (!observeMode) return;
          if (window.__cplEnhancerApplyObserver) return;
          window.__cplEnhancerApplyObserver = true;

          let attempts = 0;
          const maxAttempts = 140;
          let timer = null;
          let obs = null;

          const cleanup = () => {
            if (obs) obs.disconnect();
            if (timer) clearInterval(timer);
            window.__cplEnhancerApplyObserver = false;
          };

          const tryLater = () => {
            attempts += 1;
            const btn = findBtn();
            if (btn) {
              clickBtn(btn);
              cleanup();
              return;
            }
            if (attempts >= maxAttempts) cleanup();
          };

          obs = new MutationObserver(() => tryLater());
          obs.observe(document.documentElement, { childList: true, subtree: true });
          timer = setInterval(tryLater, 350);
          setTimeout(cleanup, 45000);
        } catch (_) {}
      }
    });
  }

  if (message?.type === "PING") {
    sendResponse({ ok: true, from: "background" });
  }
});

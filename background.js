chrome.runtime.onInstalled.addListener(() => {
  console.log("[CPL Enhancer] Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "APPLY_FILTER") {
    const tabId = sender?.tab?.id;
    if (!tabId || !chrome.scripting) return;

    const selector = message.selector;

    chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      args: [selector],
      func: (sel) => {
        try {
          const matchText = /apply filter|aplicar filtro|aplicar|filter|filtro/i;
          let btn = sel ? document.querySelector(sel) : null;
          if (!btn) {
            btn = Array.from(document.querySelectorAll("button.button-primary"))
              .find(b => matchText.test(b.textContent || ""));
          }
          if (!btn) {
            btn = Array.from(document.querySelectorAll("button.button-primary"))
              .find(b => b.querySelector("svg polygon"));
          }
          if (btn) btn.click();
        } catch (_) {}
      }
    });
  }

  if (message?.type === "PING") {
    sendResponse({ ok: true, from: "background" });
  }
});

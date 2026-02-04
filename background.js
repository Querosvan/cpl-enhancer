chrome.runtime.onInstalled.addListener(() => {
  console.log("[CPL Enhancer] Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true, from: "background" });
  }
});

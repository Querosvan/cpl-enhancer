// content/core/dom.js
(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  // Observe when an element matching `selector` appears or is replaced (SPA-safe).
  // Calls `onFound(el)` only when the matched element reference changes.
  window.CPLEnhancer.observe = function observe(selector, onFound) {
    let lastEl = null;

    const tick = () => {
      const el = document.querySelector(selector);
      if (el && el !== lastEl) {
        lastEl = el;
        onFound(el);
      }
    };

    tick();

    const obs = new MutationObserver(() => tick());
    obs.observe(document.documentElement, { childList: true, subtree: true });

    return () => obs.disconnect();
  };

  // Observe changes inside the matched element (child mutations), not just element replacement.
  // Re-attaches automatically if the SPA replaces the root element.
  window.CPLEnhancer.observeChildren = function observeChildren(selector, onChange) {
    let childObs = null;

    const attach = (root) => {
      if (childObs) childObs.disconnect();
      childObs = new MutationObserver(() => onChange(root));
      childObs.observe(root, { childList: true, subtree: true });
      onChange(root);
    };

    // Reuse observe() so we also handle SPA replacing the container node.
    window.CPLEnhancer.observe(selector, (el) => attach(el));

    return () => {
      if (childObs) childObs.disconnect();
    };
  };
})();

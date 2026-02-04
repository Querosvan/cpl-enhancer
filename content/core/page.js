(function () {
  window.CPLEnhancer = window.CPLEnhancer || {};

  window.CPLEnhancer.isTransfersPage = function isTransfersPage() {
    return location.pathname.includes("/cpl/office/transfers");
  };
})();

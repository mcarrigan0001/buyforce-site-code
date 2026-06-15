/* ===================================================================== */
/* BuyForce — Noloco footer script                                       */
/* Opens external links in a new tab. Hosted in GitHub; loaded by a      */
/* <script src> in Noloco's custom footer code. Edit + push to update.   */
/* ===================================================================== */
(function () {
  function fixLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.hostname !== location.hostname && !a.target) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }
  fixLinks();
  new MutationObserver(fixLinks).observe(document.body, { childList: true, subtree: true });
})();

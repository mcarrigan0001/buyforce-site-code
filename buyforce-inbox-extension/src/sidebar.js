/* BuyForce Sidebar shell - shared collapsible right-edge panel.
 * Loaded before content.js/listing.js. Other scripts render into it via
 * window.BFSidebar. The panel overlays Facebook (no layout reflow) and shows
 * only on Marketplace listing + inbox routes. Open/closed state is remembered.
 * Assist-only: nothing here clicks, sends, or alters Facebook.
 */
(function () {
  var KEY = 'bf_sb_open';
  var root, bodyEl, ctxEl, dotEl, built = false, openState = true, stateLoaded = false;

  function applies() {
    var p = location.pathname;
    return /\/marketplace\/item\/\d+/.test(p) ||
           /\/marketplace\/inbox/.test(p) ||
           /\/marketplace\/t\//.test(p);
  }

  function persist(v) { try { chrome.storage.local.set({ bf_sb_open: !!v }); } catch (e) {} }
  function applyOpen(v) { openState = !!v; if (root) root.classList.toggle('bf-sb-open', openState); }

  function build() {
    if (built) return; built = true;
    root = document.createElement('div');
    root.id = 'bf-sb'; root.className = 'bf-sb'; root.setAttribute('data-bf', '1');
    root.innerHTML =
      '<button id="bf-sb-tab" class="bf-sb-tab" type="button" title="BuyForce">' +
        '<span class="bf-sb-tab-logo">B</span>' +
        '<span class="bf-sb-tab-txt">BuyForce</span>' +
        '<span class="bf-sb-tab-dot" data-r="dot"></span>' +
      '</button>' +
      '<div class="bf-sb-panel">' +
        '<div class="bf-sb-head">' +
          '<span class="bf-sb-logo">B</span>' +
          '<b class="bf-sb-title">BuyForce</b>' +
          '<span class="bf-sb-ctx" data-r="ctx"></span>' +
          '<span class="bf-sb-x" data-r="close" title="Collapse">&rsaquo;</span>' +
        '</div>' +
        '<div class="bf-sb-body" data-r="body"></div>' +
      '</div>';
    document.documentElement.appendChild(root);
    bodyEl = root.querySelector('[data-r="body"]');
    ctxEl = root.querySelector('[data-r="ctx"]');
    dotEl = root.querySelector('[data-r="dot"]');
    root.querySelector('#bf-sb-tab').addEventListener('click', toggle);
    root.querySelector('[data-r="close"]').addEventListener('click', close);
    try {
      chrome.storage.local.get(KEY, function (o) {
        stateLoaded = true;
        var v = (o && Object.prototype.hasOwnProperty.call(o, KEY)) ? o[KEY] : true;
        applyOpen(v);
      });
    } catch (e) { stateLoaded = true; applyOpen(true); }
  }

  function ensure() {
    if (!built) build();
    if (!document.documentElement.contains(root)) document.documentElement.appendChild(root);
    return root;
  }
  function open() { ensure(); applyOpen(true); persist(true); }
  function close() { ensure(); applyOpen(false); persist(false); }
  function toggle() { ensure(); applyOpen(!openState); persist(openState); }
  function setContext(s) { ensure(); if (ctxEl) ctxEl.textContent = s || ''; }
  function setHTML(html) { ensure(); if (bodyEl) bodyEl.innerHTML = html || ''; }
  function setDot(show) { ensure(); if (dotEl) dotEl.style.display = show ? 'block' : 'none'; }

  // Show the shell only on relevant routes; hide elsewhere.
  function sync() {
    if (applies()) { ensure(); root.style.display = ''; }
    else if (root) { root.style.display = 'none'; }
  }

  window.BFSidebar = {
    ensure: ensure, open: open, close: close, toggle: toggle,
    setContext: setContext, setHTML: setHTML, setDot: setDot,
    isOpen: function () { return openState; },
    applies: applies,
    get body() { ensure(); return bodyEl; }
  };

  // Route watcher (FB is a SPA): patch history + poll as a safety net.
  function hook() {
    try {
      var push = history.pushState, rep = history.replaceState;
      history.pushState = function () { var r = push.apply(this, arguments); setTimeout(sync, 50); return r; };
      history.replaceState = function () { var r = rep.apply(this, arguments); setTimeout(sync, 50); return r; };
      window.addEventListener('popstate', function () { setTimeout(sync, 50); });
    } catch (e) {}
    setInterval(sync, 1000);
    sync();
  }
  if (document.documentElement) hook(); else document.addEventListener('DOMContentLoaded', hook);
})();

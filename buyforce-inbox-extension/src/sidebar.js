/* BuyForce Sidebar shell - shared collapsible right-edge panel.
 * Loaded before content.js/listing.js. Other scripts render into it via
 * window.BFSidebar. The panel overlays Facebook (no layout reflow) and shows
 * only on Marketplace listing + inbox routes. Open/closed state is remembered.
 * While open, it nudges FB's bottom-right chat dock aside so nothing is covered.
 * Assist-only: nothing here clicks, sends, or alters Facebook.
 */
(function () {
  var KEY = 'bf_sb_open';
  var PANEL_W = 348;
  var root, bodyEl, ctxEl, dotEl, built = false, openState = true;

  function applies() {
    var p = location.pathname;
    return /\/marketplace\/item\/\d+/.test(p) ||
           /\/marketplace\/inbox/.test(p) ||
           /\/marketplace\/t\//.test(p);
  }

  function persist(v) { try { chrome.storage.local.set({ bf_sb_open: !!v }); } catch (e) {} }

  // Move FB's bottom-right fixed chat dock/popups aside while the panel is open.
  function dockCandidates() {
    var out = [], kids = document.body ? document.body.children : [];
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i]; if (!k || k === root) continue;
      out.push(k);
      var gk = k.children;
      for (var j = 0; j < gk.length && j < 6; j++) out.push(gk[j]);
    }
    return out;
  }
  function shiftDock(on) {
    try {
      if (!document.body) return;
      if (!on) {
        var prev = document.querySelectorAll('[data-bf-shift]');
        for (var p = 0; p < prev.length; p++) { prev[p].style.removeProperty('transform'); prev[p].removeAttribute('data-bf-shift'); }
        return;
      }
      var W = window.innerWidth, H = window.innerHeight, list = dockCandidates();
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (!el || el === root || (el.getAttribute && el.getAttribute('data-bf'))) continue;
        var cs = window.getComputedStyle(el);
        if (cs.position !== 'fixed' || cs.display === 'none') continue;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        var anchoredRight = (W - r.right) < 14 && r.width < W * 0.6;
        var anchoredBottom = (H - r.bottom) < 14;
        var notFullHeight = r.height < H * 0.85;
        if (anchoredRight && anchoredBottom && notFullHeight) {
          el.style.setProperty('transition', 'transform .2s ease');
          el.style.setProperty('transform', 'translateX(-' + PANEL_W + 'px)', 'important');
          el.setAttribute('data-bf-shift', '1');
        }
      }
    } catch (e) {}
  }

  function applyOpen(v) {
    openState = !!v;
    if (root) root.classList.toggle('bf-sb-open', openState);
    shiftDock(openState && applies());
  }

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
        var v = (o && Object.prototype.hasOwnProperty.call(o, KEY)) ? o[KEY] : true;
        applyOpen(v);
      });
    } catch (e) { applyOpen(true); }
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

  function sync() {
    if (applies()) {
      ensure(); root.style.display = '';
      if (openState) shiftDock(true);
    } else if (root) {
      shiftDock(false);
      root.style.display = 'none';
    }
  }

  window.BFSidebar = {
    ensure: ensure, open: open, close: close, toggle: toggle,
    setContext: setContext, setHTML: setHTML, setDot: setDot,
    isOpen: function () { return openState; },
    applies: applies,
    get body() { ensure(); return bodyEl; }
  };

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

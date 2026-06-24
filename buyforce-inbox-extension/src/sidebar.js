/* BuyForce Sidebar shell - shared collapsible right-edge panel.
 * Loaded before content.js/listing.js. Other scripts render into it via
 * window.BFSidebar. While expanded on a Marketplace route it slides Facebook's
 * floating chat popup(s) left so they sit BESIDE the panel instead of under it.
 * The slide is applied to the popup element directly (keeps it fixed/bottom-
 * pinned) and is RE-ASSERTED on a short timer so FB's re-renders can't snap it
 * back. Purely cosmetic + reversible; performs no actions on Facebook.
 * Open/closed state is remembered PER surface (listing vs inbox).
 */
(function () {
  var DEFAULTS = { listing: true, inbox: true };
  var PANEL_W = 348, SHIFT = 372;     // panel width + gap
  var states = null, tracked = [];
  var root, bodyEl, ctxEl, dotEl, built = false, openState = false;

  function routeKind() {
    var p = location.pathname;
    if (/\/marketplace\/item\/\d+/.test(p)) return 'listing';
    if (/\/marketplace\/inbox/.test(p) || /\/marketplace\/t\//.test(p)) return 'inbox';
    return null;
  }

  function loadStates(cb) {
    if (states) { cb(); return; }
    try {
      chrome.storage.local.get(['bf_sb_open_listing', 'bf_sb_open_inbox'], function (o) {
        o = o || {};
        states = {
          listing: ('bf_sb_open_listing' in o) ? !!o.bf_sb_open_listing : DEFAULTS.listing,
          inbox: ('bf_sb_open_inbox' in o) ? !!o.bf_sb_open_inbox : DEFAULTS.inbox
        };
        cb();
      });
    } catch (e) { states = { listing: DEFAULTS.listing, inbox: DEFAULTS.inbox }; cb(); }
  }
  function persist(kind, v) { try { var o = {}; o['bf_sb_open_' + kind] = !!v; chrome.storage.local.set(o); } catch (e) {} }

  // ---- Slide FB's floating chat popups aside ----
  // A popup is a fixed, bottom-pinned, narrow box whose right edge reaches into
  // the panel strip. (The left Marketplace rail is left:0 and is never matched.)
  function isPopup(el) {
    if (!el || el === root || (root && root.contains(el))) return false;
    var cs; try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    if (r.width < 150 || r.width > window.innerWidth * 0.55) return false;     // not a full-width bar
    if (r.bottom < window.innerHeight - 60) return false;                      // bottom-pinned
    if (r.right < window.innerWidth - PANEL_W - 50) return false;              // intrudes into the panel strip
    return true;
  }
  function popupAncestor(el) {
    var n = el;
    while (n && n !== document.body && n !== document.documentElement) {
      if (isPopup(n)) return n;
      n = n.parentElement;
    }
    return null;
  }
  function detect() {
    var W = window.innerWidth, H = window.innerHeight;
    var xs = [W - PANEL_W - 24, W - 200, W - 60];
    var ys = [H - 60, H - 180, H - 320, H - 440];
    for (var a = 0; a < xs.length; a++) {
      for (var b = 0; b < ys.length; b++) {
        if (xs[a] < 0 || ys[b] < 0) continue;
        var els = document.elementsFromPoint(xs[a], ys[b]) || [];
        for (var k = 0; k < els.length; k++) {
          var pop = popupAncestor(els[k]);
          if (pop && tracked.indexOf(pop) < 0) tracked.push(pop);
        }
      }
    }
  }
  function assert() {
    var want = 'translateX(-' + SHIFT + 'px)';
    for (var i = tracked.length - 1; i >= 0; i--) {
      var el = tracked[i];
      if (!el || !el.isConnected) { tracked.splice(i, 1); continue; }
      if ((el.style.transform || '').indexOf('translateX(-' + SHIFT) < 0) {
        el.style.setProperty('transition', 'transform .15s ease');
        el.style.setProperty('transform', want, 'important');
      }
    }
  }
  function clearShift() {
    for (var i = 0; i < tracked.length; i++) {
      try { tracked[i].style.removeProperty('transform'); } catch (e) {}
    }
    tracked = [];
  }
  function tickShift() {
    if (openState && routeKind()) { detect(); assert(); }
    else if (tracked.length) { clearShift(); }
  }

  function paint() {
    if (root) root.classList.toggle('bf-sb-open', openState);
    if (openState && routeKind()) { detect(); assert(); } else { clearShift(); }
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
    root.querySelector('[data-r="close"]').addEventListener('click', collapse);
  }

  function ensure() {
    if (!built) build();
    if (!document.documentElement.contains(root)) document.documentElement.appendChild(root);
    return root;
  }

  function apply() {
    var kind = routeKind();
    if (!kind) { if (root) root.style.display = 'none'; clearShift(); return; }
    ensure(); root.style.display = '';
    loadStates(function () { openState = !!states[kind]; paint(); });
  }

  function toggle() {
    var kind = routeKind(); if (!kind) return; ensure();
    loadStates(function () { openState = !states[kind]; states[kind] = openState; paint(); persist(kind, openState); });
  }
  function collapse() {
    var kind = routeKind(); if (!kind) return; ensure();
    loadStates(function () { openState = false; states[kind] = false; paint(); persist(kind, false); });
  }
  function expand() {
    var kind = routeKind(); if (!kind) return; ensure();
    loadStates(function () { openState = true; states[kind] = true; paint(); persist(kind, true); });
  }

  function setContext(s) { ensure(); if (ctxEl) ctxEl.textContent = s || ''; }
  function setHTML(html) { ensure(); if (bodyEl) bodyEl.innerHTML = html || ''; }
  function setDot(show) { ensure(); if (dotEl) dotEl.style.display = show ? 'block' : 'none'; }

  window.BFSidebar = {
    ensure: ensure, open: expand, close: collapse, toggle: toggle,
    setContext: setContext, setHTML: setHTML, setDot: setDot,
    isOpen: function () { return openState; },
    applies: function () { return !!routeKind(); },
    get body() { ensure(); return bodyEl; }
  };

  function hook() {
    try {
      var push = history.pushState, rep = history.replaceState;
      history.pushState = function () { var r = push.apply(this, arguments); setTimeout(apply, 50); return r; };
      history.replaceState = function () { var r = rep.apply(this, arguments); setTimeout(apply, 50); return r; };
      window.addEventListener('popstate', function () { setTimeout(apply, 50); });
    } catch (e) {}
    window.addEventListener('beforeunload', clearShift);
    setInterval(apply, 1000);       // state + route
    setInterval(tickShift, 300);    // keep popups slid aside, re-assert vs FB re-renders
    apply();
  }
  if (document.documentElement) hook(); else document.addEventListener('DOMContentLoaded', hook);
})();

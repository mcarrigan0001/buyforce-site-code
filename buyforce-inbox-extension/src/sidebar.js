/* BuyForce Sidebar shell - shared collapsible right-edge panel.
 * Loaded before content.js/listing.js. Other scripts render into it via
 * window.BFSidebar. Pure overlay: it ONLY ever touches its own DOM (#bf-sb) -
 * it never moves, restyles, clicks, or reads-to-act-on any Facebook element.
 * Shows only on Marketplace listing + inbox routes. Open/closed state is
 * remembered PER surface; defaults: listing = open, inbox = collapsed (so it
 * never covers a conversation). Assist-only.
 */
(function () {
  var DEFAULTS = { listing: true, inbox: false };
  var states = null;     // { listing: bool, inbox: bool } - loaded once, cached
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
  function paint() { if (root) root.classList.toggle('bf-sb-open', openState); }

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

  // Apply the remembered state for whichever surface we're on (or hide off-route).
  function apply() {
    var kind = routeKind();
    if (!kind) { if (root) root.style.display = 'none'; return; }
    ensure(); root.style.display = '';
    loadStates(function () { openState = !!states[kind]; paint(); });
  }

  function toggle() {
    var kind = routeKind(); if (!kind) return;
    ensure();
    loadStates(function () {
      openState = !states[kind]; states[kind] = openState; paint(); persist(kind, openState);
    });
  }
  function collapse() {
    var kind = routeKind(); if (!kind) return;
    ensure();
    loadStates(function () { openState = false; states[kind] = false; paint(); persist(kind, false); });
  }
  function expand() {
    var kind = routeKind(); if (!kind) return;
    ensure();
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
    setInterval(apply, 1000);
    apply();
  }
  if (document.documentElement) hook(); else document.addEventListener('DOMContentLoaded', hook);
})();

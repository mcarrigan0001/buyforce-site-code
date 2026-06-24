/* BuyForce Sidebar shell - shared collapsible right-edge panel.
 * Loaded before content.js/listing.js. Other scripts render into it via
 * window.BFSidebar.
 *
 * Expand behavior: an AUTO toggle (header). When AUTO is on (default) every
 * listing/conversation opens expanded; collapsing is temporary (the next view
 * re-expands). When AUTO is off the panel stays collapsed until you open it.
 *
 * Room for the panel (per surface, different rules):
 *  - LISTING: reserve the strip by shrinking the page so the listing reflows
 *    into the remaining width (no fixed chat popup here to break).
 *  - INBOX: slide Facebook's floating chat popup(s) left so they sit beside the
 *    panel (shrinking the page would un-pin them). Re-asserted cheaply.
 * All of this is cosmetic CSS - it performs NO actions on Facebook.
 */
(function () {
  var PANEL_W = 348, SHIFT = 372;
  var autoExpand = true, settingsLoaded = false, manualOpen = false, lastSig = null;
  var tracked = [], scanTick = 0;
  var root, bodyEl, ctxEl, dotEl, autoEl, built = false, openState = false;

  function routeKind() {
    var p = location.pathname;
    if (/\/marketplace\/item\/\d+/.test(p)) return 'listing';
    if (/\/marketplace\/inbox/.test(p) || /\/marketplace\/t\//.test(p)) return 'inbox';
    return null;
  }
  function loadSettings(cb) {
    if (settingsLoaded) { cb(); return; }
    try {
      chrome.storage.local.get('bf_sb_autoexpand', function (o) {
        autoExpand = (o && ('bf_sb_autoexpand' in o)) ? !!o.bf_sb_autoexpand : true;
        settingsLoaded = true; cb();
      });
    } catch (e) { settingsLoaded = true; cb(); }
  }
  function persistAuto(v) { try { chrome.storage.local.set({ bf_sb_autoexpand: !!v }); } catch (e) {} }
  function computeOpen() { return autoExpand ? true : manualOpen; }

  // ---- INBOX: slide FB chat popups aside ----
  function isPopup(el) {
    if (!el || el === root || (root && root.contains(el))) return false;
    var cs; try { cs = window.getComputedStyle(el); } catch (e) { return false; }
    if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    if (r.width < 150 || r.width > window.innerWidth * 0.55) return false;
    if (r.bottom < window.innerHeight - 60) return false;
    if (r.right < window.innerWidth - PANEL_W - 50) return false;
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
    var xs = [W - PANEL_W - 24, W - 200, W - 60], ys = [H - 60, H - 180, H - 320, H - 440];
    for (var a = 0; a < xs.length; a++) for (var b = 0; b < ys.length; b++) {
      if (xs[a] < 0 || ys[b] < 0) continue;
      var els = document.elementsFromPoint(xs[a], ys[b]) || [];
      for (var k = 0; k < els.length; k++) {
        var pop = popupAncestor(els[k]);
        if (pop && tracked.indexOf(pop) < 0) tracked.push(pop);
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
    for (var i = 0; i < tracked.length; i++) { try { tracked[i].style.removeProperty('transform'); } catch (e) {} }
    tracked = [];
  }
  function shiftRun() {
    for (var i = tracked.length - 1; i >= 0; i--) { if (!tracked[i] || !tracked[i].isConnected) tracked.splice(i, 1); }
    scanTick++;
    if (tracked.length === 0 || (scanTick % 5) === 0) detect();
    assert();
  }

  function paint() {
    var kind = routeKind();
    if (root) root.classList.toggle('bf-sb-open', openState);
    // LISTING: reserve space (shrink page). INBOX: slide chat popups.
    try { document.documentElement.classList.toggle('bf-sb-pushwide', openState && kind === 'listing'); } catch (e) {}
    if (openState && kind) shiftRun(); else clearShift();
    updateAuto();
  }
  function tickShift() {
    if (openState && routeKind()) shiftRun();
    else if (tracked.length) clearShift();
  }
  function updateAuto() { if (autoEl) autoEl.classList.toggle('on', autoExpand); }

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
          '<span class="bf-sb-auto" data-r="auto" title="Auto-open on listings and the inbox. Click to toggle.">AUTO</span>' +
          '<span class="bf-sb-x" data-r="close" title="Collapse">&rsaquo;</span>' +
        '</div>' +
        '<div class="bf-sb-body" data-r="body"></div>' +
      '</div>';
    document.documentElement.appendChild(root);
    bodyEl = root.querySelector('[data-r="body"]');
    ctxEl = root.querySelector('[data-r="ctx"]');
    dotEl = root.querySelector('[data-r="dot"]');
    autoEl = root.querySelector('[data-r="auto"]');
    root.querySelector('#bf-sb-tab').addEventListener('click', toggle);
    root.querySelector('[data-r="close"]').addEventListener('click', collapse);
    autoEl.addEventListener('click', toggleAuto);
  }
  function ensure() {
    if (!built) build();
    if (!document.documentElement.contains(root)) document.documentElement.appendChild(root);
    return root;
  }

  function apply() {
    var kind = routeKind();
    if (!kind) {
      if (root) root.style.display = 'none';
      clearShift();
      try { document.documentElement.classList.remove('bf-sb-pushwide'); } catch (e) {}
      lastSig = null; return;
    }
    ensure(); root.style.display = '';
    loadSettings(function () {
      var sig = location.pathname;
      if (sig !== lastSig) { lastSig = sig; openState = computeOpen(); }  // new view -> auto decision
      paint();
    });
  }

  function toggle() { ensure(); loadSettings(function () { openState = !openState; if (!autoExpand) manualOpen = openState; paint(); }); }
  function collapse() { ensure(); loadSettings(function () { openState = false; if (!autoExpand) manualOpen = false; paint(); }); }
  function expand() { ensure(); loadSettings(function () { openState = true; if (!autoExpand) manualOpen = true; paint(); }); }
  function toggleAuto() {
    ensure();
    loadSettings(function () {
      autoExpand = !autoExpand; persistAuto(autoExpand);
      if (autoExpand) openState = true; else manualOpen = openState;
      paint();
    });
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
    window.addEventListener('beforeunload', function () { clearShift(); try { document.documentElement.classList.remove('bf-sb-pushwide'); } catch (e) {} });
    setInterval(apply, 1000);
    setInterval(tickShift, 400);
    apply();
  }
  if (document.documentElement) hook(); else document.addEventListener('DOMContentLoaded', hook);
})();

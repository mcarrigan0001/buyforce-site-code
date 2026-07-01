/* BuyForce Window-Sticker helper — CarMax / Carvana sell-my-car overlay.
 *
 * ASSIST-ONLY. This script never clicks, checks, or submits anything on the host
 * site (bot-detection risk). It only:
 *   1. Figures out the vehicle VIN (scrape on Carvana; prompt on CarMax where it's masked).
 *   2. Pulls the free window sticker via background.js -> /webhook/window-sticker (cached per VIN).
 *   3. Runs the deterministic matcher (sticker-match.js) against the on-page option labels.
 *   4. Highlights the controls the sticker CONFIRMS (green ring + "On sticker" badge) so the
 *      human rep can see which boxes to check. Optionally greys clear contradictions.
 *
 * SPA-safe: re-scans on DOM mutations (debounced) and on URL changes.
 *
 * Loaded after sticker-match.js (globalThis.BFSticker.match).
 */
(function () {
  'use strict';
  if (window.__bfwLoaded) return;
  window.__bfwLoaded = true;

  var HOST = location.hostname.replace(/^www\./, '');
  var SITE = /carvana\.com$/.test(HOST) ? 'carvana' : (/carmax\.com$/.test(HOST) ? 'carmax' : '');
  if (!SITE) return;

  // ---- small utils --------------------------------------------------------
  function t(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function debounce(fn, ms) { var tmr; return function () { var a = arguments, self = this; clearTimeout(tmr); tmr = setTimeout(function () { fn.apply(self, a); }, ms); }; }
  function money(n) { if (n == null || n === '') return ''; var v = Number(String(n).replace(/[^0-9.]/g, '')); return isFinite(v) && v ? '$' + v.toLocaleString('en-US') : (String(n).charAt(0) === '$' ? String(n) : ''); }

  // ---- per-site activation + VIN scraping --------------------------------
  function onSellPath() {
    var p = location.pathname.toLowerCase();
    if (SITE === 'carvana') return p.indexOf('/sell-my-car') !== -1;
    if (SITE === 'carmax') return p.indexOf('/sell-my-car') !== -1;
    return false;
  }

  // Scrape a full 17-char VIN from visible page text. Works on Carvana ("VIN 1GC...").
  // CarMax masks it (***...944) so this typically returns '' there.
  function scrapeVin() {
    var txt = document.body ? (document.body.innerText || '') : '';
    var m = txt.match(/\bVIN\b[:\s]*([A-HJ-NPR-Z0-9]{17})\b/i);
    if (m) return m[1].toUpperCase();
    // fallback: any bare 17-char VIN-shaped token on the page
    var m2 = txt.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    return m2 ? m2[1].toUpperCase() : '';
  }

  // Grab a masked-VIN partial (e.g. "***...303944") to prefill the confirm box.
  function scrapeVinPartial() {
    var txt = document.body ? (document.body.innerText || '') : '';
    var m = txt.match(/\bVIN\b[:\s]*([*•xX•]{2,}[A-HJ-NPR-Z0-9]{3,8})/);
    return m ? m[1] : '';
  }

  // Collect the on-page option controls the rep will be checking, per site.
  // Returns [{ el, label }] where el is the element to ring/badge.
  function collectOptions() {
    var out = [], seen = new Set();
    function add(el, label) {
      label = (label || '').replace(/\s+/g, ' ').trim();
      if (!el || !label || label.length < 2 || label.length > 80) return;
      if (seen.has(el)) return; seen.add(el);
      out.push({ el: el, label: label });
    }
    if (SITE === 'carvana') {
      // Feature checkboxes render as <label name="appraisalBuildOption:NNNNN">TEXT</label>
      // NOTE: confirm this selector live — Carvana may nest the real clickable element.
      [].forEach.call(document.querySelectorAll('label[name^="appraisalBuildOption"]'), function (el) {
        add(el, t(el));
      });
      // Fallback: any label/checkbox row under the "features" question heading.
      if (!out.length) {
        [].forEach.call(document.querySelectorAll('label, [role="checkbox"]'), function (el) {
          var lt = t(el);
          if (lt && /wheel|tire|tonneau|shell|cover|leather|roof|nav|tow|liner|board|camera|seat/i.test(lt)) add(el, lt);
        });
      }
    } else if (SITE === 'carmax') {
      // "Style and features" step: Features list has checkboxes/labels with visible text
      // (e.g. "Navigation System"). Style/Drive/Transmission are button pickers.
      // NOTE: confirm these selectors live — CarMax class names are hashed/unstable.
      [].forEach.call(document.querySelectorAll('label, [role="checkbox"], button, [role="button"]'), function (el) {
        var lt = t(el);
        if (!lt) return;
        // keep only short, feature-like controls; skip nav/step chrome
        if (lt.length > 60) return;
        if (/^(show|continue|back|next|skip|edit|save|cancel|sign|help)\b/i.test(lt)) return;
        if (/wheel|tire|tonneau|shell|cover|leather|roof|navigation|nav\b|tow|trailer|liner|running board|side step|camera|heated|cooled|remote start|sunroof|moonroof/i.test(lt)) add(el, lt);
      });
    }
    return out;
  }

  // ---- state --------------------------------------------------------------
  var sticker = null;          // last window-sticker payload (ok:true)
  var stickerVin = '';         // vin the current sticker belongs to
  var lastMiss = null;         // {reason} when the endpoint returned ok:false
  var loading = false;
  var dismissed = false;

  // ---- highlight injection (assist-only; never clicks) --------------------
  function clearHighlights() {
    [].forEach.call(document.querySelectorAll('.bfw-ring-yes, .bfw-ring-no'), function (el) {
      el.classList.remove('bfw-ring-yes', 'bfw-ring-no');
    });
    [].forEach.call(document.querySelectorAll('.bfw-badge'), function (el) { el.remove(); });
  }

  function applyHighlights() {
    clearHighlights();
    if (!sticker) return { yes: 0, no: 0, total: 0 };
    var opts = collectOptions();
    var results = BFSticker.match(sticker, opts.map(function (o) { return o.label; }));
    var yes = 0, no = 0;
    results.forEach(function (r, i) {
      var el = opts[i].el;
      if (!el || !el.isConnected) return;
      if (r.verdict === 'yes') {
        yes++;
        el.classList.add('bfw-ring-yes');
        var b = document.createElement('span');
        b.className = 'bfw-badge';
        b.innerHTML = '<span class="bfw-check">✓</span> On sticker';
        try { el.appendChild(b); } catch (e) { if (el.parentNode) el.parentNode.insertBefore(b, el.nextSibling); }
      } else if (r.verdict === 'no') {
        no++;
        el.classList.add('bfw-ring-no');
        var b2 = document.createElement('span');
        b2.className = 'bfw-badge bfw-badge-no';
        b2.textContent = 'not on sticker';
        try { el.appendChild(b2); } catch (e2) { if (el.parentNode) el.parentNode.insertBefore(b2, el.nextSibling); }
      }
    });
    return { yes: yes, no: no, total: opts.length };
  }

  // ---- overlay panel ------------------------------------------------------
  var panel = null;

  function vehTitle() {
    if (!sticker) return 'Window Sticker Match';
    var parts = [sticker.year, sticker.make, sticker.model, sticker.trim].filter(Boolean).join(' ');
    return 'Window Sticker Match' + (parts ? ' — ' + parts : '');
  }

  function renderTab() {
    var tab = document.getElementById('bfw-tab');
    if (!tab) {
      tab = document.createElement('div');
      tab.id = 'bfw-tab';
      tab.textContent = 'BuyForce Sticker';
      tab.addEventListener('click', function () { dismissed = false; tab.remove(); render(); });
      document.documentElement.appendChild(tab);
    }
  }

  function optionsHtml() {
    var io = (sticker && sticker.installedOptions) || [];
    if (io.length) {
      return '<ul class="bfw-opts">' + io.map(function (o) {
        return '<li><span>' + esc(o.name || '') + '</span>' + (o.price ? '<span class="bfw-price">' + esc(money(o.price)) + '</span>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    var se = (sticker && sticker.standardEquipment) || [];
    if (se.length) return '<ul class="bfw-opts">' + se.slice(0, 12).map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ul>';
    return '<div class="bfw-empty">No option lines on this sticker.</div>';
  }

  function statusLine(counts) {
    if (loading) return '<div class="bfw-status">Pulling window sticker…</div>';
    if (lastMiss) {
      var msg;
      if (lastMiss.reason === 'not_released' || lastMiss.reason === 'no_free_source') msg = 'No free sticker for this VIN (make/older year).';
      else if (lastMiss.reason === 'bad_vin') msg = 'That VIN doesn’t look valid (need 17 characters).';
      else if (lastMiss.reason === 'auth') msg = 'Not signed in to BuyForce — open the BuyForce app once to sync, then Re-scan.';
      else msg = 'Couldn’t reach the sticker service. Try Re-scan.';
      return '<div class="bfw-status bfw-miss">' + esc(msg) + '</div>';
    }
    if (sticker) {
      var src = sticker.source ? ('Pulled from ' + sticker.source + ' sticker') : 'Pulled from window sticker';
      var msrp = sticker.msrp ? (' · MSRP ' + money(sticker.msrp)) : '';
      var cnt = counts ? (' · highlighted ' + counts.yes + ' of ' + counts.total + ' on-page') : '';
      return '<div class="bfw-status"><b>' + esc(src + msrp) + '</b>' + esc(cnt) + '</div>';
    }
    return '<div class="bfw-status">Enter or confirm the VIN to pull this vehicle’s window sticker.</div>';
  }

  function needVinPrompt() {
    // Show the VIN input when we have no confirmed sticker VIN.
    return !sticker && !loading;
  }

  function render() {
    if (!onSellPath()) { teardown(); return; }
    if (dismissed) { renderTab(); if (panel) { panel.remove(); panel = null; } return; }

    var counts = applyHighlights();

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'bfw-panel';
      document.documentElement.appendChild(panel);
    }
    var partial = SITE === 'carmax' ? scrapeVinPartial() : '';
    var vinPrefill = (stickerVin || '').length === 17 ? stickerVin : (scrapeVin() || '');

    panel.innerHTML =
      '<div class="bfw-head">' +
        '<span class="bfw-logo"></span>' +
        '<div class="bfw-title">' + esc(vehTitle()) + '<div class="bfw-sub">BuyForce · assist-only</div></div>' +
        '<button class="bfw-x" title="Hide">×</button>' +
      '</div>' +
      '<div class="bfw-body">' +
        statusLine(counts) +
        (sticker ? ('<div class="bfw-sec-h">On this sticker</div>' + optionsHtml()) : '') +
        (needVinPrompt() ?
          ('<div class="bfw-vin">' +
             '<label>' + (partial ? 'VIN is masked here — enter/confirm full VIN' : 'Enter / confirm VIN (17 characters)') + '</label>' +
             '<div class="bfw-vin-row">' +
               '<input id="bfw-vin-input" maxlength="17" spellcheck="false" placeholder="' + esc(partial || '17-character VIN') + '" value="' + esc(vinPrefill) + '">' +
               '<button class="bfw-btn" id="bfw-vin-go">Pull</button>' +
             '</div>' +
           '</div>') : '') +
        '<div class="bfw-foot">' +
          '<button class="bfw-rescan" id="bfw-rescan">Re-scan</button>' +
          '<span class="bfw-count">' + (sticker ? (counts.yes + ' matched') : '') + '</span>' +
        '</div>' +
      '</div>';

    panel.querySelector('.bfw-x').addEventListener('click', function () { dismissed = true; render(); });
    panel.querySelector('#bfw-rescan').addEventListener('click', function () { rescan(true); });
    var go = panel.querySelector('#bfw-vin-go');
    if (go) go.addEventListener('click', submitVin);
    var inp = panel.querySelector('#bfw-vin-input');
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submitVin(); });
  }

  function submitVin() {
    var inp = panel && panel.querySelector('#bfw-vin-input');
    var vin = (inp ? inp.value : '').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    if (vin.length !== 17) {
      lastMiss = { reason: 'bad_vin' }; render(); return;
    }
    pullSticker(vin);
  }

  function teardown() {
    if (panel) { panel.remove(); panel = null; }
    var tab = document.getElementById('bfw-tab'); if (tab) tab.remove();
    clearHighlights();
  }

  // ---- sticker fetch ------------------------------------------------------
  function pullSticker(vin) {
    if (!vin || vin.length !== 17) return;
    loading = true; lastMiss = null; render();
    try {
      chrome.runtime.sendMessage({ type: 'BF_WINDOW_STICKER', vin: vin }, function (resp) {
        loading = false;
        if (chrome.runtime.lastError || !resp) { lastMiss = { reason: 'network' }; render(); return; }
        if (resp.ok) {
          sticker = resp; stickerVin = vin; lastMiss = null;
          // also stash the active VIN so the platform / other surfaces can reuse it
          try { chrome.storage.local.set({ 'bf.activeVin': vin }); } catch (e) {}
        } else {
          sticker = null; lastMiss = { reason: resp.reason || 'network' };
        }
        render();
      });
    } catch (e) { loading = false; lastMiss = { reason: 'network' }; render(); }
  }

  // Decide which VIN to use and pull if needed. force=true re-applies highlights
  // (used by Re-scan and the MutationObserver).
  function rescan(force) {
    if (!onSellPath()) { teardown(); return; }
    // Prefer a scraped full VIN (Carvana). Accept a platform-provided VIN too.
    var scraped = scrapeVin();
    if (scraped && scraped !== stickerVin) { pullSticker(scraped); return; }
    if (!sticker && !loading) {
      // try platform-provided active VIN
      try {
        chrome.storage.local.get('bf.activeVin', function (o) {
          var v = (o && o['bf.activeVin']) || '';
          if (v && v.length === 17 && v !== stickerVin) pullSticker(v);
          else render();
        });
        return;
      } catch (e) {}
    }
    render();
  }

  // ---- lifecycle: SPA-aware --------------------------------------------
  var onMutate = debounce(function () { rescan(false); }, 500);
  var mo = new MutationObserver(onMutate);
  function startObserver() {
    try { mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true }); } catch (e) {}
  }

  // URL-change detection for SPA route transitions.
  var lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      sticker = null; stickerVin = ''; lastMiss = null; dismissed = false;
      clearHighlights();
      setTimeout(function () { rescan(false); }, 600);
    }
  }, 800);

  function boot() {
    startObserver();
    rescan(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

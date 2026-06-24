/* BuyForce Inbox Overlay — Facebook content script.
 * Reads the cached pipeline index from the background worker, watches the inbox
 * for conversation rows, matches each to a BuyForce deal, and injects a badge.
 * Read-only: it never clicks, sends, or alters Facebook.
 */
(function () {
  var CFG = globalThis.BF_CONFIG;
  var idx = null;
  var linked = {};   // uuids we've already stamped a thread id onto (avoid repeat writes)

  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function daysSince(iso) { if (!iso) return null; var t = new Date(iso).getTime(); if (isNaN(t)) return null; return Math.floor((Date.now() - t) / 86400000); }
  function timeLabel(iso) { var d = daysSince(iso); if (d == null) return ''; if (d <= 0) return 'today'; if (d === 1) return '1d'; return d + 'd'; }
  function stageInfo(stage) { return CFG.stages[stage] || CFG.unknownStage; }

  function threadIdFromRow(row) {
    var a = (row.matches && row.matches('a[href]')) ? row : (row.querySelector ? row.querySelector('a[href]') : null);
    var href = a ? (a.getAttribute('href') || '') : '';
    var m = href.match(/\/marketplace\/t\/(\d+)/) || href.match(/\/t\/(\d+)/) || href.match(/thread[_-]?id=(\d+)/i);
    return m ? m[1] : '';
  }
  function rowText(row) { return (row.innerText || row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220); }

  function makeBadge(match) {
    var it = match.item, info = stageInfo(it.stage), d = daysSince(it.stageEnteredAt);
    var stale = (d != null && info.stale != null && d > info.stale);
    var tl = timeLabel(it.stageEnteredAt);
    var next = it.nextAction || info.next || '';
    var el = document.createElement('div');
    el.className = 'bf-badge' + (stale ? ' bf-stale' : '') + (match.confident ? '' : ' bf-fuzzy');
    el.setAttribute('data-bf', '1');
    el.innerHTML =
      '<span class="bf-stage" style="background:' + info.color + '">' + (match.confident ? '' : '≈ ') + esc(info.label) + '</span>' +
      (tl ? '<span class="bf-time' + (stale ? ' bf-time-stale' : '') + '">' + esc(tl) + (stale ? ' • stale' : '') + '</span>' : '') +
      (next ? '<span class="bf-next">' + esc(next) + '</span>' : '');
    el.title = (it.sellerName || '') + (it.vehicle ? ' · ' + it.vehicle : '') + ' · ' + info.label + (next ? ' · ' + next : '') + (match.confident ? '' : '  (fuzzy match)');
    return el;
  }

  function decorateRow(row) {
    if (row.getAttribute('data-bf-done') === '1') return;
    var txt = rowText(row); if (!txt || txt.length < 3) return;
    var tid = threadIdFromRow(row);
    var m = globalThis.BFMatch.match(idx, { threadId: tid, rowText: txt }, CFG.matchThreshold);
    if (!m) return; // unmatched: leave undecorated and allow a retry as the row's text fills in
    // capture: a confident fuzzy match WITH a thread id -> stamp it back so it becomes an exact match next refresh
    if (tid && !m.confident && m.score >= (CFG.linkMinScore || 0.72) && m.item && m.item.uuid && !linked[m.item.uuid]) {
      linked[m.item.uuid] = 1;
      try { chrome.runtime.sendMessage({ type: 'BF_LINK_THREAD', uuid: m.item.uuid, threadId: tid }, function () { if (chrome.runtime.lastError) {} }); } catch (e) {}
    }
    row.setAttribute('data-bf-done', '1');
    var prev = row.querySelector('.bf-badge'); if (prev) prev.remove();
    try { row.appendChild(makeBadge(m)); } catch (e) {}
  }

  function scan() {
    if (!idx) return;
    var rows = document.querySelectorAll(CFG.selectors.rowCandidates);
    [].forEach.call(rows, function (r) { try { decorateRow(r); } catch (e) {} });
  }

  var pending = null;
  function schedule() { if (pending) return; pending = setTimeout(function () { pending = null; scan(); }, 300); }

  function setIndex(resp) {
    if (!resp || resp.ok === false) {
      try { console.debug('[BuyForce] index unavailable:', resp && resp.reason); } catch (e) {}
    }
    idx = globalThis.BFMatch.buildIndex((resp && resp.items) || []);
    document.querySelectorAll('[data-bf-done]').forEach(function (x) { x.removeAttribute('data-bf-done'); });
    scan();
  }

  function getIndex(cb) {
    try {
      chrome.runtime.sendMessage({ type: 'BF_GET_INDEX' }, function (resp) {
        if (chrome.runtime.lastError) { cb(null); return; }
        cb(resp);
      });
    } catch (e) { cb(null); }
  }

  function boot() {
    getIndex(setIndex);
    var mo = new MutationObserver(function () { schedule(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(function () { getIndex(function (r) { if (r) setIndex(r); }); }, CFG.refreshMs || 300000);
  }

  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

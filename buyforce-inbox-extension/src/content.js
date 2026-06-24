/* BuyForce Inbox Overlay - Facebook content script.
 * On the Marketplace INBOX, fetches the pipeline index ONCE per visit (no
 * periodic polling), badges matching conversation rows, and renders the open
 * conversation's deal into the BuyForce sidebar. To refresh the data, reload
 * the inbox. Read-only: it never clicks, sends, or alters Facebook.
 */
(function () {
  var CFG = globalThis.BF_CONFIG;
  var idx = null;
  var linked = {};
  var fetchedSig = null;   // 'inbox' once we've fetched for the current inbox visit

  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function daysSince(iso) { if (!iso) return null; var t = new Date(iso).getTime(); if (isNaN(t)) return null; return Math.floor((Date.now() - t) / 86400000); }
  function timeLabel(iso) { var d = daysSince(iso); if (d == null) return ''; if (d <= 0) return 'today'; if (d === 1) return '1d'; return d + 'd'; }
  function stageInfo(stage) { return CFG.stages[stage] || CFG.unknownStage; }
  function money(v) { if (v == null || v === '') return ''; var n = Number(String(v).replace(/[^0-9.]/g, '')); if (!isFinite(n) || !n) return String(v); return '$' + n.toLocaleString('en-US'); }

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
    if (!m) return;
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

  // ---- Sidebar: open-conversation deal context ----
  function inboxRoute() { var p = location.pathname; return /\/marketplace\/inbox/.test(p) || /\/marketplace\/t\//.test(p); }

  function openConvoCtx() {
    var main = document.querySelector('[role="main"]'); if (!main) return null;
    var tid = (location.pathname.match(/\/t\/(\d+)/) || [])[1] || '';
    var head = '';
    var h = main.querySelector('[role="heading"]'); if (h) head += ' ' + (h.innerText || '');
    head += ' ' + (main.innerText || '').slice(0, 300);
    head = head.replace(/\s+/g, ' ').trim().slice(0, 260);
    return { threadId: tid, rowText: head };
  }

  function emptyMsg(s) { return '<div class="bf-sb-empty">' + esc(s) + '</div>'; }
  function srow(a, b) { return '<div class="bf-sb-row"><span>' + esc(a) + '</span><span>' + esc(b) + '</span></div>'; }

  function dealHTML(m) {
    var it = m.item, info = stageInfo(it.stage), d = daysSince(it.stageEnteredAt);
    var stale = (d != null && info.stale != null && d > info.stale);
    var tl = timeLabel(it.stageEnteredAt);
    var next = it.nextAction || info.next || '';
    var rows = '';
    rows += srow('Seller', it.sellerName || '—');
    if (it.askingPrice) rows += srow('Asking', money(it.askingPrice));
    if (it.offerAmount) rows += srow('Our offer', money(it.offerAmount));
    rows += srow('In stage', tl ? (tl + (stale ? ' · stale' : '')) : '—');
    if (!m.confident) rows += srow('Match', '≈ fuzzy');
    var link = it.recordUrl || it.url || it.link || '';
    return '<div class="bf-sb-veh">' + esc(it.vehicle || 'Vehicle') + '</div>' +
      '<div class="bf-sb-sub"><span class="bf-sb-stage" style="background:' + info.color + '">' + esc(info.label) + '</span></div>' +
      '<div>' + rows + '</div>' +
      (next ? '<div class="bf-sb-next">Next: <b>' + esc(next) + '</b></div>' : '') +
      (stale ? '<span class="bf-sb-flag">⚠ Stale — ' + esc(tl) + ' in stage</span>' : '') +
      (link ? '<a class="bf-sb-link" href="' + esc(link) + '" target="_blank" rel="noopener">Open in BuyForce →</a>' : '');
  }

  function renderInbox() {
    if (!window.BFSidebar || !inboxRoute()) return;
    window.BFSidebar.setContext('Inbox');
    if (!idx) { window.BFSidebar.setHTML(emptyMsg('Loading your pipeline…')); return; }
    var convoOpen = /\/t\//.test(location.pathname);
    if (!convoOpen) {
      window.BFSidebar.setDot(false);
      window.BFSidebar.setHTML(emptyMsg('Open a conversation to see its BuyForce deal. Matching leads are badged in the list.'));
      return;
    }
    var ctx = openConvoCtx();
    var m = ctx ? window.BFMatch.match(idx, ctx, CFG.matchThreshold) : null;
    if (!m) { window.BFSidebar.setDot(false); window.BFSidebar.setHTML(emptyMsg('No matching BuyForce deal for this conversation yet.')); return; }
    window.BFSidebar.setDot(true);
    window.BFSidebar.setHTML(dealHTML(m));
  }

  var pending = null;
  function schedule() { if (pending) return; pending = setTimeout(function () { pending = null; scan(); renderInbox(); }, 300); }

  function setIndex(resp) {
    if (!resp || resp.ok === false) { try { console.debug('[BuyForce] index unavailable:', resp && resp.reason); } catch (e) {} }
    idx = globalThis.BFMatch.buildIndex((resp && resp.items) || []);
    document.querySelectorAll('[data-bf-done]').forEach(function (x) { x.removeAttribute('data-bf-done'); });
    scan(); renderInbox();
  }

  function getIndex(cb) {
    try {
      chrome.runtime.sendMessage({ type: 'BF_GET_INDEX' }, function (resp) {
        if (chrome.runtime.lastError) { cb(null); return; }
        cb(resp);
      });
    } catch (e) { cb(null); }
  }

  // Fetch ONCE per inbox visit. Reset when we leave the inbox so returning re-fetches.
  function maybeFetch() {
    if (!inboxRoute()) { fetchedSig = null; return; }
    if (fetchedSig === 'inbox') return;
    fetchedSig = 'inbox';
    getIndex(setIndex);
  }

  function boot() {
    maybeFetch();
    var mo = new MutationObserver(function () { schedule(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(maybeFetch, 1500);   // fetch on entering the inbox; NO periodic refresh
    setInterval(renderInbox, 1500);  // local render only (uses cached index)
  }

  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

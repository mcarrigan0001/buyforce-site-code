/* BuyForce Inbox Overlay — matching engine.
 * ID-primary (FB thread id) with a seller+vehicle fuzzy fallback.
 * Exposes globalThis.BFMatch.
 */
globalThis.BFMatch = (function () {
  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function tokens(s) { return norm(s).split(' ').filter(Boolean); }

  function buildIndex(items) {
    var byThread = {}, list = [];
    (items || []).forEach(function (it) {
      if (it.threadId) byThread[String(it.threadId)] = it;
      list.push({ it: it, sellerTok: tokens(it.sellerName), vehTok: tokens(it.vehicle) });
    });
    return { byThread: byThread, list: list };
  }

  function fuzzyScore(rowText, entry) {
    var rt = tokens(rowText); if (!rt.length) return 0;
    var rset = {}; rt.forEach(function (t) { rset[t] = 1; });
    var want = entry.sellerTok.concat(entry.vehTok);
    if (!want.length) return 0;
    var hit = 0; want.forEach(function (t) { if (rset[t]) hit++; });
    var sellerHit = entry.sellerTok.some(function (t) { return rset[t]; });
    var vehHit = entry.vehTok.some(function (t) { return rset[t]; });
    var base = hit / want.length;
    if (sellerHit && vehHit) base += 0.15;        // reward matching both sides
    if (!sellerHit) base *= 0.4;                  // seller is the stronger signal
    return Math.min(1, base);
  }

  // ctx: { threadId, rowText }
  function match(index, ctx, threshold) {
    if (ctx.threadId && index.byThread[String(ctx.threadId)]) {
      return { item: index.byThread[String(ctx.threadId)], confident: true, score: 1 };
    }
    var best = null, bestScore = 0;
    index.list.forEach(function (e) { var s = fuzzyScore(ctx.rowText, e); if (s > bestScore) { bestScore = s; best = e; } });
    if (best && bestScore >= (threshold || 0.5)) return { item: best.it, confident: false, score: bestScore };
    return null;
  }

  return { buildIndex: buildIndex, match: match, norm: norm };
})();

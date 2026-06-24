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
    var sellerTok = entry.sellerTok || [], vehTok = entry.vehTok || [];
    if (!sellerTok.length || !vehTok.length) return 0;
    // Distinctive vehicle tokens = drop year(s) + the make (first non-year token).
    // Make + year ('nissan', '2016') are far too common and caused false positives;
    // the model/trim ('altima', 'frontier') is what actually disambiguates a vehicle.
    var nonYear = vehTok.filter(function (t) { return !/^(19|20)\d\d$/.test(t); });
    var modelTok = nonYear.slice(1);
    var sellerHit = sellerTok.some(function (t) { return t.length >= 3 && rset[t]; });
    var modelHit  = modelTok.some(function (t) { return t.length >= 3 && rset[t]; });
    // Require BOTH a real seller-name hit AND a model-level vehicle hit.
    if (!sellerHit || !modelHit) return 0;
    var want = sellerTok.concat(vehTok);
    var hit = 0; want.forEach(function (t) { if (rset[t]) hit++; });
    return Math.min(1, hit / want.length + 0.2);
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

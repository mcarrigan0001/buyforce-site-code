/* BuyForce Window-Sticker Matcher — deterministic synonym rules (no per-page AI).
 *
 * Given a window-sticker payload (from the /window-sticker webhook) and a list of
 * on-page option labels (the checkbox/button text scraped from CarMax/Carvana),
 * returns for each label a verdict: 'yes' | 'no' | 'unknown'.
 *
 * Design:
 *  - We build a normalized haystack from the sticker's standardEquipment +
 *    installedOptions[].name + options[] + gm.rpoCodes + rawText.
 *  - Each on-page label is normalized, then routed to a RULE. A rule can assert
 *    a positive signal (=> 'yes'), a contradicting signal (=> 'no'), or nothing
 *    (=> 'unknown', the safe default — we never guess 'no' without a clear
 *    contradiction).
 *  - The synonym/rule table (SYNONYMS) lives in ONE place below; extend it by
 *    adding entries. First matching rule (by route keyword) wins per label.
 *
 * Exposed as globalThis.BFSticker.match(payload, labels) for the content script,
 * and module.exports for `node -c` / unit use.
 */
(function () {
  'use strict';

  function norm(s) {
    return String(s == null ? '' : s)
      .toUpperCase()
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^A-Z0-9"/.\- ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function hasWord(hay, needle) {
    if (!needle) return false;
    var n = norm(needle);
    if (!n) return false;
    var esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(^|[^A-Z0-9])' + esc + '($|[^A-Z0-9])');
    return re.test(hay);
  }
  function hasAny(hay, needles) {
    for (var i = 0; i < needles.length; i++) if (hasWord(hay, needles[i])) return true;
    return false;
  }
  function maxInches(hay) {
    var max = 0, m;
    var re = /(\d{2})\s*(?:"|-?\s*INCH|-?\s*IN\b)/g;
    while ((m = re.exec(hay))) { var v = parseInt(m[1], 10); if (v >= 14 && v <= 30 && v > max) max = v; }
    var re2 = /R\s?(\d{2})\b/g;
    while ((m = re2.exec(hay))) { var v2 = parseInt(m[1], 10); if (v2 >= 14 && v2 <= 30 && v2 > max) max = v2; }
    return max;
  }

  function buildHay(payload) {
    var p = payload || {};
    var parts = [];
    function push(v) { if (v != null) parts.push(String(v)); }
    (p.standardEquipment || []).forEach(push);
    (p.installedOptions || []).forEach(function (o) { push(o && o.name); });
    (p.options || []).forEach(push);
    if (p.gm && Array.isArray(p.gm.rpoCodes)) p.gm.rpoCodes.forEach(push);
    push(p.trim); push(p.rawText);
    return norm(parts.join(' \n '));
  }

  // ---- the synonym / rule table (ONE place to extend) ----
  var SYNONYMS = [
    {
      key: 'alloy_wheels',
      test: ['ALLOY WHEEL', 'ALUMINUM WHEEL'],
      yes: function (h) { return hasAny(h, ['ALUMINUM WHEEL', 'ALLOY WHEEL', 'ALUMINUM WHEELS', 'ALLOY WHEELS', 'MACHINED ALUMINUM', 'CAST ALUMINUM']); },
      no: function (h) { return hasWord(h, 'STEEL WHEEL') && !hasAny(h, ['ALUMINUM WHEEL', 'ALLOY WHEEL']); }
    },
    {
      key: 'premium_oversize_wheels',
      test: ['PREMIUM WHEEL', 'OVERSIZED PREMIUM WHEEL', 'OVERSIZE PREMIUM WHEEL', '20"+', '20 +'],
      yes: function (h) {
        return maxInches(h) >= 20 || hasAny(h, ['PREMIUM WHEEL', 'CHROME WHEEL', 'MACHINED WHEEL', 'POLISHED WHEEL', 'CHROMED WHEEL', 'PREMIUM ALUMINUM', 'PREMIUM PAINTED ALUMINUM']);
      }
    },
    {
      key: 'offroad_tires',
      test: ['OFF-ROAD TIRE', 'OFF ROAD TIRE', 'OVERSIZE OFF', 'OVERSIZED OFF', 'ALL-TERRAIN', 'ALL TERRAIN'],
      yes: function (h) { return hasAny(h, ['OFF-ROAD', 'OFF ROAD', 'ALL-TERRAIN', 'ALL TERRAIN', 'A/T TIRE', 'MUD-TERRAIN', 'MUD TERRAIN', 'M/T TIRE', 'KNOBBY']); },
      no: function (h) { return hasAny(h, ['ALL-SEASON', 'ALL SEASON', 'HIGHWAY TERRAIN', 'H/T TIRE', 'TOURING TIRE']) && !hasAny(h, ['OFF-ROAD', 'OFF ROAD', 'ALL-TERRAIN', 'ALL TERRAIN', 'MUD']); }
    },
    {
      key: 'hard_tonneau',
      test: ['HARD TONNEAU', 'TONNEAU COVER', 'TONNEAU'],
      yes: function (h) { return hasWord(h, 'TONNEAU') && hasAny(h, ['HARD', 'TRI-FOLD', 'TRIFOLD', 'FOLDING HARD', 'RETRACTABLE HARD']); },
      no: function (h) { return hasWord(h, 'TONNEAU') && hasAny(h, ['SOFT', 'ROLL-UP', 'ROLL UP', 'VINYL']) && !hasAny(h, ['HARD', 'TRI-FOLD', 'TRIFOLD']); }
    },
    {
      key: 'shell_topper',
      test: ['PICKUP SHELL', 'CAMPER SHELL', 'SHELL', 'CANOPY', 'TOPPER', 'CAP'],
      yes: function (h) { return hasAny(h, ['CAMPER SHELL', 'PICKUP SHELL', 'CANOPY', 'TOPPER', 'BED CAP', 'CAMPER TOP']); }
    },
    {
      key: 'navigation',
      test: ['NAVIGATION', 'NAV SYSTEM', 'GPS'],
      yes: function (h) { return hasAny(h, ['NAVIGATION', 'GOOGLE BUILT-IN', 'GOOGLE BUILT IN', 'GOOGLE MAPS', 'NAV SYSTEM', 'GPS NAVIGATION']); }
    },
    {
      key: 'leather',
      test: ['LEATHER'],
      yes: function (h) { return hasAny(h, ['LEATHER SEAT', 'LEATHER-APPOINTED', 'LEATHER APPOINTED', 'LEATHER SEATING', 'PERFORATED LEATHER']); },
      no: function (h) { return hasAny(h, ['CLOTH SEAT', 'CLOTH SEATING', 'PREMIUM CLOTH']) && !hasAny(h, ['LEATHER SEAT', 'LEATHER SEATING', 'LEATHER-APPOINTED']); }
    },
    {
      key: 'sunroof_moonroof',
      test: ['SUNROOF', 'MOONROOF', 'GLASS ROOF', 'PANORAMIC ROOF', 'PANORAMIC'],
      yes: function (h) { return hasAny(h, ['SUNROOF', 'MOONROOF', 'PANORAMIC ROOF', 'PANORAMIC SUNROOF', 'GLASS ROOF', 'SKYVIEW', 'DUAL-PANE ROOF', 'POWER ROOF']); }
    },
    {
      key: 'heated_seats',
      test: ['HEATED SEAT', 'HEATED FRONT SEAT'],
      yes: function (h) { return hasAny(h, ['HEATED SEAT', 'HEATED FRONT SEAT', 'HEATED DRIVER', 'HEATED AND VENTILATED']); }
    },
    {
      key: 'cooled_seats',
      test: ['COOLED SEAT', 'VENTILATED SEAT'],
      yes: function (h) { return hasAny(h, ['COOLED SEAT', 'VENTILATED SEAT', 'HEATED AND VENTILATED', 'CLIMATE SEAT']); }
    },
    {
      key: 'tow_package',
      test: ['TOW PACKAGE', 'TOWING PACKAGE', 'TRAILER', 'TRAILERING'],
      yes: function (h) { return hasAny(h, ['MAX TRAILERING', 'TRAILERING PACKAGE', 'TRAILER BRAKE', 'TOW PACKAGE', 'TOWING PACKAGE', 'TRAILER TOW', 'HITCH RECEIVER', 'INTEGRATED TRAILER BRAKE']); }
    },
    {
      key: 'remote_start',
      test: ['REMOTE START'],
      yes: function (h) { return hasAny(h, ['REMOTE START', 'REMOTE VEHICLE START', 'REMOTE ENGINE START']); }
    },
    {
      key: 'running_boards',
      test: ['RUNNING BOARD', 'SIDE STEP', 'STEP BAR', 'ASSIST STEP'],
      yes: function (h) { return hasAny(h, ['RUNNING BOARD', 'SIDE STEP', 'STEP BAR', 'ASSIST STEP', 'ROCK RAILS', 'NERF BAR']); }
    },
    {
      key: 'bed_liner',
      test: ['BED LINER', 'BEDLINER', 'SPRAY-IN'],
      yes: function (h) { return hasAny(h, ['BED LINER', 'BEDLINER', 'SPRAY-IN', 'SPRAY IN', 'SPRAY-ON BEDLINER']); }
    },
    {
      key: 'backup_camera',
      test: ['BACKUP CAMERA', 'BACK-UP CAMERA', 'REAR CAMERA', 'REAR VISION'],
      yes: function (h) { return hasAny(h, ['REAR VISION CAMERA', 'BACKUP CAMERA', 'BACK-UP CAMERA', 'REAR CAMERA', 'REARVIEW CAMERA', 'REAR VIEW CAMERA']); }
    }
  ];

  // Route a normalized on-page label to a rule. Test tokens are deliberate route
  // keywords, matched as substrings of the normalized label (tolerant of
  // plural/singular, e.g. "PREMIUM WHEELS" routes on "PREMIUM WHEEL").
  function ruleFor(label) {
    for (var i = 0; i < SYNONYMS.length; i++) {
      var r = SYNONYMS[i];
      for (var j = 0; j < r.test.length; j++) {
        if (label.indexOf(norm(r.test[j])) !== -1) return r;
      }
    }
    return null;
  }

  function verdictFor(rule, hay) {
    if (!rule) return 'unknown';
    try {
      if (rule.yes && rule.yes(hay)) return 'yes';
      if (rule.no && rule.no(hay)) return 'no';
    } catch (e) { /* never throw into the page */ }
    return 'unknown';
  }

  function match(payload, labels) {
    var hay = buildHay(payload);
    return (labels || []).map(function (label) {
      var nlabel = norm(label);
      var rule = ruleFor(nlabel);
      return { label: label, verdict: verdictFor(rule, hay), rule: rule ? rule.key : '' };
    });
  }

  var api = { match: match, norm: norm, buildHay: buildHay, maxInches: maxInches, SYNONYMS: SYNONYMS };
  if (typeof globalThis !== 'undefined') globalThis.BFSticker = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();

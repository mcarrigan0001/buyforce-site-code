/* ===================================================================== */
/* BuyForce — Noloco footer script                                       */
/* 1) Opens external links in a new tab.                                 */
/* 2) Adds a Tabler icon above each pipeline column's caret, matched by  */
/*    stage NAME (survives reordering). Gray normally, green on active.   */
/* 3) Renders a live "time in stage" badge on each card from             */
/*    Stage Entered At, colored per-stage (green/orange/red).            */
/* Hosted in GitHub; loaded by a <script src> in Noloco footer code.     */
/* ===================================================================== */
(function () {
  function norm(s){ return (s||'').replace(/[‒-―]/g,'-').replace(/\s+/g,' ').trim(); }

  function fixLinks(){
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.hostname !== location.hostname && !a.target) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }

  var ICONS = {
    'Fresh Leads': 'ti-user-plus',
    'Engaged - Awaiting VIN': 'ti-message-2',
    'VIN Received - Appraisal Needed': 'ti-car',
    'Appraisal Complete - Enter Offer Sheet Values': 'ti-hash',
    'Offer Sheet Generated': 'ti-file-dollar',
    'Offer Sent (0-2 Days)': 'ti-send',
    'Nurturing (Follow Up and Re-engage)': 'ti-message-heart',
    'Appraisal Review Needed': 'ti-calculator',
    'Appraisal Review Complete': 'ti-circle-check',
    'Verbal Yes - Schedule Appt': 'ti-progress-check',
    'Scheduled': 'ti-calendar-event',
    'Acquired': 'ti-trophy',
    'Appt Shown - Follow Up': 'ti-phone',
    'No Deal': 'ti-circle-x'
  };
  var ICONMAP = {};
  Object.keys(ICONS).forEach(function(k){ ICONMAP[norm(k)] = ICONS[k]; });

  function addIcons(){
    document.querySelectorAll('[data-testid="collection-group"]').forEach(function(group){
      if (group.getAttribute('data-bficon')) return;
      var label = group.querySelector('[data-testid="collection-group-header-label"]');
      var header = group.querySelector('[data-testid="collection-group-header"]');
      if (!label || !header) return;
      var cls = ICONMAP[norm(label.textContent)];
      if (!cls) return;
      var btn = header.querySelector('button');
      var icon = document.createElement('i');
      icon.className = 'ti ' + cls + ' bf-stage-icon';
      icon.setAttribute('aria-hidden','true');
      if (btn && btn.parentNode) { btn.parentNode.insertBefore(icon, btn); }
      else { header.insertBefore(icon, header.firstChild); }
      group.setAttribute('data-bficon','1');
    });
  }

  /* per-stage [orange, red] thresholds in MINUTES; null = no aging (terminal) */
  var THRESH = {
    'Fresh Leads': [240, 720],
    'Engaged - Awaiting VIN': [720, 1440],
    'VIN Received - Appraisal Needed': [120, 360],
    'Appraisal Complete - Enter Offer Sheet Values': [120, 360],
    'Offer Sheet Generated': [120, 480],
    'Offer Sent (0-2 Days)': [1440, 2880],
    'Nurturing (Follow Up and Re-engage)': [10080, 20160],
    'Appraisal Review Needed': [240, 720],
    'Appraisal Review Complete': [240, 720],
    'Verbal Yes - Schedule Appt': [720, 1440],
    'Scheduled': [1440, 4320],
    'Appt Shown - Follow Up': [720, 1440],
    'Acquired': null,
    'No Deal': null
  };

  function fmtDuration(mins){
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h < 24) return h + 'h ' + m + 'm';
    var d = Math.floor(h / 24);
    var hh = h % 24;
    return d + 'd ' + hh + 'h';
  }

  function stageOf(card){
    var g = card.closest ? card.closest('[data-testid="collection-group"]') : null;
    if (!g) return '';
    var l = g.querySelector('[data-testid="collection-group-header-label"]');
    return l ? norm(l.textContent) : '';
  }

  function addAging(){
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
      var cells = card.querySelectorAll('[data-testid="field-cell"]');
      var lblSpan = null;
      for (var i = 0; i < cells.length; i++) {
        var l = cells[i].querySelector('[data-testid="field-cell-label"]');
        if (l && norm(l.textContent) === 'Stage Entered At') { lblSpan = l; break; }
      }
      if (!lblSpan) return;
      var valNode = lblSpan.nextElementSibling;
      if (!valNode) return;
      var raw = (valNode.getAttribute('data-bfraw') || valNode.textContent || '').trim();
      if (!raw) return;
      var dt = new Date(raw);
      if (isNaN(dt.getTime())) return;
      var mins = Math.floor((Date.now() - dt.getTime()) / 60000);
      if (mins < 0) mins = 0;
      var label = fmtDuration(mins);
      var stage = stageOf(card);
      var t = THRESH.hasOwnProperty(stage) ? THRESH[stage] : null;
      var color = '#5f5e5a';
      if (t) { color = mins >= t[1] ? '#c93535' : (mins >= t[0] ? '#e8730c' : '#3b6d11'); }
      var key = label + '|' + color;
      if (card.getAttribute('data-bfaging') === key) return;
      card.setAttribute('data-bfaging', key);
      if (!valNode.getAttribute('data-bfraw')) valNode.setAttribute('data-bfraw', raw);
      lblSpan.style.display = 'none';
      valNode.innerHTML = '<span class="bf-aging" title="In stage: ' + label + '" style="display:inline-flex;align-items:center;gap:4px;font-weight:500;color:' + color + ';"><i class="ti ti-clock" style="font-size:13px;" aria-hidden="true"></i>' + label + ' in stage</span>';
    });
  }

  function run(){ fixLinks(); addIcons(); addAging(); }
  run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  setInterval(addAging, 60000);
})();

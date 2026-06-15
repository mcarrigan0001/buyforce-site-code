/* ===================================================================== */
/* BuyForce — Noloco footer script                                       */
/* 1) Opens external links in a new tab.                                 */
/* 2) Adds a Tabler icon above each pipeline column's caret, matched by  */
/*    stage NAME (survives reordering). Gray normally, green on active.   */
/* 3) Renders a live "time in stage" badge on each card from             */
/*    Stage Entered At, colored per-stage (green/amber/red).             */
/* Hosted in GitHub; loaded by a <script src> in Noloco footer code.     */
/* ===================================================================== */
(function () {
  function norm(s){ return (s||'').replace(/[‒-―]/g,'-').replace(/\s+/g,' ').trim(); }

  /* ---- 1) external links open in a new tab ---- */
  function fixLinks(){
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.hostname !== location.hostname && !a.target) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  }

  /* ---- 2) pipeline stage icons ---- */
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
     
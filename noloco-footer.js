/* ===================================================================== */
/* BuyForce — Noloco footer script                                       */
/* 1) External links open in a new tab.                                  */
/* 2) Tabler icon above each pipeline column caret (matched by name).    */
/* 3) Opportunity cards rebuilt from their native field cells:           */
/*    header (title/subtitle), meta line (listed-ago + location),        */
/*    2x3 metric tiles, competitive green/yellow/red on Offer + pill,    */
/*    colored equity, and a live in-stage clock. Native cells hidden.    */
/* Hosted in GitHub; loaded by a <script src> in Noloco footer code.     */
/* ===================================================================== */
(function () {
  function norm(s){ return (s||'').replace(/[‐-―]/g,'-').replace(/\s+/g,' ').trim(); }
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function money(s){ return (s||'').replace(/\.00(?=$|[^0-9])/,''); }

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
    'Fresh Leads': [120, 360],
    'Engaged - Awaiting VIN': [360, 720],
    'VIN Received - Appraisal Needed': [60, 180],
    'Appraisal Complete - Enter Offer Sheet Values': [60, 180],
    'Offer Sheet Generated': [60, 180],
    'Offer Sent (0-2 Days)': [1440, 2880],
    'Nurturing (Follow Up and Re-engage)': [1440, 2880],
    'Appraisal Review Needed': [60, 180],
    'Appraisal Review Complete': [60, 180],
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

  /* ---- card helpers ---- */
  var COMPC = { g:{bg:'#e3f5cf',fg:'#2b6012'}, y:{bg:'#fbeecd',fg:'#7a4d13'}, r:{bg:'#fbe3e3',fg:'#c93535'} };

  function compInfo(raw){
    var t = norm(raw).toLowerCase();
    if(!t) return null;
    if(t.indexOf('both')>=0) return {label:'Beats Both', color:'g', icon:'ti-check'};
    if(t.indexOf('neither')>=0) return {label:'Beats Neither', color:'r', icon:'ti-x'};
    if(t.indexOf('carmax')>=0) return {label:'Beats CarMax', color:'y', icon:'ti-check'};
    if(t.indexOf('carvana')>=0) return {label:'Beats Carvana', color:'y', icon:'ti-check'};
    return null;
  }

  function equityInfo(raw){
    var t = (raw||'').trim();
    if(!t || /unknown/i.test(t)) return {text:'—', color:'#9aa0a6'};
    var m = t.match(/\$[\d,]+(\.\d+)?/);
    var amt = m ? m[0] : t;
    if(/negative/i.test(t)) return {text:'−'+amt, color:'#c93535'};
    return {text:'+'+amt, color:'#2b6012'};
  }

  function listedAgo(raw){
    if(!raw) return '';
    var d = new Date(raw);
    if(isNaN(d.getTime())) return '';
    var days = Math.floor((Date.now()-d.getTime())/86400000);
    if(days<0) days=0;
    if(days===0) return 'Listed today';
    if(days===1) return 'Listed 1 day ago';
    if(days<7) return 'Listed '+days+' days ago';
    if(days<14) return 'Listed 1 week ago';
    if(days<60) return 'Listed '+Math.round(days/7)+' weeks ago';
    var mo = Math.round(days/30);
    return 'Listed '+mo+' month'+(mo>1?'s':'')+' ago';
  }

  function tile(lbl,val){
    return '<div><div style="font-size:11px;color:#7c7c7c;">'+lbl+'</div><div style="font-size:14px;font-weight:500;color:#161616;">'+(val?esc(money(val)):'—')+'</div></div>';
  }

  function buildCard(F, card){
    var comp = compInfo(F['Competition']);
    var eq = equityInfo(F['Equity Display']);
    var asking = F['Asking Price'];
    var willTake = F['Seller Will Take'];

    var askInner;
    var wtNum=parseFloat((willTake||'').replace(/[^0-9.]/g,''));
    var akNum=parseFloat((asking||'').replace(/[^0-9.]/g,''));
    if(!isNaN(wtNum) && wtNum>0 && wtNum!==akNum){
      askInner = '<div style="font-size:11px;color:#7c7c7c;">Asking</div>'+
        '<div style="font-size:14px;font-weight:500;color:#161616;display:flex;align-items:center;gap:3px;">'+esc(money(willTake))+'<i class="ti ti-arrow-down-right" style="font-size:13px;color:#2b6012;" aria-hidden="true"></i></div>'+
        (asking?'<div style="font-size:10px;color:#b4b2a9;text-decoration:line-through;">was '+esc(money(asking))+'</div>':'');
    } else {
      askInner = '<div style="font-size:11px;color:#7c7c7c;">Asking</div><div style="font-size:14px;font-weight:500;color:#161616;">'+(asking?esc(money(asking)):'—')+'</div>';
    }

    var oc = comp ? COMPC[comp.color] : null;
    var offerTile = '<div'+(oc?' style="background:'+oc.bg+';border-radius:6px;padding:2px 6px;margin:-2px -4px;"':'')+'>'+
      '<div style="font-size:11px;color:'+(oc?oc.fg:'#7c7c7c')+';">Offer</div>'+
      '<div style="font-size:14px;font-weight:500;color:'+(oc?oc.fg:'#161616')+';">'+(F['Offer Amount']?esc(money(F['Offer Amount'])):'—')+'</div></div>';

    var equityTile = '<div><div style="font-size:11px;color:#7c7c7c;">Equity</div><div style="font-size:14px;font-weight:500;color:'+eq.color+';">'+eq.text+'</div></div>';
    var payoffRaw = F['Estimated Payoff Value'];
    var payoffTile = (payoffRaw && /[0-9]/.test(payoffRaw)) ? tile('Payoff', payoffRaw) : '';

    var grid = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-items:start;border-top:0.5px solid #ece9e0;padding-top:10px;">'+
      '<div>'+askInner+'</div>'+ tile('ACV',F['ACV']) + offerTile + tile('CarMax',F['CarMax Offer']) + tile('Carvana',F['Carvana Offer']) + equityTile + payoffTile + '</div>';

    var pill='';
    if(comp){ var c=COMPC[comp.color]; pill='<div style="padding-top:11px;"><span style="display:inline-flex;align-items:center;gap:3px;background:'+c.bg+';color:'+c.fg+';font-size:11px;padding:3px 8px;border-radius:999px;"><i class="ti '+comp.icon+'" style="font-size:12px;" aria-hidden="true"></i>'+comp.label+'</span></div>'; }

    var metaParts=[];
    var la=listedAgo(F['Date Listed']);
    if(la) metaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><i class="ti ti-calendar" style="font-size:12px;" aria-hidden="true"></i>'+la+'</span>');
    if(F['Listing Location']) metaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><i class="ti ti-map-pin" style="font-size:12px;" aria-hidden="true"></i>'+esc(F['Listing Location'])+'</span>');
    var meta = metaParts.length ? '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:4px;font-size:11px;color:#888780;">'+metaParts.join('')+'</div>' : '';

    var header='<div style="margin-bottom:9px;"><div style="font-size:15px;font-weight:500;color:#161616;">'+esc(F['Vehicle Title']||'')+'</div>'+
      (F['Vehicle Subtitle']?'<div style="font-size:12px;color:#7c7c7c;margin-top:1px;">'+esc(F['Vehicle Subtitle'])+'</div>':'')+ meta +'</div>';

    var clock='';
    var se=F['Stage Entered At'];
    if(se){ var dt=new Date(se); if(!isNaN(dt.getTime())){ var mins=Math.floor((Date.now()-dt.getTime())/60000); if(mins<0)mins=0; var stage=stageOf(card); var th=THRESH.hasOwnProperty(stage)?THRESH[stage]:null; var dotCol='#9aa0a6'; var sev='green'; if(th){ if(mins>=th[1]){dotCol='#c93535';sev='red';} else if(mins>=th[0]){dotCol='#e8730c';sev='orange';} else {dotCol='#3b6d11';sev='green';} } var txtCol='#6b6b64'; var wt='400'; if(sev==='orange'){txtCol='#e8730c';wt='500';} else if(sev==='red'){txtCol='#c93535';wt='500';} clock='<div style="border-top:0.5px solid #ece9e0;margin-top:11px;padding-top:9px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:'+wt+';color:'+txtCol+';"><span style="width:8px;height:8px;border-radius:50%;background:'+dotCol+';flex:none;"></span><i class="ti ti-clock" style="font-size:13px;color:#a09e96;" aria-hidden="true"></i>'+fmtDuration(mins)+' in stage</div>'; } }

    return header + grid + pill + clock;
  }

  function addCards(force){
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
      var firstCell = card.querySelector('[data-testid="field-cell"]');
      if(!firstCell) return;
      var container = firstCell.parentNode;
      if(!container) return;

      var F = {};
      container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){
        var lab = cell.querySelector('[data-testid="field-cell-label"]');
        if(!lab) return;
        var vNode = lab.nextElementSibling;
        F[norm(lab.textContent)] = vNode ? vNode.textContent.trim() : '';
      });

      if(!('Vehicle Title' in F) && !('Offer Amount' in F)) return;
      var raw = [F['Vehicle Title'],F['Vehicle Subtitle'],F['Date Listed'],F['Listing Location'],F['Asking Price'],F['Seller Will Take'],F['ACV'],F['Offer Amount'],F['CarMax Offer'],F['Carvana Offer'],F['Competition'],F['Equity Display'],F['Estimated Payoff Value'],F['Stage Entered At'],stageOf(card)].join('|');

      var body = container.querySelector(':scope > .bf-body');
      if(body && !force && body.getAttribute('data-raw')===raw){
        container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){ if(cell.style.display!=='none') cell.style.display='none'; });
        return;
      }
      if(!body){ body=document.createElement('div'); body.className='bf-body'; container.appendChild(body); }
      body.innerHTML = buildCard(F, card);
      body.setAttribute('data-raw', raw);
      container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){ cell.style.display='none'; });
    });
  }

  var bfArrowR, bfArrowL, bfBusy=false;
  function bfSC(){ return document.querySelector('[class*="min-h-screen-75"]'); }
  function bfPos(sc, el){ return el.getBoundingClientRect().left - sc.getBoundingClientRect().left + sc.scrollLeft; }
  function bfExpanded(sc){ return sc.querySelectorAll('[data-testid="collection-group"]:not(.w-12)'); }
  function bfNext(sc){
    var cur=sc.scrollLeft, cols=bfExpanded(sc);
    for(var i=0;i<cols.length;i++){ var pp=bfPos(sc,cols[i]); if(pp>cur+8) return pp; }
    if((sc.scrollWidth - sc.clientWidth - cur) > 4) return sc.scrollWidth;
    return null;
  }
  function bfPrev(sc){
    var cur=sc.scrollLeft, cols=bfExpanded(sc), t=null;
    for(var i=0;i<cols.length;i++){ var pp=bfPos(sc,cols[i]); if(pp < cur-8) t=pp; }
    if(t!==null) return t;
    if(cur>4) return 0;
    return null;
  }
  function bfGo(sc, target){
    if(target===null) return;
    bfBusy=true;
    sc.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    setTimeout(function(){ bfBusy=false; updateArrows(); }, 450);
  }
  function updateArrows(){
    var sc=bfSC(), show=(!!sc && window.innerWidth>640);
    if(bfArrowR) bfArrowR.style.display=(show && bfNext(sc)!==null)?'flex':'none';
    if(bfArrowL) bfArrowL.style.display=(show && bfPrev(sc)!==null)?'flex':'none';
  }
  function bfMkArrow(side){
    var b=document.createElement('button');
    b.setAttribute('aria-label', side==='r'?'Next stage':'Previous stage');
    b.innerHTML='<i class="ti ti-chevron-'+(side==='r'?'right':'left')+'" aria-hidden="true"></i>';
    b.style.cssText='position:fixed;'+(side==='r'?'right':'left')+':14px;top:50%;transform:translateY(-50%);z-index:50;width:40px;height:40px;border-radius:50%;border:none;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.18);color:#2b6012;font-size:22px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;';
    b.addEventListener('click',function(){ if(bfBusy) return; var s=bfSC(); if(!s) return; bfGo(s, side==='r'?bfNext(s):bfPrev(s)); });
    b.addEventListener('mouseenter',function(){ b.style.background='#f2fbe9'; });
    b.addEventListener('mouseleave',function(){ b.style.background='#fff'; });
    return b;
  }
  function ensureArrow(){
    if(window.innerWidth<=640){ if(bfArrowR)bfArrowR.style.display='none'; if(bfArrowL)bfArrowL.style.display='none'; return; }
    var sc=bfSC();
    if(!sc){ if(bfArrowR)bfArrowR.style.display='none'; if(bfArrowL)bfArrowL.style.display='none'; return; }
    if(!bfArrowR){ bfArrowR=bfMkArrow('r'); document.body.appendChild(bfArrowR); }
    if(!bfArrowL){ bfArrowL=bfMkArrow('l'); document.body.appendChild(bfArrowL); }
    if(!sc.getAttribute('data-bfscroll')){ sc.addEventListener('scroll',function(){ if(!bfBusy) updateArrows(); },{passive:true}); sc.setAttribute('data-bfscroll','1'); }
    updateArrows();
  }
  function run(){ fixLinks(); addIcons(); addCards(false); ensureArrow(); }
  run();
  new MutationObserver(function(){ run(); }).observe(document.body, { childList: true, subtree: true });
  setInterval(function(){ addCards(true); }, 60000);
  window.addEventListener('resize', updateArrows);
})();

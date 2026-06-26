(function(){var mo,done=false;function hide(){if(done)return;try{var els=document.querySelectorAll('p,span,div,h1,h2,h3,h4,td,li,strong,em,b');for(var i=0;i<els.length;i++){var e=els[i];if(e.children.length)continue;var t=(e.textContent||'').trim();if(t==='BF_PIPELINE_FUNNEL'||/^bft_[A-Za-z0-9]{6,}$/.test(t)){e.style.visibility='hidden';}}}catch(_e){}}window.__bfStopPrehide=function(){done=true;try{if(mo){mo.disconnect();mo=null;}}catch(_e){}};hide();try{if(document.documentElement){mo=new MutationObserver(hide);mo.observe(document.documentElement,{childList:true,subtree:true});}}catch(_e){}setTimeout(function(){try{if(mo){mo.disconnect();mo=null;}}catch(_e){}},8000);})();
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
  window.BF_VERSION='2026-06-19-c';
  /* Default pipeline columns: keep only the active stages open, collapse EVERY other stage (incl. null/"No value" and any future stage), once per browser. Reps can open any column; Noloco persists their choice. Collapsed columns don't render their cards -> faster board. */
  var bfFirstDefault=false, bfDefaultAt=0;
  var BF_KEEPOPEN={FRESH_LEADS:1, APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES:1, OFFER_SHEET_GENERATED:1, OFFER_SENT_0_2_DAYS:1};
  try{
    var BF_VIEW='vewccBG0hsX0eorteOnayUs_';
    if(!localStorage.getItem('bf.colDefaults.v3')){
      var bfRe=new RegExp('^group\\.'+BF_VIEW+'\\.(.+)\\.collapse$');
      Object.keys(localStorage).forEach(function(k){ var m=k.match(bfRe); if(m){ try{ localStorage.setItem(k, BF_KEEPOPEN[m[1]]?'false':'true'); }catch(e){} } });
      Object.keys(BF_KEEPOPEN).forEach(function(k){ try{ localStorage.setItem('group.'+BF_VIEW+'.'+k+'.collapse','false'); }catch(e){} });
      localStorage.setItem('bf.colDefaults.v3','1');
      bfFirstDefault=true; bfDefaultAt=Date.now();
    }
  }catch(e){}
  window.bfInspect=function(){
    function rect(e){ if(!e) return null; var r=e.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)}; }
    function fs(e){ return e?getComputedStyle(e).fontSize:null; }
    function cs(e,p){ if(!e) return null; var c=getComputedStyle(e),o={}; p.forEach(function(k){o[k]=c[k];}); return o; }
    function txt(e){ return e?(e.textContent||'').replace(/\s+/g,' ').trim():null; }
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])');
    var main=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-details"]):not(:has([class*="section-highlights"]))');
    var o={ version:window.BF_VERSION, vw:window.innerWidth, sidebar:!!sb, sbRect:rect(sb), mainRect:rect(main), rectopRect:rect(document.querySelector('.bf-rectop')) };
    if(!sb){ try{copy(JSON.stringify(o,null,2));}catch(e){} console.log(JSON.stringify(o,null,2)); return o; }
    o.highlights=[].map.call(sb.querySelectorAll('[data-testid="highlight-item"]'), function(h){
      var l=h.querySelector('[data-testid="highlight-label"]'), v=h.querySelector('[data-testid="highlight-value"]');
      return { label:txt(l), value:txt(v), labelFS:fs(l), valueFS:fs(v) };
    });
    o.notices=[].map.call(sb.querySelectorAll('[class*="section-notice"]'), function(n){
      var card=n.querySelector('[class*="rounded-lg"]'), grow=n.querySelector('.grow'), h5=n.querySelector('h5'), val=(grow&&(grow.querySelector('p')||grow.querySelector('div:not(:has(*))')))||null;
      return { type:(n.className.match(/bf-noti-\w+/)||['(untagged)'])[0], text:txt(n).slice(0,40),
        cardCS:cs(card,['display','flexDirection','alignItems','justifyContent','overflow','aspectRatio','gap']), cardRect:rect(card),
        h5:txt(h5), h5FS:fs(h5), valText:txt(val), valFS:fs(val), growW:grow?Math.round(grow.getBoundingClientRect().width):null };
    });
    var otb=null; [].forEach.call(sb.querySelectorAll('[class*="section-title"]'), function(e){ if(/offers to beat/i.test(txt(e)||'')&&!otb) otb=e; });
    o.offersToBeat=otb?{ text:txt(otb), hasBfOtb:otb.classList.contains('bf-otb'), fontSize:fs(otb), whiteSpace:getComputedStyle(otb).whiteSpace, rect:rect(otb) }:'NOT FOUND';
    try{ copy(JSON.stringify(o,null,2)); console.log('bfInspect: COPIED to clipboard'); }catch(e){}
    console.log(JSON.stringify(o,null,2));
    return o;
  };
  /* Inject theme CSS with a cache-bust so updates reach all devices (incl. mobile) immediately. */
  try{ if(!document.getElementById('bf-theme-css')){ var __l=document.createElement('link'); __l.id='bf-theme-css'; __l.rel='stylesheet'; __l.href='https://mcarrigan0001.github.io/buyforce-site-code/noloco-theme.css?v='+Date.now(); document.head.appendChild(__l); } }catch(e){}
  function norm(s){ return (s||'').replace(/[‐-―]/g,'-').replace(/\s+/g,' ').trim(); }
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function money(s){ return (s||'').replace(/\.00(?=$|[^0-9])/,''); }
  function dval(s){ s=(s||'').trim(); return /^[\-\u2013\u2014]+$/.test(s)?'':s; }

  function fixLinks(){
    document.querySelectorAll('a[href^="http"]:not([data-bffx])').forEach(function (a) {
      a.setAttribute('data-bffx','1');
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

  var STAGEORDER = {
    'Fresh Leads':1,'Engaged - Awaiting VIN':2,'VIN Received - Appraisal Needed':3,
    'Appraisal Complete - Enter Offer Sheet Values':4,'Offer Sheet Generated':5,'Offer Sent (0-2 Days)':6,
    'Nurturing (Follow Up and Re-engage)':7,'Appraisal Review Needed':8,'Appraisal Review Complete':9,
    'Verbal Yes - Schedule Appt':10,'Scheduled':11,'Appt Shown - Follow Up':12,'Acquired':13,'No Deal':14
  };
  var MILESTONES = ['Obtain VIN','Competing values','Create Appraisal','Finalize appraisal','Generate offer','Send offer','Follow up','Schedule Appt','Buy'];
  var STATUS_CHECKS = {
    'Fresh Leads': [],
    'Engaged - Awaiting VIN': [],
    'VIN Received - Appraisal Needed': [0],
    'Appraisal Complete - Enter Offer Sheet Values': [0,2],
    'Offer Sheet Generated': [0,2,3,4],
    'Offer Sent (0-2 Days)': [0,2,3,4,5],
    'Nurturing (Follow Up and Re-engage)': [0,2,3,4,5],
    'Appraisal Review Needed': [0],
    'Appraisal Review Complete': [0,2,3],
    'Verbal Yes - Schedule Appt': [],
    'Scheduled': [0,7],
    'Appt Shown - Follow Up': [0,2,3,4,5],
    'Acquired': [0,2,3,4,5,6,7,8],
    'No Deal': []
  };
  var CLICK_STAGE = {
    'Obtain VIN': 'VIN Received - Appraisal Needed',
    'Create Appraisal': 'Appraisal Complete - Enter Offer Sheet Values',
    'Finalize appraisal': 'Appraisal Complete - Enter Offer Sheet Values',
    'Generate offer': 'Offer Sheet Generated',
    'Send offer': 'Offer Sent (0-2 Days)',
    'Follow up': 'Nurturing (Follow Up and Re-engage)',
    'Schedule Appt': 'Scheduled',
    'Buy': 'Acquired'
  };

  function bfClockInfo(stage, baseT){
    var mins = Math.floor((Date.now() - baseT) / 60000); if (mins < 0) mins = 0;
    var dotCol, txtCol, wt = '400', lbl;
    if (stage === 'Nurturing (Follow Up and Re-engage)' || stage === 'Appt Shown - Follow Up') {
      var dayNum = Math.floor(mins / 1440) + 1;
      var DS = [[1,'#c93535'],[3,'#e0631f'],[5,'#e8930c'],[7,'#c79617'],[10,'#8a9a1c'],[15,'#3f9e5a'],[30,'#1f9e8f'],[45,'#3a8fc4'],[60,'#5aa6db']];
      var col = DS[0][1]; for (var di = 0; di < DS.length; di++) { if (dayNum >= DS[di][0]) col = DS[di][1]; }
      dotCol = col; txtCol = col; wt = '500'; lbl = 'Day ' + dayNum + ' in stage';
    } else {
      var th = THRESH.hasOwnProperty(stage) ? THRESH[stage] : null; dotCol = '#9aa0a6'; var sev = 'green';
      if (th) { if (mins >= th[1]) { dotCol = '#c93535'; sev = 'red'; } else if (mins >= th[0]) { dotCol = '#e8730c'; sev = 'orange'; } else { dotCol = '#3b6d11'; } }
      txtCol = '#6b6b64';
      if (sev === 'orange') { txtCol = '#e8730c'; wt = '500'; } else if (sev === 'red') { txtCol = '#c93535'; wt = '500'; }
      lbl = fmtDuration(mins) + ' in stage';
    }
    return { dotCol: dotCol, txtCol: txtCol, wt: wt, lbl: lbl };
  }
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
  function equityInfo2(pos, status, disp){
    var p=(pos||'').trim();
    var m=p.match(/[\d,]+(\.\d+)?/);
    if(m){
      var amt='$'+m[0];
      var neg=/negative/i.test(status||'') || /^[\-\(−]/.test(p);
      return neg ? {text:'−'+amt, color:'#c93535'} : {text:'+'+amt, color:'#2b6012'};
    }
    return equityInfo(disp);
  }
  function bfCardEquity(F){
    var esp=(F['Est Equity Position']||'');
    var hasPay=/[0-9]/.test(F['Estimated Payoff Amount']||F['Estimated Payoff Value']||'')||/[0-9]/.test(F['Actual Payoff']||F['Actual Payoff Amount']||'')||_truthy(F['No Payoff']);
    if(hasPay && /[0-9]/.test(esp)) return equityInfo2(esp, F['Equity Status'], F['Equity Display']);
    var num=function(x){var m=(x||'').replace(/[^0-9.]/g,'');return m?parseFloat(m):NaN;};
    var acv=num(F['ACV']);
    var act=num(F['Actual Payoff']); if(isNaN(act)) act=num(F['Actual Payoff Amount']);
    var est=num(F['Estimated Payoff Amount']); if(isNaN(est)) est=num(F['Estimated Payoff Value']);
    var pay=!isNaN(act)?act:(_truthy(F['No Payoff'])?0:est);
    if(!isNaN(acv)&&acv>0&&!isNaN(pay)){ var e=Math.round(acv-pay); var amt='$'+Math.abs(e).toLocaleString('en-US'); return e<0?{text:'\u2212'+amt,color:'#c93535'}:{text:'+'+amt,color:'#2b6012'}; }
    return {text:'\u2014', color:'#9aa0a6'};
  }
  function bfAttentionInfo(F, stage){
    stage=stage||'';
    if(/acquired|no deal/i.test(stage)) return null;
    if(/offer sheet generated/i.test(stage) && (F['Offer Sheet Image URL']||'')) return {key:'offer',icon:'ti-send',label:'Send offer',bg:'#e3f5cf',fg:'#2b6012'};
    if(/verbal yes/i.test(stage)) return {key:'schedule',icon:'ti-calendar-plus',label:'Schedule',bg:'#e6eefc',fg:'#1c4fb0'};
    var t=function(x){ var d=x?new Date(x).getTime():NaN; return isNaN(d)?0:d; };
    var last=Math.max(t(F['Last Follow Up At']), t(F['Last Comment At']), t(F['Stage Entered At']));
    if(last>0){ var days=(Date.now()-last)/86400000; if(days>=3) return {key:'followup',icon:'ti-alarm',label:'Follow up',bg:'#fbe3e3',fg:'#c93535'}; }
    return null;
  }
  function bfAttentionPill(F, stage){
    var a=bfAttentionInfo(F, stage); if(!a) return '';
    return '<span title="'+a.label+'" style="display:inline-flex;align-items:center;gap:3px;background:'+a.bg+';color:'+a.fg+';font-size:11px;font-weight:600;padding:3px 7px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.18);white-space:nowrap;"><i class="ti '+a.icon+'" style="font-size:12px;" aria-hidden="true"></i>'+a.label+'</span>';
  }
  function bfBoardTriage(){
    try{
      if(/\/(preview|view)\//.test(location.pathname)){ var ex0=document.getElementById('bf-triage'); if(ex0) ex0.style.display='none'; return; }
      var LAB={offer:'to send', followup:'to follow up', schedule:'to schedule'}; var ORD=['offer','followup','schedule'];
      var counts={}, total=0;
      document.querySelectorAll('[data-bfattn]').forEach(function(c){ var k=c.getAttribute('data-bfattn'); if(!k) return; counts[k]=(counts[k]||0)+1; total++; });
      var chip=document.getElementById('bf-triage');
      if(!total){ if(chip) chip.style.display='none'; return; }
      if(!chip){ chip=document.createElement('div'); chip.id='bf-triage'; chip.style.cssText='position:fixed;left:16px;bottom:16px;z-index:9000;background:#161616;color:#fff;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.28);display:flex;align-items:center;gap:7px;'; document.body.appendChild(chip); }
      chip.style.display='flex';
      var parts=[]; for(var i=0;i<ORD.length;i++){ var k=ORD[i]; if(counts[k]) parts.push(counts[k]+' '+LAB[k]); }
      chip.innerHTML='<i class="ti ti-bolt" style="font-size:14px;color:#ffd23f;" aria-hidden="true"></i><span>'+total+' need attention</span>'+(parts.length?'<span style="opacity:.62;font-weight:500;">\u00b7 '+parts.join(' \u00b7 ')+'</span>':'');
    }catch(e){}
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
  function agoShort(raw){
    var d=new Date(raw); if(isNaN(d.getTime())) return '';
    var m=Math.floor((Date.now()-d.getTime())/60000); if(m<0)m=0;
    if(m<1) return 'just now';
    if(m<60) return m+'m ago';
    var h=Math.floor(m/60); if(h<24) return h+'h ago';
    var dd=Math.floor(h/24); if(dd<7) return dd+'d ago';
    if(dd<30) return Math.floor(dd/7)+'w ago';
    return Math.floor(dd/30)+'mo ago';
  }

  function tile(lbl,val){
    return '<div><div style="font-size:11px;color:#7c7c7c;">'+lbl+'</div><div style="font-size:14px;font-weight:500;color:#161616;margin-top:1px;">'+(val?esc(money(val)):'—')+'</div></div>';
  }
  function _truthy(v){ v=(v||'').trim().toLowerCase(); return v!=='' && v!=='no' && v!=='false' && v!=='0' && v!=='off'; }
  function compTile(lbl,val,noflag){
    var inner = _truthy(noflag) ? '<span style="color:#9aa0a6;">No Offer</span>' : (val?esc(money(val)):'—');
    return '<div><div style="font-size:11px;color:#7c7c7c;">'+lbl+'</div><div style="font-size:14px;font-weight:500;color:#161616;margin-top:1px;">'+inner+'</div></div>';
  }

  /* ===== Stage-specific card buttons + inline fields ===== */
  var VIEW_SHEET_PAGE = 'https://mcarrigan0001.github.io/buyforce-site-code/offer-sheet.html';
  var GEN_SHEET_HOOK  = 'https://buyforce.app.n8n.cloud/webhook/ee9245fa-55fd-48a1-aba5-9e0093515f14';
  var CARD_DECODE_HOOK = 'https://buyforce.app.n8n.cloud/webhook/card-decode';
  var CARD_CONFIRM_HOOK = 'https://buyforce.app.n8n.cloud/webhook/card-confirm';

  /* inline field definitions. label = display label as it appears on the card
     (footer reads the current value by it); key = Noloco API field key (footer
     writes by it). NOTE: confirm `vin` matches the field your record Decode button reads. */
  var IF = {
    vin:      {label:'VIN',                            key:'vin',                        type:'text',     ph:'Enter VIN…', wide:true, al:['Vin','VIN #','VIN Number']},
    conmax:   {label:'CarMax Offer',                   key:'carMaxOffer',                type:'money',    ph:'$ —', al:['CarMax Value','Carmax Offer','Carmax Value']},
    convana:  {label:'Carvana Offer',                  key:'carvanaOffer',               type:'money',    ph:'$ —', al:['Carvana Value']},
    notes:    {label:'Condition Notes',                key:'conditionNotes',             type:'textarea', ph:'These notes will populate into the Notes for Appraisal, which you will paste in the appraisal notes within your appraisal tool.', al:['Condition Note','Vehicle Condition Notes']},
    accident: {label:'Accident History',               key:'accidentHistory',            type:'select',   al:['Accidents','Accident History?','Accident'],
               options:[['Clean','Clean','g'],['ACCIDENTS','Accident(s)','r']]},
    ncomp:    {label:'# Competing Vehicles',           key:'numberOfCompetingVehicles',  type:'number',   ph:'—', al:['# of Competing Vehicles','Number of Competing Vehicles','Competing Vehicles','# Competing']},
    days:     {label:'Est Dealer Days to Sale',        key:'estDealerDaysToSale',        type:'number',   ph:'—', al:['Estimated Dealer Days to Sale','Est. Dealer Days to Sale','Dealer Days to Sale']},
    pprv:     {label:'Est Private Party Retail Value', key:'estPrivatePartyRetailValue', type:'money',    ph:'$ —', al:['Estimated Private Party Retail Value','Est. Private Party Retail Value','Private Party Retail Value']},
    willtake: {label:'Seller Will Take',               key:'sellerWillTake',             type:'money',    ph:'$ —', al:['Seller Will Take Amount']},
    offer:    {label:'Offer Amount',                   key:'offerAmount',                type:'money',    ph:'$ —', al:['Offer']}
  };

  var STAGE_UI = {
    'Fresh Leads': { headline:'Start Conversation / Obtain VIN', layout: [
      {k:'info', text:'Check the photos and description for a VIN or Plate #, if none found, ask for the VIN.'},
      {k:'track', wt:{l:'Ask for the VIN', t:'Hi [First Name], love the [Model]. Could you share the VIN so I can research the history?'}},
      {k:'track', wt:{l:'Ask why selling', t:'Hey [First Name], love the [Model]. Can I ask why you’re selling it?'}},
      {k:'decode'},
      {k:'btn', b:{l:'Engaged / Asked for VIN', a:'stage', to:'Engaged - Awaiting VIN', p:1, i:'ti-message-2'}},
      {k:'btn', b:{l:'VIN Received', a:'stage', to:'VIN Received - Appraisal Needed', i:'ti-arrow-right'}}
    ] },
    'Engaged - Awaiting VIN': { headline:'Obtain VIN', layout: [
      {k:'track', wt:{l:'Follow up (6h+ no VIN)', t:'Just hoping to check out the CarFax and make an offer'}},
      {k:'track', wt:{l:'Follow up (24h+ no VIN)', t:'Hey [First Name], sorry to be sending another message, I’m just pretty interested in the [model]. Do you have a copy of the CarFax by chance you could share? If not, I don’t mind to get one, you just don’t have the VIN in your listing'}},
      {k:'decode'},
      {k:'btn', b:{l:'VIN Received', a:'stage', to:'VIN Received - Appraisal Needed', p:1, i:'ti-arrow-right'}}
    ] },
    'VIN Received - Appraisal Needed': { headline:'Obtain Competing Values & Create Appraisal', layout: [
      {k:'info', text:'Enter the values from CarMax and Carvana so the appraiser knows where the competition is on the vehicle. We should assume most sellers already know these offers.'},
      {k:'btn', b:{l:'Get CarMax Value',  a:'url', url:'https://www.carmax.com/sell-my-car',  i:'ti-external-link'}},
      {k:'field', f:'conmax'},
      {k:'btn', b:{l:'Get Carvana Value', a:'url', url:'https://www.carvana.com/sell-my-car', i:'ti-external-link'}},
      {k:'field', f:'convana'},
      {k:'field', f:'notes'},
      {k:'notes'},
      {k:'btn', b:{l:'Mark Appraisal Complete', a:'stage', to:'Appraisal Complete - Enter Offer Sheet Values', p:1, i:'ti-clipboard-check'}}
    ] },
    'Appraisal Complete - Enter Offer Sheet Values': { headline:'Generate & Send Offer Sheet', layout: [
      {k:'info', text:'View completed appraisal to obtain this information needed to generate the Offer Sheet.'},
      {k:'field', f:'accident'},
      {k:'field', f:'ncomp'},
      {k:'field', f:'days'},
      {k:'field', f:'conmax'},
      {k:'field', f:'convana'},
      {k:'field', f:'pprv'},
      {k:'track', wt:{l:'Send offer (send offer sheet image first)', t:'Thank you. I work with [Dealership], we’re interested in purchasing it for our inventory. Based on [CarFax]the miles, equipment, and what [model]s like it are selling for in the market, here’s where we can get to on it'}},
      {k:'btn', b:{l:'Generate Offer Sheet', a:'gensheet', p:1, i:'ti-file-invoice'}},
      {k:'btn', b:{l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'}},
      {k:'btn', b:{l:'Move to Offer Sheet Generated', a:'stage', to:'Offer Sheet Generated', p:1, i:'ti-arrow-right'}}
    ] },
    'Offer Sheet Generated': { headline:'Send Offer Sheet Image & Message', layout: [
      {k:'track', wt:{l:'Send offer (send offer sheet image first)', t:'Thank you. I work with [Dealership], we’re interested in purchasing it for our inventory. Based on [CarFax]the miles, equipment, and what [model]s like it are selling for in the market, here’s where we can get to on it'}},
      {k:'btn', b:{l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'}},
      {k:'btn', b:{l:'Move to Offer Sheet Sent', a:'stage', to:'Offer Sent (0-2 Days)', p:1, i:'ti-send'}}
    ] },
    'Offer Sent (0-2 Days)': { fields:['willtake'], buttons:[
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'},
      {l:'Generate New Offer Sheet', a:'regensheet', i:'ti-file-dollar'} ] },
    'Nurturing (Follow Up and Re-engage)': { headline:'Follow Up and Get Seller Re-engaged', fields:[], buttons:[
      {l:'Follow Up Sent', a:'followup', p:1, i:'ti-rotate-clockwise'},
      {l:'No Deal', a:'stage', to:'No Deal', i:'ti-x'} ] },
    'Appraisal Review Needed': { headline:'Enter the New Price the Seller Will Accept and Paste in Appraisal Notes', layout: [
      {k:'field', f:'willtake'},
      {k:'track', wt:{l:'Copy update for appraiser', t:'UPDATE: Seller will accept [[Seller Will Take]] - Please review appraisal and advise. - [[Rep/User Name]] [[Current Date]]'}},
      {k:'btn', b:{l:'Mark Review Complete', a:'stage', to:'Appraisal Review Complete', p:1, i:'ti-check'}},
      {k:'btn', b:{l:'Generate New Offer Sheet', a:'regensheet', i:'ti-file-dollar'}}
    ] },
    'Appraisal Review Complete': { headline:'Generate and Send New Offer Sheet & Message', layout: [
      {k:'field', f:'offer'},
      {k:'btn', b:{l:'Generate Updated Offer Sheet', a:'regensheet', i:'ti-file-dollar'}},
      {k:'btn', b:{l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'}},
      {k:'btn', b:{l:'Move to Verbal Yes - Schedule Appt', a:'stage', to:'Verbal Yes - Schedule Appt', p:1, i:'ti-progress-check'}},
      {k:'btn', b:{l:'Schedule Appt', a:'soon', i:'ti-calendar-plus'}},
      {k:'btn', b:{l:'Move to Nurturing', a:'stage', to:'Nurturing (Follow Up and Re-engage)', i:'ti-arrow-right'}}
    ] },
    'Verbal Yes - Schedule Appt': { headline:'Schedule Appt', fields:[], buttons:[
      {l:'Schedule Appt', a:'soon', i:'ti-calendar-plus'},
      {l:'Mark Scheduled', a:'stage', to:'Scheduled', p:1, i:'ti-calendar-check'} ] },
    'Scheduled': { headline:'Confirm Appt', layout: [
      {k:'apptin'},
      {k:'track', wt:{l:'Appt confirmation message (day before appt)', t:'Hey [First Name]! Just a reminder I have you down for [Appt Time] tomorrow.\n\nDon’t forget to bring both sets of keys (if you have 2), title if you have it (if not we can help take care of that), your drivers license and I’ll make sure you’re in and out, usually less than 30 min.\n\nThe address is:\n\n [Dealership Address]\n\nLooking forward to it!'}},
      {k:'btn', b:{l:'Acquired', a:'stage', to:'Acquired', p:1, i:'ti-circle-check'}},
      {k:'btn', b:{l:'Appt Shown - Did Not Buy', a:'choice', i:'ti-user-check', choices:[
        {l:'Schedule Purchase Appt Later', a:'stage', to:'Verbal Yes - Schedule Appt', i:'ti-calendar-plus'},
        {l:'Move to Appt Shown - Follow Up', a:'stage', to:'Appt Shown - Follow Up', i:'ti-phone'}
      ]}},
      {k:'btn', b:{l:'No Show', a:'stage', to:'Verbal Yes - Schedule Appt', i:'ti-user-x'}},
      {k:'btn', b:{l:'Mark Lost - Sold Elsewhere', a:'stage', to:'No Deal', i:'ti-x'}}
    ] },
    'Appt Shown - Follow Up': { headline:'Follow Up and Re-engage', fields:[], buttons:[
      {l:'Acquired', a:'stage', to:'Acquired', p:1, i:'ti-circle-check'},
      {l:'No Deal', a:'stage', to:'No Deal', i:'ti-x'} ] },
    'Acquired': { fields:[], buttons:[
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'} ] },
    'No Deal': { fields:[], buttons:[
      {l:'Reopen', a:'stage', to:'Nurturing (Follow Up and Re-engage)', i:'ti-rotate-clockwise'} ] }
  };

  function bfResolve(F, def){
    var cands=[def.label].concat(def.al||[]);
    for(var i=0;i<cands.length;i++){ var k=norm(cands[i]); if(Object.prototype.hasOwnProperty.call(F,k)) return {val:F[k]||'', label:cands[i]}; }
    return {val:'', label:def.label};
  }

  function bfInlineField(def, F, uuid, ro){
    var r=bfResolve(F, def); var val=r.val; var lbl=r.label;
    var wide=def.wide?' bf-fwide':'';
    var common = 'data-bfk="'+esc(def.key)+'" data-bfuuid="'+esc(uuid)+'" data-bftype="'+def.type+'" data-bflabel="'+esc(lbl)+'" data-bfval="'+esc(val)+'" data-bfph="'+esc(def.ph||'')+'"';
    if(def.type==='select'){
      var pills='';
      def.options.forEach(function(o){
        var on = norm(val).toLowerCase()===norm(o[0]).toLowerCase() || norm(val).toLowerCase()===norm(o[1]).toLowerCase();
        var cls='bf-pill'+(on?(o[2]==='g'?' gset':' rset'):'');
        pills += '<span class="'+cls+'" data-bfval="'+esc(o[0])+'">'+esc(o[1])+'</span>';
      });
      return '<div class="bf-f"><span class="bf-fl">'+esc(def.label)+'</span>'+
        '<div class="bf-fpills" '+common+'>'+pills+'</div></div>';
    }
    if(def.type==='textarea'){
      var disp = val ? esc(val) : '<span class="bf-ph">'+esc(def.ph||'')+'</span>';
      var copyBtn = def.copy ? '<i class="ti ti-copy bf-fcopy" title="Copy" aria-hidden="true"></i>' : '';
      return '<div class="bf-f bf-fcol"><span class="bf-fl">'+esc(def.label)+'</span>'+
        '<div class="bf-fta-wrap" '+common+'><div class="bf-fta">'+disp+'</div>'+
        '<div class="bf-facts">'+copyBtn+'<i class="ti ti-check bf-fsave" aria-hidden="true"></i></div></div></div>';
    }
    if(ro){
      return '<div class="bf-f"><span class="bf-fl">'+esc(def.label)+'</span>'+
        '<span class="bf-fi bf-fro'+wide+'"><span class="bf-fval">'+(val?esc(money(val)):'—')+'</span><i class="ti ti-lock bf-flock" aria-hidden="true"></i></span></div>';
    }
    var disp2 = val ? esc(money(val)) : '<span class="bf-ph">'+esc(def.ph||'—')+'</span>';
    return '<div class="bf-f'+(def.wide?' bf-fcol':'')+'"><span class="bf-fl">'+esc(def.label)+'</span>'+
      '<span class="bf-fi'+wide+'" '+common+'><span class="bf-fval">'+disp2+'</span><i class="ti ti-check bf-fsave" aria-hidden="true"></i></span></div>';
  }

  function bfBtnCls(b){ return 'bf-btn '+(b.p?'bf-btn-p':(b.g?'bf-btn-g':'bf-btn-s')); }
  function bfButton(b, uuid){
    if(b.choices){
      var sub=''; b.choices.forEach(function(c){ sub+=bfButton(c, uuid); });
      var bic=b.i?'<i class="ti '+b.i+'" aria-hidden="true"></i>':'';
      return '<div class="bf-choicewrap"><button type="button" class="'+bfBtnCls(b)+' bf-btn-choice" data-bfaction="choice" data-bfuuid="'+esc(uuid)+'">'+bic+'<span>'+esc(b.l)+'</span><i class="ti ti-chevron-down bf-choicecaret" aria-hidden="true"></i></button><div class="bf-choice">'+sub+'</div></div>';
    }
    var cls=bfBtnCls(b);
    var attrs='data-bfaction="'+b.a+'" data-bfuuid="'+esc(uuid)+'"';
    if(b.to) attrs+=' data-bfto="'+esc(b.to)+'"';
    if(b.url) attrs+=' data-bfurl="'+esc(b.url)+'"';
    var ic=b.i?'<i class="ti '+b.i+'" aria-hidden="true"></i>':'';
    return '<button type="button" class="'+cls+'" '+attrs+'>'+ic+'<span>'+esc(b.l)+'</span></button>';
  }

  function bfSellerFirst(F){
    var s=F['Seller Name']||'';
    if(!s){ var sub=F['Vehicle Subtitle']||''; var m=sub.match(/Seller:\s*(.+)$/i); if(m) s=m[1]; }
    s=(s||'').trim();
    return (s.split(/\s+/)[0]||'').trim();
  }
  function bfApptRaw(F){ return bfGet(F,['Appt Date and Time','Appointment Date/Time','Appointment Time','Scheduled Appt Time','Appt Date/Time','Appointment Date','Scheduled At','Appt Time','Appointment']); }
  function bfDateShort(iso){ var d=iso?new Date(iso):new Date(); if(isNaN(d.getTime())) d=new Date(); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); }
  function bfApptTimeStr(F){ var raw=bfApptRaw(F); if(!raw) return '[time]'; var d=new Date(raw); if(isNaN(d.getTime())) return '[time]'; var h=d.getHours(), m=d.getMinutes(), ap=h>=12?'PM':'AM', h12=h%12; if(h12===0)h12=12; return h12+(m?':'+(m<10?'0'+m:m):'')+' '+ap; }
  function bfApptIn(F){ var _CH='<div class="bf-confirm-head">Confirm Appointment</div>'; var raw=bfApptRaw(F); if(!raw) return _CH+'<div class="bf-info">Add an Appointment Date/Time field on the opportunity to show the countdown.</div>'; var d=new Date(raw); if(isNaN(d.getTime())) return ''; var ms=d.getTime()-Date.now(); var col,lbl; if(ms<=0){ col='#c93535'; lbl='Appt time has passed'; } else { col='#2b6012'; lbl='Appt in: '+fmtDuration(Math.floor(ms/60000)); } return _CH+'<div class="bf-apptin" style="border-color:'+col+';color:'+col+';"><i class="ti ti-clock-hour-4" aria-hidden="true"></i>'+esc(lbl)+'</div>'; }
  function bfFillTrack(t, F){
    var first=bfSellerFirst(F)||'there';
    var model=F['Model']||F['Vehicle Model']||'vehicle';
    var dealer=F['Dealership']||F['Dealer']||'our dealership';
    var acc=(F['Accident History']||'').toLowerCase();
    var carfax=(acc.indexOf('accident')>-1)?'the CarFax history, ':'';
    var willtake=money(F['Seller Will Take']||'')||'$___';
    var rep=bfGet(F,['Rep','Rep/User Name','Assigned User','Assigned To','Owner','User','Sales Rep'])||'[your name]';
    var cdate=bfDateShort(bfGet(F,['Stage Entered At']));
    var apptaddr=bfGet(F,['Dealership Address'])||'[dealership address]';
    var appttime=bfApptTimeStr(F);
    var mileage=bfGet(F,['Mileage','Miles','Odometer'])||'';
    var askingv=money(F['Asking Price']||'')||'';
    var offerv=money(F['Offer Amount']||'')||'';
    var acvv=money(F['ACV']||'')||'';
    var colorv=bfGet(F,['Color','Exterior Color','Ext Color'])||'';
    var trimv=bfGet(F,['Trim','Trim Level'])||'';
    return t.replace(/\[First Name\]/gi, first)
            .replace(/\[Model\]/gi, model)
            .replace(/\[Dealership Address\]/gi, apptaddr)
            .replace(/\[Dealership\]/gi, dealer)
            .replace(/\[Appt Time\]/gi, appttime)
            .replace(/\[CarFax\]/gi, carfax)
            .replace(/\[Mileage\]/gi, mileage)
            .replace(/\[Asking\]/gi, askingv)
            .replace(/\[Offer\]/gi, offerv)
            .replace(/\[ACV\]/gi, acvv)
            .replace(/\[Color\]/gi, colorv)
            .replace(/\[Trim\]/gi, trimv)
            .replace(/\[\[Seller Will Take\]\]/gi, willtake)
            .replace(/\[\[Rep\/User Name\]\]/gi, rep)
            .replace(/\[\[Current Date[^\]]*\]\]/gi, cdate);
  }
  function bfTrack(wt, F){
    var filled=bfFillTrack(wt.t, F);
    return '<div class="bf-f bf-fcol"><span class="bf-fl">'+esc(wt.l)+'</span>'+
      '<div class="bf-wt" data-bfwt="'+esc(filled)+'"><span class="bf-wttext">'+esc(filled)+'</span><i class="ti ti-copy bf-wtcopy" aria-hidden="true"></i></div></div>';
  }
  function bfGet(F, cands){ for(var i=0;i<cands.length;i++){ var v=F[cands[i]]; if(v!==undefined && v!=='') return v; } return ''; }
  function bfDecodePanel(F, uuid){
    var st=(bfGet(F,['Decode Status','decodeStatus','Decode status'])||'').toUpperCase();
    if(st==='PENDING_CONFIRM'){
      var y=bfGet(F,['Staged Year','stagedYear','Decoded Year']);
      var mk=bfGet(F,['Staged Make','stagedMake','Decoded Make']);
      var md=bfGet(F,['Staged Model','stagedModel','Decoded Model']);
      var tr=bfGet(F,['Staged Trim','stagedTrim','Decoded Trim']);
      var ymmt=[y,mk,md,tr].filter(function(x){return x;}).join(' ');
      return '<div class="bf-decodecard"><div class="bf-declabel">Decoded \u2014 is this the vehicle?</div>'+
        '<div class="bf-decymmt">'+esc(ymmt||'No data returned')+'</div>'+
        '<div class="bf-btns">'+
        '<button type="button" class="bf-btn bf-btn-p" data-bfaction="confirmvin" data-bfuuid="'+esc(uuid)+'"><i class="ti ti-check" aria-hidden="true"></i><span>Confirm Vehicle</span></button>'+
        '<button type="button" class="bf-btn bf-btn-s" data-bfaction="denyvin" data-bfuuid="'+esc(uuid)+'"><i class="ti ti-x" aria-hidden="true"></i><span>Not correct \u2014 re-enter</span></button>'+
        '</div></div>';
    }
    return bfFieldHtml('vin', F, uuid) + '<div class="bf-btns"><button type="button" class="bf-btn bf-btn-s" data-bfaction="decode" data-bfuuid="'+esc(uuid)+'"><i class="ti ti-scan" aria-hidden="true"></i><span>Decode</span></button></div>';
  }
  function bfNotesPreview(F){
    var notes=F['Notes for Appraisal']||F['Notes For Appraisal']||F['Appraisal Notes']||'';
    var disp = notes ? esc(notes) : '<span class="bf-ph">No appraisal notes yet</span>';
    return '<div class="bf-f bf-fcol"><span class="bf-fl">Copy Notes for Appraisal</span>'+
      '<div class="bf-wt bf-wt-clamp" data-bfwt="'+esc(notes)+'" data-bftoast="Appraisal notes copied"><span class="bf-wttext">'+disp+'</span><i class="ti ti-copy bf-wtcopy" aria-hidden="true"></i></div></div>';
  }

  function bfFieldHtml(id, F, uuid){
    var ro=false; if(id==='willtake_ro'){ ro=true; id='willtake'; }
    var def=IF[id]; return def ? bfInlineField(def, F, uuid, ro) : '';
  }
  function renderStageUI(F, card, uuid){
    var ui = STAGE_UI[stageOf(card)];
    if(!ui) return '';
    var html='';
    if(ui.layout){
      var inner='';
      ui.layout.forEach(function(it){
        if(it.k==='btn'){ if(it.b.showEmpty && (F[it.b.showEmpty]||'').trim()) return; inner += bfButton(it.b, uuid); }
        else if(it.k==='field'){ inner += bfFieldHtml(it.f, F, uuid); }
        else if(it.k==='track'){ inner += bfTrack(it.wt, F); }
        else if(it.k==='notes'){ inner += bfNotesPreview(F); }
        else if(it.k==='info'){ inner += '<div class="bf-info">'+esc(it.text)+'</div>'; }
        else if(it.k==='decode'){ inner += bfDecodePanel(F, uuid); }
        else if(it.k==='apptin'){ inner += bfApptIn(F); }
      });
      if(inner) html += '<div class="bf-stack">'+inner+'</div>';
    } else {
      if(ui.tracks && ui.tracks.length){
        var th=''; ui.tracks.forEach(function(wt){ th += bfTrack(wt, F); });
        if(th) html += '<div class="bf-tracks">'+th+'</div>';
      }
      if(ui.fields && ui.fields.length){
        var fh=''; ui.fields.forEach(function(fid){ fh += bfFieldHtml(fid, F, uuid); });
        if(fh) html += '<div class="bf-fields">'+fh+'</div>';
      }
      if(ui.buttons && ui.buttons.length){
        var bh=''; ui.buttons.forEach(function(b){ if(b.showEmpty && (F[b.showEmpty]||'').trim()) return; bh += bfButton(b, uuid); });
        if(bh) html += '<div class="bf-btns">'+bh+'</div>';
      }
    }
    if(!html) return '';
    var ov=bfLS('bfcol:'+uuid);
    var collapsed = (ov!==null) ? (ov==='1') : (bfLS('bfcoldef')==='1');
    var caret = collapsed?'ti-chevron-down':'ti-chevron-up';
    return '<div class="bf-actions'+(collapsed?' bf-collapsed':'')+'">'+
      '<div class="bf-collapse-bar" data-bfuuid="'+esc(uuid)+'" title="Collapse / expand actions"><span class="bf-collapse-line"></span><i class="ti '+caret+' bf-collapse-ic" aria-hidden="true"></i><span class="bf-collapse-line"></span></div>'+
      '<div class="bf-stageui">'+(ui.headline?'<div class="bf-headline">'+esc(ui.headline)+'</div>':'')+html+'</div></div>';
  }

  function bfFitTitle(scope, startSize){
    var start = startSize || 14;
    var els=(scope||document).querySelectorAll('.bf-title');
    for(var i=0;i<els.length;i++){
      var el=els[i]; if(!el.clientWidth) continue;
      var size=start; el.style.fontSize=start+'px'; var g=0;
      while(el.scrollWidth>el.clientWidth+0.5 && size>10 && g<24){ size-=0.5; el.style.fontSize=size+'px'; g++; }
    }
  }
  function buildCard(F, card){
    var comp = compInfo(F['Competition']);
    var eq = bfCardEquity(F);
    var asking = F['Asking Price'];
    var willTake = F['Seller Will Take'];

    var askInner;
    var wtNum=parseFloat((willTake||'').replace(/[^0-9.]/g,''));
    var akNum=parseFloat((asking||'').replace(/[^0-9.]/g,''));
    if(!isNaN(wtNum) && wtNum>0 && wtNum!==akNum){
      askInner = '<div style="font-size:11px;color:#7c7c7c;">Asking</div>'+
        '<div style="font-size:14px;font-weight:500;color:#161616;display:flex;align-items:center;justify-content:center;gap:3px;">'+esc(money(willTake))+'<i class="ti ti-arrow-down-right" style="font-size:13px;color:#2b6012;margin-right:-16px;" aria-hidden="true"></i></div>'+
        (asking?'<div style="font-size:10px;color:#b4b2a9;text-decoration:line-through;">was '+esc(money(asking))+'</div>':'');
    } else {
      askInner = '<div style="font-size:11px;color:#7c7c7c;">Asking</div><div style="font-size:14px;font-weight:500;color:#161616;margin-top:1px;">'+(asking?esc(money(asking)):'—')+'</div>';
    }

    var oc = comp ? COMPC[comp.color] : null;
    var offerTile = '<div>'+
      '<div style="font-size:11px;color:#7c7c7c;">Offer</div>'+
      '<div style="font-size:14px;font-weight:500;color:'+(oc?oc.fg:'#161616')+';">'+(F['Offer Amount']?esc(money(F['Offer Amount'])):'—')+'</div></div>';

    var equityTile = '<div><div style="font-size:14px;font-weight:500;color:'+eq.color+';">'+eq.text+'</div></div>';

    var grid = '<div class="bf-grid" style="padding-top:0;">'+
      '<div>'+askInner+'</div>'+ tile('ACV',F['ACV']) + offerTile + '</div>';
    var priceLabel = '<div class="bf-seclbl bf-thdiv" style="margin-top:0.25px;padding-top:5px;margin-bottom:1.5px;">Price &amp; Valuation</div>';

    var _accL=(F['Accident History']||'').trim().toLowerCase(); var _accPill='';
    if(_accL.indexOf('accident')>-1) _accPill='<span style="display:inline-flex;align-items:center;gap:4px;background:#fbeecd;color:#7a4d13;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.18);"><i class="ti ti-alert-triangle" style="font-size:12px;" aria-hidden="true"></i>Accident(s)</span>';
    else if(_accL.indexOf('clean')>-1) _accPill='<span style="display:inline-flex;align-items:center;gap:4px;background:#e3f5cf;color:#2b6012;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.18);"><i class="ti ti-shield-check" style="font-size:12px;" aria-hidden="true"></i>Clean History</span>';
    var _beatsPill='';
    if(comp){ var c=COMPC[comp.color]; _beatsPill='<span style="display:flex;width:100%;box-sizing:border-box;align-items:center;justify-content:center;gap:5px;background:'+c.bg+';color:'+c.fg+';font-size:11px;font-weight:700;padding:4px 14px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.18);"><i class="ti '+comp.icon+'" style="font-size:12px;" aria-hidden="true"></i>'+comp.label+'</span>'; }
    var _pillsSolo = ((_beatsPill?1:0)+(_accPill?1:0)===1);
    var _pillsRow = (_beatsPill||_accPill) ? '<div class="bf-comp-pills'+(_pillsSolo?' bf-pills-solo':'')+'">'+
      (_beatsPill?'<div class="bf-pillcell">'+_beatsPill+'</div>':'')+
      (_accPill?'<div class="bf-pillcell bf-pillcell-c">'+_accPill+'</div>':'')+
    '</div>' : '';
    var compBlock = '<div class="bf-comp">'+
      '<div class="bf-comp2">'+
        '<div class="bf-comp-left">'+
          '<div class="bf-seclbl">Competition</div>'+
          '<div class="bf-comprow2">'+ compTile('CarMax',F['CarMax Offer'],F['CarMax No Offer']) + compTile('Carvana',F['Carvana Offer'],F['Carvana No Offer']) +'</div>'+
        '</div>'+
        '<div class="bf-comp-right">'+
          '<div class="bf-seclbl">Equity</div>'+
          '<div class="bf-eqcell">'+
            '<div class="bf-eqsub">Amount</div>'+
            '<div class="bf-eqval" style="color:'+eq.color+';">'+eq.text+'</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
      _pillsRow +
    '</div>';

    var metaParts=[];
    var la=listedAgo(F['Date Listed']);
    if(la) metaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;flex:none;white-space:nowrap;"><i class="ti ti-calendar" style="font-size:12px;" aria-hidden="true"></i>'+la+'</span>');
    if(F['Listing Location']) metaParts.push('<span style="display:inline-flex;align-items:center;gap:3px;"><i class="ti ti-map-pin" style="font-size:12px;flex:none;" aria-hidden="true"></i><span style="white-space:nowrap;">'+esc(F['Listing Location'])+'</span></span>');
    var meta = metaParts.length ? '<div style="display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:3px;font-size:11px;color:#888780;">'+metaParts.join('')+'</div>' : '';

    var _n=function(x){var m=(x||'').replace(/[^0-9.]/g,'');return m?parseFloat(m):NaN;};
    var _acv=_n(F['ACV']);
    var _wt=_n(F['Seller Will Take']);
    var _ask=(!isNaN(_wt)&&_wt>0)?_wt:_n(F['Asking Price']);
    var _off=_n(F['Offer Amount']);
    var _badge='';
    if(!isNaN(_acv)&&_acv>0&&!isNaN(_ask)){
      var _cmp=compInfo(F['Competition']);
      var _cs=_cmp?(_cmp.color==='g'?40:(_cmp.color==='y'?15:0)):0;
      var _prem=_ask-_acv;
      var _ds=_prem<=2000?30:(_prem<=3000?25:(_prem<=4000?15:(_prem<=5000?7.5:0)));
      var _pct=_prem/_acv;
      var _ps=_pct<=0?20:(_pct>=0.20?0:20*(1-_pct/0.20));
      var _eqp=_n(F['Est Equity Position']);
      var _es=isNaN(_eqp)?0:(_eqp>=2000?10:(_eqp<=0?0:10*(_eqp/2000)));
      var _score=Math.round(_cs+_ds+_ps+_es);
      var _tier=_score>=75?{bg:'#e3f5cf',fg:'#2b6012',l:'Hot'}:(_score>=50?{bg:'#fbeecd',fg:'#7a4d13',l:'Warm'}:{bg:'#eceae3',fg:'#6b6b64',l:'Cool'});
      _badge='<span title="'+_tier.l+' '+_score+'/100 (beats '+_cs+', $gap '+Math.round(_ds)+', %gap '+Math.round(_ps)+', equity '+Math.round(_es)+')" style="flex:none;display:inline-flex;align-items:center;gap:3px;background:'+_tier.bg+';color:'+_tier.fg+';font-size:11px;font-weight:500;padding:3px 6px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.18);"><i class="ti ti-flame" style="font-size:12px;" aria-hidden="true"></i>'+_score+'</span>';
    }
    var _listing = F['Listing Link'] ? '<button type="button" class="bf-listing" data-bfurl="'+esc(F['Listing Link'])+'" title="View listing" aria-label="View listing"><i class="ti ti-external-link" aria-hidden="true"></i></button>' : '';
    var _dt=(F['Drive Time to Listing']||'').trim(); var _dist=(F['Distance to Listing']||'').trim();
    var _travel='';
    if(_dt||_dist){
      _travel='<div title="Travel distance / time to listing" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;font-size:11px;font-weight:600;color:#5b5f57;white-space:nowrap;margin-top:2px;">'+
        (_dist?'<div style="display:flex;align-items:center;gap:3px;"><i class="ti ti-route" style="font-size:12px;color:#9aa0a6;flex:none;" aria-hidden="true"></i>'+esc(_dist)+'</div>':'')+
        (_dt?'<div style="display:flex;align-items:center;gap:3px;"><i class="ti ti-clock-hour-4" style="font-size:12px;color:#9aa0a6;flex:none;" aria-hidden="true"></i>'+esc(_dt)+'</div>':'')+
      '</div>';
    }
    var _ai0 = bfAttentionInfo(F, stageOf(card)); var _attn = _ai0 ? bfAttentionPill(F, stageOf(card)) : '';
    try{ if(card){ if(_ai0) card.setAttribute('data-bfattn', _ai0.key); else card.removeAttribute('data-bfattn'); } }catch(_ae){}
    var _topRight = (_attn||_badge||_listing) ? '<div style="display:flex;align-items:center;gap:6px;flex:none;">'+_attn+_badge+_listing+'</div>' : '';
    var _right = (_listing||_badge||_travel) ? '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none;">'+_topRight+_travel+'</div>' : '';
    var _sub=(F['Vehicle Subtitle']||'').replace(/(\d{3,})(\s*miles)/i, function(m,n,suf){ return Number(n).toLocaleString('en-US')+suf; });
    var _subM=_sub, _subSeller=''; var _sm=_sub.split(/\s*·\s*Seller:\s*/i); if(_sm.length>1){ _subM=_sm[0]; _subSeller=_sm[1]; }
    var _vinLine = F['VIN'] ? '<div class="bf-vincopy" data-bfvin="'+esc(F['VIN'])+'" title="Click to copy VIN" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;margin-top:3px;max-width:100%;font-size:10px;color:#9aa0a6;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px;"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">VIN '+esc(F['VIN'])+'</span><i class="ti ti-copy" style="font-size:11px;flex:none;" aria-hidden="true"></i></div>' : '';
    var header='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:9px;"><div style="min-width:0;"><div class="bf-title" style="font-size:14px;font-weight:700;color:#161616;line-height:1.25;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:clip;">'+esc(F['Vehicle Title']||'')+'</div>'+ _vinLine +
      (_subM?'<div style="font-size:11px;color:#7c7c7c;margin-top:3px;line-height:1.3;">'+esc(_subM)+'</div>':'')+
      (_subSeller?'<div style="font-size:11px;color:#7c7c7c;margin-top:3px;line-height:1.3;">Seller: '+esc(_subSeller)+'</div>':'')+ meta +'</div>'+ _right +'</div>';

    var clock='';
    var se=F['Stage Entered At'];
    var lf=F['Last Follow Up At'];
    var seT=se?new Date(se).getTime():NaN;
    var lfT=lf?new Date(lf).getTime():NaN;
    var baseT=seT;
    if(!isNaN(lfT) && (isNaN(seT)||lfT>seT)) baseT=lfT;
    if(!isNaN(baseT)){ var ci=bfClockInfo(stageOf(card), baseT); clock='<div class="bf-clock" data-bf-base="'+baseT+'" data-bf-stage="'+esc(stageOf(card))+'" style="border-top:1px solid #8a8a8a;margin-top:11px;padding-top:9px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:'+ci.wt+';color:'+ci.txtCol+';"><span class="bf-clock-dot" style="width:8px;height:8px;border-radius:50%;background:'+ci.dotCol+';flex:none;"></span><i class="ti ti-clock" style="font-size:13px;color:#a09e96;" aria-hidden="true"></i><span class="bf-clock-lbl">'+ci.lbl+'</span></div>'; }

    var _uuid = (function(){ var h=card.getAttribute('href')||''; var mm=h.match(/(rec[0-9a-z]+)/i); return mm?mm[1]:''; })();
    var _stg = stageOf(card);
    var _checks = STATUS_CHECKS[_stg] || [];
    var _noDeal = (_stg === 'No Deal');
    var _done = 0, _items = '';
    for (var mi = 0; mi < MILESTONES.length; mi++) {
      var _label = MILESTONES[mi];
      var _ok = (_label === 'Competing values') ? !!(_uuid && bfLS('bfcv:'+_uuid)==='1') : (_checks.indexOf(mi) > -1);
      if (_ok) _done++;
      var _circ;
      if (_ok) _circ = '<span style="width:15px;height:15px;border-radius:50%;background:#3b6d11;color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:none;"><i class="ti ti-check" style="font-size:10px;" aria-hidden="true"></i></span>';
      else if (_noDeal) _circ = '<span style="width:15px;height:15px;border-radius:50%;background:#fbe3e3;color:#c93535;display:inline-flex;align-items:center;justify-content:center;flex:none;"><i class="ti ti-x" style="font-size:10px;" aria-hidden="true"></i></span>';
      else _circ = '<span style="width:15px;height:15px;border-radius:50%;border:1.5px solid #d3d1c7;flex:none;display:inline-block;"></span>';
      var _ctype = (_label==='Competing values') ? 'cv' : (CLICK_STAGE[_label] ? 'stage' : '');
      var _attr = _ctype ? (' class="bf-ms" data-bfclick="'+_ctype+'"'+(_ctype==='stage'?' data-bfstage="'+esc(CLICK_STAGE[_label])+'"':'')) : '';
      var _cur = _ctype ? 'cursor:pointer;' : '';
      _items += '<div'+_attr+' style="display:flex;align-items:center;gap:5px;'+_cur+'">' + _circ +
        '<span style="font-size:10px;line-height:1.15;color:' + (_ok ? '#3b3b38' : (_noDeal ? '#c93535' : '#9aa0a6')) + ';text-align:left;">' + _label.replace(/ /g,'<br>') + '</span></div>';
    }
    var _pct = MILESTONES.length ? (_done / MILESTONES.length) : 0;
    var _C = (2 * Math.PI * 6);
    var _ringColor = _noDeal ? '#c93535' : '#92df02';
    var _ring = '<svg width="14" height="14" viewBox="0 0 16 16" style="flex:none;display:block;">' +
      '<circle cx="8" cy="8" r="6" fill="none" stroke="#e3e1d8" stroke-width="2.5"></circle>' +
      '<circle cx="8" cy="8" r="6" fill="none" stroke="' + _ringColor + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + _C.toFixed(2) + '" stroke-dashoffset="' + (_C * (1 - _pct)).toFixed(2) + '" transform="rotate(-90 8 8)"></circle></svg>';
    var checklist = '<div style="border-top:1px solid #8a8a8a;padding-top:5.25px;padding-bottom:10px;margin-bottom:1px;">' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4.5px;">' + _ring +
      '<span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#6b6b64;">DEAL PROGRESS</span>' +
      '<span style="font-size:10px;color:#9aa0a6;"> · ' + _done + ' of ' + MILESTONES.length + '</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px 6px;padding:0 22px;">' + _items + '</div></div>';
    var _lc = F['Last Comment'];
    var commentLine = '';
    if (_lc) {
      var _txt = _lc.length > 60 ? _lc.slice(0,60).trim() + '…' : _lc;
      var _ago = F['Last Comment At'] ? agoShort(F['Last Comment At']) : '';
      commentLine = '<div class="bf-comment" style="display:flex;align-items:center;gap:5px;margin:8px -4px 0;padding:3px 4px;font-size:11px;color:#6b6b64;cursor:pointer;">' +
        '<i class="ti ti-message-2" style="font-size:13px;color:#9aa0a6;flex:none;" aria-hidden="true"></i>' +
        '<span style="line-height:1.3;flex:1;min-width:0;">“' + esc(_txt) + '”' + (_ago ? '<span style="color:#9aa0a6;"> · ' + _ago + '</span>' : '') + '</span>' +
        '<i class="ti ti-pencil bf-comment-hint" style="font-size:12px;color:#b4b2a9;flex:none;" aria-hidden="true"></i></div>';
    } else {
      commentLine = '<div class="bf-comment" style="display:flex;align-items:center;gap:5px;margin:8px -4px 0;padding:3px 4px;font-size:11px;color:#b4b2a9;cursor:pointer;">' +
        '<i class="ti ti-message-2" style="font-size:13px;color:#b4b2a9;flex:none;" aria-hidden="true"></i>No comments yet' +
        '<i class="ti ti-pencil bf-comment-hint" style="font-size:12px;color:#b4b2a9;flex:none;margin-left:auto;" aria-hidden="true"></i></div>';
    }
    var commentLabel = '<div class="bf-seclbl" style="margin-top:5.25px;margin-bottom:1.5px;">Comments</div>';
    return header + checklist + priceLabel + grid + compBlock + commentLabel + commentLine + renderStageUI(F, card, _uuid) + clock;
  }

  function bfDecorateCard(card, force){
    if(bfEditing) return;
    if(card.getAttribute('data-bfmoved')) return;
    var firstCell = card.querySelector('[data-testid="field-cell"]');
    if(!firstCell) return;
    var container = firstCell.parentNode;
    if(!container) return;
    var F = {};
    container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){
      var lab = cell.querySelector('[data-testid="field-cell-label"]');
      if(!lab) return;
      var vNode = lab.nextElementSibling;
      F[norm(lab.textContent)] = dval(vNode ? vNode.textContent : '');
    });
    if(!('Vehicle Title' in F) && !('Offer Amount' in F)) return;
    var raw = [F['Vehicle Title'],F['Vehicle Subtitle'],F['Date Listed'],F['Listing Location'],F['Asking Price'],F['Seller Will Take'],F['ACV'],F['Offer Amount'],F['CarMax Offer'],F['Carvana Offer'],F['Competition'],F['Equity Display'],F['Estimated Payoff Amount'],F['Estimated Payoff Value'],F['CarMax No Offer'],F['Carvana No Offer'],F['No Payoff'],F['Stage Entered At'],F['Last Comment'],F['Last Comment At'],F['Offer Sheet Image URL'],F['Offer Sheet Status'],F['Last Follow Up At'],F['VIN'],F['Condition Notes'],F['Accident History'],F['# Competing Vehicles'],F['Est Dealer Days to Sale'],F['Est Private Party Retail Value'],F['Est Equity Position'],F['Equity Status'],F['Notes for Appraisal'],F['Model'],F['Listing Link'],stageOf(card)].join('|');
    var body = container.querySelector(':scope > .bf-body');
    if(body && !force && body.getAttribute('data-raw')===raw){
      container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){ if(cell.style.display!=='none') cell.style.display='none'; });
      return;
    }
    if(!body){ body=document.createElement('div'); body.className='bf-body'; container.appendChild(body); }
    body.innerHTML = buildCard(F, card);
    bfFitTitle(body);
    body.setAttribute('data-raw', raw);
    container.querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){ cell.style.display='none'; });
  }
  var bfIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ bfIO.unobserve(en.target); bfDecorateCard(en.target, false); } });
  }, { root: null, rootMargin: '900px 900px', threshold: 0 }) : null;
  var bfVirtIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.remove('bf-vhidden'); }
      else { en.target.classList.add('bf-vhidden'); }
    });
  }, { root: null, rootMargin: '600px 600px', threshold: 0 }) : null;
  function addCards(force){
    if(bfEditing) return;
    var onR=/\/(preview|view)\//.test(location.pathname);
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
      if(card.getAttribute('data-bfmoved')) return;
      if(bfVirtIO && !onR) bfVirtIO.observe(card);
      if(card.querySelector('.bf-body')){ bfDecorateCard(card, force); return; }
      if(bfIO && !force && !onR){ bfIO.observe(card); }
      else { bfDecorateCard(card, force); }
    });
  }

  var bfArrowR, bfArrowL, bfBusy=false, bfArrowResize=false;
  var bfBackdrop;
  var bfCloseBtn;
  function bfRecSecClass(){ if(!/\/(preview|view)\//.test(location.pathname)) return; document.querySelectorAll('[data-testid="details-section"]').forEach(function(sx){ sx.classList.toggle('bf-sec-collapsed', !sx.querySelector('form')); }); }
  var bfCollapsedFor=null;
  function bfRecCollapseDefault(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var key=location.pathname; if(bfCollapsedFor===key) return;
    var secs=document.querySelectorAll('[data-testid="details-section"]');
    if(secs.length<3) return;
    var raw=''; try{ raw=localStorage.getItem('noloco.recordDetailSectionExpanded')||''; }catch(e){}
    var json={}; try{ json=raw?JSON.parse(raw):{}; }catch(e){}
    [].forEach.call(secs,function(sec){
      var node=sec,id=null; for(var i=0;i<8&&node;i++){ if(node.id&&/^(elm|sec)/.test(node.id)){id=node.id;break;} node=node.parentElement; }
      var expanded=!!sec.querySelector('form')||(id&&json[id]===true);
      if(expanded){ var h=sec.querySelector('h2'); if(h){ var hdr=h.closest('[role="button"]')||h.parentElement; if(hdr) hdr.click(); } }
    });
    bfCollapsedFor=key;
  }
  function bfDeb(fn,ms){ var t; return function(){ clearTimeout(t); t=setTimeout(fn,ms||160); }; }
  var bfFlipL=null, bfFlipR=null, bfFlipOrder=null, bfFlipCount=0, bfBoardDirty=true;
  var bfPipeBd=null,bfPipeSnap=null,bfPipeAL=null,bfPipeAR=null; var BF_PIPE_EL='vewCcJTaXm4WOtOcuaCNz1a7';
  function bfBuildFullOrder(){
    var groups=[].slice.call(document.querySelectorAll('[data-testid="collection-group"]'));
    if(!groups.length) return null;
    var edges=null;
    try{
      var g0=groups[0]; var fk=Object.keys(g0).find(function(k){return k.indexOf('__reactFiber')===0;});
      var node=g0[fk],d=0;
      while(node&&d<60){ var p=node.memoizedProps; if(p){ for(var k in p){ var v=p[k]; if(v&&typeof v==='object'&&Array.isArray(v.edges)&&v.edges.length>10){ edges=v.edges; break; } } } if(edges)break; node=node.return; d++; }
    }catch(e){}
    if(!edges) return null;
    var byStatus={}, valid={};
    edges.forEach(function(ed){ var r=ed&&ed.node; if(r&&r.uuid){ var st=String(r.status); (byStatus[st]=byStatus[st]||[]).push(r.uuid); valid[st]=1; } });
    function grpStatus(gr){
      try{ var fk2=Object.keys(gr).find(function(k){return k.indexOf('__reactFiber')===0;}); var n=gr[fk2],dd=0;
        while(n&&dd<20){ var p2=n.memoizedProps; if(p2){ for(var k2 in p2){ var v2=p2[k2]; if(typeof v2==='string'&&valid[v2]) return v2; if(v2&&typeof v2==='object'){ if(typeof v2.value==='string'&&valid[v2.value]) return v2.value; if(typeof v2.key==='string'&&valid[v2.key]) return v2.key; } } } n=n.return; dd++; } }catch(e){}
      return null;
    }
    var order=[], seen={};
    groups.forEach(function(gr){
      var st=grpStatus(gr); if(!st||!byStatus[st]) return;
      var col=norm(((gr.querySelector('[data-testid="collection-group-header-label"]')||{}).textContent||''));
      byStatus[st].forEach(function(u){ if(!seen[u]){ seen[u]=1; order.push({u:u,col:col}); } });
    });
    Object.keys(byStatus).forEach(function(st){ byStatus[st].forEach(function(u){ if(!seen[u]){ seen[u]=1; order.push({u:u,col:''}); } }); });
    return order.length?order:null;
  }
  var bfSwipeBound=false;
  function bfRecSwipe(){
    if(bfSwipeBound) return; bfSwipeBound=true;
    var panel=null, sx=0, sy=0, dir=0, w=0;
    function getPanel(){ var rv=document.querySelector('[data-testid="record-view"]'); if(!rv) return null; return rv.closest('[class*="inset-y-0"]')||rv.parentElement; }
    function clearStyles(p){ p.style.transition=''; p.style.transform=''; p.style.opacity=''; p.style.willChange=''; }
    document.addEventListener('touchstart', function(e){
      panel=null; dir=0;
      if(location.pathname.indexOf('/preview/')<0) return;
      if(!e.touches||e.touches.length!==1) return;
      var tgt=e.target;
      if(tgt&&tgt.closest&&tgt.closest('input,textarea,[contenteditable],select,button,a,[role="button"],[data-testid="action-button"],.bf-flip,.bf-rectop,.bf-sidebar')) return;
      var p=getPanel(); if(!p) return;
      var t=e.touches[0]; var pr=p.getBoundingClientRect();
      if((t.clientY - pr.top) < 100) return;
      panel=p; sx=t.clientX; sy=t.clientY; w=(pr.width)||window.innerWidth;
    }, {passive:true});
    document.addEventListener('touchmove', function(e){
      if(!panel||!e.touches||!e.touches.length) return;
      var t=e.touches[0]; var dx=t.clientX-sx, dy=t.clientY-sy;
      if(dir===0){
        if(Math.abs(dx)<6 && Math.abs(dy)<6) return;
        dir = (Math.abs(dx)>Math.abs(dy)*1.25) ? 1 : -1;   /* lock direction; -1 = vertical, leave scroll alone */
        if(dir===1){ panel.style.transition='none'; panel.style.willChange='transform'; }
      }
      if(dir===1){
        if(e.cancelable) e.preventDefault();               /* block vertical scroll while dragging across */
        var hasTarget = dx<0 ? (bfFlipR&&bfFlipR.style.display!=='none') : (bfFlipL&&bfFlipL.style.display!=='none');
        var move = hasTarget ? dx : dx*0.25;                /* rubber-band when no card that direction */
        panel.style.transform='translateX('+move+'px)';
        panel.style.opacity=String(Math.max(0.55, 1-Math.abs(move)/(w*1.6)));
      }
    }, {passive:false});
    document.addEventListener('touchend', function(e){
      if(!panel||dir!==1){ panel=null; return; }
      var t=e.changedTouches&&e.changedTouches[0]; var dx=t?t.clientX-sx:0;
      var threshold=Math.min(110, w*0.28);
      var go=null;
      if(dx<=-threshold){ if(bfFlipR&&bfFlipR.style.display!=='none') go=bfFlipR.getAttribute('data-bfgo'); }
      else if(dx>=threshold){ if(bfFlipL&&bfFlipL.style.display!=='none') go=bfFlipL.getAttribute('data-bfgo'); }
      var p=panel; panel=null;
      if(go){
        p.style.transition='transform .16s ease-out, opacity .16s ease-out';
        p.style.transform='translateX('+(dx<0?-w:w)+'px)'; p.style.opacity='0.25';
        setTimeout(function(){ clearStyles(p); bfFlipGo(go); }, 160);
      } else {
        p.style.transition='transform .2s ease-out, opacity .2s ease-out';
        p.style.transform='translateX(0)'; p.style.opacity='1';
        setTimeout(function(){ clearStyles(p); }, 210);
      }
    }, {passive:true});
  }
  var bfSbBound=false;
  function bfSidebarSwipe(){
    if(bfSbBound) return; bfSbBound=true;
    var sx=0, sy=0, on=false;
    document.addEventListener('touchstart', function(e){
      on=false;
      if(window.innerWidth>900) return;
      if(location.pathname.indexOf('/preview/')<0) return;
      var t=e.target; if(!(t&&t.closest&&t.closest('.bf-sidebar'))) return;
      if(!e.touches||e.touches.length!==1) return;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY; on=true;
    }, {passive:true});
    document.addEventListener('touchend', function(e){
      if(!on) return; on=false;
      var t=e.changedTouches&&e.changedTouches[0]; if(!t) return;
      var dx=t.clientX-sx, dy=t.clientY-sy;
      if(dx < -45 && Math.abs(dx) > Math.abs(dy)*1.3){ document.body.classList.add('bf-sbcollapsed'); }
    }, {passive:true});
  }
  function bfEnsureSbRestore(){
    if(document.querySelector('.bf-sbrestore')) return;
    var h=document.createElement('div'); h.className='bf-sbrestore'; h.setAttribute('aria-label','Show sidebar'); h.innerHTML='<i class="ti ti-chevron-right" aria-hidden="true"></i>';
    h.addEventListener('click', function(){ document.body.classList.remove('bf-sbcollapsed'); });
    document.body.appendChild(h);
  }
  function bfFlipGo(u){
    var tc=document.querySelector('[data-testid="collection-record"][href*="'+u+'"]');
    if(tc){ tc.click(); }
    else { try{ history.pushState({},'','/opportunities-1/preview/'+u+'/overview'); window.dispatchEvent(new PopStateEvent('popstate')); }catch(e){ location.href='/opportunities-1/preview/'+u+'/overview'; } }
  }
  function bfShortStage(name){
    var n=name||'';
    if(/appraisal complete/i.test(n)) return 'Offer Sheet Values';
    if(/vin received/i.test(n)) return 'Appraisal Needed';
    if(/nurturing/i.test(n)) return 'Nurturing';
    return n;
  }
  function bfRecMobNav(){
    var nav=document.querySelector('.bf-mobnav');
    if(location.pathname.indexOf('/preview/')<0 || window.innerWidth>900){ if(nav) nav.remove(); return; }
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    var host=sb.querySelector('.max-w-6xl')||sb.querySelector('[class*="section-highlights"]')||sb;
    var order=bfFlipOrder; if(!order){ order=bfBuildFullOrder(); if(order) bfFlipOrder=order; }
    if(!order||!order.length) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; var idx=-1; for(var i=0;i<order.length;i++){ if(order[i].u===uuid){ idx=i; break; } }
    if(idx<0){ if(nav) nav.remove(); return; }
    var cur=order[idx];
    function btn(dir){
      var ni= dir==='prev'? idx-1 : idx+1;
      var chevS= dir==='prev'?'ti-chevron-left':'ti-chevron-right';
      var chevD= dir==='prev'?'ti-chevrons-left':'ti-chevrons-right';
      if(ni<0||ni>=order.length){ return '<button class="bf-mobnav-btn" data-dir="'+dir+'" disabled>'+(dir==='prev'?'<i class="ti '+chevS+'"></i><span class="bf-mn-main">Start</span>':'<span class="bf-mn-main">End</span><i class="ti '+chevS+'"></i>')+'</button>'; }
      var t=order[ni]; var cross=(t.col!==cur.col);
      if(cross){ var cap=dir==='prev'?'Prev stage':'Next stage'; var stack='<span class="bf-mn-stack"><span class="bf-mn-cap">'+cap+'</span><span class="bf-mn-col">'+esc(bfShortStage(t.col))+'</span></span>'; var inner= dir==='prev'? ('<i class="ti '+chevD+'"></i>'+stack) : (stack+'<i class="ti '+chevD+'"></i>'); return '<button class="bf-mobnav-btn bf-mn-boundary" data-dir="'+dir+'" data-bfgo="'+t.u+'">'+inner+'</button>'; }
      var main= dir==='prev'? ('<i class="ti '+chevS+'"></i><span class="bf-mn-main">Previous Record</span>') : ('<span class="bf-mn-main">Next Record</span><i class="ti '+chevS+'"></i>');
      return '<button class="bf-mobnav-btn" data-dir="'+dir+'" data-bfgo="'+t.u+'">'+main+'</button>';
    }
    var html=btn('prev')+btn('next');
    if(!nav){ nav=document.createElement('div'); nav.className='bf-mobnav'; }
    if(nav.getAttribute('data-raw')!==html){ nav.setAttribute('data-raw',html); nav.innerHTML=html; }
    if(host.lastElementChild!==nav){ host.appendChild(nav); }
  }
  document.addEventListener('click', function(e){ var b=e.target&&e.target.closest&&e.target.closest('.bf-mobnav-btn[data-bfgo]'); if(b){ e.preventDefault(); e.stopPropagation(); var u=b.getAttribute('data-bfgo'); if(u) bfFlipGo(u); } }, true);
  function bfMkFlip(side){
    var b=document.createElement('button'); b.type='button'; b.className='bf-flip';
    b.style.cssText='position:fixed;'+(side==='r'?'right':'left')+':12px;top:50%;transform:translateY(-50%);z-index:10050;display:none;cursor:pointer;';
    b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); var u=b.getAttribute('data-bfgo'); if(u) bfFlipGo(u); });
    document.body.appendChild(b); return b;
  }
  function bfRecFlip(){
    if(location.pathname.indexOf('/preview/')<0){ if(bfFlipL)bfFlipL.style.display='none'; if(bfFlipR)bfFlipR.style.display='none'; return; }
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var cards=document.querySelectorAll('[data-testid="collection-record"]'); var cnt=cards.length;
    var order=bfFlipOrder;
    var stale=!order||!order.some(function(o){return o.u===uuid;});
    if(stale){
      order=bfBuildFullOrder();
      if(order){ bfFlipOrder=order; bfFlipCount=cnt; }
    }
    if(!order||!order.length) return;
    var idx=-1; for(var i=0;i<order.length;i++){ if(order[i].u===uuid){ idx=i; break; } }
    if(idx<0){ if(bfFlipL)bfFlipL.style.display='none'; if(bfFlipR)bfFlipR.style.display='none'; return; }
    if(!bfFlipL) bfFlipL=bfMkFlip('l'); if(!bfFlipR) bfFlipR=bfMkFlip('r');
    function upd(btn, side){
      var ni=side==='r'?idx+1:idx-1;
      if(ni<0||ni>=order.length){ btn.style.display='none'; return; }
      var nxt=order[ni]; var cross=(order[idx].col!==nxt.col);
      btn.setAttribute('data-bfgo', nxt.u);
      btn.setAttribute('aria-label', side==='r'?'Next record':'Previous record');
      if(cross){ btn.className='bf-flip bf-flip-col'; var cap=(side==='r'?'Next stage':'Prev stage'); var chev='<i class="ti ti-chevrons-'+(side==='r'?'right':'left')+'" aria-hidden="true"></i>'; btn.innerHTML='<span class="bf-flipcap">'+cap+'</span><span class="bf-flipcol">'+esc(nxt.col)+'</span>'+chev; }
      else { btn.className='bf-flip'; btn.innerHTML='<i class="ti ti-chevron-'+(side==='r'?'right':'left')+'" aria-hidden="true"></i>'; }
      btn.style.display='inline-flex';
    }
    upd(bfFlipR,'r'); upd(bfFlipL,'l');
  }
  function manageBackdrop(){
    var rv = (location.pathname.indexOf('/preview/') > -1) ? document.querySelector('[data-testid="record-view"]') : null;
    if(rv){
      var panel = rv.closest('[class*="inset-y-0"]') || rv.parentElement;
      var parent = panel ? panel.parentNode : document.body;
      if(!bfBackdrop){
        bfBackdrop=document.createElement('div');
        bfBackdrop.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.45);';
        bfBackdrop.addEventListener('click',function(){ try{ document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,which:27,bubbles:true})); }catch(e){} });
      }
      if(panel && bfBackdrop.parentNode !== parent){ parent.insertBefore(bfBackdrop, panel); }
      else if(!bfBackdrop.parentNode){ document.body.appendChild(bfBackdrop); }
      bfBackdrop.style.display='';
      if(bfArrowR) bfArrowR.style.display='none';
      if(bfArrowL) bfArrowL.style.display='none';
      if(window.innerWidth<=640){
        if(!bfCloseBtn){
          bfCloseBtn=document.createElement('button');
          bfCloseBtn.setAttribute('aria-label','Close');
          bfCloseBtn.innerHTML='<i class="ti ti-x" aria-hidden="true"></i>';
          bfCloseBtn.style.cssText='position:fixed;top:16px;right:16px;z-index:10001;width:38px;height:38px;border-radius:50%;border:none;background:#ffffff;box-shadow:0 2px 10px rgba(0,0,0,0.28);color:#161616;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;';
          bfCloseBtn.addEventListener('click',function(){ try{ history.back(); }catch(e){} });
          document.body.appendChild(bfCloseBtn);
        }
        bfCloseBtn.style.display='flex';
      } else if(bfCloseBtn){ bfCloseBtn.style.display='none'; }
    } else {
      if(bfBackdrop) bfBackdrop.style.display='none';
      if(bfCloseBtn) bfCloseBtn.style.display='none';
    }
  }
  function bfPipeIsDrawer(){ try{ if(/^\/(pipeline|command)\//.test(location.pathname)) return false; var pp=new URLSearchParams(location.search).get('_parentPage'); if(!pp) return false; var d=JSON.parse(atob(pp)); return !!(d&&d.elementId===BF_PIPE_EL); }catch(e){ return false; } }
  function bfPipeGo(u){ var url='/opportunities-1/view/'+u+'/overview'+location.search; try{ history.pushState({},'',url); window.dispatchEvent(new PopStateEvent('popstate')); }catch(e){ location.href=url; } }
  function bfPipeClose(){ try{ history.pushState({},'','/command'); window.dispatchEvent(new PopStateEvent('popstate')); }catch(e){ location.href='/command'; } }
  function bfMkPipeArrow(side){ var b=document.createElement('button'); b.type='button'; b.className='bf-flip bf-pipearrow'; b.style.cssText='position:fixed;top:50%;'+(side==='l'?'left:16px':'right:16px')+';transform:translateY(-50%);z-index:10002;display:none;'; b.innerHTML='<i class="ti ti-chevron-'+(side==='l'?'left':'right')+'" aria-hidden="true"></i>'; b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); var u=b.getAttribute('data-bfgo'); if(u) bfPipeGo(u); }); document.body.appendChild(b); return b; }
  function bfPipeDrawer(){
    if(!bfPipeIsDrawer()){ if(bfPipeBd)bfPipeBd.style.display='none'; if(bfPipeSnap)bfPipeSnap.style.display='none'; if(bfPipeAL)bfPipeAL.style.display='none'; if(bfPipeAR)bfPipeAR.style.display='none'; document.documentElement.removeAttribute('data-bfpipedrawer'); return; }
    var rv=document.querySelector('[data-testid="record-view"]'); if(!rv){ if(bfPipeBd)bfPipeBd.style.display='none'; if(bfPipeSnap)bfPipeSnap.style.display='none'; return; }
    try{ bfPipeCSS(); }catch(e){}
    document.documentElement.setAttribute('data-bfpipedrawer','1');
    var panel=null, bestZ=-1, pn=rv;
    while(pn&&pn!==document.body){ var pcs=getComputedStyle(pn); var pz=parseInt(pcs.zIndex); if((pcs.position==='fixed'||pcs.position==='absolute')&&!isNaN(pz)&&pz>bestZ){ bestZ=pz; panel=pn; } pn=pn.parentElement; }
    if(!panel) panel=rv.parentElement||rv;
    var parent=panel.parentNode||document.body;
    if(!bfPipeSnap){ bfPipeSnap=document.createElement('div'); bfPipeSnap.id='bf-pipesnap'; bfPipeSnap.style.cssText='position:fixed;inset:0;z-index:9990;background:#ffffff;overflow:hidden;pointer-events:none;'; }
    var snap=''; try{ snap=sessionStorage.getItem('bf.pipesnap')||''; }catch(e){}
    if(bfPipeSnap.__snap!==snap){ bfPipeSnap.innerHTML = snap?('<div style="padding:56px 22px 0;height:100%;box-sizing:border-box;overflow:hidden;">'+snap+'</div>'):''; bfPipeSnap.__snap=snap; }
    if(!bfPipeBd){ bfPipeBd=document.createElement('div'); bfPipeBd.id='bf-pipebd'; bfPipeBd.style.cssText='position:fixed;inset:0;z-index:9992;background:rgba(0,0,0,0.55);'; bfPipeBd.addEventListener('click', bfPipeClose); if(!window.__bfPipeEsc){ window.__bfPipeEsc=1; document.addEventListener('keydown', function(e){ if(e.key==='Escape' && bfPipeIsDrawer()){ e.preventDefault(); bfPipeClose(); } }); } }
    if(bfPipeSnap.parentNode!==parent){ try{ parent.insertBefore(bfPipeSnap, panel); }catch(e){ if(!bfPipeSnap.parentNode) document.body.appendChild(bfPipeSnap); } }
    if(bfPipeBd.parentNode!==parent){ try{ parent.insertBefore(bfPipeBd, panel); }catch(e){ if(!bfPipeBd.parentNode) document.body.appendChild(bfPipeBd); } }
    bfPipeSnap.style.display=''; bfPipeBd.style.display='';
    try{ panel.style.setProperty('width','min(940px,96vw)','important'); panel.style.setProperty('left','auto','important'); panel.style.setProperty('right','0','important'); panel.style.setProperty('margin','0','important'); }catch(e){}
    var order=[]; try{ order=JSON.parse(sessionStorage.getItem('bf.pipeorder')||'[]'); }catch(e){}
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; var idx=order.indexOf(uuid);
    if(!bfPipeAL) bfPipeAL=bfMkPipeArrow('l'); if(!bfPipeAR) bfPipeAR=bfMkPipeArrow('r');
    if(idx<0){ bfPipeAL.style.display='none'; bfPipeAR.style.display='none'; }
    else { if(idx>0){ bfPipeAL.setAttribute('data-bfgo',order[idx-1]); bfPipeAL.style.display='inline-flex'; } else { bfPipeAL.style.display='none'; } if(idx<order.length-1){ bfPipeAR.setAttribute('data-bfgo',order[idx+1]); bfPipeAR.style.display='inline-flex'; } else { bfPipeAR.style.display='none'; } }
  }
  function bfRecNum(v){ var n=parseFloat(String(v||'').replace(/[^0-9.\-]/g,'')); return isNaN(n)?NaN:n; }
  function bfRecScore(F){
    var acv=bfRecNum(F['ACV']), ask=bfRecNum(F['Asking Price']), off=bfRecNum(F['Offer Amount']);
    if(isNaN(acv)||acv<=0||isNaN(ask)) return null;
    var cmp=compInfo(F['Competition']);
    var cs=cmp?(cmp.color==='g'?40:(cmp.color==='y'?15:0)):0;
    var prem=ask-acv;
    var ds=prem<=2000?30:(prem<=3000?25:(prem<=4000?15:(prem<=5000?7.5:0)));
    var pct=prem/acv;
    var ps=pct<=0?20:(pct>=0.20?0:20*(1-pct/0.20));
    var eqp=bfRecNum(F['Est Equity Position']);
    var es=isNaN(eqp)?0:(eqp>=2000?10:(eqp<=0?0:10*(eqp/2000)));
    var score=Math.round(cs+ds+ps+es);
    var tier=score>=75?{bg:'#e3f5cf',fg:'#2b6012'}:(score>=50?{bg:'#fbeecd',fg:'#7a4d13'}:{bg:'#eceae3',fg:'#6b6b64'});
    return {score:score,tier:tier};
  }
  var PIPE_STATUSNAME={FRESH_LEADS:'Fresh Leads',ENGAGED_AWAITING_VIN:'Engaged - Awaiting VIN',VIN_RECEIVED_APPRAISAL_NEEDED:'VIN Received - Appraisal Needed',APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES:'Appraisal Complete - Enter Offer Sheet Values',OFFER_SHEET_GENERATED:'Offer Sheet Generated',OFFER_SENT_0_2_DAYS:'Offer Sent (0-2 Days)',NURTURING_FOLLOW_UP_AND_RE_ENGAGE:'Nurturing (Follow Up and Re-engage)',APPRAISAL_REVIEW_NEEDED:'Appraisal Review Needed',APPRAISAL_REVIEW_COMPLETE:'Appraisal Review Complete',VERBAL_YES_SCHEDULE_APPT:'Verbal Yes - Schedule Appt',SCHEDULED:'Scheduled',APPT_SHOWN_FOLLOW_UP:'Appt Shown - Follow Up',ACQUIRED:'Acquired',NO_DEAL:'No Deal'};
  function bfRecFallback(uuid){
    var raw=''; try{ raw=sessionStorage.getItem('bfrec:'+uuid)||localStorage.getItem('bfrec:'+uuid)||''; }catch(e){}
    if(!raw) return null;
    var r; try{ r=JSON.parse(raw); }catch(e){ return null; }
    if(!r) return null;
    var stg=PIPE_STATUSNAME[r.status]||'';
    var sub=r.subtitle||'';
    if(!sub){ var parts=[]; if(r.mileage!=null&&r.mileage!=='') parts.push(Number(r.mileage).toLocaleString('en-US')+' miles'); if(r.color) parts.push(r.color); sub=parts.join(' \u00b7 '); }
    if(r.seller && !/\u00b7\s*Seller:/i.test(sub)){ sub=(sub?sub+' \u00b7 ':'')+'Seller: '+r.seller; }
    var v=function(x){ return (x==null?'':String(x)); };
    var F={'Vehicle Title':v(r.title),'Vehicle Subtitle':sub,'VIN':v(r.vin),'Mileage':v(r.mileage),'Exterior Color':v(r.color),'Seller Name':v(r.seller),'Competition':v(r.competition),'Distance to Listing':v(r.distance),'Drive Time to Listing':v(r.driveTime),'Listing Location':v(r.location),'Date Listed':v(r.dateListed),'Listing Link':v(r.listingLink),'Offer Sheet Image URL':v(r.offerSheetUrl),'Accident History':v(r.accident),'Stage Entered At':v(r.stageEnteredAt),'Last Follow Up At':v(r.lastActivityAt),'Last Comment At':v(r.lastActivityAt),'ACV':v(r.acv),'Asking Price':v(r.asking),'Offer Amount':v(r.offer),'Est Equity Position':v(r.eq)};
    return {F:F, stg:stg};
  }
  function bfRecTop(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var body=document.querySelector('[data-testid="record-view-body"]'); if(!body) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]');
    var F, stg;
    if(card){ F=bfReadF(card); stg=stageOf(card); }
    else { var _fb=bfRecFallback(uuid); if(!_fb) return; F=_fb.F; stg=_fb.stg; }
    if(window.__bfStageOverride && window.__bfStageOverride[uuid]){ stg=window.__bfStageOverride[uuid]; }
    var dist=F['Distance to Listing']||'', drive=F['Drive Time to Listing']||'', loc=F['Listing Location']||'', listed=F['Date Listed']?listedAgo(F['Date Listed']):'';
    var sc=bfRecScore(F);
    var checks=STATUS_CHECKS[stg]||[]; var noDeal=(stg==='No Deal');
    (function(){ var _c=compInfo(F['Competition']); var _oc=_c?(_c.color==='g'?'#2b6012':(_c.color==='y'?'#7a4d13':'#c93535')):''; if(!_oc) return; var _sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!_sb) return; _sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(ce){ var lb=ce.querySelector('[data-testid="highlight-label"]'); var vl=ce.querySelector('[data-testid="highlight-value"]'); if(lb&&vl&&/offer amount/i.test(lb.textContent||'')){ vl.style.setProperty('color', _oc, 'important'); } }); })();
    var vin=F['VIN']||'', mileage=F['Mileage']||'', color=F['Exterior Color']||'', seller=F['Seller Name']||'';
    var days=F['Days Working']||''; var daysDisp=days?(/[a-z]/i.test(days)?days:String(days).replace(/[^0-9.]/g,'')+'d'):'';
    var _accL=(F['Accident History']||'').trim().toLowerCase(); var accPill='';
    if(_accL.indexOf('accident')>-1) accPill='<span class="bf-rtaccpill" style="background:#fbeecd;color:#7a4d13;"><i class="ti ti-alert-triangle" aria-hidden="true"></i>Accident(s)</span>';
    else if(_accL.indexOf('clean')>-1) accPill='<span class="bf-rtaccpill" style="background:#e3f5cf;color:#2b6012;"><i class="ti ti-shield-check" aria-hidden="true"></i>Clean History</span>';
    var _rai=bfAttentionInfo(F, stg); var attnPill=_rai?('<span class="bf-rtaccpill" style="background:'+_rai.bg+';color:'+_rai.fg+';"><i class="ti '+_rai.icon+'" aria-hidden="true"></i>'+_rai.label+'</span>'):'';
    var tisHtml='';
    (function(){ var se=F['Stage Entered At']; var baseT=se?new Date(se).getTime():NaN; if(isNaN(baseT)) return; var mins=Math.floor((Date.now()-baseT)/60000); if(mins<0)mins=0; var txtCol,lbl; if(stg==='Nurturing (Follow Up and Re-engage)'||stg==='Appt Shown - Follow Up'){ var dayNum=Math.floor(mins/1440)+1; var DS=[[1,'#c93535'],[3,'#e0631f'],[5,'#e8930c'],[7,'#c79617'],[10,'#8a9a1c'],[15,'#3f9e5a'],[30,'#1f9e8f'],[45,'#3a8fc4'],[60,'#5aa6db']]; var col=DS[0][1]; for(var di=0;di<DS.length;di++){ if(dayNum>=DS[di][0]) col=DS[di][1]; } txtCol=col; lbl='Day '+dayNum; } else { var th=(typeof THRESH!=='undefined'&&THRESH.hasOwnProperty(stg))?THRESH[stg]:null; txtCol='#3b3b38'; if(th){ if(mins>=th[1])txtCol='#c93535'; else if(mins>=th[0])txtCol='#e8730c'; else txtCol='#3b6d11'; } lbl=fmtDuration(mins); } tisHtml='<div class="bf-rtstat"><div class="bf-rtstatv" style="color:'+txtCol+';"><i class="ti ti-clock" aria-hidden="true"></i>'+esc(lbl)+'</div><div class="bf-rtstatl">TIME IN STAGE</div></div>'; })();
    var vinLine=vin?('<div class="bf-vincopy bf-rtvin" data-bfvin="'+esc(vin)+'" title="Click to copy VIN"><span>VIN '+esc(vin)+'</span><i class="ti ti-copy" aria-hidden="true"></i></div>'):'';
    var _sub=(F['Vehicle Subtitle']||'').replace(/(\d{3,})(\s*miles)/i, function(m,n,suf){ return Number(n).toLocaleString('en-US')+suf; });
    var mc=_sub, sellerName=''; var _sm=_sub.split(/\s*·\s*Seller:\s*/i); if(_sm.length>1){ mc=_sm[0]; sellerName=_sm[1]; }
    var sellerLine=sellerName?('Seller: '+esc(sellerName)):'';
    var sub2=[];
    if(listed) sub2.push('<span class="bf-rtchip"><i class="ti ti-calendar" aria-hidden="true"></i>'+esc(listed)+'</span>');
    if(loc) sub2.push('<span class="bf-rtchip"><i class="ti ti-map-pin" aria-hidden="true"></i>'+esc(loc)+'</span>');
    var metaL='<div class="bf-rtmetaL">'+vinLine+(mc?'<div class="bf-rtsub1">'+esc(mc)+'</div>':'')+(sellerLine?'<div class="bf-rtsub1">'+sellerLine+'</div>':'')+(sub2.length?'<div class="bf-rtsub2">'+sub2.join('')+'</div>':'')+'</div>';
    function rstat(ic,val,lab){ return val?('<div class="bf-rtstat"><div class="bf-rtstatv"><i class="ti '+ic+'" aria-hidden="true"></i>'+esc(val)+'</div><div class="bf-rtstatl">'+lab+'</div></div>'):''; }
    var flameStat=sc?('<div class="bf-rtstat"><div class="bf-rtstatv bf-rtflamev" style="background:'+sc.tier.bg+';color:'+sc.tier.fg+';"><i class="ti ti-flame" aria-hidden="true"></i>'+sc.score+'</div><div class="bf-rtstatl">SCORE</div></div>'):'';
    var stats='<div class="bf-rtstats">'+rstat('ti-route',dist,'DISTANCE')+flameStat+rstat('ti-clock',drive,'DRIVE TIME')+rstat('ti-briefcase',daysDisp,'DAYS WORKING')+tisHtml+'</div>';
    var listing=F['Listing Link']||'';
    var visit=listing?('<a class="bf-rtvisiticon" href="'+esc(listing)+'" target="_blank" rel="noopener" aria-label="Visit listing" title="Visit listing"><i class="ti ti-external-link" aria-hidden="true"></i></a>'):'';
    var title=esc(F['Vehicle Title']||'');
    var curSeg=(location.pathname.match(/\/(overview|vehicle-appraisal|offers-next-steps)\/?$/)||[])[1]||'overview';
    var TABS=[['overview','Overview'],['vehicle-appraisal','Vehicle & Appraisal'],['offers-next-steps','Offers & Next Steps']];
    var tabs='<div class="bf-rectabs">'+TABS.map(function(t){return '<button class="bf-rectab'+(t[0]===curSeg?' bf-rectab-on':'')+'" data-bftab="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>';
    var stagePill=stg?'<span class="bf-rtstagepill"><i class="ti ti-progress" aria-hidden="true"></i>'+esc(stg)+'</span>':'';
    var meta='<div class="bf-rechdr">'+visit+'<div class="bf-rechdr-main"><div class="bf-rechdr-left"><div class="bf-rechdr-titlewrap"><div class="bf-rectitle bf-title">'+title+'</div>'+attnPill+accPill+'</div>'+(stagePill?'<div class="bf-rtstagerow">'+stagePill+'</div>':'')+metaL+'</div>'+stats+'</div></div>';
    var done=0, steps='';
    for(var i=0;i<MILESTONES.length;i++){
      var lab=MILESTONES[i];
      var ok=(lab==='Competing values')?!!(uuid&&bfLS('bfcv:'+uuid)==='1'):(checks.indexOf(i)>-1);
      if(ok) done++;
      var circ=ok?'<span class="bf-rtcirc bf-rtdone"><i class="ti ti-check" aria-hidden="true"></i></span>':(noDeal?'<span class="bf-rtcirc bf-rtno"><i class="ti ti-x" aria-hidden="true"></i></span>':'<span class="bf-rtcirc bf-rtopen"></span>');
      var _isCV=(lab==='Competing values'); var _clk=_isCV||CLICK_STAGE[lab];
      var _cls='bf-rtstep'+(ok?' bf-rtdonestep':'')+(_clk?' bf-rtclick':'');
      var _att=_clk?(_isCV?(' data-bfcv="'+esc(uuid)+'"'):(' data-bfstage="'+esc(CLICK_STAGE[lab])+'" data-bfuuid="'+esc(uuid)+'"')):'';
      steps+='<div class="'+_cls+'"'+_att+'>'+circ+'<span class="bf-rtlabel'+(ok?' bf-rtlon':'')+'">'+esc(lab)+'</span></div>';
    }
    var prog='<div class="bf-rtprog"><div class="bf-rthd"><span class="bf-rttitle">DEAL PROGRESS</span><span class="bf-rtcount">'+done+' of '+MILESTONES.length+'</span></div><div class="bf-rtsteps">'+steps+'</div></div>';
    var raw=[F['Vehicle Title'],curSeg,stg,dist,drive,loc,listed,(sc?sc.score:''),F['Competition'],F['VIN'],F['Mileage'],F['Exterior Color'],F['Seller Name'],F['Days Working'],F['Accident History'],F['Stage Entered At'],F['Last Follow Up At'],F['Offer Sheet Image URL'],(_rai?_rai.key:''),uuid].join('|');
    var top=body.querySelector(':scope > .bf-rectop');
    if(top && top.getAttribute('data-raw')===raw) return;
    if(!top){ top=document.createElement('div'); top.className='bf-rectop'; body.insertBefore(top, body.firstChild); }
    top.innerHTML=meta+prog;
    bfFitTitle(top, window.innerWidth<=900?15:17);
    top.setAttribute('data-raw', raw);
  }
  function bfRecHideEmpty(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    [].forEach.call(document.querySelectorAll('[data-testid="record-view"] label, [data-testid="record-view"] [class*="text-stone"], [data-testid="record-view"] h5'), function(el){ if(el.children.length===0 && el.textContent.trim()==='Estimated Payoff Amount'){ el.textContent='Est Payoff Amount'; } });
    document.querySelectorAll('[data-testid="details-section"] form > div').forEach(function(cell){
      if(cell.querySelector('input,textarea,select,button')){ cell.style.removeProperty('display'); return; }
      var v=cell.querySelector('[id="field-cell"]'); if(!v){ return; }
      if(v.querySelector('a,img,svg')){ cell.style.removeProperty('display'); return; }
      var t=(v.textContent||'').replace(/\s+/g,' ').trim();
      if(t==='' || /^[-–—\s]+$/.test(t)){ cell.style.display='none'; } else { cell.style.removeProperty('display'); }
    });
  }
  function bfRecTweaks(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var rv=document.querySelector('[data-testid="record-view"]'); if(!rv) return;
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])');
    var scope=sb||rv;
    var unknown=/equity unknown/i.test(rv.textContent||'');
    if(sb&&unknown){
      sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(ce){
        var lb=ce.querySelector('[data-testid="highlight-label"]'); var vl=ce.querySelector('[data-testid="highlight-value"]');
        if(lb&&vl&&/est equity position/i.test(lb.textContent||'')){ if(vl.textContent.trim()!=='-') vl.textContent='-'; }
      });
    }
    scope.querySelectorAll('[class*="section-notice"]').forEach(function(n){
      var t=(n.textContent||'').toLowerCase();
      if(/equity/.test(t)){ n.classList.add('bf-noti-eq'); }
      else if(/beat/.test(t)){ n.classList.add('bf-noti-beats'); }
      else if(/carmax/.test(t)){ n.classList.add('bf-noti-cm'); bfSetNoticeIcon(n); }
      else if(/carvana/.test(t)){ n.classList.add('bf-noti-cv'); bfSetNoticeIcon(n); }
    });
    [].forEach.call(scope.querySelectorAll('[class*="section-title"],h1,h2,h3,h4,h5,h6,label,span,p,div'), function(el){
      if(/^offers to beat$/i.test((el.textContent||'').replace(/\s+/g,' ').trim())){ el.classList.add('bf-otb'); }
    });
  }
  function bfRecPills(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    function setPill(card,bg,fg,icon,label,raw){
      if(!card) return; if(card.getAttribute('data-bfpill')===raw) return;
      card.setAttribute('data-bfpill',raw);
      card.style.cssText='display:flex !important;align-items:center !important;justify-content:center !important;background:'+bg+' !important;color:'+fg+' !important;border:none !important;border-radius:999px !important;padding:7px 14px !important;box-shadow:0 2px 6px rgba(0,0,0,0.18);width:100% !important;box-sizing:border-box;min-height:0 !important;';
      card.innerHTML='<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;white-space:nowrap;">'+(icon?'<i class="ti '+icon+'" style="font-size:13px;" aria-hidden="true"></i>':'')+label+'</span>';
    }
    var bt=sb.querySelector('.bf-noti-beats');
    if(bt){ var h5=bt.querySelector('h5'); var comp=compInfo(h5?h5.textContent:''); var card=bt.querySelector('[class*="rounded-lg"]'); if(card&&comp){ var c=COMPC[comp.color]; setPill(card,c.bg,c.fg,comp.icon,comp.label,'b|'+comp.label); } }
    var eq=sb.querySelector('.bf-noti-eq');
    if(eq){ var ec=eq.querySelector('[class*="rounded-lg"]'); if(ec){ var val=(eq.textContent||'').replace(/est\.?\s*equity position/i,'').trim(); var m=val.match(/[\d,]+(\.\d+)?/); var bg,fg,label; if(!m||/unknown/i.test(val)){ bg='#eceee9'; fg='#6b6b64'; label='Equity Unknown'; } else { var neg=/negative/i.test(val)||/^\s*[\-\(\u2212]/.test(val); fg=neg?'#c93535':'#2b6012'; bg=neg?'#fbe3e3':'#e3f5cf'; label='Equity '+(neg?'\u2212':'+')+'$'+m[0]; } setPill(ec,bg,fg,'',label,'e|'+label); } }
  }
  function bfPipePriceRead(scope){
    var F={};
    scope.querySelectorAll('[data-testid="field-cell"]').forEach(function(c){ var lb=c.querySelector('[data-testid="field-cell-label"]'); if(!lb) return; var vn=lb.nextElementSibling; var k=norm(lb.textContent); var v=dval(vn?vn.textContent:''); if(v||!(k in F)) F[k]=v; });
    scope.querySelectorAll('[data-testid="highlight-item"]').forEach(function(c){ var lb=c.querySelector('[data-testid="highlight-label"]'); var vl=c.querySelector('[data-testid="highlight-value"]'); if(lb){ var k=norm(lb.textContent); var v=dval(vl?vl.textContent:''); if(v||!(k in F)) F[k]=v; } });
    return F;
  }
  function bfPipePriceData(scope, uuid){
    var F=bfPipePriceRead(scope);
    var R={}; try{ R=JSON.parse(sessionStorage.getItem('bfrec:'+uuid)||'{}'); }catch(e){}
    if(R){ if(!F['Competition']&&R.competition) F['Competition']=R.competition; if(!F['Est Equity Position']&&R.eq!=null&&R.eq!=='') F['Est Equity Position']=String(R.eq); if(!F['Asking Price']&&R.asking!=null&&R.asking!=='') F['Asking Price']=String(R.asking); if(!F['Offer Amount']&&R.offer!=null&&R.offer!=='') F['Offer Amount']=String(R.offer); if(!F['ACV']&&R.acv!=null&&R.acv!=='') F['ACV']=String(R.acv); }
    return F;
  }
  function bfPipePriceHtml(F){
    function g(keys){ for(var i=0;i<keys.length;i++){ var v=F[keys[i]]; if(v!=null&&v!=='') return v; } return ''; }
    function money(v){ if(v==null||v==='') return '—'; var n=parseFloat((''+v).replace(/[^0-9.\-]/g,'')); if(isNaN(n)) return '—'; return '$'+Math.round(n).toLocaleString('en-US'); }
    var asking=g(['Asking Price']), offer=g(['Offer Amount']), acv=g(['ACV']);
    var payoff=g(['Est Payoff Amount','Estimated Payoff Amount','Actual Payoff Amount']);
    var eq=g(['Est Equity Position']), eqDisp=g(['Equity Display']), eqStatus=g(['Equity Status']);
    var carmax=g(['CarMax Offer']), carvana=g(['Carvana Offer']), comp=g(['Competition']);
    function card(label,val,sub,green){ return '<div class="bf-pc"><div class="bf-pc-l">'+esc(label)+(sub?'<div class="bf-pc-sub">'+esc(sub)+'</div>':'')+'</div><div class="bf-pc-v'+(green?' bf-pc-green':'')+'">'+esc(val)+'</div></div>'; }
    var cards='<div class="bf-pcgrid">'+card('Asking Price',money(asking))+card('Offer Amount',money(offer),(acv?'ACV '+money(acv):''),true)+card('Est Payoff Amount',money(payoff))+card('Est Equity Position',(eqDisp&&/[0-9]/.test(eqDisp))?eqDisp:money(eq))+'</div>';
    var ei=equityInfo2(eq,eqStatus,eqDisp);
    var eqPill='<div class="bf-pcequity" style="color:'+ei.color+';">'+(ei.text==='—'?'Equity Unknown':('Equity '+ei.text))+'</div>';
    var ci=compInfo(comp);
    var beats=ci?('<div class="bf-pcbeats bf-pcbeats-'+ci.color+'"><i class="ti '+ci.icon+'" aria-hidden="true"></i>'+esc(ci.label)+'</div>'):'';
    var rows=(carmax?('<div class="bf-pcrow"><span><i class="ti ti-businessplan" aria-hidden="true"></i>CarMax</span><b>'+money(carmax)+'</b></div>'):'')+(carvana?('<div class="bf-pcrow"><span><i class="ti ti-businessplan" aria-hidden="true"></i>Carvana</span><b>'+money(carvana)+'</b></div>'):'');
    var otb=(rows||beats)?('<div class="bf-pcotb"><div class="bf-pcotb-h"><i class="ti ti-swords" aria-hidden="true"></i>Offers to beat</div>'+rows+beats+'</div>'):'';
    return cards+eqPill+otb;
  }
  function bfPipePrice(){
    if(!/^\/(pipeline|command)\/preview\//.test(location.pathname)) return;
    var body=document.querySelector('[data-testid="record-view-body"]'); if(!body) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var cols=body.querySelector(':scope > .bf-reccols');
    if(cols && cols.getAttribute('data-uuid')===uuid){ var lf=cols.querySelector('.bf-recleft'); if(lf){ var nf=bfPipePriceHtml(bfPipePriceData(cols.querySelector('.bf-recright')||body, uuid)); if(lf.getAttribute('data-h')!==nf){ lf.innerHTML=nf; lf.setAttribute('data-h',nf); } } return; }
    var rectop=body.querySelector(':scope > .bf-rectop'); if(!rectop) return;
    var content=[].filter.call(body.children, function(c){ return c!==rectop && !(c.classList&&c.classList.contains('bf-reccols')); });
    if(!content.length) return;
    var F=bfPipePriceData(body, uuid);
    if(cols) cols.remove();
    cols=document.createElement('div'); cols.className='bf-reccols'; cols.setAttribute('data-uuid',uuid);
    var left=document.createElement('div'); left.className='bf-recleft'; var lh=bfPipePriceHtml(F); left.innerHTML=lh; left.setAttribute('data-h',lh);
    var right=document.createElement('div'); right.className='bf-recright';
    content.forEach(function(n){ right.appendChild(n); });
    cols.appendChild(left); cols.appendChild(right);
    if(rectop.nextSibling) body.insertBefore(cols, rectop.nextSibling); else body.appendChild(cols);
  }
  function bfV2Money(v){ if(v==null||v==='') return '—'; var n=parseFloat((''+v).replace(/[^0-9.\-]/g,'')); if(isNaN(n)) return '—'; return '$'+Math.round(n).toLocaleString('en-US'); }
  function bfV2Html(R,uuid){
    var title=esc(R.title||'Opportunity');
    var vin=(R.vin||''); var vinLine=vin?('<div class="bf-v2vin" data-bfvin="'+esc(vin)+'" title="Copy VIN">VIN '+esc(vin)+' <i class="ti ti-copy" aria-hidden="true"></i></div>'):'';
    var sub=(R.subtitle||''); var mileage=R.mileage, color=R.color;
    if(!color){ var cm=sub.match(/·\s*([A-Za-z ]+)\s*$/); }
    var asking=R.asking, offer=R.offer, acv=R.acv;
    var spread=(asking!=null&&asking!==''&&offer!=null&&offer!=='')?(Number(asking)-Number(offer)):null;
    var spct=(spread!=null&&Number(asking)>0)?Math.round(spread/Number(asking)*1000)/10:null;
    var F={'ACV':R.acv,'Asking Price':R.asking,'Offer Amount':R.offer,'Competition':R.competition,'Est Equity Position':R.eq};
    var sc=bfRecScore(F); var score=sc?sc.score:null;
    var prob=(score!=null)?score:null; var probTier=prob==null?'':(prob>=70?'High':(prob>=45?'Medium':'Low'));
    var ci=compInfo(R.competition||''); var winning=ci&&ci.color==='g';
    var winLabel=ci?ci.label:''; 
    var accL=(R.accident||'').toLowerCase(), acc='';
    if(accL.indexOf('accident')>-1) acc='<span class="bf-v2acc bad"><i class="ti ti-alert-triangle" aria-hidden="true"></i>Accident(s)</span>';
    else if(accL.indexOf('clean')>-1) acc='<span class="bf-v2acc clean"><i class="ti ti-shield-check" aria-hidden="true"></i>Clean History</span>';
    var stageFull=(typeof PIPE_STATUSNAME!=='undefined'&&PIPE_STATUSNAME[R.status])||R.status||'';
    var stagePretty=stageFull.replace(/_/g,' ');
    var dt=R.driveTime||'', dist=R.distance||'', loc=R.location||'';
    var listed=R.dateListed?listedAgo(R.dateListed):'';
    var ML=['Lead','VIN','Appraisal','Offer','Sent','Follow Up','Schedule','Verify','Buy'];
    var checks=(typeof STATUS_CHECKS!=='undefined'&&STATUS_CHECKS[stageFull])||[];
    var steps='',done=0; for(var i=0;i<MILESTONES.length;i++){ var ok=checks.indexOf(i)>-1; if(ok)done++; var cur=(!ok&&checks.indexOf(i-1)>-1); steps+='<div class="bf-v2step'+(ok?' done':(cur?' cur':''))+'"><div class="bf-v2dot">'+(ok?'<i class="ti ti-check" aria-hidden="true"></i>':(cur?'<i class="ti ti-circle-filled" style="font-size:11px;" aria-hidden="true"></i>':''))+'</div><div class="bf-v2sl">'+esc((ML[i]||MILESTONES[i]))+'</div></div>'; }
    var carmax=R.carmax, carvana=R.carvana;
    var recOffer=(offer!=null&&offer!=='')?(Number(offer)+300):null;
    var objection=(!R.payoff&&!/[0-9]/.test((R.eq||'')+''))?'Needs payoff clarification':'Confirm condition + miles';
    var head='<div class="bf-v2card bf-v2hero"><div class="bf-v2herotop">'
      +'<div class="bf-v2thumb">'+(R.photo?('<img src="'+esc(R.photo)+'">'):'<i class="ti ti-car" aria-hidden="true"></i>')+'</div>'
      +'<div class="bf-v2htxt"><div class="bf-v2trow"><div class="bf-v2title">'+title+'</div>'+(score!=null?'<div class="bf-v2score"><div class="bf-v2scoren"><i class="ti ti-flame" style="font-size:14px;" aria-hidden="true"></i>'+score+'</div><div class="bf-v2scorel">Seller Score</div></div>':'')+'</div>'
      +vinLine+'<div class="bf-v2badges">'+(winning?'<span class="bf-v2win"><i class="ti ti-trophy" aria-hidden="true"></i>WINNING</span>':(winLabel?'<span class="bf-v2win" style="background:rgba(240,165,40,.15);color:#f0a528;"><i class="ti ti-swords" aria-hidden="true"></i>'+esc(winLabel)+'</span>':''))+acc+(stagePretty?'<span class="bf-v2pill green"><i class="ti ti-progress" aria-hidden="true"></i>'+esc(stagePretty)+'</span>':'')+'</div></div></div>'
      +'<div class="bf-v2meta">'
      +(mileage!=null&&mileage!==''?'<div class="bf-v2mc"><i class="ti ti-gauge" aria-hidden="true"></i><div><b>'+Number(mileage).toLocaleString('en-US')+' mi</b><span>Mileage</span></div></div>':'')
      +(dt?'<div class="bf-v2mc"><i class="ti ti-clock-hour-4" aria-hidden="true"></i><div><b>'+esc(dt)+'</b><span>Travel Time</span></div></div>':'')
      +(dist?'<div class="bf-v2mc"><i class="ti ti-route" aria-hidden="true"></i><div><b>'+esc(dist)+'</b><span>Distance</span></div></div>':'')
      +(loc?'<div class="bf-v2mc"><i class="ti ti-map-pin" aria-hidden="true"></i><div><b>'+esc(loc)+'</b><span>Location</span></div></div>':'')
      +'</div></div>';
    var p3='<div class="bf-v2p3"><div class="bf-v2pc"><div class="bf-v2pl">ASKING PRICE</div><div class="bf-v2pv">'+bfV2Money(asking)+'</div></div><div class="bf-v2pc hi"><div class="bf-v2pl">YOUR OFFER</div><div class="bf-v2pv">'+bfV2Money(offer)+'</div>'+(acv?'<div class="bf-v2ps">ACV '+bfV2Money(acv)+'</div>':'')+'</div><div class="bf-v2pc"><div class="bf-v2pl">SPREAD</div><div class="bf-v2pv">'+(spread!=null?bfV2Money(spread):'—')+'</div>'+(spct!=null?'<div class="bf-v2ps green">'+spct+'%</div>':'')+'</div></div>';
    var comp='<div class="bf-v2card"><div class="bf-v2sh"><span class="bf-v2t">COMPETITIVE LANDSCAPE</span></div><div class="bf-v2comp"><div class="bf-v2cc"><div class="bf-v2cl">CarMax</div><div class="bf-v2cv">'+bfV2Money(carmax)+'</div></div><div class="bf-v2cc"><div class="bf-v2cl">Carvana</div><div class="bf-v2cv">'+bfV2Money(carvana)+'</div></div><div class="bf-v2cc win"><div class="bf-v2cl">BUYFORCE OFFER</div><div class="bf-v2cv">'+bfV2Money(offer)+'</div>'+(winning?'<div class="bf-v2winchip">WINNING</div>':'')+'</div></div></div>';
    var ai='<div class="bf-v2card"><div class="bf-v2sh"><span class="bf-v2t">AIFORCE RECOMMENDATION<span class="bf-v2ai">AI</span></span></div><div class="bf-v2airow"><div class="bf-v2ring">'+(prob!=null?('<svg width="96" height="96"><circle cx="48" cy="48" r="40" stroke="#22262b" stroke-width="8" fill="none"></circle><circle cx="48" cy="48" r="40" stroke="#8fe04a" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="251.3" stroke-dashoffset="'+(251.3*(1-prob/100)).toFixed(1)+'" transform="rotate(-90 48 48)"></circle></svg><div class="bf-v2pct">'+prob+'%</div>'):'')+'</div><div style="flex:1;min-width:0;"><div class="bf-v2k">Probability of Acquisition '+(probTier?'· '+probTier:'')+'</div><div class="bf-v2arow"><div><div class="bf-v2k">Recommended Offer</div><div class="bf-v2v green">'+(recOffer!=null?bfV2Money(recOffer):'—')+'</div></div></div><div class="bf-v2arow"><div><div class="bf-v2k">Seller likely objection</div><div class="bf-v2v" style="font-size:14px;">'+esc(objection)+'</div></div></div></div></div></div>';
    var prog='<div class="bf-v2card"><div class="bf-v2sh"><span class="bf-v2t">DEAL PROGRESS</span><span style="font-size:12px;color:#9aa0a6;font-weight:600;">'+done+' of '+MILESTONES.length+'</span></div><div class="bf-v2prog">'+steps+'</div></div>';
    var feed='<div class="bf-v2card"><div class="bf-v2tabs"><div class="bf-v2tab on" data-vt="act">ACTIVITY</div><div class="bf-v2tab" data-vt="notes">NOTES</div><div class="bf-v2tab" data-vt="tasks">TASKS</div></div><div class="bf-v2feed" data-vp="act"><div class="bf-v2empty">Loading activity…</div></div><div class="bf-v2feed" data-vp="notes" style="display:none;"><div class="bf-v2empty">No notes.</div></div><div class="bf-v2feed" data-vp="tasks" style="display:none;"><div class="bf-v2empty">No tasks.</div></div></div>';
    var acts='<div class="bf-v2acts"><a class="bf-v2act call" data-act="call"><i class="ti ti-phone" aria-hidden="true"></i>Call</a><a class="bf-v2act" data-act="text"><i class="ti ti-message-2" aria-hidden="true"></i>Text</a><a class="bf-v2act" data-act="email"><i class="ti ti-mail" aria-hidden="true"></i>Email</a><a class="bf-v2act" data-act="offer"><i class="ti ti-currency-dollar" aria-hidden="true"></i>Offer</a><a class="bf-v2act" data-act="more"><i class="ti ti-dots" aria-hidden="true"></i>More</a></div>';
    return '<div class="bf-v2wrap">'+head+'<div class="bf-v2grid"><div class="bf-v2col">'+p3+comp+'</div><div class="bf-v2col">'+prog+'</div></div><div class="bf-v2wsslot"></div><div class="bf-v2secs"></div>'+acts+'</div>';
  }
  function bfV2Wire(host, uuid, R){
    host.querySelectorAll('.bf-v2act').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); var k=a.getAttribute('data-act'); bfToast(k.charAt(0).toUpperCase()+k.slice(1)+' \u2014 (wire next)'); }); });
    host.querySelectorAll('.bf-v2vin[data-bfvin]').forEach(function(v){ v.addEventListener('click',function(){ try{ navigator.clipboard.writeText(v.getAttribute('data-bfvin')); bfToast('VIN copied'); }catch(e){} }); });
  }
  var bfV2Fetching={};
  function bfV2Fetch(uuid){
    if(bfV2Fetching[uuid]) return; bfV2Fetching[uuid]=1;
    var tk=''; try{ tk=bfGetApiToken(); }catch(e){}
    if(!tk){ bfV2Fetching[uuid]=0; return; }
    try{
      fetch(BF_WH+'/pipeline-summary',{method:'POST',headers:{'Content-Type':'application/json','X-BF-Token':tk},body:'{}'})
        .then(function(r){return r.json();})
        .then(function(d){ if(d){ var ap=function(arr){ (arr||[]).forEach(function(sg){ (sg.records||[]).forEach(function(r){ if(r&&r.uuid){ try{ var j=JSON.stringify(r); sessionStorage.setItem('bfrec:'+r.uuid,j); localStorage.setItem('bfrec:'+r.uuid,j); }catch(e){} } }); }); }; ap(d.stages); ap(d.other); } bfV2Fetching[uuid]=0; try{ bfV2(); }catch(e){} })
        .catch(function(){ bfV2Fetching[uuid]=0; });
    }catch(e){ bfV2Fetching[uuid]=0; }
  }
  function bfV2Nav(uuid){
    function ord(){ try{ return JSON.parse(sessionStorage.getItem('bf.pipeorder')||'[]'); }catch(e){ return []; } }
    function go(u){ if(u) location.href='/opportunities/view/'+u+'/summary'; }
    function back(){ location.href='/command'; }
    var nav=document.getElementById('bf-v2nav');
    if(!nav){
      nav=document.createElement('div'); nav.id='bf-v2nav';
      nav.innerHTML='<div class="bf-v2navbtn bf-v2back" role="button" tabindex="0" title="Back to pipeline (Esc)"><i class="ti ti-arrow-left" aria-hidden="true"></i></div><div class="bf-v2navbtn bf-v2prev" role="button" tabindex="0" title="Previous deal (left arrow)"><i class="ti ti-chevron-left" aria-hidden="true"></i></div><div class="bf-v2navbtn bf-v2next" role="button" tabindex="0" title="Next deal (right arrow)"><i class="ti ti-chevron-right" aria-hidden="true"></i></div><div class="bf-v2pos"></div>';
      document.body.appendChild(nav);
      nav.querySelector('.bf-v2back').addEventListener('click', back);
      nav.querySelector('.bf-v2prev').addEventListener('click', function(){ var o=ord(),i=o.indexOf(nav.getAttribute('data-uuid')); if(i>0) go(o[i-1]); });
      nav.querySelector('.bf-v2next').addEventListener('click', function(){ var o=ord(),i=o.indexOf(nav.getAttribute('data-uuid')); if(i>-1&&i<o.length-1) go(o[i+1]); });
      if(!window.__bfV2Keys){ window.__bfV2Keys=1; document.addEventListener('keydown', function(e){ if(document.documentElement.getAttribute('data-bfv2')!=='1') return; var tg=e.target; if(tg&&(/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)||tg.isContentEditable)) return; var nv=document.getElementById('bf-v2nav'); var u=nv?nv.getAttribute('data-uuid'):''; var o=ord(),i=o.indexOf(u); if(e.key==='Escape'){ back(); } else if(e.key==='ArrowLeft'){ if(i>0) go(o[i-1]); } else if(e.key==='ArrowRight'){ if(i>-1&&i<o.length-1) go(o[i+1]); } }); }
    }
    nav.setAttribute('data-uuid', uuid);
    var o=ord(), idx=o.indexOf(uuid);
    var pos=nav.querySelector('.bf-v2pos'), pv=nav.querySelector('.bf-v2prev'), nx=nav.querySelector('.bf-v2next');
    if(idx>-1 && o.length>1){ pos.textContent=(idx+1)+' / '+o.length; pos.style.display=''; pv.style.display=''; nx.style.display=''; pv.style.visibility=idx>0?'visible':'hidden'; nx.style.visibility=idx<o.length-1?'visible':'hidden'; }
    else { pos.style.display='none'; pv.style.display='none'; nx.style.display='none'; }
  }
  function bfV2(){
    if(!/\/(view|preview)\/rec[0-9a-z]+/.test(location.pathname)){ if(document.documentElement.getAttribute('data-bfv2')==='1'){ document.documentElement.removeAttribute('data-bfv2'); document.documentElement.removeAttribute('data-bfv2framed'); var old=document.getElementById('bf-v2'); if(old) old.remove(); var oldn=document.getElementById('bf-v2nav'); if(oldn) oldn.remove(); } return; }
    var body=document.querySelector('[data-testid="record-view-body"]'); if(!body) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var host=document.getElementById('bf-v2');
    if(!host || host.getAttribute('data-uuid')!==uuid){
      var R={}; try{ R=JSON.parse(sessionStorage.getItem('bfrec:'+uuid)||localStorage.getItem('bfrec:'+uuid)||'{}'); }catch(e){}
      if(!R || Object.keys(R).length<3){ bfV2Fetch(uuid); return; }
      if(!host){ host=document.createElement('div'); host.id='bf-v2'; }
      host.setAttribute('data-uuid',uuid); host.innerHTML=bfV2Html(R,uuid);
      if(host.parentNode!==body) body.insertBefore(host, body.firstChild);
      bfV2Wire(host,uuid,R);
    }
    document.documentElement.setAttribute('data-bfv2','1');
    var bfV2Framed=false; try{ bfV2Framed = bfPipeIsDrawer() || /\/preview\//.test(location.pathname); }catch(_fr){ bfV2Framed=false; }
    document.documentElement.setAttribute('data-bfv2framed', bfV2Framed?'1':'0');
    if(bfV2Framed){ var _vn=document.getElementById('bf-v2nav'); if(_vn) _vn.remove(); }
    else { try{ bfV2Nav(uuid); }catch(_nv){} }
    if(!body.__bfV2Bd){ body.__bfV2Bd=1; body.addEventListener('click', function(e){ if(document.documentElement.getAttribute('data-bfv2')!=='1') return; if(document.documentElement.getAttribute('data-bfv2framed')==='1') return; var v=document.getElementById('bf-v2'); if(v && !v.contains(e.target) && !(e.target.closest&&e.target.closest('#bf-v2nav'))){ try{ location.href='/command'; }catch(_x){} } }); }
    var slot=host.querySelector('.bf-v2wsslot');
    var secwrap=host.querySelector('.bf-v2secs');
    [].forEach.call(body.children, function(c){
      if(c===host) return;
      if(c.classList && c.classList.contains('bf-ws')){ if(slot && c.parentNode!==slot){ slot.appendChild(c); } c.style.removeProperty('display'); return; }
      if(secwrap && c.querySelector){ var _ds=c.querySelector('[data-testid="details-section"]'); var _h2=_ds&&_ds.querySelector('h2'); if(_ds && _h2 && /vin|competing offers|make the offer|send offer|schedule|payoff/i.test(_h2.textContent||'')){ if(c.parentNode!==secwrap){ secwrap.appendChild(c); } c.style.removeProperty('display'); return; } }
      if(c.style.display!=='none') c.style.setProperty('display','none','important');
    });
  }
  function bfColDefaultSweep(){
    if(!bfFirstDefault || (Date.now()-bfDefaultAt>8000)) return;
    if(/\/(preview|view)\//.test(location.pathname)) return;
    var groups=document.querySelectorAll('[data-testid="collection-group"]:not(.w-12)');
    var KEEP=/fresh leads|appraisal complete|offer sheet generated|offer sent/i;
    [].forEach.call(groups,function(g){
      var lab=g.querySelector('[data-testid="collection-group-header-label"]');
      var t=lab?(lab.textContent||'').trim():'';
      if(t && !KEEP.test(t)){ var btn=g.querySelector('[data-testid="collection-group-header"] button'); if(btn) btn.click(); }
    });
  }
  var BF_DBADGE='<svg class="bf-dbadge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>';
  function bfSetNoticeIcon(n){ var ii=n.querySelector('i.ti'); var sp=ii?ii.parentElement:null; if(sp && sp.getAttribute('data-bficon')!=='1'){ sp.setAttribute('data-bficon','1'); sp.innerHTML=BF_DBADGE; } }
  function bfRecSectionIcons(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var rv=document.querySelector('[data-testid="record-view"]'); if(!rv) return;
    var MAP=[[/vehicle|vin|decode/i,'ti-car'],[/payoff|equity|finance/i,'ti-credit-card'],[/apprais/i,'ti-clipboard-check'],[/competition|offers to beat|carmax|carvana/i,'ti-swords'],[/offer|price|valuation/i,'ti-cash'],[/schedul|appoint/i,'ti-calendar'],[/seller|contact/i,'ti-user'],[/listing|location/i,'ti-map-pin'],[/note|condition/i,'ti-notes']];
    rv.querySelectorAll('[class*="section-title"]').forEach(function(el){
      if(el.getAttribute('data-bfsicon')) return;
      var t=(el.textContent||'').replace(/\s+/g,' ').trim(); if(!t) return;
      var icon=''; for(var i=0;i<MAP.length;i++){ if(MAP[i][0].test(t)){ icon=MAP[i][1]; break; } }
      if(!icon) return;
      el.setAttribute('data-bfsicon','1');
      var ic=document.createElement('i'); ic.className='ti '+icon+' bf-sicon'; ic.setAttribute('aria-hidden','true'); ic.style.cssText='margin-right:7px;font-size:0.95em;color:#9aa0a6;vertical-align:-1px;';
      el.insertBefore(ic, el.firstChild);
    });
  }
  function bfRecHlIcons(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    var MAP=[[/asking price/i,'ti-tag'],[/offer amount/i,'ti-cash'],[/payoff/i,'ti-credit-card'],[/equity/i,'ti-wallet'],[/carmax/i,'$'],[/carvana/i,'$']];
    sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(it){
      var lb=it.querySelector('[data-testid="highlight-label"]'); if(!lb) return;
      var t=lb.textContent||''; var icon='';
      for(var i=0;i<MAP.length;i++){ if(MAP[i][0].test(t)){ icon=MAP[i][1]; break; } }
      if(!icon) return;
      var inner=lb.closest('[class*="flex-col"]')||lb.parentElement.parentElement; if(!inner) return;
      var content = icon==='$' ? BF_DBADGE : '<i class="ti '+icon+'" aria-hidden="true"></i>';
      var ex=inner.querySelector(':scope > .bf-hicon');
      if(ex && ex.getAttribute('data-ic')===icon) return;
      if(ex) ex.remove();
      var sp=document.createElement('span'); sp.className='bf-hicon'; sp.setAttribute('data-ic',icon); sp.setAttribute('aria-hidden','true'); sp.innerHTML=content;
      inner.insertBefore(sp, inner.firstChild);
    });
  }
  var bfHlResizeBound=false;
  var bfMoResizeBound=false;
  function bfRecMobileOffers(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    var grid=sb.querySelector('[class*="section-highlights"] [class*="grid"]'); if(!grid) return;
    if(!bfMoResizeBound){ bfMoResizeBound=true; window.addEventListener('resize', bfDeb(function(){ try{ bfRecMobileOffers(); }catch(e){} },180), {passive:true}); }
    var cmH=null, cvH=null;
    grid.querySelectorAll('[data-testid="highlight-item"]').forEach(function(it){ var l=it.querySelector('[data-testid="highlight-label"]'); var t=l?(l.textContent||''):''; if(/carmax/i.test(t)) cmH=it; else if(/carvana/i.test(t)) cvH=it; });
    var lbl=grid.querySelector(':scope > .bf-otb-m');
    var pill=grid.querySelector(':scope > .bf-mbeats');
    if(window.innerWidth>900){ if(lbl) lbl.remove(); if(pill) pill.remove(); return; }
    if(cmH){ if(!lbl){ lbl=document.createElement('div'); lbl.className='bf-otb-m'; lbl.textContent='Offers to beat'; } if(cmH.previousElementSibling!==lbl){ grid.insertBefore(lbl, cmH); } }
    if(cvH){
      var comp=null; var bn=sb.querySelector('.bf-noti-beats h5'); if(bn) comp=compInfo(bn.textContent);
      if(!comp){ var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; var card=uuid?document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'):null; if(card){ comp=compInfo(bfReadF(card)['Competition']); } }
      if(comp){ var c=COMPC[comp.color]; if(!pill){ pill=document.createElement('div'); pill.className='bf-mbeats'; } var raw=comp.label+'|'+comp.color; if(pill.getAttribute('data-raw')!==raw){ pill.setAttribute('data-raw',raw); pill.style.background=c.bg; pill.style.color=c.fg; pill.innerHTML='<span><i class="ti '+comp.icon+'" aria-hidden="true"></i>'+comp.label+'</span>'; } if(cvH.nextElementSibling!==pill){ grid.insertBefore(pill, cvH.nextSibling); } }
      else if(pill){ pill.remove(); }
    }
  }
  function bfRecSectionsUI(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]');
    var stg; if(card){ stg=stageOf(card); } else { var _Rs={}; try{ _Rs=JSON.parse(sessionStorage.getItem('bfrec:'+uuid)||localStorage.getItem('bfrec:'+uuid)||'{}'); }catch(e){} stg=_Rs.status||''; if(!stg) return; }
    var checks=STATUS_CHECKS[stg]||[];
    var MAP=[[/vin\s*&|vin and|vin &amp;|vin\b/i,'ti-car',0],[/competing offers/i,'ti-scale',2],[/make the offer/i,'ti-businessplan',4],[/send offer/i,'ti-send',5],[/schedule/i,'ti-calendar-event',7],[/payoff/i,'ti-receipt',8]];
    var firstNotDone=false;
    [].forEach.call(document.querySelectorAll('[data-testid="details-section"]'),function(sec){
      var h=sec.querySelector('h2'); if(!h) return;
      var t=h.textContent.replace(/\s+/g,' ').trim();
      var info=null; for(var i=0;i<MAP.length;i++){ if(MAP[i][0].test(t)){ info=MAP[i]; break; } }
      if(!info) return;
      var done=checks.indexOf(info[2])>-1;
      var status=done?'done':(firstNotDone?'upcoming':'current');
      if(!done&&!firstNotDone) firstNotDone=true;
      sec.classList.add('bf-rsec');
      sec.classList.remove('bf-rsec-done','bf-rsec-current','bf-rsec-upcoming');
      sec.classList.add('bf-rsec-'+status);
      var ic=h.querySelector(':scope > .bf-rsicon');
      if(!ic){ ic=document.createElement('span'); ic.className='bf-rsicon'; ic.innerHTML='<i class="ti '+info[1]+'" aria-hidden="true"></i>'; h.insertBefore(ic,h.firstChild); }
      var par=h.parentElement;
      var cc=par.querySelector(':scope > .bf-rscc');
      if(!cc){ cc=document.createElement('span'); cc.className='bf-rscc'; par.insertBefore(cc, par.firstChild); }
      if(cc.getAttribute('data-st')!==status){ cc.innerHTML = done?'<i class="ti ti-check" aria-hidden="true"></i>':''; cc.setAttribute('data-st',status); }
      var chip=h.querySelector(':scope > .bf-rschip');
      if(status==='current'){ if(!chip){ chip=document.createElement('span'); chip.className='bf-rschip'; chip.textContent='Current step'; h.appendChild(chip); } chip.style.display=''; }
      else if(chip){ chip.style.display='none'; }
      if(/competing offers/i.test(t)){
        [].forEach.call(sec.querySelectorAll('p,div,span'),function(el){ if(el.children.length===0 && !el.classList.contains('bf-secblurb') && /in this section, notate/i.test(el.textContent||'')) el.style.display='none'; });
        var cmLbl=null; [].forEach.call(sec.querySelectorAll('label'),function(l){ if(/carmax offer/i.test(l.textContent)) cmLbl=l; });
        if(cmLbl){ var cc2=cmLbl; while(cc2&&cc2.parentElement&&cc2.parentElement.tagName!=='FORM') cc2=cc2.parentElement; var bl=sec.querySelector('.bf-secblurb'); if(!bl){ bl=document.createElement('div'); bl.className='bf-secblurb'; bl.textContent='In this section, notate anything noteworthy about the condition. Also, enter the values from CarMax and Carvana so the appraiser knows where the competition is on the vehicle.'; } if(cc2&&cc2.parentNode&&cc2.previousElementSibling!==bl) cc2.parentNode.insertBefore(bl,cc2); }
      }
      var _coll=!sec.querySelector('form'); [].forEach.call(sec.querySelectorAll('[data-testid="action-button"]'),function(b){ b.style.display=_coll?'none':''; });
      [].forEach.call(sec.querySelectorAll('form > div'),function(cell){ var lb=cell.querySelector('label'); if(!lb) return; var lt=lb.textContent.trim(); var vEl=cell.querySelector('[id="field-cell"]'); if(!vEl) return; var vt=(vEl.textContent||'').trim(); function setp(c){ vEl.classList.add('bf-pillval'); vEl.classList.remove('bf-pg','bf-pa','bf-pr'); vEl.classList.add(c); } if(/accident history/i.test(lt)){ if(/clean/i.test(vt)) setp('bf-pg'); else if(/accident/i.test(vt)) setp('bf-pa'); } else if(/offer sheet status/i.test(lt)){ if(/not generated/i.test(vt)) setp('bf-pr'); else if(/generated/i.test(vt)) setp('bf-pg'); } });
    });
  }
  function bfPortBlock(stages, skip, skipUrl, F, uuid){
    var textHtml='', btnHtml='', seen={};
    stages.forEach(function(sk){
      var ui=STAGE_UI[sk]; if(!ui) return;
      var items = ui.layout ? ui.layout.slice() : [];
      if(!ui.layout){ (ui.tracks||[]).forEach(function(wt){items.push({k:'track',wt:wt});}); (ui.fields||[]).forEach(function(fd){items.push({k:'field',f:fd});}); (ui.buttons||[]).forEach(function(b){items.push({k:'btn',b:b});}); }
      items.forEach(function(it){
        if(skip.indexOf(it.k)>-1) return;
        if(it.k==='btn'){ if(skipUrl && it.b.a==='url') return; var key=it.b.l+'|'+(it.b.to||''); if(seen[key]) return; seen[key]=1; if(it.b.showEmpty&&(F[it.b.showEmpty]||'').trim())return; btnHtml+=bfButton(it.b,uuid); }
        else if(it.k==='field'){ textHtml+=bfFieldHtml(it.f,F,uuid); }
        else if(it.k==='track'){ var tk='trk|'+it.wt.l; if(seen[tk])return; seen[tk]=1; textHtml+=bfTrack(it.wt,F); }
        else if(it.k==='notes'){ textHtml+=bfNotesPreview(F); }
        else if(it.k==='info'){ textHtml+='<div class="bf-info">'+esc(it.text)+'</div>'; }
        else if(it.k==='apptin'){ textHtml+=bfApptIn(F); }
      });
    });
    if(!textHtml && !btnHtml) return '';
    return '<div class="bf-portgrid">'+(textHtml?'<div class="bf-port-text">'+textHtml+'</div>':'')+(btnHtml?'<div class="bf-port-btns">'+btnHtml+'</div>':'')+'</div>';
  }
  function bfRecPort(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var mm=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=mm?mm[1]:''; if(!uuid) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'); var F=card?bfReadF(card):{};
    var CFG=[
      {re:/vin\b|vin &/i, stages:['Fresh Leads','Engaged - Awaiting VIN'], skip:['decode','field'], skipUrl:false},
      {re:/competing offers/i, stages:['VIN Received - Appraisal Needed'], skip:['field','info'], skipUrl:true},
      {re:/make the offer/i, stages:['Appraisal Complete - Enter Offer Sheet Values'], skip:['field','info'], skipUrl:false},
      {re:/send offer/i, stages:['Offer Sheet Generated','Nurturing (Follow Up and Re-engage)'], skip:['field'], skipUrl:false},
      {re:/schedule/i, stages:['Verbal Yes - Schedule Appt','Scheduled'], skip:['field'], skipUrl:false}
    ];
    [].forEach.call(document.querySelectorAll('[data-testid="details-section"]'),function(sec){
      var h=sec.querySelector('h2'); if(!h) return; var t=h.textContent.replace(/\s+/g,' ').trim();
      var cfg=null; for(var i=0;i<CFG.length;i++){ if(CFG[i].re.test(t)){ cfg=CFG[i]; break; } }
      if(!cfg) return;
      var ex=sec.querySelector(':scope > .bf-secport');
      var collapsed=!sec.querySelector('form');
      if(collapsed){ if(ex) ex.style.display='none'; return; }
      if(ex) ex.style.display='';
      var raw=cfg.stages.join('|')+'#'+(F['Vehicle Title']||'')+'#'+(F['Offer Sheet Image URL']||'')+'#'+(F['Notes for Appraisal']||F['Condition Notes']||'')+'#'+(F['Seller Name']||'')+'#'+(F['Appointment Date/Time']||F['Appointment']||'');
      if(ex && ex.getAttribute('data-raw')===raw) return;
      var html=bfPortBlock(cfg.stages, cfg.skip, cfg.skipUrl, F, uuid);
      if(!html){ if(ex) ex.remove(); return; }
      if(!ex){ ex=document.createElement('div'); ex.className='bf-secport'; sec.appendChild(ex); }
      ex.setAttribute('data-raw', raw);
      ex.innerHTML='<div class="bf-secdiv"></div>'+html;
    });
  }
  function bfRecEditableHl(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    document.querySelectorAll('[class*="section-notice"]').forEach(function(n){
      var key=null,lbl=null;
      if(n.classList.contains('bf-noti-cm')){ key='carMaxOffer'; lbl='CarMax Offer'; }
      else if(n.classList.contains('bf-noti-cv')){ key='carvanaOffer'; lbl='Carvana Offer'; }
      if(!key) return;
      var cand=n.querySelectorAll('p,span,h5,h4,div'), valEl=null;
      for(var i=0;i<cand.length;i++){ var e=cand[i]; if(e.children.length===0 && /\$[\d,]/.test(e.textContent||'')){ valEl=e; break; } }
      if(valEl && !valEl.classList.contains('bf-edit')){ valEl.classList.add('bf-edit'); valEl.setAttribute('data-bfkey',key); valEl.setAttribute('data-bflabel',lbl); valEl.setAttribute('data-bffmt','money'); }
    });
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(it){
      var lb=it.querySelector('[data-testid="highlight-label"]'); if(!lb) return; var t=lb.textContent||'';
      var vl=it.querySelector('[data-testid="highlight-value"]');
      if(/offer amount/i.test(t)){
        if(vl && !vl.classList.contains('bf-edit')){ vl.classList.add('bf-edit'); vl.setAttribute('data-bfkey','offerAmount'); vl.setAttribute('data-bflabel','Offer Amount'); vl.setAttribute('data-bffmt','money'); }
        var acv=it.querySelector('[class*="text-stone-600"]'); if(acv){ if(!acv.classList.contains('bf-edit')){ acv.classList.add('bf-edit'); acv.setAttribute('data-bfkey','acv'); acv.setAttribute('data-bflabel','ACV'); acv.setAttribute('data-bffmt','acv'); } if(window.innerWidth<=900){ acv.style.setProperty('color','#141414','important'); } else { acv.style.removeProperty('color'); } var _at=acv.textContent||''; if(_at.indexOf('ACV:')>-1){ acv.textContent=_at.replace('ACV:','ACV'); } }
      } else if(/payoff/i.test(t)){
        if(/estimated payoff/i.test(t) && lb.textContent.trim().toUpperCase()!=='EST PAYOFF AMOUNT'){ lb.textContent='Est Payoff Amount'; }
        if(vl && !vl.classList.contains('bf-edit')){ vl.classList.add('bf-edit'); vl.setAttribute('data-bfkey','estimatedPayoffAmount'); vl.setAttribute('data-bflabel','Est Payoff'); vl.setAttribute('data-bffmt','money'); }
        if(vl && vl.getAttribute('data-editing')!=='1'){ var pv=(vl.textContent||'').trim(); if(pv===''||/^[-\u2013\u2014]+$/.test(pv)){ if(vl.textContent!=='-') vl.textContent='-'; } }
      } else if(/carmax/i.test(t)){
        if(vl && !vl.classList.contains('bf-edit')){ vl.classList.add('bf-edit'); vl.setAttribute('data-bfkey','carMaxOffer'); vl.setAttribute('data-bflabel','CarMax Offer'); vl.setAttribute('data-bffmt','money'); }
      } else if(/carvana/i.test(t)){
        if(vl && !vl.classList.contains('bf-edit')){ vl.classList.add('bf-edit'); vl.setAttribute('data-bfkey','carvanaOffer'); vl.setAttribute('data-bflabel','Carvana Offer'); vl.setAttribute('data-bffmt','money'); }
      }
    });
  }
  document.addEventListener('click', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-edit'):null;
    if(!el || el.getAttribute('data-editing')==='1' || (e.target&&e.target.tagName==='INPUT')) return;
    e.preventDefault(); e.stopPropagation();
    var key=el.getAttribute('data-bfkey'), lbl=el.getAttribute('data-bflabel'), fmt=el.getAttribute('data-bffmt');
    var cur=(el.textContent||'').replace(/[^0-9.]/g,'');
    el.setAttribute('data-editing','1'); el.setAttribute('data-orig', el.innerHTML);
    el.innerHTML='<input class="bf-edit-input" type="text" inputmode="decimal" value="'+cur+'">';
    var inp=el.querySelector('input'); if(inp){ inp.focus(); try{inp.select();}catch(_){} }
    var done=false;
    function fin(sv){ if(done)return; done=true; el.removeAttribute('data-editing'); el.removeAttribute('data-orig');
      var raw=(sv||'').replace(/[^0-9.]/g,''); var n=raw!==''?Number(raw):'';
      var uuid=(location.pathname.match(/\/(rec[0-9a-z]+)/i)||[])[1]||'';
      var payload={uuid:uuid}; payload[key]=(n===''?null:n); bfPost(payload); if(key==='estimatedPayoffAmount'||key==='acv'||key==='actualPayoff'||key==='actualPayoffAmount'){ try{ bfRecRecalcEquity(uuid, key, n); }catch(_e){} }
      el.textContent = n===''?'-':(fmt==='acv'?('ACV $'+Number(n).toLocaleString('en-US')):('$'+Number(n).toLocaleString('en-US')));
      try{ var _d=el.textContent; document.querySelectorAll('.bf-edit[data-bfkey="'+key+'"]').forEach(function(o){ if(o!==el && o.getAttribute('data-editing')!=='1'){ o.textContent=_d; } }); }catch(_2){}
      bfToast(lbl+' saved');
      if(key==='offerAmount'){ try{ bfRecTop(); }catch(_){} }
    }
    function cancel(){ if(done)return; done=true; el.removeAttribute('data-editing'); el.innerHTML=el.getAttribute('data-orig')||''; el.removeAttribute('data-orig'); }
    if(inp){ inp.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); fin(inp.value); } else if(ev.key==='Escape'){ ev.preventDefault(); cancel(); } }); inp.addEventListener('blur', function(){ fin(inp.value); }); }
  }, true);
  function bfRecNumFromEdit(k){ var el=document.querySelector('.bf-edit[data-bfkey="'+k+'"]'); if(!el) return NaN; var s=(el.textContent||'').replace(/[^0-9.]/g,''); return s===''?NaN:Number(s); }
  function bfRecRecalcEquity(uuid, changedKey, changedVal){
    var cv = changedVal===''?NaN:Number(changedVal);
    var acv = changedKey==='acv' ? cv : bfRecNumFromEdit('acv');
    var est = changedKey==='estimatedPayoffAmount' ? cv : bfRecNumFromEdit('estimatedPayoffAmount');
    var act = (changedKey==='actualPayoff'||changedKey==='actualPayoffAmount') ? cv : bfRecNumFromEdit('actualPayoff');
    if(isNaN(act)) act=bfRecNumFromEdit('actualPayoffAmount');
    var payoff = (!isNaN(act)&&act>0) ? act : est;
    if(isNaN(acv)||isNaN(payoff)) return;
    var eq = Math.round(acv - payoff);
    var disp = (eq<0?'-$':'+$')+Math.abs(eq).toLocaleString('en-US');
    var status = eq>=0?'Positive':'Negative';
    bfPost({uuid:uuid, estimatedEquityPosition:eq, estEquityPosition:eq, equityPosition:eq, equityDisplay:disp, equityStatus:status});
    try{ document.querySelectorAll('.bf-eqval,[data-bfeq]').forEach(function(o){ o.textContent=disp; }); }catch(_e){}
    bfToast('Equity updated to '+disp);
  }
  function bfRecHideBottomBtns(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var rv=document.querySelector('[data-testid="record-view"]'); if(!rv) return;
    var SBSEL='[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])';
    rv.querySelectorAll('[data-testid="action-button"]').forEach(function(b){
      if(b.closest('[data-testid="details-section"]')||b.closest('.bf-rectop')||b.closest('.bf-secport')||b.closest(SBSEL)) return;
      b.style.display='none';
    });
  }
  function bfSC(){ var g=document.querySelector('[data-testid="collection-group"]'); return g?g.parentElement:null; }
  function bfPos(sc, el){ return el.getBoundingClientRect().left - sc.getBoundingClientRect().left + sc.scrollLeft; }
  function bfExpanded(sc){ return sc.querySelectorAll('[data-testid="collection-group"]:not(.w-12)'); }
  function bfNext(sc){
    var vr=sc.scrollLeft + sc.clientWidth, max=sc.scrollWidth - sc.clientWidth, cols=bfExpanded(sc);
    for(var i=0;i<cols.length;i++){ var left=bfPos(sc,cols[i]); var right=left+cols[i].offsetWidth; if(right > vr + 4){ return Math.min(max, right - sc.clientWidth + 12); } }
    if((max - sc.scrollLeft) > 4) return max;
    return null;
  }
  function bfPrev(sc){
    var vl=sc.scrollLeft, cols=bfExpanded(sc), t=null;
    for(var i=0;i<cols.length;i++){ var left=bfPos(sc,cols[i]); if(left < vl - 4){ t=Math.max(0, left - 12); } }
    if(t!==null) return t;
    if(vl>4) return 0;
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
    if(!sc.getAttribute('data-bfscroll')){
      sc.addEventListener('scroll',function(){ if(!bfBusy) updateArrows(); },{passive:true});
      sc.setAttribute('data-bfscroll','1');
      if(!bfArrowResize){ bfArrowResize=true; window.addEventListener('resize', bfDeb(function(){ updateArrows(); },180), {passive:true}); }
      updateArrows();
    }
  }
  var BF_HOOK='https://buyforce.app.n8n.cloud/webhook/update-stage';
  var bfStageBusy=false;
  function bfLS(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  document.addEventListener('mousedown', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-ms, .bf-comment, .bf-actions, .bf-listing, .bf-vincopy'):null;
    if(el){ e.stopPropagation(); }
  }, true);
  document.addEventListener('pointerdown', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-ms, .bf-comment, .bf-actions, .bf-listing, .bf-vincopy'):null;
    if(el){ e.stopPropagation(); }
  }, true);
  document.addEventListener('click', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-ms'):null;
    if(!el) return;
    e.preventDefault(); e.stopPropagation();
    var card=el.closest('[data-testid="collection-record"]');
    var href=card?(card.getAttribute('href')||''):'';
    var m=href.match(/(rec[0-9a-z]+)/i);
    var uuid=m?m[1]:'';
    if(!uuid) return;
    var type=el.getAttribute('data-bfclick');
    if(type==='cv'){
      var k='bfcv:'+uuid;
      try{ if(localStorage.getItem(k)==='1') localStorage.removeItem(k); else localStorage.setItem(k,'1'); }catch(err){}
      var b=card.querySelector('.bf-body'); if(b) b.removeAttribute('data-raw');
      addCards(true);
    } else if(type==='stage'){
      bfMoveCard(card, uuid, el.getAttribute('data-bfstage'));
    }
  }, true);
  document.addEventListener('click', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-rtclick'):null;
    if(!el) return;
    e.preventDefault(); e.stopPropagation();
    var cv=el.getAttribute('data-bfcv');
    if(cv){
      var k='bfcv:'+cv; try{ if(localStorage.getItem(k)==='1') localStorage.removeItem(k); else localStorage.setItem(k,'1'); }catch(err){}
      var t=document.querySelector('[data-testid="record-view-body"] > .bf-rectop'); if(t) t.removeAttribute('data-raw'); bfRecTop();
      var bc=document.querySelector('[data-testid="collection-record"][href*="'+cv+'"]'); if(bc){ var bb=bc.querySelector('.bf-body'); if(bb) bb.removeAttribute('data-raw'); } addCards(true);
      return;
    }
    var uuid=el.getAttribute('data-bfuuid'), to=el.getAttribute('data-bfstage');
    if(!uuid||!to) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]');
    if(card){ bfMoveCard(card, uuid, to); } else { bfPost({uuid:uuid, status:to}); bfToast('Moving to '+to+'…'); } try{ window.__bfStageOverride=window.__bfStageOverride||{}; window.__bfStageOverride[uuid]=to; var _rt=document.querySelector('[data-testid="record-view-body"] > .bf-rectop'); if(_rt) _rt.removeAttribute('data-raw'); bfRecTop(); }catch(_so){}
  }, true);
  document.addEventListener('click', function(e){
    var t=(e.target&&e.target.closest)?e.target.closest('.bf-rectab'):null;
    if(!t) return; e.preventDefault(); e.stopPropagation();
    var seg=t.getAttribute('data-bftab'); var rv=document.querySelector('[data-testid="record-view"]');
    var link=rv?rv.querySelector('a[href$="/'+seg+'"]'):null;
    if(link){ link.click(); } else { var base=location.pathname.replace(/\/(overview|vehicle-appraisal|offers-next-steps)\/?$/,''); location.href=base+'/'+seg; }
  }, true);
  document.addEventListener('click', function(e){
    var c=(e.target&&e.target.closest)?e.target.closest('.bf-recclose'):null;
    if(!c) return; e.preventDefault(); e.stopPropagation();
    try{ history.back(); }catch(_){ location.href='/opportunities-1'; }
  }, true);
  var bfEditing=false;
  document.addEventListener('click', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-comment'):null;
    if(!el) return;
    if(el.getAttribute('data-editing')){ e.preventDefault(); e.stopPropagation(); return; }
    e.preventDefault(); e.stopPropagation();
    var card=el.closest('[data-testid="collection-record"]');
    var href=card?(card.getAttribute('href')||''):'';
    var m=href.match(/(rec[0-9a-z]+)/i); var uuid=m?m[1]:'';
    if(!uuid) return;
    bfEditing=true; el.setAttribute('data-editing','1');
    el.innerHTML='<input type="text" placeholder="Add a comment\u2026" style="width:100%;border:1px solid #92df02;border-radius:6px;padding:5px 8px;font-size:11px;font-family:inherit;outline:none;box-sizing:border-box;" />';
    var inp=el.querySelector('input'); if(inp) inp.focus();
    var done=false;
    function finish(save){
      if(done) return; done=true; bfEditing=false;
      var txt=inp?(inp.value||'').trim():'';
      if(save && txt){
        var cells=card.querySelectorAll('[data-testid="field-cell"]');
        for(var i=0;i<cells.length;i++){ var lab=cells[i].querySelector('[data-testid="field-cell-label"]'); if(!lab) continue; var ln=norm(lab.textContent); var vn=lab.nextElementSibling; if(!vn) continue; if(ln==='Last Comment'){ vn.textContent=txt; } else if(ln==='Last Comment At'){ vn.textContent=new Date().toISOString(); } }
        try{ fetch('https://buyforce.app.n8n.cloud/webhook/add-comment',{method:'POST',body:JSON.stringify({uuid:uuid,text:txt})}); }catch(err){}
      }
      el.removeAttribute('data-editing');
      var b=card.querySelector('.bf-body'); if(b) b.removeAttribute('data-raw');
      addCards(true);
    }
    inp.addEventListener('keydown',function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); finish(true); } else if(ev.key==='Escape'){ ev.preventDefault(); finish(false); } });
    inp.addEventListener('blur',function(){ finish((inp.value||'').trim().length>0); });
  }, true);
  /* ===== inline field + stage-button interactions ===== */
  var bfToastEl;
  function bfToast(msg){
    if(!bfToastEl){ bfToastEl=document.createElement('div'); bfToastEl.style.cssText='position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:10050;background:#161616;color:#fff;font-size:13px;padding:9px 16px;border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.2s;pointer-events:none;'; document.body.appendChild(bfToastEl); }
    bfToastEl.textContent=msg; bfToastEl.style.opacity='1';
    clearTimeout(bfToastEl._t); bfToastEl._t=setTimeout(function(){ bfToastEl.style.opacity='0'; },2200);
  }
  function bfOpen(url){ if(!url) return; try{ var a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){ try{ window.open(url,'_blank','noopener'); }catch(_){} } }
  function bfReadF(card){
    var F={}; var first=card.querySelector('[data-testid="field-cell"]'); var cont=first?first.parentNode:card;
    (cont||card).querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){
      var lab=cell.querySelector('[data-testid="field-cell-label"]'); if(!lab) return;
      var vn=lab.nextElementSibling; F[norm(lab.textContent)]=dval(vn?vn.textContent:'');
    });
    return F;
  }
  function bfSetCell(card, label, val){
    var cells=card.querySelectorAll('[data-testid="field-cell"]');
    for(var i=0;i<cells.length;i++){ var lb=cells[i].querySelector('[data-testid="field-cell-label"]'); if(lb && norm(lb.textContent)===norm(label)){ var vn=lb.nextElementSibling; if(vn) vn.textContent=val; } }
  }
  function bfRebuild(card){ var b=card.querySelector('.bf-body'); if(b) b.removeAttribute('data-raw'); addCards(true); }
  function bfPost(payload){ try{ if(payload && typeof payload==='object'){ var _ak=['status','lastComment','lastCommentAt','lastFollowUpAt','apptDateAndTime']; var _act=false; for(var _i=0;_i<_ak.length;_i++){ if(_ak[_i] in payload){ _act=true; break; } } if(_act && !('lastActivityAt' in payload)){ payload.lastActivityAt=new Date().toISOString(); } } fetch(BF_HOOK,{method:'POST',body:JSON.stringify(payload)}); }catch(e){} }
  var bfMovedSet={};
  function bfFlashCard(card){ if(!card) return; card.classList.remove('bf-cardflash'); void card.offsetWidth; card.classList.add('bf-cardflash'); clearTimeout(card._bfFl); card._bfFl=setTimeout(function(){ card.classList.remove('bf-cardflash'); }, 1000); }
  function bfFindCard(uuid, stageName){
    var found=null;
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(c){
      var m=(c.getAttribute('href')||'').match(/(rec[0-9a-z]+)/i);
      if(m && m[1]===uuid && (!stageName || stageOf(c)===stageName)) found=c;
    });
    return found;
  }
  function bfExpandColumn(stageName){
    var groups=document.querySelectorAll('[data-testid="collection-group"]');
    for(var i=0;i<groups.length;i++){
      var l=groups[i].querySelector('[data-testid="collection-group-header-label"]');
      if(l && norm(l.textContent)===stageName){
        if(groups[i].classList.contains('w-12')){ var b=groups[i].querySelector('[data-testid="collection-group-header"] button'); if(b) b.click(); }
        return groups[i];
      }
    }
    return null;
  }
  function bfScrollToCard(card){
    var grp=card.closest('[data-testid="collection-group"]');
    var sc=bfSC();
    if(sc && grp){ try{ var left=bfPos(sc, grp); sc.scrollTo({left:Math.max(0,left-14), behavior:'smooth'}); }catch(e){} }
    setTimeout(function(){
      try{
        var vs=grp?grp.querySelector('[class*="overflow-y-auto"]'):null;
        if(vs){
          var cr=card.getBoundingClientRect(), vr=vs.getBoundingClientRect();
          var hd=grp.querySelector('[data-testid="collection-group-header"]'); var hh=hd?hd.offsetHeight:0;
          var delta=(cr.top - vr.top) - hh - 4;
          vs.scrollBy({top:delta, behavior:'smooth'});
        }
      }catch(e){}
      bfFlashCard(card);
    }, 420);
  }
  function bfFallbackTile(card, uuid, to){
    card.setAttribute('data-bfmoved','1');
    card.setAttribute('data-bforig', stageOf(card));
    var body=card.querySelector('.bf-body');
    if(!body){ body=document.createElement('div'); body.className='bf-body'; var fc=card.querySelector('[data-testid="field-cell"]'); (fc?fc.parentNode:card).appendChild(body); }
    body.innerHTML='<div class="bf-movedtile"><i class="ti ti-circle-check" aria-hidden="true"></i><span class="bf-movedtxt">Moved to '+esc(to)+'</span><a class="bf-undo">Undo</a><a class="bf-openrec">Open</a><span class="bf-movedbar"></span></div>';
    var bar=body.querySelector('.bf-movedbar'); if(bar){ bar.style.transition='width 6s linear'; requestAnimationFrame(function(){ bar.style.width='0%'; }); }
    card._bfFade=setTimeout(function(){
      var hh=card.offsetHeight; card.style.overflow='hidden'; card.style.transition='opacity .4s ease, max-height .45s ease, margin .4s ease, padding .4s ease'; card.style.maxHeight=hh+'px'; void card.offsetHeight;
      card.style.opacity='0'; card.style.maxHeight='0px'; card.style.marginTop='0'; card.style.marginBottom='0'; card.style.paddingTop='0'; card.style.paddingBottom='0';
      setTimeout(function(){ card.style.display='none'; }, 460);
    }, 6000);
  }
  function bfMoveCard(card, uuid, to){
    if(!uuid || bfMovedSet[uuid]) return;
    bfMovedSet[uuid]=true;
    bfPost({uuid:uuid, status:to});
    bfToast('Moving to '+to+'…');
    bfExpandColumn(to);
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      var dest=bfFindCard(uuid, to);
      if(dest){
        clearInterval(iv); delete bfMovedSet[uuid];
        bfExpandColumn(to);
        bfScrollToCard(dest);
        bfToast('Moved to '+to);
      } else if(tries>=24){
        clearInterval(iv); delete bfMovedSet[uuid];
        bfFallbackTile(card, uuid, to);
      }
    }, 250);
  }

  function bfSaveField(card, host, val){
    var uuid=host.getAttribute('data-bfuuid')||'';
    var key=host.getAttribute('data-bfk');
    var type=host.getAttribute('data-bftype');
    var label=host.getAttribute('data-bflabel');
    if(!uuid||!key){ bfRebuild(card); return; }
    var out=val;
    if(type==='number'||type==='money'){ var n=parseFloat((val||'').toString().replace(/[^0-9.\-]/g,'')); out=isNaN(n)?'':n; }
    var p={uuid:uuid}; p[key]=out; bfPost(p);
    if(label){ bfSetCell(card, label, (out===''?'':(type==='money'?'$'+out:String(out)))); }
    bfRebuild(card); bfFlashCard(card);
  }

  function bfEnterEdit(host, multiline){
    if(bfEditing || host.getAttribute('data-editing')) return;
    var card=host.closest('[data-testid="collection-record"]'); if(!card) return;
    var raw=host.getAttribute('data-bfval')||'';
    bfEditing=true; host.setAttribute('data-editing','1');
    var ph = host.getAttribute('data-bfph')||'';
    host.innerHTML = multiline ? '<textarea class="bf-fedit" rows="2" placeholder="'+esc(ph)+'"></textarea>' : '<input type="text" class="bf-fedit" placeholder="'+esc(ph)+'" />';
    var inp=host.querySelector('.bf-fedit'); if(inp){ inp.value=raw; inp.focus(); try{ if(!multiline) inp.select(); }catch(e){} }
    var done=false;
    function finish(save){
      if(done) return; done=true; bfEditing=false; host.removeAttribute('data-editing');
      var v=inp?inp.value.trim():'';
      if(save){ bfSaveField(card, host, v); } else { bfRebuild(card); }
    }
    inp.addEventListener('keydown', function(ev){
      if(ev.key==='Enter' && !multiline){ ev.preventDefault(); finish(true); }
      else if(ev.key==='Enter' && multiline && (ev.metaKey||ev.ctrlKey)){ ev.preventDefault(); finish(true); }
      else if(ev.key==='Escape'){ ev.preventDefault(); finish(false); }
    });
    inp.addEventListener('blur', function(){ setTimeout(function(){ if(!done) finish(true); }, 140); });
  }

  function bfAmountPrompt(btn){
    if(bfEditing || btn.getAttribute('data-editing')) return;
    var card=btn.closest('[data-testid="collection-record"]'); if(!card) return;
    var uuid=btn.getAttribute('data-bfuuid')||'';
    bfEditing=true; btn.setAttribute('data-editing','1');
    var orig=btn.innerHTML;
    btn.innerHTML='<input type="text" class="bf-amt" placeholder="$ new offer" />';
    var inp=btn.querySelector('.bf-amt'); if(inp) inp.focus();
    var done=false;
    function fin(save){
      if(done) return; done=true; bfEditing=false; btn.removeAttribute('data-editing');
      var n=inp?parseFloat((inp.value||'').replace(/[^0-9.]/g,'')):NaN;
      if(save && !isNaN(n)){
        bfPost({uuid:uuid, offerAmount:n, offerSheetStatus:'Generating'});
        try{ fetch(GEN_SHEET_HOOK,{method:'POST',body:JSON.stringify({uuid:uuid, offerAmount:n})}); }catch(e){}
        bfSetCell(card,'Offer Amount','$'+n); bfSetCell(card,'Offer Sheet Status','Generating');
        bfToast('Generating updated offer sheet…');
      }
      btn.innerHTML=orig; bfRebuild(card);
    }
    inp.addEventListener('keydown',function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); fin(true); } else if(ev.key==='Escape'){ ev.preventDefault(); fin(false); } });
    inp.addEventListener('blur',function(){ setTimeout(function(){ if(!done) fin(true); },140); });
  }

  function bfHandleBtn(btn){
    var uuid=btn.getAttribute('data-bfuuid')||'';
    var card=btn.closest('[data-testid="collection-record"]')||(uuid?document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'):null);
    var a=btn.getAttribute('data-bfaction');
    if(a==='url'){ bfOpen(btn.getAttribute('data-bfurl')); return; }
    if(a==='choice'){ var cw=btn.closest('.bf-choicewrap'); if(cw) cw.classList.toggle('bf-open'); return; }
    if(a==='soon'){ bfToast('Scheduling tool coming soon'); return; }
    if(!uuid) return;
    if(a==='stage'){
      bfMoveCard(card, uuid, btn.getAttribute('data-bfto'));
      return;
    }
    if(!card) return;
    if(a==='viewsheet'){
      var F=bfReadF(card); var img=F['Offer Sheet Image URL']||''; var nm=F['Vehicle Title']||'';
      if(!img){ bfToast('No offer sheet yet'); return; }
      bfOpen(VIEW_SHEET_PAGE+'?img='+encodeURIComponent(img)+'&name='+encodeURIComponent(nm));
      return;
    }
    if(a==='gensheet'){
      try{ fetch(GEN_SHEET_HOOK,{method:'POST',body:JSON.stringify({uuid:uuid})}); }catch(e){}
      bfPost({uuid:uuid, offerSheetStatus:'Generating'});
      bfSetCell(card,'Offer Sheet Status','Generating'); bfToast('Generating offer sheet…'); bfRebuild(card); bfFlashCard(card);
      return;
    }
    if(a==='copynotes'){
      var Fn=bfReadF(card);
      var notes=Fn['Notes for Appraisal']||Fn['Notes For Appraisal']||Fn['Appraisal Notes']||Fn['Condition Notes']||'';
      if(!notes){ bfToast('No appraisal notes yet'); return; }
      try{ navigator.clipboard.writeText(notes); }catch(_){}
      bfToast('Appraisal notes copied');
      return;
    }
    if(a==='decode'){ var Fd=bfReadF(card); var dvin=(Fd['VIN']||'').trim(); if(!dvin){ bfToast('Enter a VIN first'); return; } try{ fetch(CARD_DECODE_HOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uuid:uuid, vin:dvin})}); }catch(e){} bfToast('Decoding VIN\u2026'); return; }
    if(a==='confirmvin'){ try{ fetch(CARD_CONFIRM_HOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uuid:uuid})}); }catch(e){} bfSetCell(card,'Decode Status','CONFIRMED'); bfToast('Vehicle confirmed'); bfRebuild(card); bfFlashCard(card); return; }
    if(a==='denyvin'){ bfPost({uuid:uuid, decodeStatus:''}); bfSetCell(card,'Decode Status',''); bfToast('Cleared \u2014 re-enter the VIN'); bfRebuild(card); return; }
    if(a==='regensheet'){ bfAmountPrompt(btn); return; }
    if(a==='followup'){
      var iso=new Date().toISOString();
      bfPost({uuid:uuid, lastFollowUpAt:iso});
      bfSetCell(card,'Last Follow Up At', iso); bfToast('Follow-up logged · clock reset'); bfRebuild(card); bfFlashCard(card);
      return;
    }
  }

  document.addEventListener('click', function(e){
    var t=e.target; if(!t||!t.closest) return;
    if(t.closest('.bf-fedit, .bf-amt')){ e.preventDefault(); e.stopPropagation(); return; }
    var lst=t.closest('.bf-listing');
    if(lst){ e.preventDefault(); e.stopPropagation(); var lu=lst.getAttribute('data-bfurl'); bfOpen(lu); return; }
    var vc=t.closest('.bf-vincopy');
    if(vc){ e.preventDefault(); e.stopPropagation(); var vv=vc.getAttribute('data-bfvin')||''; if(vv){ try{ navigator.clipboard.writeText(vv); }catch(_){} bfToast('VIN copied'); } return; }
    if(t.closest('[data-editing]')){ e.preventDefault(); e.stopPropagation(); return; }
    var cbar=t.closest('.bf-collapse-bar');
    if(cbar){ e.preventDefault(); e.stopPropagation(); var cu=cbar.getAttribute('data-bfuuid'); var ck='bfcol:'+cu; var isC=bfLS(ck)==='1'; try{ if(isC) localStorage.removeItem(ck); else localStorage.setItem(ck,'1'); }catch(_){} var act=cbar.closest('.bf-actions'); if(act) act.classList.toggle('bf-collapsed'); var ic=cbar.querySelector('.bf-collapse-ic'); if(ic){ ic.classList.toggle('ti-chevron-up'); ic.classList.toggle('ti-chevron-down'); } return; }
    var undo=t.closest('.bf-undo');
    if(undo){ e.preventDefault(); e.stopPropagation(); var uc=undo.closest('[data-testid="collection-record"]'); if(uc){ if(uc._bfFade) clearTimeout(uc._bfFade); var om=(uc.getAttribute('href')||'').match(/(rec[0-9a-z]+)/i); var ou=om?om[1]:''; var orig=uc.getAttribute('data-bforig'); if(ou&&orig) bfPost({uuid:ou, status:orig}); uc.removeAttribute('data-bfmoved'); uc.style.opacity=''; uc.style.maxHeight=''; uc.style.marginTop=''; uc.style.marginBottom=''; uc.style.paddingTop=''; uc.style.paddingBottom=''; uc.style.overflow=''; var ub=uc.querySelector('.bf-body'); if(ub) ub.removeAttribute('data-raw'); addCards(true); bfToast('Move undone'); } return; }
    var openr=t.closest('.bf-openrec');
    if(openr){ e.preventDefault(); e.stopPropagation(); var oc=openr.closest('[data-testid="collection-record"]'); var oh=oc?oc.getAttribute('href'):''; if(oh){ location.href=oh; } return; }
    var btn=t.closest('.bf-btn');
    if(btn){ e.preventDefault(); e.stopPropagation(); bfHandleBtn(btn); return; }
    var pill=t.closest('.bf-pill[data-bfval]');
    if(pill){ e.preventDefault(); e.stopPropagation(); var host=pill.closest('.bf-fpills'); var c=pill.closest('[data-testid="collection-record"]'); if(host&&c) bfSaveField(c, host, pill.getAttribute('data-bfval')); return; }
    var wt=t.closest('.bf-wt');
    if(wt){ e.preventDefault(); e.stopPropagation(); var wttxt=wt.getAttribute('data-bfwt')||''; if(!wttxt){ bfToast('Nothing to copy yet'); return; } try{ navigator.clipboard.writeText(wttxt); }catch(_){} bfToast(wt.getAttribute('data-bftoast')||'Copied — paste into Messenger'); return; }
    var cp=t.closest('.bf-fcopy');
    if(cp){ e.preventDefault(); e.stopPropagation(); var w=cp.closest('[data-bfk]'); var txt=w?(w.getAttribute('data-bfval')||''):''; try{ navigator.clipboard.writeText(txt); }catch(_){} bfToast('Copied'); return; }
    var ta=t.closest('.bf-fta-wrap');
    if(ta){ e.preventDefault(); e.stopPropagation(); bfEnterEdit(ta, true); return; }
    var fi=t.closest('.bf-fi');
    if(fi && !fi.classList.contains('bf-fro')){ e.preventDefault(); e.stopPropagation(); bfEnterEdit(fi, false); return; }
  }, true);

  var BF_USERS_URL='https://buyforce.app.n8n.cloud/webhook/get-users?key=bf7q2xK9';
  var bfUserMap=null, bfUsersLoading=false, bfPop=null, bfPopTimer=null;
  function bfLoadUsers(){ /* multi-tenant: do not download a cross-dealership user list. purge any old cache. */ try{ localStorage.removeItem('bfusers2'); }catch(e){} return; }
  function bfEnsurePop(){ if(!bfPop){ bfPop=document.createElement('div'); bfPop.style.cssText='position:fixed;z-index:10002;background:#fff;border:0.5px solid #d3d1c7;box-shadow:0 4px 16px rgba(0,0,0,0.18);border-radius:10px;padding:10px 12px;display:none;min-width:150px;pointer-events:none;font-family:Inter,-apple-system,sans-serif;'; document.body.appendChild(bfPop); } return bfPop; }
  function bfShowUserPop(el){
    if(!bfUserMap){ bfLoadUsers(); return; }
    var name=(el.textContent||'').replace(/^@/,'').trim();
    var u=bfUserMap[name.toLowerCase()]; if(!u) return;
    var pa=name.split(' '); var ini=(((pa[0]||'')[0]||'')+((pa[pa.length-1]||'')[0]||'')).toUpperCase();
    var last=u.last?agoShort(u.last):'';
    var pop=bfEnsurePop();
    pop.innerHTML='<div style="display:flex;align-items:center;gap:9px;"><span style="width:34px;height:34px;border-radius:50%;background:#e3f5cf;color:#2b6012;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex:none;">'+ini+'</span><div style="min-width:0;"><div style="font-size:13px;font-weight:500;color:#161616;">'+name+'</div>'+(u.role?'<div style="font-size:11px;color:#7c7c7c;">'+u.role+'</div>':'')+(last?'<div style="font-size:11px;color:#3b6d11;margin-top:1px;">Active '+last+'</div>':'')+'</div></div>';
    pop.style.display='block';
    var r=el.getBoundingClientRect();
    var top=r.top-pop.offsetHeight-8; if(top<8) top=r.bottom+8;
    var left=r.left; if(left+pop.offsetWidth>window.innerWidth-8) left=window.innerWidth-8-pop.offsetWidth;
    pop.style.top=top+'px'; pop.style.left=Math.max(8,left)+'px';
  }
  function bfHideUserPop(){ if(bfPop) bfPop.style.display='none'; }
  document.addEventListener('mouseover', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('span[class*="bg-blue-200"]'):null;
    if(!el || !el.closest('[data-testid="comments-section"]')) return;
    clearTimeout(bfPopTimer); bfShowUserPop(el);
  }, true);
  document.addEventListener('mouseout', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('span[class*="bg-blue-200"]'):null;
    if(!el) return;
    bfPopTimer=setTimeout(bfHideUserPop, 150);
  }, true);
  var bfAllBtn;
  function bfAllCollapsed(){ return bfLS('bfcoldef')==='1'; }
  function bfClearColOverrides(){ try{ for(var i=localStorage.length-1;i>=0;i--){ var k=localStorage.key(i); if(k && k.indexOf('bfcol:')===0) localStorage.removeItem(k); } }catch(e){} }
  function bfSyncToggle(){ if(!bfAllBtn) return; var c=bfAllCollapsed(); var want=c?'c':'e'; if(bfAllBtn.getAttribute('data-bfstate')===want) return; bfAllBtn.setAttribute('data-bfstate',want); bfAllBtn.innerHTML='<i class="ti '+(c?'ti-chevrons-down':'ti-chevrons-up')+'" aria-hidden="true"></i><span>'+(c?'Expand all':'Collapse all')+'</span>'; }
  function bfEnsureToggle(){
    if(location.pathname.indexOf('/preview/')>-1 || !bfSC()){ if(bfAllBtn) bfAllBtn.style.display='none'; return; }
    if(!bfAllBtn){
      bfAllBtn=document.createElement('button');
      bfAllBtn.className='bf-allcollapse';
      bfAllBtn.setAttribute('aria-label','Expand or collapse all cards');
      bfAllBtn.addEventListener('click', function(ev){
        ev.preventDefault(); ev.stopPropagation();
        var nowC=bfAllCollapsed();
        try{ localStorage.setItem('bfcoldef', nowC?'0':'1'); }catch(e){}
        bfClearColOverrides();
        document.querySelectorAll('.bf-body').forEach(function(b){ b.removeAttribute('data-raw'); });
        addCards(true); bfSyncToggle();
      });
      document.body.appendChild(bfAllBtn);
    }
    bfAllBtn.style.display='inline-flex';
    bfSyncToggle();
  }
  function bfSnap(){
    var cols=document.querySelectorAll('[data-testid="collection-group"]:not(.w-12)'); if(!cols.length) return;
    var hd=cols[0].querySelector('[data-testid="collection-group-header"]'); var pad=(hd?hd.offsetHeight:0)+'px';
    cols.forEach(function(g){
      var sc=g.querySelector('[class*="overflow-y-auto"]'); if(!sc) return;
      if(sc.style.scrollSnapType!=='y mandatory') sc.style.scrollSnapType='y mandatory';
      if(sc.style.scrollPaddingTop!==pad) sc.style.scrollPaddingTop=pad;
    });
  }
  var bfDidScroll=false;
  function bfInitScroll(){
    if(bfDidScroll) return; if(location.pathname.indexOf('/preview/')>-1) return;
    var grp=document.querySelector('[data-testid="collection-group"]'); if(!grp) return; bfDidScroll=true;
    setTimeout(function(){ try{ grp.scrollIntoView({block:'start', inline:'nearest'}); }catch(e){ try{ grp.scrollIntoView(true); }catch(_){} } }, 450);
  }
  var bfDidExpandMobile=false;
  function bfExpandAllMobile(){
    if(window.innerWidth>640 || bfDidExpandMobile) return;
    var cc=document.querySelectorAll('[data-testid="collection-group"].w-12'); if(!cc.length) return;
    bfDidExpandMobile=true;
    cc.forEach(function(g){ var b=g.querySelector('[data-testid="collection-group-header"] button'); if(b) b.click(); });
  }
  function bfMoveSearch(){
    if(location.pathname.indexOf('/preview/')>-1) return;
    var sb=document.querySelector('[data-testid="collection-search-button"]'); if(!sb) return;
    var add=[...document.querySelectorAll('a,button')].find(function(n){return /Add Opportunity/i.test(n.textContent||'');});
    if(!add) return;
    var grp=add;
    while(grp && grp!==document.body && !(typeof grp.className==='string' && /\bml-auto\b/.test(grp.className))) grp=grp.parentElement;
    if(!grp || grp===document.body) grp=add.parentElement;
    if(!grp) return;
    var proxy=document.getElementById('bf-search-proxy');
    if(!proxy){
      proxy=document.createElement('button');
      proxy.id='bf-search-proxy'; proxy.className='bf-search-proxy'; proxy.type='button'; proxy.setAttribute('aria-label','Search');
      proxy.innerHTML='<i class="ti ti-search" aria-hidden="true"></i>';
      proxy.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); var real=document.querySelector('[data-testid="collection-search-button"]'); if(real) real.click(); });
    }
    if(grp.firstChild!==proxy) grp.insertBefore(proxy, grp.firstChild);
    document.body.classList.add('bf-search-relocated');
  }
  function bfTagContainers(){
    var body=document.querySelector('[data-testid="record-view-body"]'); if(!body) return;
    body.querySelectorAll(':scope > [data-testid="record-view-section"][class*="section-container"]').forEach(function(sx){
      if(sx.querySelector('[class*="section-highlights"]')){ if(!sx.classList.contains('bf-sidebar')) sx.classList.add('bf-sidebar'); }
      else if(sx.querySelector('[class*="section-details"]')){ if(!sx.classList.contains('bf-main')) sx.classList.add('bf-main'); }
    });
  }
  /* ===== Workspace: tabbed object replacing the comments box ===== */
  var BF_WH='https://buyforce.app.n8n.cloud/webhook';
  function bfPostEvent(p){ try{ if(p&&p.uuid) delete bfEvCache[p.uuid]; }catch(_c){} try{ fetch(BF_WH+'/add-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}); }catch(e){} }
  var bfEvCache={}, bfTaskCache={}, BF_WSTTL=300000;
  function bfGetEvents(uuid){ var c=bfEvCache[uuid]; if(c && (Date.now()-c.at)<BF_WSTTL) return Promise.resolve(c.data); return fetch(BF_WH+'/get-events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uuid:uuid})}).then(function(r){return r.json();}).then(function(d){ d=d||{events:[]}; bfEvCache[uuid]={at:Date.now(),data:d}; return d; }).catch(function(){return {events:[]};}); }
  function bfPostTask(p){ try{ if(p&&p.action==='list'&&p.uuid){ var c=bfTaskCache[p.uuid]; if(c && (Date.now()-c.at)<BF_WSTTL) return Promise.resolve(c.data); } if(p&&(p.action==='create'||p.action==='complete')){ if(p.uuid) delete bfTaskCache[p.uuid]; else bfTaskCache={}; } }catch(_c){} return fetch(BF_WH+'/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).then(function(r){return r.json();}).then(function(d){ try{ if(p&&p.action==='list'&&p.uuid) bfTaskCache[p.uuid]={at:Date.now(),data:d}; }catch(_c2){} return d; }).catch(function(){return null;}); }
  function bfWsUpdateBadge(ws){ var open=ws.querySelectorAll('.bf-ws-task:not(.done)').length; var tab=ws.querySelector('.bf-ws-tab[data-tab="tasks"]'); if(tab){ if(open>0) tab.setAttribute('data-badge', String(open)); else tab.removeAttribute('data-badge'); } }
  function bfWsDueChip(iso){ if(!iso) return ''; var t=new Date(iso).getTime(); if(isNaN(t)) return ''; var days=Math.round((t-Date.now())/86400000); var soon=days<=1; var lbl; if(days<0) lbl='Overdue'; else if(days===0) lbl='Due today'; else if(days===1) lbl='Due tomorrow'; else lbl='In '+days+' days'; return '<span class="bf-ws-due '+(soon?'soon':'later')+'">'+lbl+'</span>'; }
  function bfWsTaskHtml(t){ var done=(t.status==='done'); return '<div class="bf-ws-task'+(done?' done':'')+'" data-id="'+esc(String(t.id||''))+'"><span class="bf-ws-check'+(done?' done':'')+'">'+(done?'<i class="ti ti-check" aria-hidden="true"></i>':'')+'</span><div class="bf-ws-taskb"><div class="bf-ws-taskt">'+esc(t.text||'')+'</div>'+(done?'':bfWsDueChip(t.dueAt))+'</div></div>'; }
  function bfWsRenderTasks(ws, tasks){ var box=ws.querySelector('.bf-ws-tasklist'); if(!box) return; tasks=tasks||[]; var open=tasks.filter(function(t){return t.status!=='done';}); var done=tasks.filter(function(t){return t.status==='done';}); var h=''; if(open.length){ h+='<div class="bf-ws-lbl" style="margin-top:18px;">Open</div>'+open.map(bfWsTaskHtml).join(''); } if(done.length){ h+='<div class="bf-ws-lbl" style="margin-top:14px;">Done</div>'+done.slice(0,5).map(bfWsTaskHtml).join(''); } if(!open.length&&!done.length){ h='<div class="bf-ws-empty">No reminders yet — add one above.</div>'; } box.innerHTML=h; bfWsUpdateBadge(ws); }
  function bfWsLoadTasks(ws, uuid){ bfPostTask({action:'list', uuid:uuid}).then(function(d){ if(!ws.isConnected||ws.getAttribute('data-uuid')!==uuid) return; bfWsRenderTasks(ws, (d&&d.tasks)||[]); }); }
  function bfWsConfirmText(deal, human, location){ var ui=STAGE_UI['Scheduled']; var t=''; if(ui&&ui.layout){ ui.layout.forEach(function(it){ if(it.k==='track'&&it.wt&&/confirm/i.test(it.wt.l)) t=it.wt.t; }); } if(!t) return ''; return t.replace(/\[First Name\]/g, (deal.sellerFirst||'there')).replace(/\[Appt Time\]/g, human).replace(/\[Dealership Address\]/g, (location||deal.address||'')).replace(/\[[^\]]+\]/g,'').trim(); }
  function bfPostOcr(dataUrl){ return fetch(BF_WH+'/aiforce-ocr',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:dataUrl})}).then(function(r){return r.json();}).catch(function(){return null;}); }
  function bfPostAI(uuid, sellerMessage, deal){ return fetch(BF_WH+'/aiforce-reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uuid:uuid,sellerMessage:sellerMessage,deal:deal||{}})}).then(function(r){return r.json();}).catch(function(){return {suggestions:[]};}); }
  function bfWsRenderSuggests(ws, sugg){ var box=ws.querySelector('.bf-ws-suggests'); if(!box) return; if(!sugg||!sugg.length){ box.innerHTML='<div class="bf-ws-empty">No suggestions returned — try again.</div>'; return; } box.innerHTML='<div class="bf-ws-lbl" style="margin-top:14px;">AIForce replies <span style="font-weight:400;letter-spacing:0;text-transform:none;color:#9aa0a6;">· in your voice</span></div>'+sugg.map(function(sg,i){ return '<div class="bf-ws-suggest"><div class="bf-ws-sgh"><span class="bf-ws-strat">'+esc(sg.strategy||'Reply')+(i===0?'<span class="bf-ws-rec">recommended</span>':'')+'</span><button class="bf-ws-copy"><i class="ti ti-copy" aria-hidden="true"></i>Copy</button></div><div class="bf-ws-suggest-txt">'+esc(sg.text||'')+'</div></div>'; }).join(''); }
  function bfCurUser(){ try{ var v=localStorage.getItem('bf.user'); if(v) return v; }catch(e){} return 'Me'; }
  function bfInits(n){ n=(n||'').trim(); if(!n) return '?'; var p=n.split(/\s+/); return (((p[0]||'')[0]||'')+((p[1]||'')[0]||'')).toUpperCase()||'?'; }
  function bfRel(iso){ if(!iso) return ''; var t=new Date(iso).getTime(); if(isNaN(t)) return ''; var s=Math.floor((Date.now()-t)/1000); if(s<60) return 'just now'; var m=Math.floor(s/60); if(m<60) return m+'m ago'; var h=Math.floor(m/60); if(h<24) return h+'h ago'; var d=Math.floor(h/24); if(d===1) return 'Yesterday'; if(d<7) return d+'d ago'; var w=Math.floor(d/7); if(w<5) return w+(w===1?' week ago':' weeks ago'); var mo=Math.floor(d/30); return mo+(mo===1?' month ago':' months ago'); }
  var BF_EVT={ call:['ti-phone','g'], text:['ti-message-2','g'], message:['ti-message-2','g'], email:['ti-mail','g'], vm:['ti-microphone-2','g'], stage_change:['ti-arrow-right','g'], offer_generated:['ti-file-text','g'], offer_sent:['ti-send','g'], competing_values:['ti-alert-triangle','a'], vin_received:['ti-scan','x'], appt_booked:['ti-calendar-event','g'], lead_created:['ti-user-plus','x'] };
  var BF_WSDEF={ 'Fresh Leads':'aiforce','Engaged - Awaiting VIN':'aiforce','VIN Received - Appraisal Needed':'scripts','Appraisal Complete - Enter Offer Sheet Values':'aiforce','Offer Sheet Generated':'scripts','Offer Sent (0-2 Days)':'aiforce','Nurturing (Follow Up and Re-engage)':'tasks','Appraisal Review Needed':'scripts','Appraisal Review Complete':'scripts','Verbal Yes - Schedule Appt':'schedule','Scheduled':'schedule','Appt Shown - Follow Up':'log' };
  var BF_LOGLBL={ message:'Messaged', call:'Called', text:'Texted', email:'Emailed', vm:'Left VM' };
  var bfWsTabMem={};
  function bfWsEvtHtml(e){
    if(e.type==='note'){ return '<div class="bf-ws-item"><span class="bf-ws-dot note">'+esc(bfInits(e.actor))+'</span><div class="bf-ws-ib"><div class="bf-ws-it"><span class="bf-ws-kind">Note</span>'+esc(e.actor||'Note')+'</div><div class="bf-ws-note">'+esc(e.text||'')+'</div><div class="bf-ws-meta">'+esc(bfRel(e.createdAt))+'</div></div></div>'; }
    var ic=BF_EVT[e.type]||['ti-circle-dot','x']; var dc=ic[1]==='g'?'green':(ic[1]==='a'?'amber':'gray');
    var meta=[]; if(e.actor) meta.push(esc(e.actor)); var rt=bfRel(e.createdAt); if(rt) meta.push(rt);
    return '<div class="bf-ws-item"><span class="bf-ws-dot '+dc+'"><i class="ti '+ic[0]+'" aria-hidden="true"></i></span><div class="bf-ws-ib"><div class="bf-ws-it">'+esc(e.text||'')+'</div><div class="bf-ws-meta">'+meta.join(' · ')+'</div></div></div>';
  }
  function bfWsFeed(ws, events){ var f=ws.querySelector('.bf-ws-tl'); if(!f) return; if(!events||!events.length){ f.innerHTML='<div class="bf-ws-empty">No activity yet — add a note or log a touch to start the timeline.</div>'; return; } f.innerHTML=events.map(bfWsEvtHtml).join(''); }
  function bfWsLoad(ws, uuid){ var f=ws.querySelector('.bf-ws-tl'); if(f) f.innerHTML='<div class="bf-ws-empty">Loading…</div>'; bfGetEvents(uuid).then(function(d){ if(ws.getAttribute('data-uuid')!==uuid||!ws.isConnected) return; bfWsFeed(ws, (d&&d.events)||[]); }); }
  function bfWsPrepend(ws, e){ var f=ws.querySelector('.bf-ws-tl'); if(!f) return; var emp=f.querySelector('.bf-ws-empty'); if(emp) f.innerHTML=''; f.insertAdjacentHTML('afterbegin', bfWsEvtHtml(e)); }
  function bfWsScripts(stg, F){
    var ui=STAGE_UI[stg]; var tr=[];
    if(ui&&ui.layout){ ui.layout.forEach(function(it){ if(it.k==='track'&&it.wt) tr.push(it.wt); }); }
    if(!tr.length) return '<div class="bf-ws-empty">No scripts for this stage.</div>';
    var h=''; tr.forEach(function(wt){ var txt=bfFillTrack(wt.t, F); h+='<div class="bf-ws-track"><div class="bf-ws-trh"><span class="bf-ws-trn">'+esc(wt.l)+'</span><button class="bf-ws-copy"><i class="ti ti-copy" aria-hidden="true"></i>Copy</button></div><div class="bf-ws-track-txt">'+esc(txt)+'</div></div>'; });
    return h;
  }
  function bfWsHtml(stg, F){
    function T(id,label,icon,badge){ return '<button class="bf-ws-tab" data-tab="'+id+'" type="button"'+(badge?' data-badge="'+badge+'"':'')+'><i class="ti '+icon+'" aria-hidden="true"></i>'+label+'</button>'; }
    var tabs='<div class="bf-ws-tabs" role="tablist">'+T('timeline','Timeline','ti-clock')+T('aiforce','AIForce','ti-sparkles','AI')+T('scripts','Scripts','ti-align-left')+T('log','Log','ti-checkbox')+T('schedule','Schedule','ti-calendar')+T('tasks','Tasks','ti-bell')+'</div>';
    var pTL='<section class="bf-ws-panel" data-panel="timeline"><div class="bf-ws-composer"><input class="bf-ws-noteinput" placeholder="Add a note for the team…"><button class="bf-ws-attach" data-act="attach" type="button" aria-label="Attach a photo"><i class="ti ti-paperclip" aria-hidden="true"></i></button><button class="bf-ws-send" data-act="note" type="button" aria-label="Post note"><i class="ti ti-send" aria-hidden="true"></i></button></div><input type="file" accept="image/*" class="bf-ws-fileinput" style="display:none;"><div class="bf-ws-attachchip"></div><p class="bf-ws-micro">Notes drop into the timeline and become the deal’s <b>Last Comment</b>. Notes, calls, stage moves, offers, appointments — all show here newest-first.</p><div class="bf-ws-tl"></div></section>';
    var pAI='<section class="bf-ws-panel" data-panel="aiforce"><div class="bf-ws-lbl">Seller’s last message</div><textarea class="bf-ws-seller" placeholder="Paste the seller’s last message here…"></textarea><div class="bf-ws-ocrrow"><button class="bf-ws-ocr" data-act="ocr" type="button"><i class="ti ti-camera" aria-hidden="true"></i>Upload screenshot</button><span class="bf-ws-ocrhint">reads the convo into the box above</span></div><input type="file" accept="image/*" class="bf-ws-ocrinput" style="display:none;"><button class="bf-ws-btn ghost" data-act="aiforce" type="button"><i class="ti ti-sparkles" aria-hidden="true"></i>Get AIForce replies</button><div class="bf-ws-suggests"></div><p class="bf-ws-micro">Drafted from your word tracks + this deal (CarMax, ACV, accident, stage). Edit before sending — <b>AIForce never sends on its own.</b></p></section>';
    var pSC='<section class="bf-ws-panel" data-panel="scripts"><div class="bf-ws-rowsplit"><div class="bf-ws-lbl" style="margin:0;">Scripts for this stage</div><span class="bf-ws-stage">'+esc(stg||'')+'</span></div><div class="bf-ws-scripts">'+bfWsScripts(stg,F)+'</div></section>';
    var pLG='<section class="bf-ws-panel" data-panel="log"><div class="bf-ws-lbl">Log a touch</div><div class="bf-ws-row">'+['Messaged|message|ti-message-2','Called|call|ti-phone','Texted|text|ti-message-dots','Emailed|email|ti-mail','Left VM|vm|ti-microphone-2'].map(function(s,i){var p=s.split('|');return '<button class="bf-ws-type'+(i===0?' sel':'')+'" data-logtype="'+p[1]+'" type="button"><i class="ti '+p[2]+'" aria-hidden="true"></i>'+p[0]+'</button>';}).join('')+'</div><div class="bf-ws-composer" style="margin-top:10px;"><input class="bf-ws-loginput" placeholder="What happened? (optional)"></div><button class="bf-ws-btn primary" data-act="log" type="button" style="margin-top:10px;"><i class="ti ti-check" aria-hidden="true"></i>Log touch</button><p class="bf-ws-micro">Posts the touch to the <b>Timeline</b> and resets the follow-up clock.</p></section>';
    var _dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], _mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], _days='';
    for(var _i=0;_i<5;_i++){ var _dt=new Date(); _dt.setDate(_dt.getDate()+_i); var _lbl=_i===0?'Today':(_dn[_dt.getDay()]+' \u00b7 '+_mn[_dt.getMonth()]+' '+_dt.getDate()); var _iso=_dt.getFullYear()+'-'+('0'+(_dt.getMonth()+1)).slice(-2)+'-'+('0'+_dt.getDate()).slice(-2); _days+='<button class="bf-ws-type'+(_i===0?' sel':'')+'" data-day="'+_iso+'" type="button">'+_lbl+'</button>'; }
    var _times=['9:00 AM|09:00','10:30 AM|10:30','1:00 PM|13:00','3:30 PM|15:30'].map(function(s2,i2){var p2=s2.split('|');return '<button class="bf-ws-type'+(i2===1?' sel':'')+'" data-time="'+p2[1]+'" type="button">'+p2[0]+'</button>';}).join('');
    var _addr=bfGet(F,['Dealership Address','dealershipAddress'])||'Add a Dealership Address field on the deal';
    var _pick=bfGet(F,['Vehicle Location Address','vehicleLocationAddress','Pickup Address','pickupAddress'])||'';
    var _td=new Date(); var _today=_td.getFullYear()+'-'+('0'+(_td.getMonth()+1)).slice(-2)+'-'+('0'+_td.getDate()).slice(-2);
    var pSH='<section class="bf-ws-panel" data-panel="schedule"><div class="bf-ws-schedform"><div class="bf-ws-lbl">Schedule the appointment</div><div class="bf-ws-sublbl">Date</div><div class="bf-ws-row">'+_days+'</div><input class="bf-ws-dateinput" type="date" min="'+_today+'" value="'+_today+'"><div class="bf-ws-sublbl">Time</div><div class="bf-ws-row">'+_times+'</div><input class="bf-ws-timeinput" type="time" value="10:30"><div class="bf-ws-sublbl">Location</div><div class="bf-ws-row"><button class="bf-ws-type sel" data-loc="dealership" type="button">Dealership</button><button class="bf-ws-type" data-loc="pickup" type="button">Pickup address</button></div><div class="bf-ws-loc bf-ws-loc-deal"><i class="ti ti-map-pin" aria-hidden="true"></i><div><div class="bf-ws-locname">Dealership</div><div class="bf-ws-locaddr">'+esc(_addr)+'</div></div></div><div class="bf-ws-loc-pick" style="display:none;"><input class="bf-ws-pickupinput" placeholder="Enter the seller pickup address" value="'+esc(_pick)+'"></div><div class="bf-ws-eta"></div><button class="bf-ws-btn primary" data-act="book" type="button" style="margin-top:14px;"><i class="ti ti-calendar-check" aria-hidden="true"></i>Book appointment</button><p class="bf-ws-micro">Stamps the time + location, moves the deal to <b>Scheduled</b>, and posts it to the Timeline.</p><div class="bf-ws-confirm"></div></div><div class="bf-ws-schedbooked" style="display:none;"></div></section>';
    var _due=['Today|0','Tomorrow|1','In 3 days|3','In 1 week|7'].map(function(s3,i3){var p3=s3.split('|');return '<button class="bf-ws-type'+(i3===1?' sel':'')+'" data-due="'+p3[1]+'" type="button">'+p3[0]+'</button>';}).join('');
    var pTK='<section class="bf-ws-panel" data-panel="tasks"><div class="bf-ws-lbl">Add a reminder</div><div class="bf-ws-composer"><input class="bf-ws-taskinput" placeholder="Remind me to\u2026"></div><div class="bf-ws-row" style="margin:10px 0 12px;">'+_due+'</div><button class="bf-ws-btn ghost" data-act="addtask" type="button"><i class="ti ti-plus" aria-hidden="true"></i>Add reminder</button><div class="bf-ws-tasklist"></div></section>';
    return '<div class="bf-ws-head"><span class="bf-ws-h">Workspace</span><span class="bf-ws-ctx">tabs adapt to the deal stage</span></div>'+tabs+'<div class="bf-ws-panels">'+pTL+pAI+pSC+pLG+pSH+pTK+'</div>';
  }
  function bfWsActivate(ws, tab){ ws.querySelectorAll('.bf-ws-tab').forEach(function(t){ t.classList.toggle('on', t.getAttribute('data-tab')===tab); }); ws.querySelectorAll('.bf-ws-panel').forEach(function(p){ p.classList.toggle('on', p.getAttribute('data-panel')===tab); }); }
  function bfWsCopy(btn){ var box=btn.closest('.bf-ws-track')||btn.closest('.bf-ws-suggest'); var el=box?box.querySelector('.bf-ws-track-txt, .bf-ws-suggest-txt'):null; var txt=el?el.textContent:''; try{ navigator.clipboard.writeText(txt); }catch(e){} var o=btn.innerHTML; btn.innerHTML='<i class="ti ti-check" aria-hidden="true"></i>Copied'; setTimeout(function(){ btn.innerHTML=o; },1200); }
  function bfWsAction(ws, uuid, act){
    var actor=bfCurUser(); var nowI=new Date().toISOString();
    if(act==='reschedule'){ bfWsShowSchedForm(ws); return; }
    if(act==='attach'){ var _fi=ws.querySelector('.bf-ws-fileinput'); if(_fi) _fi.click(); return; }
    if(act==='ocr'){ var _oi=ws.querySelector('.bf-ws-ocrinput'); if(_oi) _oi.click(); return; }
    if(act==='attachclear'){ var _fc=ws.querySelector('.bf-ws-fileinput'); if(_fc) _fc.value=''; var _ch=ws.querySelector('.bf-ws-attachchip'); if(_ch) _ch.innerHTML=''; return; }
    if(act==='note'){ var inp=ws.querySelector('.bf-ws-noteinput'); var t=(inp&&inp.value||'').trim(); if(!t) return; bfPostEvent({uuid:uuid,type:'note',actor:actor,text:t}); bfPost({uuid:uuid,lastComment:t,lastCommentAt:nowI}); bfWsPrepend(ws,{type:'note',actor:actor,text:t,createdAt:nowI}); inp.value=''; bfToast('Note posted'); return; }
    if(act==='log'){ var sel=ws.querySelector('.bf-ws-type.sel[data-logtype]'); var ty=sel?sel.getAttribute('data-logtype'):'message'; var ln=ws.querySelector('.bf-ws-loginput'); var note=(ln&&ln.value||'').trim(); var lbl=BF_LOGLBL[ty]||'Logged'; var txt=lbl+(note?' — '+note:''); bfPostEvent({uuid:uuid,type:ty,actor:actor,text:txt}); bfPost({uuid:uuid,lastFollowUpAt:nowI}); bfWsPrepend(ws,{type:ty,actor:actor,text:txt,createdAt:nowI}); if(ln) ln.value=''; bfToast('Logged · clock reset'); return; }
    if(act==='aiforce'){ var sb=ws.querySelector('.bf-ws-seller'); var sm=(sb&&sb.value||'').trim(); if(!sm){ bfToast('Paste the seller message first'); return; } var box=ws.querySelector('.bf-ws-suggests'); if(box) box.innerHTML='<div class="bf-ws-empty">AIForce is drafting…</div>'; bfPostAI(uuid, sm, ws._bfDeal||{}).then(function(d){ if(!ws.isConnected) return; bfWsRenderSuggests(ws, (d&&d.suggestions)||[]); }); return; }
    if(act==='book'){ var _di=ws.querySelector('.bf-ws-dateinput'); var _ti=ws.querySelector('.bf-ws-timeinput'); var day=(_di&&_di.value)||''; var tm=(_ti&&_ti.value)||''; if(!day){ var dEl=ws.querySelector('.bf-ws-type.sel[data-day]'); day=dEl?dEl.getAttribute('data-day'):''; } if(!tm){ var tEl=ws.querySelector('.bf-ws-type.sel[data-time]'); tm=tEl?tEl.getAttribute('data-time'):''; } if(!day||!tm){ bfToast('Pick a date and time'); return; } var dObj=new Date(day+'T'+tm+':00'); var iso=isNaN(dObj.getTime())?'':dObj.toISOString(); var human=isNaN(dObj.getTime())?(day+' '+tm):(dObj.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+' at '+dObj.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})); var deal=ws._bfDeal||{}; var locPill=ws.querySelector('.bf-ws-type.sel[data-loc]'); var locKind=locPill?locPill.getAttribute('data-loc'):'dealership'; var locStr=deal.address||''; var payload={uuid:uuid, status:'Scheduled', apptDateAndTime:iso}; if(locKind==='pickup'){ var _pi=ws.querySelector('.bf-ws-pickupinput'); var _pa=(_pi&&_pi.value||'').trim(); locStr=_pa; if(_pa) payload.vehicleLocationAddress=_pa; } bfPost(payload); var locTxt=locStr?(' \u2014 '+(locKind==='pickup'?'pickup at ':'at ')+locStr):''; bfPostEvent({uuid:uuid, type:'appt_booked', actor:actor, text:'Appointment booked for '+human+locTxt}); bfWsPrepend(ws,{type:'appt_booked',actor:actor,text:'Appointment booked for '+human+locTxt,createdAt:nowI}); var _rem=new Date(dObj.getTime()); _rem.setDate(_rem.getDate()-1); _rem.setHours(17,0,0,0); if(isNaN(_rem.getTime())||_rem.getTime()<Date.now()) _rem=new Date(); bfPostTask({action:'create', uuid:uuid, text:'Send appt confirmation/reminder to '+(deal.sellerFirst||'seller')+' — appt '+human, dueAt:_rem.toISOString(), createdBy:actor}).then(function(){ if(ws.isConnected) bfWsLoadTasks(ws, uuid); }); if(locKind==='pickup' && ws._bfEta && ws._bfEta.leaveBy){ var _lbms=Date.parse(ws._bfEta.leaveBy); if(!isNaN(_lbms) && _lbms>Date.now()){ var _lbt=new Date(_lbms).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}); bfPostTask({action:'create', uuid:uuid, text:'Leave by '+_lbt+' for '+(deal.vehicle||'the vehicle')+' pickup (~'+ws._bfEta.durationText+' drive in traffic)', dueAt:ws._bfEta.leaveBy, createdBy:actor}).then(function(){ if(ws.isConnected) bfWsLoadTasks(ws, uuid); }); } } bfToast('Booked \u00b7 moved to Scheduled'); bfWsRenderBooked(ws, human, (locKind==='pickup'?'Pickup':'Dealership'), locStr); var conf=ws.querySelector('.bf-ws-confirm'); if(conf){ var ctext=bfWsConfirmText(deal, human, locStr); conf.innerHTML='<div class="bf-ws-sublbl" style="margin-top:16px;">Confirmation text (send the evening before)</div><div class="bf-ws-track"><div class="bf-ws-trh"><span class="bf-ws-trn">Day-before reminder</span><button class="bf-ws-copy"><i class="ti ti-copy" aria-hidden="true"></i>Copy</button></div><div class="bf-ws-track-txt">'+esc(ctext)+'</div></div>'; } return; }
    if(act==='addtask'){ var ti=ws.querySelector('.bf-ws-taskinput'); var tt=(ti&&ti.value||'').trim(); if(!tt){ bfToast('Type a reminder first'); return; } var ddEl=ws.querySelector('.bf-ws-type.sel[data-due]'); var nd=ddEl?parseInt(ddEl.getAttribute('data-due'),10):1; if(isNaN(nd)) nd=1; var due=new Date(); due.setDate(due.getDate()+nd); bfPostTask({action:'create', uuid:uuid, text:tt, dueAt:due.toISOString(), createdBy:actor}).then(function(){ if(ws.isConnected) bfWsLoadTasks(ws, uuid); }); if(ti) ti.value=''; bfToast('Reminder added'); return; }
  }
  function bfPostDriveEta(p){ return fetch(BF_WH+'/drive-eta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).then(function(r){return r.json();}).catch(function(){return null;}); }
  function bfWsFmtTime(iso){ var d=new Date(iso); if(isNaN(d.getTime())) return ''; return d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}); }
  function bfWsSchedISO(ws){ var di=ws.querySelector('.bf-ws-dateinput'); var ti=ws.querySelector('.bf-ws-timeinput'); var day=(di&&di.value)||''; var tm=(ti&&ti.value)||''; if(!day){ var d2=ws.querySelector('.bf-ws-type.sel[data-day]'); day=d2?d2.getAttribute('data-day'):''; } if(!tm){ var t2=ws.querySelector('.bf-ws-type.sel[data-time]'); tm=t2?t2.getAttribute('data-time'):''; } if(!day||!tm) return ''; var o=new Date(day+'T'+tm+':00'); return isNaN(o.getTime())?'':o.toISOString(); }
  function bfPlacesFetch(q){ return fetch(BF_WH+'/places-autocomplete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:q})}).then(function(r){return r.json();}).catch(function(){return null;}); }
  function bfAttachPlacesAuto(inp){
    if(!inp||inp.getAttribute('data-bfac')==='1') return; inp.setAttribute('data-bfac','1');
    var box=null, items=[], active=-1, t=null, justPicked=false;
    function close(){ if(box){ box.remove(); box=null; } items=[]; active=-1; }
    function pos(){ if(!box) return; var r=inp.getBoundingClientRect(); box.style.left=r.left+'px'; box.style.top=(r.bottom+4)+'px'; box.style.width=r.width+'px'; }
    function render(){ if(!box){ box=document.createElement('div'); box.className='bf-acbox'; document.body.appendChild(box); } pos(); box.innerHTML=items.map(function(it,i){ return '<div class="bf-acitem'+(i===active?' on':'')+'" data-i="'+i+'">'+esc(it.description)+'</div>'; }).join(''); [].forEach.call(box.querySelectorAll('.bf-acitem'),function(el){ el.addEventListener('mousedown',function(e){ e.preventDefault(); pick(+el.getAttribute('data-i')); }); }); }
    function pick(i){ var it=items[i]; if(!it) return; justPicked=true; inp.value=it.description; close(); inp.dispatchEvent(new Event('input',{bubbles:true})); }
    inp.addEventListener('input', function(){ if(justPicked){ justPicked=false; close(); return; } var q=inp.value.trim(); if(t) clearTimeout(t); if(q.length<3){ close(); return; } t=setTimeout(function(){ bfPlacesFetch(q).then(function(d){ if(inp.value.trim()!==q) return; if(!d||!d.suggestions||!d.suggestions.length){ close(); return; } items=d.suggestions; active=-1; render(); }); }, 300); });
    inp.addEventListener('keydown', function(e){ if(!box||!items.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(active+1,items.length-1); render(); } else if(e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(active-1,0); render(); } else if(e.key==='Enter'){ if(active>=0){ e.preventDefault(); pick(active); } } else if(e.key==='Escape'){ close(); } });
    inp.addEventListener('blur', function(){ setTimeout(close, 160); });
    window.addEventListener('scroll', function(){ pos(); }, true);
  }
  function bfWsDriveEtaSoon(ws, uuid){ clearTimeout(ws._bfEtaT); ws._bfEtaT=setTimeout(function(){ bfWsDriveEta(ws, uuid); }, 500); }
  function bfWsDriveEta(ws, uuid){
    var box=ws.querySelector('.bf-ws-eta'); if(!box) return;
    var locPill=ws.querySelector('.bf-ws-type.sel[data-loc]'); var isPickup=locPill&&locPill.getAttribute('data-loc')==='pickup';
    var deal=ws._bfDeal||{}; var origin=deal.address||'';
    var pi=ws.querySelector('.bf-ws-pickupinput'); var dest=(pi&&pi.value||'').trim();
    var iso=bfWsSchedISO(ws); ws._bfEta=null;
    if(!isPickup||!dest||!origin||!iso){ box.innerHTML=''; return; }
    var token=iso+'|'+dest; ws._bfEtaTok=token;
    box.innerHTML='<i class="ti ti-car" aria-hidden="true"></i> Checking drive time at that time…';
    bfPostDriveEta({origin:origin, destination:dest, departureTime:iso}).then(function(d){
      if(!ws.isConnected||ws.getAttribute('data-uuid')!==uuid||ws._bfEtaTok!==token) return;
      if(!d||!d.ok){ box.innerHTML=''; return; }
      ws._bfEta={leaveBy:d.leaveBy, minutes:d.minutes, durationText:d.durationText, distance:d.distance};
      var lb=bfWsFmtTime(d.leaveBy);
      box.innerHTML='<i class="ti ti-car" aria-hidden="true"></i> ~'+esc(d.durationText)+' in traffic at that time. Leave by <b>'+esc(lb)+'</b>'+(d.distance?(' · '+esc(d.distance)):'');
    });
  }
  function bfWsShowSchedForm(ws){ var bk=ws.querySelector('.bf-ws-schedbooked'); var fm=ws.querySelector('.bf-ws-schedform'); if(bk)bk.style.display='none'; if(fm)fm.style.display=''; }
  function bfWsRenderBooked(ws, humanStr, locLabel, addrStr){
    var bk=ws.querySelector('.bf-ws-schedbooked'); var fm=ws.querySelector('.bf-ws-schedform'); if(!bk||!fm) return;
    var loc = locLabel?(locLabel+(addrStr?(', '+addrStr):'')):(addrStr||'');
    bk.innerHTML='<div class="bf-ws-lbl">Appointment booked</div>'+
      '<div class="bf-ws-bkrow"><i class="ti ti-calendar-event" aria-hidden="true"></i><span>'+esc(humanStr||'')+'</span></div>'+
      (loc?('<div class="bf-ws-bkrow"><i class="ti ti-map-pin" aria-hidden="true"></i><span>'+esc(loc)+'</span></div>'):'')+
      '<button class="bf-ws-btn ghost" data-act="reschedule" type="button" style="margin-top:14px;"><i class="ti ti-calendar-cog" aria-hidden="true"></i>Reschedule appointment</button>';
    fm.style.display='none'; bk.style.display='';
  }
  function bfWsScheduleInit(ws, F){
    var raw=bfApptRaw(F); if(!raw) return;
    var d=new Date(raw); var human=isNaN(d.getTime())?String(raw):(d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+' at '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}));
    var pick=bfGet(F,['Vehicle Location Address','vehicleLocationAddress','Pickup Address']);
    var label = pick?'Pickup':'Dealership'; var addr = pick||bfGet(F,['Dealership Address','dealershipAddress'])||'';
    bfWsRenderBooked(ws, human, label, addr);
  }
  function bfWorkspace(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var ws=document.querySelector('.bf-ws');
    if(ws && ws.getAttribute('data-uuid')===uuid) return;
    var main=document.querySelector('.bf-main');
    var host=main?(main.querySelector(':scope > .max-w-6xl')||main):document.querySelector('[data-testid="record-view-body"]');
    if(!host) return;
    if(ws) ws.remove();
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]');
    var F=card?bfReadF(card):{}; var stg=card?stageOf(card):'';
    ws=document.createElement('div'); ws.className='bf-ws'; ws.setAttribute('data-uuid',uuid);
    ws.innerHTML=bfWsHtml(stg,F);
    var _sn=(F['Seller Name']||F['Seller']||'').replace(/^seller:\s*/i,'').trim().split(/\s+/)[0]||'';
    ws._bfDeal={ vehicle:(F['Vehicle Title']||''), dealership:(F['Dealership']||F['Dealer']||''), mileage:(bfGet(F,['Mileage','Miles','Odometer'])||''), color:(bfGet(F,['Color','Exterior Color','Ext Color'])||''), trim:(bfGet(F,['Trim','Trim Level'])||''), payoff:(bfGet(F,['Est Payoff Amount','Payoff Amount','Payoff'])||''), equity:(bfGet(F,['Est Equity Position','Equity Position'])||''), retail:(bfGet(F,['Est Private Party Retail Value','Private Party Retail Value'])||''), dealerDays:(bfGet(F,['Est Dealer Days to Sale','Dealer Days to Sale'])||''), stage:stg, sellerFirst:_sn, asking:(F['Asking Price']||''), acv:(F['ACV']||''), offer:(F['Offer Amount']||''), carmax:(F['CarMax Offer']||''), carvana:(F['Carvana Offer']||''), competition:(F['Competition']||''), accident:(F['Accident History']||''), address:(bfGet(F,['Dealership Address','dealershipAddress'])||'') };
    var _wsAnchor=main?null:host.querySelector(':scope > .bf-rectop'); if(_wsAnchor){ if(_wsAnchor.nextSibling) host.insertBefore(ws, _wsAnchor.nextSibling); else host.appendChild(ws); } else { host.insertBefore(ws, host.firstChild); }
    var def=bfWsTabMem[uuid]||BF_WSDEF[stg]||'timeline';
    bfWsActivate(ws, def);
    ws.addEventListener('click', function(e){
      var tg=e.target;
      var tab=tg.closest&&tg.closest('.bf-ws-tab'); if(tab){ var n=tab.getAttribute('data-tab'); bfWsTabMem[uuid]=n; bfWsActivate(ws,n); return; }
      var cp=tg.closest&&tg.closest('.bf-ws-copy'); if(cp){ e.preventDefault(); bfWsCopy(cp); return; }
      var chk=tg.closest&&tg.closest('.bf-ws-check'); if(chk){ var te=chk.closest('.bf-ws-task'); if(te && !te.classList.contains('done')){ var tid=te.getAttribute('data-id'); if(tid) bfPostTask({action:'complete', id:tid}); te.classList.add('done'); chk.classList.add('done'); chk.innerHTML='<i class="ti ti-check" aria-hidden="true"></i>'; var dc=te.querySelector('.bf-ws-due'); if(dc) dc.remove(); bfWsUpdateBadge(ws); } return; }
      var ty=tg.closest&&tg.closest('.bf-ws-type'); if(ty){ var row=ty.closest('.bf-ws-row'); if(row){ row.querySelectorAll('.bf-ws-type').forEach(function(x){x.classList.toggle('sel',x===ty);}); } var _dv=ty.getAttribute('data-day'); if(_dv){ var _di2=ws.querySelector('.bf-ws-dateinput'); if(_di2) _di2.value=_dv; } var _tv=ty.getAttribute('data-time'); if(_tv){ var _tin=ws.querySelector('.bf-ws-timeinput'); if(_tin) _tin.value=_tv; } var _lk=ty.getAttribute('data-loc'); if(_lk){ var _sec=ty.closest('.bf-ws-panel'); var _dd=_sec.querySelector('.bf-ws-loc-deal'); var _pp=_sec.querySelector('.bf-ws-loc-pick'); var _ip=(_lk==='pickup'); if(_dd)_dd.style.display=_ip?'none':''; if(_pp)_pp.style.display=_ip?'':'none'; } bfWsDriveEtaSoon(ws, uuid); return; }
      var ac=tg.closest&&tg.closest('[data-act]'); if(ac){ e.preventDefault(); bfWsAction(ws, uuid, ac.getAttribute('data-act')); return; }
    });
    ws.querySelectorAll('.bf-ws-noteinput,.bf-ws-loginput').forEach(function(inp){ inp.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); bfWsAction(ws, uuid, inp.classList.contains('bf-ws-noteinput')?'note':'log'); } }); });
    var _dIn=ws.querySelector('.bf-ws-dateinput'); if(_dIn) _dIn.addEventListener('input', function(){ ws.querySelectorAll('.bf-ws-type[data-day]').forEach(function(x){ x.classList.remove('sel'); }); bfWsDriveEtaSoon(ws, uuid); });
    var _tIn=ws.querySelector('.bf-ws-timeinput'); if(_tIn) _tIn.addEventListener('input', function(){ ws.querySelectorAll('.bf-ws-type[data-time]').forEach(function(x){ x.classList.remove('sel'); }); bfWsDriveEtaSoon(ws, uuid); });
    var _pIn=ws.querySelector('.bf-ws-pickupinput'); if(_pIn) _pIn.addEventListener('input', function(){ bfWsDriveEtaSoon(ws, uuid); }); if(_pIn){ try{bfAttachPlacesAuto(_pIn);}catch(_ac){} }
    var _fIn=ws.querySelector('.bf-ws-fileinput'); if(_fIn) _fIn.addEventListener('change', function(){ var f=_fIn.files&&_fIn.files[0]; var chip=ws.querySelector('.bf-ws-attachchip'); if(!chip) return; chip.innerHTML = f ? ('<span class="bf-ws-chip"><i class="ti ti-photo" aria-hidden="true"></i>'+esc(f.name)+'<button class="bf-ws-chipx" data-act="attachclear" type="button" aria-label="Remove">×</button></span>') : ''; });
    var _oIn=ws.querySelector('.bf-ws-ocrinput'); if(_oIn) _oIn.addEventListener('change', function(){ var f=_oIn.files&&_oIn.files[0]; if(!f) return; var sb=ws.querySelector('.bf-ws-seller'); if(sb){ sb.value=''; sb.setAttribute('placeholder','Reading screenshot…'); } bfToast('Reading screenshot…'); var rd=new FileReader(); rd.onload=function(){ bfPostOcr(rd.result).then(function(d){ _oIn.value=''; if(!ws.isConnected) return; if(d&&d.transcript){ if(sb) sb.value=d.transcript; bfToast('Screenshot read in'); } else { bfToast('Could not read screenshot'); if(sb) sb.setAttribute('placeholder','Paste the seller’s last message here…'); } }); }; rd.readAsDataURL(f); });
    bfWsLoad(ws, uuid);
    bfWsLoadTasks(ws, uuid);
    bfWsScheduleInit(ws, F);
  }

  function bfPostAssign(uuid,id){ try{ fetch(BF_WH+'/assign-rep',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uuid:uuid,id:id})}); }catch(e){} }
  function bfPostExtract(dataUrl){ return fetch(BF_WH+'/listing-extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:dataUrl})}).then(function(r){return r.json();}).catch(function(){return null;}); }
  function bfPostCreate(fields,url,dist){ return fetch(BF_WH+'/listing-create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:fields,listingUrl:url,distribution:(dist||null)})}).then(function(r){return r.json();}).catch(function(){return null;}); }
  function bfLiEnsureFab(){
    if(/\/(preview|view)\//.test(location.pathname)){ var ex=document.querySelector('.bf-li-fab'); if(ex) ex.style.display='none'; return; }
    var fab=document.querySelector('.bf-li-fab');
    if(!fab){ fab=document.createElement('button'); fab.className='bf-li-fab'; fab.type='button'; fab.innerHTML='<i class="ti ti-camera-plus" aria-hidden="true"></i><span>Screenshot lead</span>'; fab.addEventListener('click', bfLiOpen); document.body.appendChild(fab); }
    fab.style.display='inline-flex';
  }
  function bfLiOpen(){
    var old=document.querySelector('.bf-li-overlay'); if(old) old.remove();
    var ov=document.createElement('div'); ov.className='bf-li-overlay';
    ov.innerHTML='<div class="bf-li-modal"><div class="bf-li-head"><span>New lead from screenshot</span><button class="bf-li-x" type="button" aria-label="Close">×</button></div><div class="bf-li-body"><label class="bf-li-lbl">Listing screenshot</label><input type="file" accept="image/*" class="bf-li-file"><label class="bf-li-lbl">Listing URL</label><input type="text" class="bf-li-url" placeholder="Paste the Facebook Marketplace link"><div class="bf-li-actions"><button class="bf-li-extract bf-ws-btn primary" type="button"><i class="ti ti-sparkles" aria-hidden="true"></i>Extract details</button><button class="bf-li-manual bf-ws-btn ghost" type="button"><i class="ti ti-keyboard" aria-hidden="true"></i>Enter manually</button></div><div class="bf-li-fields"></div></div></div>';
    document.body.appendChild(ov);
    try{ fetch(BF_WH+'/pipeline-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(d){ ov._bfMeta={canFilter:!!(d&&d.canFilter), dealerships:(d&&d.dealerships)||[]}; }).catch(function(){}); }catch(_m){}
    ov.addEventListener('click', function(e){ if(e.target===ov || (e.target.closest && e.target.closest('.bf-li-x'))){ ov.remove(); } });
    ov.querySelector('.bf-li-extract').addEventListener('click', function(){ bfLiExtract(ov); });
    ov.querySelector('.bf-li-manual').addEventListener('click', function(){ bfLiRenderFields(ov, {}); });
  }
  function bfLiExtract(ov){
    var fi=ov.querySelector('.bf-li-file'); var file=fi&&fi.files&&fi.files[0]; var fld=ov.querySelector('.bf-li-fields');
    if(!file){ bfToast('Add a screenshot first'); return; }
    fld.innerHTML='<div class="bf-ws-empty">Reading listing…</div>';
    var rd=new FileReader(); rd.onload=function(){ bfPostExtract(rd.result).then(function(d){ if(!ov.isConnected) return; bfLiRenderFields(ov,(d&&d.fields)||{}); }); }; rd.readAsDataURL(file);
  }
  function bfLiRenderFields(ov, f){
    ov._bfFields=f;
    var fld=ov.querySelector('.bf-li-fields');
    function row(k,label,val){ return '<label class="bf-li-lbl">'+label+'</label><input type="text" class="bf-li-f" data-k="'+k+'" value="'+esc(val==null?'':String(val))+'">'; }
    var meta=ov._bfMeta||{}; var distHtml=''; if(meta.canFilter && (meta.dealerships||[]).length){ distHtml='<div class="bf-li-dist"><label class="bf-li-lbl">Distribute to stores <span class="bf-li-disttag">BuyForce</span></label><div class="bf-li-stores">'+meta.dealerships.map(function(d){ return '<label class="bf-li-store"><input type="checkbox" class="bf-li-dchk" value="'+esc(String(d.id))+'"><span>'+esc(d.name||('Store '+d.id))+'</span></label>'; }).join('')+'</div><div class="bf-li-disthint">Pick one or more stores. Leave empty to add to your own store.</div></div>'; }
    fld.innerHTML=row('vehicleTitle','Vehicle',f.vehicleTitle||'')+row('price','Asking price',f.price)+row('mileage','Mileage',f.mileage)+row('location','Location',f.location)+row('sellerName','Seller',f.sellerName)+row('vin','VIN',f.vin)+distHtml+'<button class="bf-li-create bf-ws-btn primary" type="button" style="margin-top:12px;"><i class="ti ti-plus" aria-hidden="true"></i>Create lead</button><div class="bf-li-result"></div>';
    fld.querySelector('.bf-li-create').addEventListener('click', function(){ bfLiCreate(ov); });
  }
  function bfLiCreate(ov){
    var fields=Object.assign({}, ov._bfFields||{}); ov.querySelectorAll('.bf-li-f').forEach(function(i){ var v=i.value; if(v!=='') fields[i.getAttribute('data-k')]=v; });
    var url=(ov.querySelector('.bf-li-url')||{}).value||''; var res=ov.querySelector('.bf-li-result');
    res.innerHTML='<div class="bf-ws-empty">Creating…</div>';
    var dist=null; var chks=ov.querySelectorAll('.bf-li-dchk:checked'); if(chks&&chks.length){ var dids=[].map.call(chks,function(c){ var n=Number(c.value); return isNaN(n)?c.value:n; }); dist={dealershipIds:dids}; }
    bfPostCreate(fields,url,dist).then(function(d){ if(!ov.isConnected) return; if(d&&d.ok){ var n=d.created||1; if(d.uuid){ try{ bfPostEvent({uuid:d.uuid, type:'lead_created', actor:bfCurUser(), text:'Lead added to Fresh Leads'+(d.duplicate?' (flagged as a possible duplicate)':'')}); }catch(_e){} } var msg=(n>1?(n+' leads created'):'Lead created')+(d.vehicle?(': '+esc(d.vehicle)):''); if(d.duplicate){ msg+='. Flagged as a possible duplicate'+(d.dupVehicle?(' of '+esc(d.dupVehicle)):'')+'.'; } else { msg+='. Refresh the board to see it.'; } res.innerHTML='<div class="bf-li-ok">'+msg+'</div>'; bfToast(d.duplicate?'Created, duplicate flagged':(n>1?(n+' leads created'):'Lead created')); } else { res.innerHTML='<div class="bf-li-err">'+esc((d&&d.reason)||'Could not create the record. Please try again.')+'</div>'; } });
  }
  function bfRecApprBtns(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var mm=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=mm?mm[1]:'';
    document.querySelectorAll('[data-testid="details-section"]').forEach(function(sec){
      var h=sec.querySelector('h2'); if(!h) return; if(!/competing/i.test(h.textContent||'')) return;
      var port=sec.querySelector('.bf-secport'); if(port) port.classList.add('bf-port-center');
      var form=sec.querySelector('form'); if(!form) return;
      [].forEach.call(form.querySelectorAll(':scope > div'), function(cell){
        var lab=cell.querySelector('label'); if(!lab) return; var lt=(lab.textContent||'').toLowerCase();
        var url='', label='';
        if(lt.indexOf('carmax')>-1){ url='https://www.carmax.com/sell-my-car'; label='Get CarMax Value'; }
        else if(lt.indexOf('carvana')>-1){ url='https://www.carvana.com/sell-my-car'; label='Get Carvana Value'; }
        if(!url) return;
        var prev=cell.previousElementSibling;
        if(prev && prev.classList && prev.classList.contains('bf-getval-wrap')) return;
        var wrap=document.createElement('div'); wrap.className='bf-getval-wrap';
        wrap.innerHTML=bfButton({l:label, a:'url', url:url, i:'ti-external-link'}, uuid);
        cell.parentNode.insertBefore(wrap, cell);
      });
    });
  }
  function bfSchedFormHtml(F){
    var _dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], _mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], _days='';
    for(var _i=0;_i<5;_i++){ var _dt=new Date(); _dt.setDate(_dt.getDate()+_i); var _lbl=_i===0?'Today':(_dn[_dt.getDay()]+' · '+_mn[_dt.getMonth()]+' '+_dt.getDate()); var _iso=_dt.getFullYear()+'-'+('0'+(_dt.getMonth()+1)).slice(-2)+'-'+('0'+_dt.getDate()).slice(-2); _days+='<button class="bf-ws-type'+(_i===0?' sel':'')+'" data-day="'+_iso+'" type="button">'+_lbl+'</button>'; }
    var _times=['9:00 AM|09:00','10:30 AM|10:30','1:00 PM|13:00','3:30 PM|15:30'].map(function(s2,i2){var p2=s2.split('|');return '<button class="bf-ws-type'+(i2===1?' sel':'')+'" data-time="'+p2[1]+'" type="button">'+p2[0]+'</button>';}).join('');
    var _addr=bfGet(F,['Dealership Address','dealershipAddress'])||'Add a Dealership Address field on the deal';
    var _pick=bfGet(F,['Vehicle Location Address','vehicleLocationAddress','Pickup Address','pickupAddress'])||'';
    var _td=new Date(); var _today=_td.getFullYear()+'-'+('0'+(_td.getMonth()+1)).slice(-2)+'-'+('0'+_td.getDate()).slice(-2);
    return '<div class="bf-ws-schedform"><div class="bf-ws-lbl">Schedule the appointment</div><div class="bf-ws-sublbl">Date</div><div class="bf-ws-row">'+_days+'</div><input class="bf-ws-dateinput" type="date" min="'+_today+'" value="'+_today+'"><div class="bf-ws-sublbl">Time</div><div class="bf-ws-row">'+_times+'</div><input class="bf-ws-timeinput" type="time" value="10:30"><div class="bf-ws-sublbl">Location</div><div class="bf-ws-row"><button class="bf-ws-type sel" data-loc="dealership" type="button">Dealership</button><button class="bf-ws-type" data-loc="pickup" type="button">Pickup address</button></div><div class="bf-ws-loc bf-ws-loc-deal"><i class="ti ti-map-pin" aria-hidden="true"></i><div><div class="bf-ws-locname">Dealership</div><div class="bf-ws-locaddr">'+esc(_addr)+'</div></div></div><div class="bf-ws-loc-pick" style="display:none;"><input class="bf-ws-pickupinput" placeholder="Enter the seller pickup address" value="'+esc(_pick)+'"></div><div class="bf-ws-eta"></div><button class="bf-ws-btn primary" data-act="book" type="button" style="margin-top:14px;"><i class="ti ti-calendar-check" aria-hidden="true"></i>Book appointment</button></div><div class="bf-ws-schedbooked" style="display:none;"></div>';
  }
  function bfRecDedupBtns(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    document.querySelectorAll('[data-testid="details-section"]').forEach(function(sec){
      var seen={};
      [].forEach.call(sec.querySelectorAll('.bf-btn'),function(b){
        var key=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
        if(!key) return;
        if(seen[key]){ var w=b.closest('.bf-getval-wrap'); (w||b).remove(); }
        else { seen[key]=1; }
      });
    });
  }
  function bfRecScheduler(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var mm=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=mm?mm[1]:''; if(!uuid) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'); var F=card?bfReadF(card):{}; var stg=card?stageOf(card):'';
    [].forEach.call(document.querySelectorAll('[data-testid="details-section"]'), function(sec){
      var h=sec.querySelector('h2'); if(!h) return; var t=(h.textContent||''); if(!/schedule/i.test(t) || !/(confirm|appoint)/i.test(t)) return;
      if(!sec.querySelector('form')) return;
      var ex=sec.querySelector(':scope > .bf-recsched');
      if(ex && ex.getAttribute('data-uuid')===uuid) return;
      if(ex) ex.remove();
      var rs=document.createElement('div'); rs.className='bf-recsched'; rs.setAttribute('data-uuid',uuid);
      rs.innerHTML=bfSchedFormHtml(F);
      rs._bfDeal={ vehicle:(F['Vehicle Title']||''), stage:stg, sellerFirst:bfSellerFirst(F), address:(bfGet(F,['Dealership Address','dealershipAddress'])||'') };
      var port=sec.querySelector(':scope > .bf-secport');
      if(port) sec.insertBefore(rs, port); else sec.appendChild(rs);
      rs.addEventListener('click', function(e){ var tg=e.target;
        var ty=tg.closest&&tg.closest('.bf-ws-type'); if(ty){ var row=ty.closest('.bf-ws-row'); if(row){ row.querySelectorAll('.bf-ws-type').forEach(function(x){x.classList.toggle('sel',x===ty);}); } var _dv=ty.getAttribute('data-day'); if(_dv){ var _di2=rs.querySelector('.bf-ws-dateinput'); if(_di2) _di2.value=_dv; } var _tv=ty.getAttribute('data-time'); if(_tv){ var _tin=rs.querySelector('.bf-ws-timeinput'); if(_tin) _tin.value=_tv; } var _lk=ty.getAttribute('data-loc'); if(_lk){ var _dd=rs.querySelector('.bf-ws-loc-deal'); var _pp=rs.querySelector('.bf-ws-loc-pick'); var _ip=(_lk==='pickup'); if(_dd)_dd.style.display=_ip?'none':''; if(_pp)_pp.style.display=_ip?'':'none'; } bfWsDriveEtaSoon(rs, uuid); return; }
        var ac=tg.closest&&tg.closest('[data-act]'); if(ac){ e.preventDefault(); bfWsAction(rs, uuid, ac.getAttribute('data-act')); return; }
      });
      var _dIn=rs.querySelector('.bf-ws-dateinput'); if(_dIn) _dIn.addEventListener('input', function(){ rs.querySelectorAll('.bf-ws-type[data-day]').forEach(function(x){ x.classList.remove('sel'); }); bfWsDriveEtaSoon(rs, uuid); });
      var _tIn=rs.querySelector('.bf-ws-timeinput'); if(_tIn) _tIn.addEventListener('input', function(){ rs.querySelectorAll('.bf-ws-type[data-time]').forEach(function(x){ x.classList.remove('sel'); }); bfWsDriveEtaSoon(rs, uuid); });
      var _pIn=rs.querySelector('.bf-ws-pickupinput'); if(_pIn) _pIn.addEventListener('input', function(){ bfWsDriveEtaSoon(rs, uuid); }); if(_pIn){ try{bfAttachPlacesAuto(_pIn);}catch(_ac){} }
      bfWsScheduleInit(rs, F);
    });
  }
  function bfPipeCSS(){ if(window.__bfPipeCSS) return; window.__bfPipeCSS=1; var s=document.createElement('style'); s.textContent="#bff-wrap,.bff-listcard{font-family:Inter,system-ui,sans-serif;border:1px solid #1d1f25;border-radius:16px;color:#e8e8ea;}#bff-wrap{padding:20px 24px 16px;background:#000;}#bff-wrap *,.bff-listcard *{box-sizing:border-box;}.bff-listcard{margin-top:16px;padding:16px 18px;display:none;background:#0c0d10;}.bff-head{display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;}.bff-title{font-size:17px;font-weight:700;color:#fff;letter-spacing:-.2px;}.bff-glow{color:#fff;text-shadow:0 0 8px rgba(146,223,2,.95),0 0 20px rgba(146,223,2,.6);}.bff-scope{font-size:11px;color:#7a7a82;font-weight:500;}.bff-rt{margin-left:auto;display:flex;align-items:center;gap:8px;}.bff-tabs{display:flex;gap:6px;background:#16171b;border-radius:10px;padding:3px;}.bff-tab{font-size:12px;font-weight:600;color:#9a9aa2;padding:6px 14px;border-radius:8px;cursor:pointer;border:none;background:none;}.bff-tab.on{background:#26282e;color:#fff;}.bff-filter{display:inline-flex;align-items:center;gap:6px;background:#15161b;border:1px solid #2a2c33;color:#e8e8ea;font-size:12px;font-weight:600;padding:7px 13px;border-radius:9px;cursor:pointer;}.bff-filter:hover{background:#1b1d22;}.bff-fpanel{background:#101116;border:1px solid #21232a;border-radius:12px;padding:12px 14px;margin:4px 0 10px;}.bff-fgrid{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:flex-end;}.bff-fc{display:flex;flex-direction:column;gap:4px;}.bff-fc label{font-size:10px;font-weight:700;letter-spacing:.4px;color:#7a7c84;text-transform:uppercase;}.bff-fc select,.bff-fc input{background:#15161b;border:1px solid #2a2c33;color:#e8e8ea;font-size:12px;border-radius:8px;padding:6px 8px;outline:none;}.bff-fc select{min-width:130px;}.bff-frange{display:flex;align-items:center;gap:5px;}.bff-frange input{width:64px;}.bff-frange span{color:#6a6c74;}.bff-fclear{align-self:flex-end;background:none;border:1px solid #2a2c33;color:#cfd2d6;font-size:12px;padding:7px 12px;border-radius:8px;cursor:pointer;}.bff-fclear:hover{background:#1b1d22;}.bff-funnel{display:flex;align-items:flex-start;gap:0;overflow-x:auto;padding:10px 0 6px;}.bff-stage{display:flex;flex-direction:column;align-items:center;flex:0 0 auto;min-width:118px;cursor:pointer;border-radius:12px;padding:6px 4px 8px;transition:background .12s;}.bff-stage:hover,.bff-stage.on{background:#141519;}.bff-ico{width:52px;height:52px;border-radius:50%;background:#15161b;border:1px solid #2a2c33;display:flex;align-items:center;justify-content:center;color:#d4d7db;font-size:23px;}.bff-n{font-size:33px;font-weight:800;color:#92df02;line-height:1;margin-top:13px;letter-spacing:-.5px;}.bff-n.zero{color:#54565c;}.bff-l{font-size:13px;color:#9aa0a6;margin-top:7px;text-align:center;white-space:nowrap;}.bff-conn{flex:1 1 22px;min-width:16px;height:64px;position:relative;}.bff-conn::before{content:'';position:absolute;left:-2px;right:-2px;top:32px;height:1px;background:linear-gradient(90deg,rgba(146,223,2,.14),rgba(146,223,2,.6),rgba(146,223,2,.14));}.bff-dot{position:absolute;left:50%;top:32px;width:9px;height:9px;border-radius:50%;background:#92df02;box-shadow:0 0 7px 1px rgba(146,223,2,.85);transform:translate(-50%,-50%);}.bff-lc-h{display:flex;align-items:center;gap:8px;margin-bottom:10px;}.bff-lc-t{font-size:14px;font-weight:700;color:#fff;}.bff-lc-c{font-size:12px;color:#8a8a92;}.bff-tblwrap{overflow:auto;max-height:62vh;}.bff-tbl{width:100%;border-collapse:collapse;font-size:12.5px;}.bff-tbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.4px;color:#7a7c84;text-transform:uppercase;padding:8px 10px;cursor:pointer;white-space:nowrap;border-bottom:1px solid #1f2127;user-select:none;position:sticky;top:0;background:#0c0d10;z-index:3;}.bff-tbl th:hover{color:#b6b9c0;}.bff-tbl th.on{color:#92df02;}.bff-tbl th.num{text-align:right;}.bff-tbl td{padding:9px 10px;border-bottom:1px solid #161820;color:#dcdce2;white-space:nowrap;}.bff-tbl td.num{text-align:right;}.bff-tbl th.ctr{text-align:center;}.bff-tbl td.ctr{text-align:center;}.bff-tbl tbody tr{cursor:pointer;}.bff-tbl tbody tr:hover{background:#141519;}.bff-tbl .veh{font-weight:600;color:#f1f1f3;}.bff-score{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:7px;font-weight:700;font-size:11px;}.bff-tbtn{display:inline-flex;align-items:center;gap:4px;background:#15161b;border:1px solid #2a2c33;color:#cfd2d6;font-size:11px;font-weight:600;padding:4px 9px;border-radius:7px;cursor:pointer;}.bff-tbtn:hover{background:#22242a;}.bff-tbtn-g{border-color:#92df02;color:#92df02;}.bff-empty,.bff-load{font-size:13px;color:#8a8a92;padding:10px 2px;}.bff-tblwrap::-webkit-scrollbar,.bff-funnel::-webkit-scrollbar{width:9px;height:9px;}.bff-tblwrap::-webkit-scrollbar-track,.bff-funnel::-webkit-scrollbar-track{background:transparent;}.bff-tblwrap::-webkit-scrollbar-thumb,.bff-funnel::-webkit-scrollbar-thumb{background:rgba(150,153,162,.28);border-radius:8px;}.bff-tblwrap::-webkit-scrollbar-thumb:hover,.bff-funnel::-webkit-scrollbar-thumb:hover{background:rgba(150,153,162,.45);}.bff-tblwrap,.bff-funnel{scrollbar-width:thin;scrollbar-color:rgba(150,153,162,.28) transparent;}#bf-ovl .bf-ovl-card{position:absolute;top:3%;left:50%;transform:translateX(-50%);width:min(1100px,94%);height:94%;background:#0c0d10;border:1px solid #2a2c33;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;}#bf-ovl .bf-ovl-bar{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #1f2127;}#bf-ovl .bf-ovl-pos{font-size:12px;color:#9aa0a6;font-weight:600;}#bf-ovl .bf-ovl-open{font-size:12px;color:#92df02;text-decoration:none;font-weight:600;}#bf-ovl .bf-ovl-x{background:none;border:none;color:#cfd2d6;font-size:18px;cursor:pointer;padding:2px 6px;line-height:1;}#bf-ovl .bf-ovl-if{flex:1;width:100%;border:0;background:#fff;}#bf-ovl .bf-ovl-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(20,21,25,.92);border:1px solid #2a2c33;color:#e8e8ea;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}#bf-ovl .bf-ovl-prev{left:14px;}#bf-ovl .bf-ovl-next{right:14px;}.bff-caret{display:flex;align-items:center;justify-content:center;margin:4px auto 0;width:34px;height:22px;color:#7a7c84;cursor:pointer;font-size:18px;border-radius:8px;}.bff-caret:hover{color:#92df02;background:#141519;}@media(max-width:640px){.bff-stage{min-width:92px;}.bff-conn{min-width:10px;}}"; document.head.appendChild(s); }
  function bfPipeTitle(){ try{ var els=document.querySelectorAll('h1,h2,h3,h4,[class*="itle"],[class*="eading"]'); for(var i=0;i<els.length;i++){ var e=els[i]; if(e.getAttribute('data-bfpipetitle')==='1') continue; var t=(e.textContent||'').trim(); if(t.length<40 && /^pipeline summary$/i.test(t)){ e.style.setProperty('color','#ffffff','important'); e.style.setProperty('text-shadow','0 0 8px rgba(146,223,2,.95), 0 0 20px rgba(146,223,2,.6)','important'); e.setAttribute('data-bfpipetitle','1'); } } }catch(e){} }
  function bfPipeRender(R){ try{ R.style.visibility='visible'; if(window.__bfStopPrehide) window.__bfStopPrehide(); }catch(_e){}
    var ENDPOINT='https://buyforce.app.n8n.cloud/webhook/pipeline-summary';
    var RECORD_BASE='https://buyforce.noloco.co/opportunities-1/view/';
    var MACRO=[{label:'Fresh Leads',statuses:['FRESH_LEADS']},{label:'Capturing VIN',statuses:['ENGAGED_AWAITING_VIN']},{label:'Appraising',statuses:['VIN_RECEIVED_APPRAISAL_NEEDED','APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES','APPRAISAL_REVIEW_NEEDED','APPRAISAL_REVIEW_COMPLETE']},{label:'Fresh Offer Sent',statuses:['OFFER_SHEET_GENERATED','OFFER_SENT_0_2_DAYS']},{label:'Follow Up',statuses:['NURTURING_FOLLOW_UP_AND_RE_ENGAGE','VERBAL_YES_SCHEDULE_APPT','SCHEDULED','APPT_SHOWN_FOLLOW_UP']},{label:'Acquired',statuses:['ACQUIRED']}];
    var COLS=[{k:'title',t:'Vehicle'},{k:'listingLink',t:'Listing'},{k:'daysInStage',t:'Time In<br>Stage',num:true,center:true},{k:'seller',t:'Seller'},{k:'_score',t:'Opportunity<br>Score',num:true,center:true},{k:'asking',t:'Asking',num:true,money:true},{k:'offer',t:'Offer',num:true,money:true},{k:'_ovp',t:'Offer<br>Vs Price',num:true,money:true,hcenter:true},{k:'acv',t:'ACV',num:true,money:true},{k:'competition',t:'Competition'},{k:'rep',t:'Assigned Rep'},{k:'mileage',t:'Mileage',num:true},{k:'driveTime',t:'Drive Time',num:true,drive:true},{k:'offerStatus',t:'Offer Status'},{k:'offerSheetUrl',t:'Offer Sheet'}];
    var st={view:'macro',data:null,open:null,sortK:'daysInStage',sortDir:-1,dealId:null,f:{}};
    R.innerHTML='<div id="bff-wrap"><div class="bff-head"><div class="bff-hleft"><div class="bff-titlerow"><span class="bff-title bff-glow">COMMAND CENTER</span></div><span class="bff-scope" data-r="scope"></span></div><div class="bff-rt"><div class="bff-sectoggles"><button class="bff-sectg on" data-sec="kpis" type="button"><i class="ti ti-gauge"></i>KPIs</button><button class="bff-sectg on" data-sec="extras" type="button" title="Leaderboard & Reports"><i class="ti ti-chart-histogram"></i></button></div><span class="bff-masterrep" data-r="masterrep"></span></div></div><div class="bff-kpis" data-r="kpis"></div><div class="bff-extras"><div class="bff-actpanel" data-r="actpanel"></div><div class="bff-perfpanel" data-r="perf"></div><div class="bff-reportpanel" data-r="report"></div></div><div class="bff-section bff-funsec"><div class="bff-sechead"><span class="bff-sectitle">Pipeline Milestones</span><div class="bff-tabs bff-tabs-funnel"><button class="bff-tab on" data-view="macro">Milestones</button><button class="bff-tab" data-view="stages">All stages</button></div></div><div class="bff-funnel" data-r="funnel"><div class="bff-load">Loading pipeline…</div></div><div class="bff-caret" data-r="caret" style="display:none;" title="Show all opportunities"><i class="ti ti-chevron-down" aria-hidden="true"></i></div></div></div><div class="bff-listcard" data-r="lc"></div>'; (function(){ [].forEach.call(R.querySelectorAll('.bff-sectg'),function(b){ b.addEventListener('click',function(){ var sec=b.getAttribute('data-sec'); var tg=(sec==='kpis')?q('kpis'):R.querySelector('.bff-extras'); var on=b.classList.toggle('on'); if(tg) tg.style.display=on?'':'none'; }); }); })();
    function q(n){ return R.querySelector('[data-r="'+n+'"]'); }
    function esc2(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
    function usd(n){ if(n==null||n==='') return '—'; var x=Number(n); if(isNaN(x)) return '—'; var neg=x<0; return (neg?'-$':'$')+Math.round(Math.abs(x)).toLocaleString('en-US'); }
    function num(n){ if(n==null||n==='') return '—'; var x=Number(n); if(isNaN(x)) return '—'; return Math.round(x).toLocaleString('en-US'); }
    function pIcon(lab){ lab=(lab||'').toLowerCase(); if(/fresh lead/.test(lab)) return 'ti-users'; if(/vin|capturing|engaged/.test(lab)) return 'ti-barcode'; if(/apprais/.test(lab)) return 'ti-clipboard-list'; if(/offer/.test(lab)) return 'ti-send'; if(/follow|nurtur|schedul|verbal|appt|closing/.test(lab)) return 'ti-phone-call'; if(/acquired/.test(lab)) return 'ti-car'; if(/no deal/.test(lab)) return 'ti-circle-x'; return 'ti-point'; }
    function pSvg(lab){ lab=(lab||'').toLowerCase(); var w='#d4d7db',g='#92df02'; var o='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke-linecap="round" stroke-linejoin="round">'; if(/fresh lead/.test(lab)) return o+'<circle cx="10" cy="8" r="3.1" stroke="'+w+'" stroke-width="1.7"/><path d="M4 19c0-3.1 2.7-5.3 6-5.3 1.1 0 2.1.2 3 .6" stroke="'+w+'" stroke-width="1.7"/><path d="M18.5 13v5M16 15.5h5" stroke="'+g+'" stroke-width="2.3"/></svg>'; if(/vin|capturing|engaged/.test(lab)) return o+'<g stroke="'+w+'" stroke-width="1.7"><path d="M5 6v12"/><path d="M8.5 6v12"/><path d="M15.5 6v12"/><path d="M19 6v12"/></g><g stroke="'+g+'" stroke-width="2.1"><path d="M11 6v12"/><path d="M13 6v12"/></g></svg>'; if(/apprais/.test(lab)) return o+'<rect x="5" y="4.5" width="14" height="16.5" rx="2" stroke="'+w+'" stroke-width="1.6"/><path d="M9 4.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5" stroke="'+w+'" stroke-width="1.5"/><g stroke="'+g+'" stroke-width="1.9"><path d="M8.5 10.5h7"/><path d="M8.5 13.5h7"/><path d="M8.5 16.5h4"/></g></svg>'; if(/offer/.test(lab)) return o+'<path d="M21 4 3 10.8l6 2.4L21 4Z" stroke="'+w+'" stroke-width="1.5"/><path d="M21 4 9 13.2V19l2.6-3.4L21 4Z" fill="'+g+'" fill-opacity="0.25" stroke="'+g+'" stroke-width="1.5"/></svg>'; if(/follow|nurtur|schedul|verbal|appt|closing/.test(lab)) return o+'<path d="M5 5h14a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-8L7 19v-3.5H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="'+w+'" stroke-width="1.6"/><g fill="'+g+'"><circle cx="9" cy="10.2" r="1.1"/><circle cx="12" cy="10.2" r="1.1"/><circle cx="15" cy="10.2" r="1.1"/></g></svg>'; if(/acquired/.test(lab)) return o+'<path d="M5 11.5 6.4 7.8A2 2 0 0 1 8.3 6.5h5.4a2 2 0 0 1 1.9 1.3l1.4 3.7" stroke="'+w+'" stroke-width="1.6"/><path d="M3.5 11.5h13a1.5 1.5 0 0 1 1.5 1.5V15a1 1 0 0 1-1 1h-1" stroke="'+w+'" stroke-width="1.6"/><path d="M6 16H4.5a1 1 0 0 1-1-1v-2a1.5 1.5 0 0 1 1.5-1.5" stroke="'+w+'" stroke-width="1.6"/><circle cx="7.5" cy="16" r="1.5" stroke="'+w+'" stroke-width="1.4"/><path d="M14.5 16.5 16.6 18.6 21 14" stroke="'+g+'" stroke-width="2.3"/></svg>'; return o+'<circle cx="12" cy="12" r="2.4" fill="'+w+'" stroke="none"/></svg>'; }
    function dMin(s){ if(!s) return -1; var h=0,m=0; var hm=String(s).match(/(\d+)\s*hr/); var mm=String(s).match(/(\d+)\s*min/); if(hm) h=+hm[1]; if(mm) m=+mm[1]; var t=h*60+m; return t>0?t:-1; }
    function daysColor(d){ if(d>=14) return '#ff5b5b'; if(d>=7) return '#f0a23a'; if(d>=4) return '#e8d44a'; return '#9aa0a6'; }
    function compColor(c){ c=(c||'').toLowerCase(); if(c.indexOf('both')>-1) return '#57c822'; if(c.indexOf('carmax')>-1||c.indexOf('carvana')>-1) return '#9fd86a'; if(c.indexOf('neither')>-1) return '#c97a7a'; return '#cfd2d6'; }
    function scoreTier(s){ return s>=75?{bg:'#e3f5cf',fg:'#2b6012'}:(s>=50?{bg:'#fbeecd',fg:'#7a4d13'}:{bg:'#23252b',fg:'#9aa0a6'}); }
    function ovpColor(v){ if(v>=5000) return '#ff5b5b'; if(v>=4000) return '#f0a23a'; if(v>=3000) return '#e8d44a'; if(v>=1000) return '#9fd86a'; return '#57c822'; }
    function compCs(c){ c=(c||'').toLowerCase(); if(c.indexOf('both')>-1) return 40; if(c.indexOf('carmax')>-1||c.indexOf('carvana')>-1) return 15; return 0; }
    function calcScore(r){ var acv=Number(r.acv), ask=Number(r.asking); if(!(acv>0)||isNaN(ask)) return null; var cs=compCs(r.competition); var prem=ask-acv; var ds=prem<=2000?30:(prem<=3000?25:(prem<=4000?15:(prem<=5000?7.5:0))); var pct=prem/acv; var ps=pct<=0?20:(pct>=0.20?0:20*(1-pct/0.20)); var eqp=Number(r.eq); var es=isNaN(eqp)?0:(eqp>=2000?10:(eqp<=0?0:10*(eqp/2000))); return Math.round(cs+ds+ps+es); }
    function calcOvp(r){ if(r.asking==null||r.asking===''||r.offer==null||r.offer==='') return null; var ask=Number(r.asking), off=Number(r.offer); if(isNaN(ask)||isNaN(off)) return null; return ask-off; }
    function decorate(d){ var ap=function(arr){ (arr||[]).forEach(function(s){ (s.records||[]).forEach(function(r){ r._score=calcScore(r); r._ovp=calcOvp(r); try{ var _j=JSON.stringify(r); sessionStorage.setItem('bfrec:'+r.uuid,_j); localStorage.setItem('bfrec:'+r.uuid,_j); }catch(e){} }); }); }; if(d){ ap(d.stages); ap(d.other); } }
    function distinct(getter){ var set={},out=[]; var add=function(arr){ (arr||[]).forEach(function(s){ (s.records||[]).forEach(function(r){ var v=getter(r); if(v&&!set[v]){ set[v]=1; out.push(v); } }); }); }; add(st.data&&st.data.stages); add(st.data&&st.data.other); out.sort(); return out; }
    function nIn(v,mn,mx){ if(mn!==''&&mn!=null){ if(v==null||v<Number(mn)) return false; } if(mx!==''&&mx!=null){ if(v==null||v>Number(mx)) return false; } return true; }
    function macroLabelOf(s){ for(var i=0;i<MACRO.length;i++){ if(MACRO[i].statuses.indexOf(s)>-1) return MACRO[i].label; } return ''; }
    function fOpp(r){ var f=st.f; if(f.mstage){ if(macroLabelOf(r.status)!==f.mstage) return false; } if(f.stage){ if((r.status||'')!==f.stage) return false; } if(f.comp){ if((r.competition||'').toLowerCase().indexOf(f.comp)<0) return false; } if(f.rep){ if(f.rep==='__none__'){ if(r.rep) return false; } else if(r.rep!==f.rep) return false; } if(f.ostatus){ if((r.offerStatus||'')!==f.ostatus) return false; } if(!nIn(r.daysInStage,f.daysMin,f.daysMax)) return false; if(!nIn(r.mileage,f.mileMin,f.mileMax)) return false; if(!nIn(r._score,f.scoreMin,f.scoreMax)) return false; if(!nIn(r._ovp,f.ovpMin,f.ovpMax)) return false; if((f.driveMin!==''&&f.driveMin!=null)||(f.driveMax!==''&&f.driveMax!=null)){ var dm=dMin(r.driveTime); if(dm<0) return false; if(!nIn(dm,f.driveMin,f.driveMax)) return false; } return true; }
    function sortVal(r,c){ var v=r[c.k]; if(c.drive) return dMin(v); if(c.num){ return (v==null||v==='')?-Infinity:Number(v); } return (v==null?'':String(v)).toLowerCase(); }
    function fmtDur2(d){ if(d==null||isNaN(d)) return '—'; var mins=d*1440; if(mins<60) return Math.round(mins)+' mins'; if(mins<1440){ var h=Math.floor(mins/60), m=Math.round(mins-h*60); return h+' hr'+(h===1?'':'s')+(m?' '+m+' mins':''); } return (Math.round(d*10)/10)+' days'; }
    function cellHtml(r,c){ var v=r[c.k]; if(c.k==='title') return '<span class="veh">'+(esc2(v)||'(untitled)')+'</span>'; if(c.k==='_score') return v==null?'—':('<span class="bff-score" style="background:'+scoreTier(v).bg+';color:'+scoreTier(v).fg+';"><i class="ti ti-flame" style="font-size:11px;" aria-hidden="true"></i>'+v+'</span>'); if(c.k==='daysInStage') return v==null?'—':('<span style="color:'+daysColor(v)+';font-weight:600;">'+fmtDur2(v)+'</span>'); if(c.k==='_ovp') return v==null?'—':('<span style="color:'+ovpColor(v)+';">'+usd(v)+'</span>'); if(c.money) return usd(v); if(c.k==='mileage') return num(v); if(c.k==='competition') return v?('<span style="color:'+compColor(v)+';">'+esc2(v)+'</span>'):'—'; if(c.k==='offerStatus') return v?esc2(String(v).replace(/_/g,' ').toLowerCase()):'—'; if(c.k==='driveTime') return v?esc2(v):'—'; if(c.k==='listingLink') return v?('<button class="bff-tbtn" data-link="'+esc2(v)+'"><i class="ti ti-external-link" aria-hidden="true"></i>Listing</button>'):'—'; if(c.k==='offerSheetUrl') return v?('<button class="bff-tbtn bff-tbtn-g" data-sheet="'+esc2(v)+'"><i class="ti ti-photo" aria-hidden="true"></i>Sheet</button>'):'—'; return esc2(v)||'—'; }
    function colByKey(k){ for(var i=0;i<COLS.length;i++){ if(COLS[i].k===k) return COLS[i]; } return COLS[3]; }
    function rawUnits(){ var s=(st.data&&st.data.stages)||[]; if(st.view==='stages') return s.filter(function(x){return x.status!=='NO_DEAL';}); var by={}; s.forEach(function(x){by[x.status]=x;}); return MACRO.map(function(m){ var recs=[]; m.statuses.forEach(function(cd){ var z=by[cd]; if(z) recs=recs.concat(z.records||[]); }); return {status:m.label,label:m.label,records:recs}; }); }
    function units(){ return rawUnits().map(function(u){ var fr=u.records.filter(fOpp); return {status:u.status,label:u.label,count:fr.length,records:fr}; }); }
    var ovl=null,ovlIf=null,ovlList=[],ovlIdx=0;
    function sortRows(records){ var c=colByKey(st.sortK); return records.slice().sort(function(a,b){ var av=sortVal(a,c),bv=sortVal(b,c); if(av<bv) return -1*st.sortDir; if(av>bv) return 1*st.sortDir; return 0; }); }
    function navList(){ var arr=[]; if(st.open==='__all__'){ var rec=[]; var addr=function(a){(a||[]).forEach(function(z){rec=rec.concat(z.records||[]);});}; addr(st.data&&st.data.stages); addr(st.data&&st.data.other); sortRows(rec.filter(fOpp)).forEach(function(r){arr.push(r.uuid);}); } else { units().forEach(function(u){ sortRows(u.records).forEach(function(r){arr.push(r.uuid);}); }); } return arr; }
    function ovlShow(){ var uuid=ovlList[ovlIdx]; if(!uuid||!ovl) return; ovlIf.src=RECORD_BASE+uuid; var op=ovl.querySelector('[data-o="open"]'); if(op) op.href=RECORD_BASE+uuid; var ps=ovl.querySelector('[data-o="pos"]'); if(ps) ps.textContent=(ovlIdx+1)+' of '+ovlList.length; var pv=ovl.querySelector('[data-o="prev"]'); var nx=ovl.querySelector('[data-o="next"]'); if(pv) pv.style.visibility=ovlIdx>0?'visible':'hidden'; if(nx) nx.style.visibility=ovlIdx<ovlList.length-1?'visible':'hidden'; }
    function ovlGo(d){ var ni=ovlIdx+d; if(ni<0||ni>=ovlList.length) return; ovlIdx=ni; ovlShow(); }
    function ovlClose(){ if(ovl){ ovl.style.display='none'; if(ovlIf) ovlIf.src='about:blank'; } var _w=0; try{ _w=+(localStorage.getItem('bf.lastWriteAt')||0); }catch(e){} if(st.ovlOpenedAt && _w>st.ovlOpenedAt){ st.ovlOpenedAt=0; load(st.dealId); } else { st.ovlOpenedAt=0; } }
    function ensureOverlay(){ if(ovl) return; ovl=document.createElement('div'); ovl.id='bf-ovl'; ovl.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);'; ovl.innerHTML='<div class="bf-ovl-card"><div class="bf-ovl-bar"><span class="bf-ovl-pos" data-o="pos"></span><div style="flex:1"></div><a class="bf-ovl-open" data-o="open" target="_blank" rel="noopener">Open full page</a><button class="bf-ovl-x" data-o="close">✕</button></div><iframe class="bf-ovl-if" data-o="if" src="about:blank"></iframe></div><button class="bf-ovl-nav bf-ovl-prev" data-o="prev">‹</button><button class="bf-ovl-nav bf-ovl-next" data-o="next">›</button>'; document.body.appendChild(ovl); ovlIf=ovl.querySelector('[data-o="if"]'); ovl.querySelector('[data-o="close"]').addEventListener('click',ovlClose); ovl.querySelector('[data-o="prev"]').addEventListener('click',function(e){e.stopPropagation();ovlGo(-1);}); ovl.querySelector('[data-o="next"]').addEventListener('click',function(e){e.stopPropagation();ovlGo(1);}); ovl.addEventListener('click',function(e){ if(e.target===ovl) ovlClose(); }); document.addEventListener('keydown',function(e){ if(!ovl||ovl.style.display==='none') return; if(e.key==='Escape') ovlClose(); else if(e.key==='ArrowLeft') ovlGo(-1); else if(e.key==='ArrowRight') ovlGo(1); }); }
    function openOverlay(uuid){ try{ var _na=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'); if(_na){ window.__bfPipeDrawerOpenedAt=Date.now(); try{ sessionStorage.setItem('bf.pipeorder', JSON.stringify(navList())); }catch(_o){} try{ sessionStorage.setItem('bf.pipesnap', R.innerHTML); }catch(_s){} _na.click(); return; } }catch(_e){} ensureOverlay(); st.ovlOpenedAt=Date.now(); ovlList=navList(); ovlIdx=ovlList.indexOf(uuid); if(ovlIdx<0){ ovlList=[uuid]; ovlIdx=0; } ovl.style.display='block'; ovlShow(); }
    function renderList(){ var lc=q('lc'); if(!st.open){ lc.style.display='none'; lc.innerHTML=''; return; } var u; if(st.open==='__all__'){ var ar=[]; var addr=function(a){(a||[]).forEach(function(z){ar=ar.concat(z.records||[]);});}; addr(st.data&&st.data.stages); addr(st.data&&st.data.other); ar=ar.filter(fOpp); u={status:'__all__',label:'All Opportunities',count:ar.length,records:ar}; } else if(st.open==='__active__'||st.open==='__acquired__'){ var ar2=[]; var ad2=function(a){(a||[]).forEach(function(z){ar2=ar2.concat(z.records||[]);});}; ad2(st.data&&st.data.stages); ad2(st.data&&st.data.other); ar2=ar2.filter(fOpp); if(st.open==='__active__'){ ar2=ar2.filter(function(r){return r.status!=='ACQUIRED'&&r.status!=='NO_DEAL';}); } else { ar2=ar2.filter(function(r){return r.status==='ACQUIRED';}); } u={status:st.open,label:(st.open==='__active__'?'Active Deals':'Acquired'),count:ar2.length,records:ar2}; } else { u=units().filter(function(x){return x.status===st.open;})[0]; } if(!u){ lc.style.display='none'; lc.innerHTML=''; return; } var c=colByKey(st.sortK); var rows=(u.records||[]).slice().sort(function(a,b){ var av=sortVal(a,c),bv=sortVal(b,c); if(av<bv) return -1*st.sortDir; if(av>bv) return 1*st.sortDir; return 0; }); var th=COLS.map(function(col){ var ar=(st.sortK===col.k)?(st.sortDir>0?' ▲':' ▼'):''; return '<th data-k="'+col.k+'" class="'+(col.center||col.hcenter?'ctr':(col.num?'num':''))+(st.sortK===col.k?' on':'')+'">'+col.t+ar+'</th>'; }).join(''); var body=rows.length?rows.map(function(r){ return '<tr data-uuid="'+esc2(r.uuid)+'">'+COLS.map(function(col){ return '<td class="'+(col.center?'ctr':(col.num?'num':''))+'">'+cellHtml(r,col)+'</td>'; }).join('')+'</tr>'; }).join(''):'<tr><td colspan="15" style="color:#8a8a92;padding:12px;">No deals match.</td></tr>'; lc.style.display='block'; lc.innerHTML='<div class="bff-lc-h"><span class="bff-lc-t">'+esc2(u.label)+'</span><span class="bff-lc-c">'+u.count+' deal'+(u.count===1?'':'s')+' · click a column to sort</span><button class="bff-filter bff-filter-lc" data-r="fbtn"><i class="ti ti-filter" style="color:#92df02;font-size:14px;" aria-hidden="true"></i>Filter</button></div><div class="bff-fpanel" data-r="fpanel" style="display:none;"></div><div class="bff-tblwrap"><table class="bff-tbl"><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table></div>'; try{buildFilter();}catch(_e){} var _fb=lc.querySelector('[data-r="fbtn"]'); if(_fb) _fb.addEventListener('click',function(){ var fp=q('fpanel'); if(fp) fp.style.display=(fp.style.display==='none'?'block':'none'); }); [].forEach.call(lc.querySelectorAll('th'),function(h){ h.addEventListener('click',function(){ var k=h.getAttribute('data-k'); if(st.sortK===k){ st.sortDir=-st.sortDir; } else { st.sortK=k; st.sortDir=colByKey(k).num?-1:1; } renderList(); }); }); [].forEach.call(lc.querySelectorAll('.bff-tbtn'),function(b){ b.addEventListener('click',function(ev){ ev.stopPropagation(); var u3=b.getAttribute('data-link')||b.getAttribute('data-sheet'); if(u3){ try{ window.open(u3,'_blank','noopener'); }catch(e){} } }); }); [].forEach.call(lc.querySelectorAll('tbody tr'),function(tr){ tr.addEventListener('click',function(){ var u2=tr.getAttribute('data-uuid'); if(u2) openOverlay(u2); }); }); }
    function render(){ var F=q('funnel'); var U=units(); if(!U.length){ F.innerHTML='<div class="bff-empty">No data.</div>'; return; } var h=''; U.forEach(function(u,i){ if(i>0) h+='<div class="bff-conn"><span class="bff-dot"></span></div>'; var on=(st.open===u.status)?' on':''; var z=u.count===0?' zero':''; h+='<div class="bff-stage'+on+'" data-status="'+esc2(u.status)+'"><div class="bff-ico">'+pSvg(u.label)+'</div><div class="bff-n'+z+'">'+Number(u.count).toLocaleString('en-US')+'</div><div class="bff-l">'+esc2(u.label)+'</div></div>'; }); F.innerHTML=h; F.classList.toggle('bff-funnel-grid', st.view==='stages'); [].forEach.call(F.querySelectorAll('.bff-stage'),function(el){ el.addEventListener('click',function(){ var s2=el.getAttribute('data-status'); st.open=(st.open===s2?null:s2); render(); renderList(); bfPipeKPI(); }); }); }
    function updateCaret(){ var c=q('caret'); if(!c) return; var sh=(st.data&&(st.open===null||st.open==='__all__')); c.style.display=sh?'flex':'none'; var ic=c.querySelector('i'); if(ic) ic.className='ti '+(st.open==='__all__'?'ti-chevron-up':'ti-chevron-down'); }
    function bfPipeKPI(){
      if(!st.data) return;
      if(!st.tf) st.tf={};
      if(!st.repW) st.repW={};
      if(st.repMaster==null) st.repMaster='';
      if(!st.tfW) st.tfW={};
      if(st.tfMaster==null) st.tfMaster='';
      var recs=[]; var addr=function(a){(a||[]).forEach(function(z){recs=recs.concat(z.records||[]);});}; addr(st.data.stages); addr(st.data.other);
      function active(r){ return r.status!=='ACQUIRED' && r.status!=='NO_DEAL'; }
      function tf(key){
        var now=new Date(), y=now.getFullYear(), m=now.getMonth(), day=now.getDate();
        function D(yy,mm,dd){ return new Date(yy,mm,dd,0,0,0,0).getTime(); }
        function sod(t){ var x=new Date(t); return new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(); }
        var nowT=now.getTime(), MS=864e5, s2,e2,ps,pe,pace=null;
        if(key==='last7'){ e2=nowT; s2=nowT-7*MS; pe=s2; ps=s2-7*MS; }
        else if(key==='thisweek'){ var dow=(now.getDay()+6)%7; s2=sod(nowT-dow*MS); e2=nowT; ps=s2-7*MS; pe=s2; }
        else if(key==='last30'){ e2=nowT; s2=nowT-30*MS; pe=s2; ps=s2-30*MS; }
        else if(key==='qtd'){ var q=Math.floor(m/3); s2=D(y,q*3,1); e2=nowT; var pq=q-1,py=y; if(pq<0){pq=3;py=y-1;} ps=D(py,pq*3,1); pe=D(py,pq*3+3,1); }
        else if(key==='lastq'){ var q2=Math.floor(m/3),lq=q2-1,ly=y; if(lq<0){lq=3;ly=y-1;} s2=D(ly,lq*3,1); e2=D(ly,lq*3+3,1); var pp=lq-1,ppy=ly; if(pp<0){pp=3;ppy=ly-1;} ps=D(ppy,pp*3,1); pe=D(ppy,pp*3+3,1); }
        else if(key==='ytd'){ s2=D(y,0,1); e2=nowT; ps=D(y-1,0,1); pe=D(y-1,m,day+1); }
        else if(key==='prioryear'){ s2=D(y-1,0,1); e2=D(y,0,1); ps=D(y-2,0,1); pe=D(y-1,0,1); }
        else if(key==='today'){ s2=sod(nowT); e2=nowT; pe=s2; ps=s2-MS; }
        else { key='mtd'; s2=D(y,m,1); e2=nowT; ps=D(y,m-1,1); pe=D(y,m,1); pace={dp:day, dim:new Date(y,m+1,0).getDate()}; }
        return {key:key,start:s2,end:e2,prevStart:ps,prevEnd:pe,pace:pace};
      }
      var TFL={today:'Today',mtd:'Month to date',last7:'Last 7 days',thisweek:'This week',last30:'Last 30 days',qtd:'Quarter to date',lastq:'Last quarter',ytd:'Year to date',prioryear:'Prior year'};
      var REPS=(function(){ var s={},o=[]; recs.forEach(function(r){ var v=(r.rep||'').trim(); if(v&&!s[v]){s[v]=1;o.push(v);} }); o.sort(); return o; })();
      function effRep(w){ return (st.repW[w]!==undefined)?st.repW[w]:st.repMaster; }
      function effTF(w){ var d=(w==='reporttf')?'ytd':'mtd'; return (st.tfW[w]!==undefined)?st.tfW[w]:(st.tfMaster||d); }
      function repRecs(w){ var rp=effRep(w); return rp?recs.filter(function(r){return (r.rep||'').trim()===rp;}):recs; }
      function initials(nm){ return (nm||'').split(/\s+/).map(function(x){return x[0]||'';}).join('').slice(0,2).toUpperCase(); }
      function ddTF(w){ var k=effTF(w); var dft=(w==='reporttf')?'ytd':'mtd'; var act=(k!==dft)?' bff-dd-act':''; var lab=(k!=='mtd')?('<span class="bff-ddl">'+TFL[k]+'</span>'):''; var m=Object.keys(TFL).map(function(x){return '<div class="bff-ddo'+(x===k?' on':'')+'" data-dd="'+w+'" data-kind="tf" data-v="'+x+'">'+TFL[x]+'</div>';}).join(''); return '<div class="bff-dd bff-ddt'+act+'"><button type="button" class="bff-ddb" data-ddtoggle="1" title="Timeframe"><i class="ti ti-clock-hour-4"></i>'+lab+'<i class="ti ti-chevron-down bff-ddcar"></i></button><div class="bff-ddm">'+m+'</div></div>'; }
      function ddDeal(){ if(!(st.data&&st.data.canFilter)) return ''; var sel=st.data.selectedDealershipId, cur=null; (st.data.dealerships||[]).forEach(function(dl){ if(dl.id===sel) cur=dl; }); var act=(sel!=null)?' bff-dd-act':''; var lab=cur?('<span class="bff-ddl">'+esc2(cur.name)+'</span>'):''; var opts='<div class="bff-ddo'+(sel==null?' on':'')+'" data-dd="deal" data-kind="deal" data-v="">All dealerships</div>'+(st.data.dealerships||[]).map(function(dl){return '<div class="bff-ddo'+(dl.id===sel?' on':'')+'" data-dd="deal" data-kind="deal" data-v="'+dl.id+'">'+esc2(dl.name)+'</div>';}).join(''); return '<div class="bff-dd bff-ddd'+act+'"><button type="button" class="bff-ddb" data-ddtoggle="1" title="Dealership"><i class="ti ti-building-store"></i>'+lab+'<i class="ti ti-chevron-down bff-ddcar"></i></button><div class="bff-ddm bff-ddmr">'+opts+'</div></div>'; }
      function ddRep(w){ var rp=effRep(w); var act=rp?' bff-dd-act':''; var face=rp?('<span class="bff-ddav">'+esc2(initials(rp))+'</span>'):'<i class="ti ti-user"></i>'; var opts='<div class="bff-ddo'+(rp===''?' on':'')+'" data-dd="'+w+'" data-kind="rep" data-v="">All Reps</div>'+REPS.map(function(rn){return '<div class="bff-ddo'+(rp===rn?' on':'')+'" data-dd="'+w+'" data-kind="rep" data-v="'+esc2(rn)+'"><span class="bff-ddav sm">'+esc2(initials(rn))+'</span>'+esc2(rn)+'</div>';}).join(''); return '<div class="bff-dd bff-ddr'+act+'"><button type="button" class="bff-ddb" data-ddtoggle="1" title="Rep">'+face+'<i class="ti ti-chevron-down bff-ddcar"></i></button><div class="bff-ddm bff-ddmr">'+opts+'</div></div>'; }
      function inR(ts,T){ var t=Date.parse(ts); return !isNaN(t)&&t>=T.start&&t<T.end; }
      function inP(ts,T){ var t=Date.parse(ts); return !isNaN(t)&&t>=T.prevStart&&t<T.prevEnd; }
      function acqIn(rs,T,p){ return rs.filter(function(r){return r.status==='ACQUIRED'&&(p?inP(r.stageEnteredAt,T):inR(r.stageEnteredAt,T));}).length; }
      function leadsIn(rs,T,p){ return rs.filter(function(r){var d=r.dateListed||r.stageEnteredAt; return p?inP(d,T):inR(d,T);}).length; }
      function dlt(c,pv){ if(pv==null||pv===0) return null; return Math.round((c-pv)/pv*1000)/10; }
      function dhtml(d){ if(d==null) return '<span class="bff-delta flat">—</span>'; var up=d>=0; return '<span class="bff-delta '+(up?'up':'down')+'">'+(up?'▲':'▼')+Math.abs(d)+'%</span>'; }
      var STORD={FRESH_LEADS:0,ENGAGED_AWAITING_VIN:1,VIN_RECEIVED_APPRAISAL_NEEDED:2,APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES:3,APPRAISAL_REVIEW_NEEDED:3,APPRAISAL_REVIEW_COMPLETE:3,OFFER_SHEET_GENERATED:4,OFFER_SENT_0_2_DAYS:5,NURTURING_FOLLOW_UP_AND_RE_ENGAGE:5,VERBAL_YES_SCHEDULE_APPT:7,SCHEDULED:8,APPT_SHOWN_FOLLOW_UP:9,ACQUIRED:10,NO_DEAL:-1};
      function ord(s2){ var v=STORD[s2]; return v==null?-1:v; }
      function cohort(rs,T,p,pred){ return rs.filter(function(r){ var d=r.dateListed||r.stageEnteredAt; return (p?inP(d,T):inR(d,T))&&pred(r); }).length; }
      function isAcq(r){ return r.status==='ACQUIRED'; }
      function reachedOffer(r){ return ord(r.status)>=5; }
      function macroUnits(rs){ return MACRO.map(function(mm){ var rr=rs.filter(function(r){ return mm.statuses.indexOf(r.status)>-1; }); return {status:mm.label,label:mm.label,count:rr.length,records:rr}; }); }
      var actv=repRecs('active').filter(active);
      var rsa=repRecs('acq'); var Ta=tf(effTF('acq')), acqC=acqIn(rsa,Ta,false), acqP=acqIn(rsa,Ta,true);
      var paceVal=Ta.pace?Math.round(acqC/Math.max(1,Ta.pace.dp)*Ta.pace.dim):null;
      var acqDelta=dhtml(dlt(paceVal!=null?paceVal:acqC,acqP));
      function listedIn(rs,T,p){ return rs.filter(function(r){ if(!r.dateListed) return false; return p?inP(r.dateListed,T):inR(r.dateListed,T); }).length; }
      var rsc=repRecs('close'); var Tc=tf(effTF('close'));
      var ldC=listedIn(rsc,Tc,false), ldP=listedIn(rsc,Tc,true);
      var caC=acqIn(rsc,Tc,false), caP=acqIn(rsc,Tc,true);
      var crC=ldC?Math.round(caC/ldC*100):0, crP=ldP?Math.round(caP/ldP*100):0;
      var rso=repRecs('offer'); var To=tf(effTF('offer'));
      function offMade(r){ return ord(r.status)>=4; }
      var ofC=cohort(rso,To,false,offMade), ofP=cohort(rso,To,true,offMade);
      var oaC=cohort(rso,To,false,isAcq), oaP=cohort(rso,To,true,isAcq);
      var ocC=ofC?Math.round(oaC/ofC*100):0, ocP=ofP?Math.round(oaP/ofP*100):0;
      var closeAcq=caC, closeLeads=ldC; var offerAcq=oaC, offers=ofC;
      var kEl=q('kpis');
      var acqBody=(paceVal!=null)
        ? '<div class="bff-kpi-acqrow"><div class="bff-kpi-col"><div class="bff-kpi-v">'+acqC+'</div><div class="bff-kpi-l">Acquired</div></div><div class="bff-kpi-div"></div><div class="bff-kpi-col"><div class="bff-kpi-v">'+paceVal+'</div><div class="bff-kpi-l">Pace</div></div></div><div class="bff-kpi-sub">'+acqDelta+'</div>'
        : '<div class="bff-kpi-v">'+acqC+'</div><div class="bff-kpi-l">Acquired</div><div class="bff-kpi-sub">'+acqDelta+'</div>';
      if(kEl) kEl.innerHTML=
        '<div class="bff-kpi bff-kpi-tf"><span class="bff-kpi-rep">'+ddRep('active')+'</span><div class="bff-kpi-body"><div class="bff-kpi-ic'+(st.open==='__active__'?' lit':'')+'" data-kpiic="active"><i class="ti ti-flame"></i></div><div class="bff-kpi-main"><div class="bff-kpi-v">'+actv.length.toLocaleString('en-US')+'</div><div class="bff-kpi-l">Active Deals</div></div></div></div>'+
        '<div class="bff-kpi bff-kpi-tf"><span class="bff-kpi-rep">'+ddRep('acq')+'</span><span class="bff-kpi-time">'+ddTF('acq')+'</span><div class="bff-kpi-body"><div class="bff-kpi-ic'+(st.open==='__acquired__'?' lit':'')+'" data-kpiic="acq"><i class="ti ti-checks"></i></div><div class="bff-kpi-main">'+acqBody+'</div></div></div>'+
        '<div class="bff-kpi bff-kpi-tf"><span class="bff-kpi-rep">'+ddRep('close')+'</span><span class="bff-kpi-time">'+ddTF('close')+'</span><div class="bff-kpi-body"><div class="bff-kpi-ic'+(st.kpiInfo&&st.kpiInfo.close?' lit':'')+'" data-kpiic="close"><i class="ti ti-target-arrow"></i></div><div class="bff-kpi-main"><div class="bff-kpi-v">'+crC+'%</div><div class="bff-kpi-l">Close Rate</div><div class="bff-kpi-sub">'+dhtml(dlt(crC,crP))+'</div></div></div>'+(st.kpiInfo&&st.kpiInfo.close?'<div class="bff-kpi-info">'+closeAcq+' closed \u00b7 '+closeLeads+' new leads</div>':'')+'</div>'+
        '<div class="bff-kpi bff-kpi-tf"><span class="bff-kpi-rep">'+ddRep('offer')+'</span><span class="bff-kpi-time">'+ddTF('offer')+'</span><div class="bff-kpi-body"><div class="bff-kpi-ic'+(st.kpiInfo&&st.kpiInfo.offer?' lit':'')+'" data-kpiic="offer"><i class="ti ti-send"></i></div><div class="bff-kpi-main"><div class="bff-kpi-v">'+ocC+'%</div><div class="bff-kpi-l">Offer \u2192 Close</div><div class="bff-kpi-sub">'+dhtml(dlt(ocC,ocP))+'</div></div></div>'+(st.kpiInfo&&st.kpiInfo.offer?'<div class="bff-kpi-info">'+offerAcq+' acquired out of '+offers+' offers</div>':'')+'</div>';
      var rsAc=repRecs('activity'); var Tac=tf(effTF('activity'));
      function actCount(ss,T,p){ return rsAc.filter(function(r){ return ss.indexOf(r.status)>-1 && (p?inP(r.stageEnteredAt,T):inR(r.stageEnteredAt,T)); }).length; }
      var actDefs=[{l:'New Leads',ss:['FRESH_LEADS','ENGAGED_AWAITING_VIN']},{l:'VINs Captured',ss:['VIN_RECEIVED_APPRAISAL_NEEDED']},{l:'Appraisals Needed',ss:['VIN_RECEIVED_APPRAISAL_NEEDED','APPRAISAL_REVIEW_NEEDED']},{l:'Appraisals Completed',ss:['APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES','APPRAISAL_REVIEW_COMPLETE']},{l:'Offers Sent',ss:['OFFER_SHEET_GENERATED','OFFER_SENT_0_2_DAYS']},{l:'Acquired',ss:['ACQUIRED']}];
      var aEl=q('actpanel'); if(aEl){ var arows=actDefs.map(function(a){ return {l:a.l,c:actCount(a.ss,Tac,false),pv:actCount(a.ss,Tac,true)}; }); var amax=Math.max.apply(null,arows.map(function(x){return x.c;}).concat([1])); aEl.innerHTML='<div class="bff-ph"><span>Activity</span><span class="bff-phc">'+ddRep('activity')+ddTF('activity')+'</span></div>'+arows.map(function(a){ var w=Math.max(4,Math.round(a.c/amax*100)); return '<div class="bff-actrow"><span class="bff-actl">'+a.l+'</span>'+dhtml(dlt(a.c,a.pv))+'<span class="bff-actn">'+a.c+'</span><span class="bff-actbar"><span class="bff-actfill" style="width:'+w+'%"></span></span></div>'; }).join(''); }
      var rsP=repRecs('perf'); var Tp=tf(effTF('perf')); var byRep={}; rsP.forEach(function(r){ var rp=(r.rep||'').trim(); if(!rp) return; if(!byRep[rp]) byRep[rp]={name:rp,acq:0,total:0}; byRep[rp].total++; if(r.status==='ACQUIRED'&&inR(r.stageEnteredAt,Tp)) byRep[rp].acq++; });
      var perf=Object.keys(byRep).map(function(k){return byRep[k];}).sort(function(a,b){return (b.acq-a.acq)||(b.total-a.total);}).slice(0,3); (function(){ var dAcq=[35,29,25], dTot=[52,47,43], dPic=["https://randomuser.me/api/portraits/men/32.jpg","https://randomuser.me/api/portraits/women/68.jpg","https://randomuser.me/api/portraits/men/52.jpg"]; for(var di=0; di<perf.length && di<3; di++){ perf[di].acq=dAcq[di]; perf[di].total=dTot[di]; perf[di].photo=dPic[di]; } })();
      var pEl=q('perf'); if(pEl) pEl.innerHTML='<div class="bff-ph"><span>Top Performers</span><span class="bff-phc">'+ddRep('perf')+ddTF('perf')+'</span></div>'+(perf.length?('<div class="bff-tplist">'+perf.map(function(p,i){ var cl=p.total?Math.round(p.acq/p.total*100):0; return '<div class="bff-tpitem"><div class="bff-tprank">#'+(i+1)+'</div><div class="bff-tpav">'+(p.photo?('<img src="'+esc2(p.photo)+'" alt="">'):esc2(initials(p.name)))+'</div><div class="bff-tpinfo"><div class="bff-tpname">'+esc2(p.name)+'</div></div><div class="bff-tpmet"><div class="bff-tpval">'+p.acq+'</div><div class="bff-tplbl">Units</div></div></div>'; }).join('')+'</div>'):'<div class="bff-empty">No reps assigned.</div>');
      var REPL={conversion:'Conversion Rate',vehicles:'Vehicles by Stage',acquisition:'Acquisition Rate',appraisalcomp:'Appraisal Completion Rate',offeracc:'Offer Acceptance Rate',followup:'Follow-up Effectiveness',velocity:'Acquisition Velocity',appraiser:'Appraiser Performance'};
      var RMETA={conversion:'% of leads that convert to the next stage',vehicles:'Total number of vehicles in each stage',acquisition:'% of fresh leads that result in an acquisition',appraisalcomp:'% of VINs that are appraised',offeracc:'% of offers that are accepted',followup:'Acquisition rate by number of follow-up touches',velocity:'Avg time from lead to acquisition & avg time in stage',appraiser:'Per-appraiser appraisal and offer metrics'};
      function reportSel(){ var k=st.tf.report||'conversion'; return '<select class="bff-tf bff-reptf" data-tf="report">'+Object.keys(REPL).map(function(x){return '<option value="'+x+'"'+(x===k?' selected':'')+'>'+REPL[x]+'</option>';}).join('')+'</select>'; }
      function pctv(a,b){ return b?Math.round(a/b*1000)/10:0; }
      function apprReport(rs){ var by={}; rs.forEach(function(r){ var ap=(r.appraiser||'').trim(); if(!ap) return; if(!by[ap]) by[ap]={asg:0,comp:0,bCM:0,bCV:0,bBoth:0,bNeither:0,cmD:0,cvD:0,bothD:0,days:0,daysN:0}; var a=by[ap]; a.asg++; if(ord(r.status)>=3){ a.comp++; if(r.daysInStage!=null){ a.days+=Number(r.daysInStage||0); a.daysN++; } } var cm=Number(r.carmax),cv=Number(r.carvana),off=Number(r.offer)||Number(r.acv); var hCM=!isNaN(cm)&&cm>0,hCV=!isNaN(cv)&&cv>0; if(hCM){a.cmD++; if(off>cm)a.bCM++;} if(hCV){a.cvD++; if(off>cv)a.bCV++;} if(hCM&&hCV){a.bothD++; if(off>cm&&off>cv)a.bBoth++; if(!(off>cm)&&!(off>cv))a.bNeither++;} }); var ks=Object.keys(by); if(!ks.length) return '<div class="bff-empty">No appraiser data in this period.</div>'; function p(n,d){return d?Math.round(n/d*100):0;} function fmtDur(d){ if(d==null) return '\u2014'; var mins=d*1440; if(mins<60) return Math.round(mins)+' mins'; if(mins<1440){ var h=Math.floor(mins/60), mm=Math.round(mins-h*60); return h+' hr'+(h===1?'':'s')+(mm?' '+mm+' mins':''); } return (Math.round(d*10)/10)+' days'; } var rows=ks.map(function(k){var a=by[k]; return {name:k,asg:a.asg,comp:a.comp,compp:p(a.comp,a.asg),avg:(a.daysN?a.days/a.daysN:null),bCM:p(a.bCM,a.cmD),bCV:p(a.bCV,a.cvD),bBoth:p(a.bBoth,a.bothD),bNeither:p(a.bNeither,a.bothD)};}); var sk=(st.apprSort&&st.apprSort.k)||'avg', sd=(st.apprSort&&st.apprSort.dir)||1; rows.sort(function(x,y){ var xv=x[sk],yv=y[sk]; if(sk==='name'){ return xv<yv?-1*sd:(xv>yv?1*sd:0); } if(xv==null&&yv==null) return 0; if(xv==null) return 1; if(yv==null) return -1; return (xv-yv)*sd; }); var cols=[{k:'name',t:'Appraiser',n:false},{k:'avg',t:'Avg Time',n:true},{k:'bCM',t:'Beat CM',n:true},{k:'bCV',t:'Beat CV',n:true},{k:'bBoth',t:'Beat Both',n:true},{k:'bNeither',t:'Neither',n:true},{k:'asg',t:'Asgnd',n:true},{k:'comp',t:'Compl',n:true},{k:'compp',t:'Compl %',n:true}]; var th=cols.map(function(c){var on=c.k===sk; var ar=on?(sd>0?' \u25B2':' \u25BC'):''; return '<th class="'+(c.n?'n':'')+(on?' on':'')+'" data-asort="'+c.k+'">'+c.t+ar+'</th>';}).join(''); var body=rows.map(function(r){ return '<tr><td>'+esc2(r.name)+'</td><td class="n">'+fmtDur(r.avg)+'</td><td class="n">'+r.bCM+'%</td><td class="n">'+r.bCV+'%</td><td class="n">'+r.bBoth+'%</td><td class="n">'+r.bNeither+'%</td><td class="n">'+r.asg+'</td><td class="n">'+r.comp+'</td><td class="n">'+r.compp+'%</td></tr>';}).join(''); return '<div class="bff-rtblwrap"><table class="bff-rtbl"><thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody></table></div>'; }
      function bfPipeReports(){
        var which=st.tf.report||'conversion';
        var Trep=tf(effTF('reporttf'));
        var rrecs=repRecs('report').filter(function(r){ var d=r.dateListed||r.stageEnteredAt; return inR(d,Trep); });
        var U=macroUnits(rrecs);
        function reached(i){ var s2=0; for(var k=i;k<U.length;k++) s2+=U[k].count; return s2; }
        function avgDS(u){ var fr=u.records.filter(function(r){return r.daysInStage!=null;}); return fr.length?Math.round(fr.reduce(function(s2,r){return s2+Number(r.daysInStage||0);},0)/fr.length*10)/10:0; }
        function funnel(items,noBars){ var mx=Math.max.apply(null,items.map(function(x){return x.num;}).concat([0.0001])); return '<div class="bff-rfn">'+items.map(function(x,i){ var hh=Math.max(8,Math.round((x.num/mx)*58)); var conn=i>0?'<div class="bff-rfconn"><span class="bff-rfdot"></span></div>':''; return conn+'<div class="bff-rfcol"><div class="bff-rfval">'+x.disp+'</div>'+(noBars?'<div class="bff-rfgap"></div>':'<div class="bff-rfbar" style="height:'+hh+'px"></div>')+'<div class="bff-rfico'+(st.repIcon===i?' lit':'')+'" data-rfi="'+i+'">'+pSvg(x.label)+'</div><div class="bff-rflbl">'+esc2(x.label)+'</div></div>'; }).join('')+'</div>'; }
        function donut(pct,lbl){ var rr=40,cc=2*Math.PI*rr,off=cc*(1-Math.max(0,Math.min(100,pct))/100); return '<div class="bff-rdc"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="'+rr+'" class="bff-rdbg"></circle><circle cx="50" cy="50" r="'+rr+'" class="bff-rdfg" style="--rdcc:'+cc.toFixed(1)+'" stroke-dasharray="'+cc.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 50 50)"></circle></svg><div class="bff-rdtxt"><div class="bff-rdpct">'+pct+'%</div><div class="bff-rdl">'+lbl+'</div></div></div>'; }
        function sb(l,v,ic){ return '<div class="bff-rsb"><div class="bff-rsbl">'+l+'</div><div class="bff-rsbv">'+v+'</div><i class="ti '+ic+'"></i></div>'; }
        function num(n){ return Number(n).toLocaleString('en-US'); }
        var body='',summ='';
        if(which==='conversion'){ body=funnel(U.map(function(u,i){var v=(i===0?100:pctv(reached(i),reached(i-1))); return {label:u.label,num:v,disp:v+'%'};})); summ='Overall Conversion Rate <b>'+pctv(reached(U.length-1),reached(0))+'%</b>'; }
        else if(which==='vehicles'){ body=funnel(U.map(function(u){return {label:u.label,num:u.count,disp:num(u.count)};})); summ='Total in Pipeline <b>'+num(rrecs.length)+'</b>'; }
        else if(which==='acquisition'){ var ra=reached(U.length-1); body='<div class="bff-rtop"><div class="bff-rtopv">'+pctv(ra,reached(0))+'%</div><div class="bff-rtopl">of Fresh Leads Acquired</div></div>'+funnel(U.map(function(u,i){var v=pctv(ra,reached(i)); return {label:u.label,num:v,disp:v+'%'};})); }
        else if(which==='appraisalcomp'){ var vinR=reached(1),apR=reached(2); body='<div class="bff-rdrow">'+sb('VIN Captured',num(vinR),'ti-barcode')+donut(pctv(apR,vinR),'Completion<br>Rate')+sb('Appraised',num(apR),'ti-clipboard-check')+'</div>'; summ='Total Leads <b>'+num(rrecs.length)+'</b>'; }
        else if(which==='offeracc'){ var ofR=reached(3),acR=reached(U.length-1); body='<div class="bff-rdrow">'+sb('Offers Sent',num(ofR),'ti-send')+donut(pctv(acR,ofR),'Acceptance<br>Rate')+sb('Offers Accepted',num(acR),'ti-businessplan')+'</div>'; }
        else if(which==='velocity'){ var aq2=rrecs.filter(function(r){return r.status==='ACQUIRED'&&r.dateListed&&r.stageEnteredAt;}); var dd2=aq2.map(function(r){return (Date.parse(r.stageEnteredAt)-Date.parse(r.dateListed))/864e5;}).filter(function(x){return !isNaN(x)&&x>=0;}); var av2=dd2.length?Math.round(dd2.reduce(function(s,x){return s+x;},0)/dd2.length*10)/10:0; var fnl=funnel(U.map(function(u){var a=avgDS(u); return {label:u.label,num:a,disp:a+'<span class="bff-rfu">days</span>'};}),true); body='<div class="bff-rvtop"><span class="bff-rvtopl">Average Time Lead → Acquisition</span><span class="bff-rvtopv">'+av2+' Days</span></div><div class="bff-rvfn">'+fnl+'</div>'; }
        else if(which==='followup'){ var bk={}; for(var bi=0;bi<7;bi++) bk[bi]={tot:0,acq:0}; function fbk(n){ if(n<=0)return 0; if(n<=1)return 1; if(n<=3)return 2; if(n<=5)return 3; if(n<=7)return 4; if(n<=9)return 5; return 6; } rrecs.forEach(function(r){ var t=fbk(Number(r.followups||0)); bk[t].tot++; if(r.status==='ACQUIRED')bk[t].acq++; }); var FL=['0 Touches','1+ Touch','2-3+ Touches','4-5+ Touches','6-7 Touches','8-9 Touches','10+ Touches']; var its=[0,1,2,3,4,5,6].map(function(t){return {l:FL[t],v:pctv(bk[t].acq,bk[t].tot)};}); var mxf=Math.max.apply(null,its.map(function(x){return x.v;}).concat([1])); body='<div class="bff-rfbig">'+its.map(function(x){var hh=Math.max(8,Math.round((x.v/mxf)*118)); return '<div class="bff-rfbcol"><div class="bff-rfbv">'+x.v+'%</div><div class="bff-rfbbar" style="height:'+hh+'px"></div><div class="bff-rfblbl">'+esc2(x.l)+'</div></div>';}).join('')+'</div>'; }
        else if(which==='appraiser'){ body=apprReport(rrecs); }
        var foot=(which==='appraiser')?'':'<div class="bff-rfoot"><span class="bff-rfsum">'+(summ||'')+'</span><span class="bff-rfcmp"><span class="bff-rfvs">vs prior period</span>'+dhtml(null)+'</span></div>';
        var cap=''; if(st.repIcon!=null && U[st.repIcon]){ var ci=st.repIcon, su=U[ci]; if(which==='conversion'){ if(ci===0){ cap='<div class="bff-rcap">'+reached(0)+' entered '+esc2(su.label)+' (100%)</div>'; } else { var den=reached(ci-1); cap='<div class="bff-rcap">'+reached(ci)+' of '+den+' advanced to '+esc2(su.label)+' ('+pctv(reached(ci),den)+'%)</div>'; } } else if(which==='acquisition'){ var ra=reached(U.length-1); cap='<div class="bff-rcap">'+ra+' acquired of '+reached(ci)+' '+esc2(su.label)+' ('+pctv(ra,reached(ci))+'%)</div>'; } else if(which==='vehicles'){ cap='<div class="bff-rcap">'+su.count+' '+esc2(su.label)+' of '+reached(0)+' total</div>'; } }
        var rEl=q('report'); if(rEl) rEl.innerHTML='<div class="bff-rhead"><div class="bff-rhl"><div class="bff-rtitle">'+REPL[which]+'</div><div class="bff-rdesc">'+RMETA[which]+'</div></div><div class="bff-rhc"><div class="bff-rhc-top">'+reportSel()+'</div><div class="bff-rhc-bot">'+ddRep('report')+ddTF('reporttf')+'</div></div></div><div class="bff-rbody">'+body+cap+'</div>'+foot;
      }
      bfPipeReports();
      var mrEl=q('masterrep'); if(mrEl) mrEl.innerHTML=ddRep('master')+ddTF('master')+ddDeal();
      [].forEach.call(document.querySelectorAll('#bff-wrap .bff-tf'),function(sel){ if(sel.__bfw) return; sel.__bfw=1; sel.addEventListener('change',function(){ st.tf[sel.getAttribute('data-tf')]=sel.value; bfPipeKPI(); }); });
      if(!window.__bfDD){ window.__bfDD=1; document.addEventListener('click',function(e){ var t=e.target; var as=t.closest&&t.closest('[data-asort]'); if(as){ e.stopPropagation(); var ak=as.getAttribute('data-asort'); if(!st.apprSort) st.apprSort={k:'avg',dir:1}; if(st.apprSort.k===ak){ st.apprSort.dir=-st.apprSort.dir; } else { st.apprSort.k=ak; st.apprSort.dir=1; } try{bfPipeKPI();}catch(_e){} return; } var ki=t.closest&&t.closest('[data-kpiic]'); if(ki){ e.stopPropagation(); var kw=ki.getAttribute('data-kpiic'); if(kw==='active'){ st.open=(st.open==='__active__'?null:'__active__'); renderList(); updateCaret(); bfPipeKPI(); } else if(kw==='acq'){ st.open=(st.open==='__acquired__'?null:'__acquired__'); renderList(); updateCaret(); bfPipeKPI(); } else if(kw==='close'){ if(!st.kpiInfo)st.kpiInfo={}; st.kpiInfo.close=!st.kpiInfo.close; try{bfPipeKPI();}catch(_e){} } else if(kw==='offer'){ if(!st.kpiInfo)st.kpiInfo={}; st.kpiInfo.offer=!st.kpiInfo.offer; try{bfPipeKPI();}catch(_e){} } return; } var rfi=t.closest&&t.closest('[data-rfi]'); if(rfi){ e.stopPropagation(); var ix=+rfi.getAttribute('data-rfi'); st.repIcon=(st.repIcon===ix?null:ix); try{bfPipeKPI();}catch(_e){} return; } var tog=t.closest&&t.closest('[data-ddtoggle]'); if(tog){ e.stopPropagation(); var dd=tog.parentNode; var was=dd.classList.contains('open'); [].forEach.call(document.querySelectorAll('.bff-dd.open'),function(d){d.classList.remove('open');}); if(!was) dd.classList.add('open'); return; } var op=t.closest&&t.closest('.bff-ddo'); if(op){ e.stopPropagation(); var w=op.getAttribute('data-dd'),kind=op.getAttribute('data-kind'),v=op.getAttribute('data-v'); if(kind==='deal'){ [].forEach.call(document.querySelectorAll('.bff-dd.open'),function(d){d.classList.remove('open');}); load(v===''?null:(+v)); return; } if(kind==='tf'){ if(w==='master'){ st.tfMaster=v; st.tfW={}; } else { st.tfW[w]=v; } } else { if(w==='master'){ st.repMaster=v; st.repW={}; } else { st.repW[w]=v; } } [].forEach.call(document.querySelectorAll('.bff-dd.open'),function(d){d.classList.remove('open');}); try{bfPipeKPI();}catch(_e){} return; } [].forEach.call(document.querySelectorAll('.bff-dd.open'),function(d){d.classList.remove('open');}); }); }
    }
    function refresh(){ render(); renderList(); updateCaret(); try{bfPipeKPI();}catch(_k){} }
    function ctlRange(lbl,key){ return '<div class="bff-fc"><label>'+lbl+'</label><div class="bff-frange"><input type="number" data-f="'+key+'Min" placeholder="min" value="'+esc2(st.f[key+'Min']||'')+'"><span>–</span><input type="number" data-f="'+key+'Max" placeholder="max" value="'+esc2(st.f[key+'Max']||'')+'"></div></div>'; }
    function ctlSelect(lbl,key,opts){ var o='<option value="">All</option>'; opts.forEach(function(op){ o+='<option value="'+esc2(op.v)+'"'+(st.f[key]===op.v?' selected':'')+'>'+esc2(op.t)+'</option>'; }); return '<div class="bff-fc"><label>'+lbl+'</label><select data-f="'+key+'">'+o+'</select></div>'; }
    function buildFilter(){ var fp=q('fpanel'); if(!fp) return; var html=''; if(st.data&&st.data.canFilter){ var dop='<option value="">All dealerships</option>'; (st.data.dealerships||[]).forEach(function(dl){ dop+='<option value="'+dl.id+'"'+(st.data.selectedDealershipId===dl.id?' selected':'')+'>'+esc2(dl.name)+'</option>'; }); html+='<div class="bff-fc"><label>Dealership</label><select data-f="__deal">'+dop+'</select></div>'; } html+=ctlSelect('Competition','comp',[{v:'both',t:'Beats Both'},{v:'carmax',t:'Beats CarMax'},{v:'carvana',t:'Beats Carvana'},{v:'neither',t:'Beats Neither'}]); var reps=distinct(function(r){return r.rep;}).map(function(x){return {v:x,t:x};}); reps.unshift({v:'__none__',t:'Unassigned'}); html+=ctlSelect('Assigned Rep','rep',reps); html+=ctlSelect('Milestone Stage','mstage',MACRO.map(function(m){return {v:m.label,t:m.label};})); var stgs=distinct(function(r){return r.status;}).map(function(x){return {v:x,t:String(x).replace(/_/g,' ').toLowerCase()};}); html+=ctlSelect('Stage','stage',stgs); var sts=distinct(function(r){return r.offerStatus;}).map(function(x){return {v:x,t:String(x).replace(/_/g,' ').toLowerCase()};}); html+=ctlSelect('Offer Status','ostatus',sts); html+=ctlRange('Opportunity Score','score'); html+=ctlRange('Days in Stage','days'); html+=ctlRange('Offer vs Price ($)','ovp'); html+=ctlRange('Mileage','mile'); html+=ctlRange('Drive Time (min)','drive'); fp.innerHTML='<div class="bff-fgrid">'+html+'<button class="bff-fclear" data-r="fclear">Clear all</button></div>'; [].forEach.call(fp.querySelectorAll('[data-f]'),function(el){ var ev=(el.tagName==='SELECT')?'change':'input'; el.addEventListener(ev,function(){ var k=el.getAttribute('data-f'); if(k==='__deal'){ load(el.value===''?null:(+el.value)); return; } st.f[k]=el.value; refresh(); }); }); var cl=q('fclear'); if(cl) cl.addEventListener('click',function(){ st.f={}; buildFilter(); refresh(); }); }
    function updateScope(d){ var sc=q('scope'); if(!sc) return; if(d&&d.needsAuth){ sc.style.display=''; sc.textContent='(open a record once so your access loads, then refresh)'; return; } if(!(d&&d.allAccess)){ sc.style.display='none'; sc.textContent=''; return; } sc.style.display=''; var base='All dealerships'; if(d.selectedDealershipId!=null&&d.dealerships){ d.dealerships.forEach(function(dl){ if(dl.id===d.selectedDealershipId) base=dl.name; }); } sc.innerHTML=esc2(base)+' \u00b7 <span class="bff-scope-n">'+((d&&d.total)||0)+'</span> deals'; }
    function waitToken(){ if(st._tw) return; var n=0; var sc=q('scope'); if(sc) sc.textContent='Loading your access…'; st._tw=setInterval(function(){ var t=''; try{t=bfGetApiToken();}catch(e){} if(t){ clearInterval(st._tw); st._tw=null; load(st.dealId); } else if(++n>25){ clearInterval(st._tw); st._tw=null; if(sc) sc.textContent='(open any record once so your access loads, then come back)'; } },700); }
    function load(dealId){ st.dealId=(dealId!=null?dealId:null); var __ck='bf.cc.cache.'+(st.dealId==null?'all':st.dealId); try{ var __cj=localStorage.getItem(__ck); if(__cj){ var __co=JSON.parse(__cj); if(__co&&__co.d&&__co.d.stages){ st.data=__co.d; decorate(st.data); updateScope(__co.d); buildFilter(); refresh(); } } }catch(e){} var tk=''; try{ tk=bfGetApiToken(); }catch(e){} if(!tk){ waitToken(); return; } var bo=st.dealId!=null?{dealershipId:st.dealId}:{}; fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-BF-Token':tk},body:JSON.stringify(bo)}).then(function(r){return r.json();}).then(function(d){ st.data=d||{stages:[]}; if(d&&d.needsAuth){ var s2=q('scope'); if(s2) s2.textContent='(access not recognized — open any record once to refresh)'; return; } try{ if(d&&d.stages) localStorage.setItem(__ck, JSON.stringify({t:Date.now(), d:d})); }catch(e){} decorate(st.data); updateScope(d); buildFilter(); refresh(); }).catch(function(){ if(!(st.data&&st.data.stages)) q('funnel').innerHTML='<div class="bff-empty">Could not load the pipeline. Refresh to retry.</div>'; }); }
    [].forEach.call(R.querySelectorAll('.bff-tab'),function(t){ t.addEventListener('click',function(){ R.querySelectorAll('.bff-tab').forEach(function(x){x.classList.remove('on');}); t.classList.add('on'); st.view=t.getAttribute('data-view'); st.open=null; refresh(); }); });

    var _cr=q('caret'); if(_cr) _cr.addEventListener('click',function(){ st.open=(st.open==='__all__'?null:'__all__'); refresh(); });
    R.__bfReload=function(){ try{ load(st.dealId); }catch(e){} };
    load(null);
  }
  function bfPipelinePage(){ try{ if(!window.__bfPipeLog){ window.__bfPipeLog=1; try{ console.log('BF_PIPE active'); }catch(e){} } bfPipeTitle(); if(/^\/(pipeline|command)(\/|$)/.test(location.pathname)){ var vc=document.querySelector('[data-testid="view-collection"]'); if(vc){ var ph=document.getElementById('bf-pipe-host'); if(!ph){ ph=document.createElement('div'); ph.id='bf-pipe-host'; ph.setAttribute('data-bfpipe','1'); ph.style.cssText='display:flex;flex-direction:column;flex:1 1 auto;min-height:0;width:100%;'; vc.insertBefore(ph, vc.firstChild); bfPipeCSS(); bfPipeRender(ph); try{ console.log('BF_PIPE collection host rendered'); }catch(e){} } else if(ph.parentElement!==vc){ vc.insertBefore(ph, vc.firstChild); } var coll=vc.querySelector('.collection-view'); if(coll) coll.style.setProperty('display','none','important'); [].forEach.call(vc.children,function(c){ if(c===ph) return; if(c.classList&&c.classList.contains('collection-view')) return; if(c.querySelector&&c.querySelector('[data-testid="record-view"]')) return; if(c.getAttribute&&c.getAttribute('data-testid')==='record-view') return; c.style.setProperty('display','none','important'); }); if((location.pathname==='/pipeline'||location.pathname==='/command') && window.__bfPipeDrawerOpenedAt){ var _oa=window.__bfPipeDrawerOpenedAt; window.__bfPipeDrawerOpenedAt=0; var _w=0; try{ _w=+(localStorage.getItem('bf.lastWriteAt')||0); }catch(e){} if(_w>_oa && ph.__bfReload){ ph.__bfReload(); } } } return; } var host=null; var els=document.querySelectorAll('p,span,div,h1,h2,h3,h4,td,li,strong,em,b'); for(var i=0;i<els.length;i++){ var e=els[i]; if(e.children.length>0) continue; if((e.textContent||'').trim()==='BF_PIPELINE_FUNNEL'){ host=e; break; } } if(!host) return; if(host.getAttribute('data-bfpipe')==='1') return; host.setAttribute('data-bfpipe','1'); try{ console.log('BF_PIPE rendering funnel'); }catch(e){} bfPipeCSS(); bfPipeRender(host); }catch(e){} }
  function bfIframeIsolate(){
    try{
      if(window.self===window.top) return;
      if(!/\/(view|preview)\//.test(location.pathname)) return;
      var rv=document.querySelector('[data-testid="record-view"]'); if(!rv) return;
      if(document.documentElement.getAttribute('data-bfiso')==='1') return;
      var el=rv;
      while(el && el!==document.body && el.parentElement){ var par=el.parentElement; [].forEach.call(par.children,function(ch){ if(ch!==el){ try{ ch.style.setProperty('display','none','important'); }catch(e){} } }); try{ par.style.setProperty('padding','0','important'); par.style.setProperty('margin','0','important'); }catch(e){} el=par; }
      try{ document.body.style.setProperty('background','#fff','important'); }catch(e){}
      document.documentElement.setAttribute('data-bfiso','1');
    }catch(e){}
  }
  function run(){ try{bfIframeIsolate();}catch(_if){} var onRec=/\/(preview|view)\//.test(location.pathname); document.body.classList.toggle('bf-rec-open', onRec); if(!onRec) document.body.classList.remove('bf-sbcollapsed'); bfTagContainers(); fixLinks(); addIcons(); bfRecTop(); bfRecHideEmpty(); bfRecTweaks(); bfRecPills(); bfRecHlIcons(); bfRecSectionIcons(); bfRecMobileOffers(); bfRecSectionsUI(); bfRecPort(); bfRecApprBtns(); try{bfRecDedupBtns();}catch(_dd){} bfRecScheduler(); bfRecSecClass(); bfWorkspace(); try{bfPipePrice();}catch(_pp){} bfRecCollapseDefault(); bfRecEditableHl(); manageBackdrop(); try{bfPipeDrawer();}catch(_pd){} bfRecFlip(); bfRecSwipe(); bfSidebarSwipe(); bfEnsureSbRestore(); bfRecMobNav(); bfLoadUsers(); try{bfLiEnsureFab();}catch(e){} if(!onRec||bfBoardDirty){ addCards(false); } bfBoardDirty=false; bfRecHideBottomBtns(); try{bfBoardTriage();}catch(_te){} try{bfPipelinePage();}catch(_pe){} try{bfPushExtToken();}catch(_xt){} try{bfV2();}catch(_v2){} if(!onRec){ if(bfFirstDefault) bfColDefaultSweep(); ensureArrow(); bfEnsureToggle(); bfSnap(); bfInitScroll(); bfExpandAllMobile(); bfMoveSearch(); } }
  run();
  var bfLast=0, bfTimer=null, bfObs=null;
  function bfStartObs(){ if(!bfObs) bfObs=new MutationObserver(bfScheduleRun); bfObs.observe(document.body, { childList: true, subtree: true }); }
  function bfFire(){ bfTimer=null; bfLast=Date.now(); if(bfObs){ try{ bfObs.disconnect(); }catch(e){} } try{ run(); }catch(e){} bfStartObs(); }
  function bfScheduleRun(muts){
    if(muts){ for(var i=0;i<muts.length;i++){ var m=muts[i], t=m.target;
      if(t&&t.closest&&t.closest('[data-testid="collection-record"],[data-testid="collection-group"]')){ bfBoardDirty=true; break; }
      var an=m.addedNodes; if(an&&an.length){ for(var j=0;j<an.length;j++){ var n=an[j]; if(n.nodeType===1&&n.matches&&(n.matches('[data-testid="collection-record"]')||(n.querySelector&&n.querySelector('[data-testid="collection-record"]')))){ bfBoardDirty=true; break; } } }
    } }
    var since=Date.now()-bfLast;
    if(since>=700){ if(bfTimer){ clearTimeout(bfTimer); bfTimer=null; } bfFire(); return; } /* maxWait */
    if(bfTimer) clearTimeout(bfTimer);
    bfTimer=setTimeout(bfFire, 250); /* debounce */
  }
  bfStartObs();
  function bfTickClocks(){
    document.querySelectorAll('.bf-clock[data-bf-base]').forEach(function(el){
      var baseT=parseFloat(el.getAttribute('data-bf-base')); if(isNaN(baseT)) return;
      var ci=bfClockInfo(el.getAttribute('data-bf-stage')||'', baseT);
      el.style.color=ci.txtCol; el.style.fontWeight=ci.wt;
      var dot=el.querySelector('.bf-clock-dot'); if(dot) dot.style.background=ci.dotCol;
      var lbl=el.querySelector('.bf-clock-lbl'); if(lbl && lbl.textContent!==ci.lbl) lbl.textContent=ci.lbl;
    });
  }
  function bfCatchUpCards(){
    if(bfEditing) return;
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
      if(card.getAttribute('data-bfmoved')) return;
      if(!card.classList.contains('bf-vhidden') && !card.querySelector('.bf-body')) bfDecorateCard(card, false);
    });
  }
  setInterval(function(){
    if(bfObs){ try{ bfObs.disconnect(); }catch(e){} }
    try{ bfTickClocks(); bfCatchUpCards(); }catch(e){}
    if(bfObs){ try{ bfStartObs(); }catch(e){} }
  }, 60000);
  var bfTokTries=0;
  function bfGetApiToken(){ try{ return sessionStorage.getItem('bf.apitoken')||localStorage.getItem('bf.apitoken')||''; }catch(e){ return ''; } }
  function bfPushExtToken(){ try{ var t=bfGetApiToken(); if(!t) return; var now=Date.now(); if(window.__bfExtTok===t && window.__bfExtTokAt && (now-window.__bfExtTokAt)<4000) return; window.__bfExtTok=t; window.__bfExtTokAt=now; window.postMessage({source:'buyforce-noloco',type:'BF_TOKEN_SYNC',token:String(t)}, window.location.origin); }catch(e){} }
  try{ if(!window.__bfFetchWrapped && window.fetch){ window.__bfFetchWrapped=true; var _bfOrigFetch=window.fetch; window.fetch=function(input, init){ try{ var url=(typeof input==='string')?input:((input&&input.url)||''); if(url.indexOf('buyforce.app.n8n.cloud')!==-1){ var t=bfGetApiToken(); if(t){ init=init||{}; var h=init.headers; if(h && typeof Headers!=='undefined' && h instanceof Headers){ h.set('X-BF-Token', t); } else { h=Object.assign({}, h||{}); h['X-BF-Token']=t; init.headers=h; } } } if(/\/(update-stage|assign-rep|offer-sheet|card-confirm|card-decode|listing-create)/.test(url)||url.indexOf('ee9245fa')!==-1){ try{ localStorage.setItem('bf.lastWriteAt', String(Date.now())); }catch(_w){} } }catch(e){} return _bfOrigFetch.apply(this, arguments); }; } }catch(e){}
  function bfHideTokens(){
    try{
      var rx=/bft_[A-Za-z0-9]{20,}/;
      var tw=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var tn, hide=[];
      while(tn=tw.nextNode()){ if(rx.test(tn.nodeValue||'')){ if(tn.parentElement) hide.push(tn.parentElement); } }
      for(var i=0;i<hide.length;i++){ try{ hide[i].style.display='none'; if(hide[i].setAttribute) hide[i].setAttribute('data-bftok','1'); }catch(e){} }
      var ins=document.querySelectorAll('input,textarea');
      for(var k=0;k<ins.length;k++){ try{ if(rx.test((ins[k].value||'')+'')){ ins[k].style.display='none'; if(ins[k].setAttribute) ins[k].setAttribute('data-bftok','1'); } }catch(e){} }
    }catch(e){}
  }
  function bfCaptureApiToken(){
    try{
      bfHideTokens();
      if(bfGetApiToken()) return;
      if(bfTokTries++>120) return;
      var rx=/bft_[A-Za-z0-9]{20,}/;
      var done=function(tok){ try{ sessionStorage.setItem('bf.apitoken', tok); }catch(e){} try{ localStorage.setItem('bf.apitoken', tok); }catch(e){} try{ console.log('BF_TOKEN captured ok'); bfToast('BF auth ready \u2713'); }catch(e){} bfHideTokens(); };
      var tw=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var tn; while(tn=tw.nextNode()){ var mm=(tn.nodeValue||'').match(rx); if(mm){ done(mm[0]); return; } }
      var ins=document.querySelectorAll('input,textarea');
      for(var j=0;j<ins.length;j++){ var m2=((ins[j].value||'')+'').match(rx); if(m2){ done(m2[0]); return; } }
    }catch(e){}
  }
  try{ if(!window.__bfTokTimer){ bfCaptureApiToken(); window.__bfTokTimer=setInterval(bfCaptureApiToken, 1500); } }catch(e){}
  window.addEventListener('resize', bfDeb(updateArrows,180));
})();

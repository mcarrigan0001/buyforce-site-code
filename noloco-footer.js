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
  function bfApptRaw(F){ return bfGet(F,['Appointment Date/Time','Appointment Time','Scheduled Appt Time','Appt Date/Time','Appointment Date','Scheduled At','Appt Time','Appointment']); }
  function bfDateShort(iso){ var d=iso?new Date(iso):new Date(); if(isNaN(d.getTime())) d=new Date(); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); }
  function bfApptTimeStr(F){ var raw=bfApptRaw(F); if(!raw) return '[time]'; var d=new Date(raw); if(isNaN(d.getTime())) return '[time]'; var h=d.getHours(), m=d.getMinutes(), ap=h>=12?'PM':'AM', h12=h%12; if(h12===0)h12=12; return h12+(m?':'+(m<10?'0'+m:m):'')+' '+ap; }
  function bfApptIn(F){ var raw=bfApptRaw(F); if(!raw) return '<div class="bf-info">Add an Appointment Date/Time field on the opportunity to show the countdown.</div>'; var d=new Date(raw); if(isNaN(d.getTime())) return ''; var ms=d.getTime()-Date.now(); var col,lbl; if(ms<=0){ col='#c93535'; lbl='Appt time has passed'; } else { col='#2b6012'; lbl='Appt in: '+fmtDuration(Math.floor(ms/60000)); } return '<div class="bf-apptin" style="border-color:'+col+';color:'+col+';"><i class="ti ti-clock-hour-4" aria-hidden="true"></i>'+esc(lbl)+'</div>'; }
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
    return t.replace(/\[First Name\]/gi, first)
            .replace(/\[Model\]/gi, model)
            .replace(/\[Dealership Address\]/gi, apptaddr)
            .replace(/\[Dealership\]/gi, dealer)
            .replace(/\[Appt Time\]/gi, appttime)
            .replace(/\[CarFax\]/gi, carfax)
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
    var _payoff = F['Estimated Payoff Amount']||F['Estimated Payoff Value']||'';
    var _hasPayoff = /[0-9]/.test(_payoff) || _truthy(F['No Payoff']);
    var eq = (_hasPayoff && /[0-9]/.test(F['Est Equity Position']||'')) ? equityInfo2(F['Est Equity Position'], F['Equity Status'], F['Equity Display']) : {text:'—', color:'#9aa0a6'};
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
    var _topRight = (_badge||_listing) ? '<div style="display:flex;align-items:center;gap:6px;flex:none;">'+_badge+_listing+'</div>' : '';
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
    if(!isNaN(baseT)){ var mins=Math.floor((Date.now()-baseT)/60000); if(mins<0)mins=0; var stage=stageOf(card); var dotCol, txtCol, wt2, lbl; if(stage==='Nurturing (Follow Up and Re-engage)'||stage==='Appt Shown - Follow Up'){ var dayNum=Math.floor(mins/1440)+1; var DAYSTOPS=[[1,'#c93535'],[3,'#e0631f'],[5,'#e8930c'],[7,'#c79617'],[10,'#8a9a1c'],[15,'#3f9e5a'],[30,'#1f9e8f'],[45,'#3a8fc4'],[60,'#5aa6db']]; var col=DAYSTOPS[0][1]; for(var di=0;di<DAYSTOPS.length;di++){ if(dayNum>=DAYSTOPS[di][0]) col=DAYSTOPS[di][1]; } dotCol=col; txtCol=col; wt2='500'; lbl='Day '+dayNum+' in stage'; } else { var th=THRESH.hasOwnProperty(stage)?THRESH[stage]:null; dotCol='#9aa0a6'; var sev='green'; if(th){ if(mins>=th[1]){dotCol='#c93535';sev='red';} else if(mins>=th[0]){dotCol='#e8730c';sev='orange';} else {dotCol='#3b6d11';sev='green';} } txtCol='#6b6b64'; wt2='400'; if(sev==='orange'){txtCol='#e8730c';wt2='500';} else if(sev==='red'){txtCol='#c93535';wt2='500';} lbl=fmtDuration(mins)+' in stage'; } clock='<div class="bf-clock" style="border-top:1px solid #8a8a8a;margin-top:11px;padding-top:9px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:'+wt2+';color:'+txtCol+';"><span style="width:8px;height:8px;border-radius:50%;background:'+dotCol+';flex:none;"></span><i class="ti ti-clock" style="font-size:13px;color:#a09e96;" aria-hidden="true"></i>'+lbl+'</div>'; }

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
    var _ringColor = _noDeal ? '#c93535' : '#57c822';
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
  function addCards(force){
    if(bfEditing) return;
    var onR=/\/(preview|view)\//.test(location.pathname);
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
      if(card.getAttribute('data-bfmoved')) return;
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
      if(tgt&&tgt.closest&&tgt.closest('input,textarea,[contenteditable],select,button,a,[role="button"],[data-testid="action-button"],.bf-flip')) return;
      panel=getPanel(); if(!panel) return;
      var t=e.touches[0]; sx=t.clientX; sy=t.clientY; w=(panel.getBoundingClientRect().width)||window.innerWidth;
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
  function bfFlipGo(u){
    var tc=document.querySelector('[data-testid="collection-record"][href*="'+u+'"]');
    if(tc){ tc.click(); }
    else { try{ history.pushState({},'','/opportunities-1/preview/'+u+'/overview'); window.dispatchEvent(new PopStateEvent('popstate')); }catch(e){ location.href='/opportunities-1/preview/'+u+'/overview'; } }
  }
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
  function bfRecTop(){
    if(!/\/(preview|view)\//.test(location.pathname)) return;
    var body=document.querySelector('[data-testid="record-view-body"]'); if(!body) return;
    var m=location.pathname.match(/\/(rec[0-9a-z]+)/i); var uuid=m?m[1]:''; if(!uuid) return;
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'); if(!card) return;
    var F=bfReadF(card); var stg=stageOf(card);
    var dist=F['Distance to Listing']||'', drive=F['Drive Time to Listing']||'', loc=F['Listing Location']||'', listed=F['Date Listed']?listedAgo(F['Date Listed']):'';
    var sc=bfRecScore(F);
    var checks=STATUS_CHECKS[stg]||[]; var noDeal=(stg==='No Deal');
    (function(){ var _c=compInfo(F['Competition']); var _oc=_c?(_c.color==='g'?'#2b6012':(_c.color==='y'?'#7a4d13':'#c93535')):''; if(!_oc) return; var _sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!_sb) return; _sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(ce){ var lb=ce.querySelector('[data-testid="highlight-label"]'); var vl=ce.querySelector('[data-testid="highlight-value"]'); if(lb&&vl&&/offer amount/i.test(lb.textContent||'')){ vl.style.setProperty('color', _oc, 'important'); } }); })();
    var vin=F['VIN']||'', mileage=F['Mileage']||'', color=F['Exterior Color']||'', seller=F['Seller Name']||'';
    var days=F['Days Working']||''; var daysDisp=days?(/[a-z]/i.test(days)?days:String(days).replace(/[^0-9.]/g,'')+'d'):'';
    var _accL=(F['Accident History']||'').trim().toLowerCase(); var accPill='';
    if(_accL.indexOf('accident')>-1) accPill='<span class="bf-rtaccpill" style="background:#fbeecd;color:#7a4d13;"><i class="ti ti-alert-triangle" aria-hidden="true"></i>Accident(s)</span>';
    else if(_accL.indexOf('clean')>-1) accPill='<span class="bf-rtaccpill" style="background:#e3f5cf;color:#2b6012;"><i class="ti ti-shield-check" aria-hidden="true"></i>Clean History</span>';
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
    var meta='<div class="bf-rechdr">'+visit+'<div class="bf-rechdr-main"><div class="bf-rechdr-left"><div class="bf-rechdr-titlewrap"><div class="bf-rectitle bf-title">'+title+'</div>'+accPill+'</div>'+(stagePill?'<div class="bf-rtstagerow">'+stagePill+'</div>':'')+metaL+'</div>'+stats+'</div></div>';
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
    var raw=[F['Vehicle Title'],curSeg,stg,dist,drive,loc,listed,(sc?sc.score:''),F['Competition'],F['VIN'],F['Mileage'],F['Exterior Color'],F['Seller Name'],F['Days Working'],F['Accident History'],F['Stage Entered At'],uuid].join('|');
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
    var card=document.querySelector('[data-testid="collection-record"][href*="'+uuid+'"]'); if(!card) return;
    var stg=stageOf(card); var checks=STATUS_CHECKS[stg]||[];
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
    var sb=document.querySelector('[data-testid="record-view-body"] > [data-testid="record-view-section"][class*="section-container"]:has([class*="section-highlights"])'); if(!sb) return;
    sb.querySelectorAll('[data-testid="highlight-item"]').forEach(function(it){
      var lb=it.querySelector('[data-testid="highlight-label"]'); if(!lb) return; var t=lb.textContent||'';
      var vl=it.querySelector('[data-testid="highlight-value"]');
      if(/offer amount/i.test(t)){
        if(vl && !vl.classList.contains('bf-edit')){ vl.classList.add('bf-edit'); vl.setAttribute('data-bfkey','offerAmount'); vl.setAttribute('data-bflabel','Offer Amount'); vl.setAttribute('data-bffmt','money'); }
        var acv=it.querySelector('[class*="text-stone-600"]'); if(acv && !acv.classList.contains('bf-edit')){ acv.classList.add('bf-edit'); acv.setAttribute('data-bfkey','acv'); acv.setAttribute('data-bflabel','ACV'); acv.setAttribute('data-bffmt','acv'); }
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
      var payload={uuid:uuid}; payload[key]=(n===''?null:n); bfPost(payload);
      el.textContent = n===''?'-':(fmt==='acv'?('ACV: $'+Number(n).toLocaleString('en-US')):('$'+Number(n).toLocaleString('en-US')));
      bfToast(lbl+' saved');
      if(key==='offerAmount'){ try{ bfRecTop(); }catch(_){} }
    }
    function cancel(){ if(done)return; done=true; el.removeAttribute('data-editing'); el.innerHTML=el.getAttribute('data-orig')||''; el.removeAttribute('data-orig'); }
    if(inp){ inp.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); fin(inp.value); } else if(ev.key==='Escape'){ ev.preventDefault(); cancel(); } }); inp.addEventListener('blur', function(){ fin(inp.value); }); }
  }, true);
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
    if(card){ bfMoveCard(card, uuid, to); } else { bfPost({uuid:uuid, status:to}); bfToast('Moving to '+to+'…'); }
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
    el.innerHTML='<input type="text" placeholder="Add a comment\u2026" style="width:100%;border:1px solid #57c822;border-radius:6px;padding:5px 8px;font-size:11px;font-family:inherit;outline:none;box-sizing:border-box;" />';
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
  function bfPost(payload){ try{ fetch(BF_HOOK,{method:'POST',body:JSON.stringify(payload)}); }catch(e){} }
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
  function bfLoadUsers(){
    if(bfUserMap||bfUsersLoading) return;
    try{ var c=localStorage.getItem('bfusers2'); if(c){ var o=JSON.parse(c); if(o&&o.m&&(Date.now()-o.t<600000)){ bfUserMap=o.m; return; } } }catch(e){}
    bfUsersLoading=true;
    fetch(BF_USERS_URL).then(function(r){return r.json();}).then(function(d){
      var arr=(d&&d.users)||[]; var m={}; arr.forEach(function(u){ if(u&&u.name) m[u.name.toLowerCase()]={role:u.role||'', last:u.lastActiveAt||''}; });
      bfUserMap=m; try{ localStorage.setItem('bfusers2',JSON.stringify({t:Date.now(),m:m})); }catch(e){}
    }).catch(function(){}).finally(function(){ bfUsersLoading=false; });
  }
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
    document.querySelectorAll('[data-testid="collection-group"]:not(.w-12)').forEach(function(g){
      var sc=g.querySelector('[class*="overflow-y-auto"]'); if(!sc) return;
      if(sc.style.scrollSnapType!=='y mandatory') sc.style.scrollSnapType='y mandatory';
      var hd=g.querySelector('[data-testid="collection-group-header"]'); var pad=(hd?hd.offsetHeight:0)+'px';
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
  function run(){ var onRec=/\/(preview|view)\//.test(location.pathname); document.body.classList.toggle('bf-rec-open', onRec); fixLinks(); addIcons(); bfRecTop(); bfRecHideEmpty(); bfRecTweaks(); bfRecPills(); bfRecHlIcons(); bfRecMobileOffers(); bfRecSectionsUI(); bfRecPort(); bfRecSecClass(); bfRecCollapseDefault(); bfRecEditableHl(); manageBackdrop(); bfRecFlip(); bfRecSwipe(); bfLoadUsers(); if(!onRec||bfBoardDirty){ addCards(false); } bfBoardDirty=false; bfRecHideBottomBtns(); if(!onRec){ if(bfFirstDefault) bfColDefaultSweep(); ensureArrow(); bfEnsureToggle(); bfSnap(); bfInitScroll(); bfExpandAllMobile(); bfMoveSearch(); } }
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
    bfTimer=setTimeout(bfFire, 200); /* debounce */
  }
  bfStartObs();
  setInterval(function(){ addCards(true); }, 60000);
  window.addEventListener('resize', bfDeb(updateArrows,180));
})();

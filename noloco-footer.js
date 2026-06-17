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

  var STAGEORDER = {
    'Fresh Leads':1,'Engaged - Awaiting VIN':2,'VIN Received - Appraisal Needed':3,
    'Appraisal Complete - Enter Offer Sheet Values':4,'Offer Sheet Generated':5,'Offer Sent (0-2 Days)':6,
    'Nurturing (Follow Up and Re-engage)':7,'Appraisal Review Needed':8,'Appraisal Review Complete':9,
    'Verbal Yes - Schedule Appt':10,'Scheduled':11,'Appt Shown - Follow Up':12,'Acquired':13,'No Deal':14
  };
  var MILESTONES = ['Obtain VIN','Competing values','Create appraisal with notes','Finalize appraisal','Generate offer','Send offer','Follow up','Schedule','Buy'];
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
    'Create appraisal with notes': 'Appraisal Complete - Enter Offer Sheet Values',
    'Finalize appraisal': 'Appraisal Complete - Enter Offer Sheet Values',
    'Generate offer': 'Offer Sheet Generated',
    'Send offer': 'Offer Sent (0-2 Days)',
    'Follow up': 'Nurturing (Follow Up and Re-engage)',
    'Schedule': 'Scheduled',
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
    return '<div><div style="font-size:11px;color:#7c7c7c;">'+lbl+'</div><div style="font-size:14px;font-weight:500;color:#161616;">'+(val?esc(money(val)):'—')+'</div></div>';
  }

  /* ===== Stage-specific card buttons + inline fields ===== */
  var VIEW_SHEET_PAGE = 'https://mcarrigan0001.github.io/buyforce-site-code/offer-sheet.html';
  var GEN_SHEET_HOOK  = 'https://buyforce.app.n8n.cloud/webhook/ee9245fa-55fd-48a1-aba5-9e0093515f14';

  /* inline field definitions. label = display label as it appears on the card
     (footer reads the current value by it); key = Noloco API field key (footer
     writes by it). NOTE: confirm `vin` matches the field your record Decode button reads. */
  var IF = {
    vin:      {label:'VIN',                            key:'vin',                        type:'text',     ph:'Enter VIN…', wide:true, al:['Vin','VIN #','VIN Number']},
    conmax:   {label:'CarMax Offer',                   key:'carMaxOffer',                type:'money',    ph:'$ —', al:['CarMax Value','Carmax Offer','Carmax Value']},
    convana:  {label:'Carvana Offer',                  key:'carvanaOffer',               type:'money',    ph:'$ —', al:['Carvana Value']},
    notes:    {label:'Condition Notes',                key:'conditionNotes',             type:'textarea', ph:'Add condition notes…', al:['Condition Note','Vehicle Condition Notes']},
    accident: {label:'Accident History',               key:'accidentHistory',            type:'select',   al:['Accidents','Accident History?','Accident'],
               options:[['Clean','Clean','g'],['ACCIDENTS','Accident(s)','r']]},
    ncomp:    {label:'# Competing Vehicles',           key:'numberOfCompetingVehicles',  type:'number',   ph:'—', al:['# of Competing Vehicles','Number of Competing Vehicles','Competing Vehicles','# Competing']},
    days:     {label:'Est Dealer Days to Sale',        key:'estDealerDaysToSale',        type:'number',   ph:'—', al:['Estimated Dealer Days to Sale','Est. Dealer Days to Sale','Dealer Days to Sale']},
    pprv:     {label:'Est Private Party Retail Value', key:'estPrivatePartyRetailValue', type:'money',    ph:'$ —', al:['Estimated Private Party Retail Value','Est. Private Party Retail Value','Private Party Retail Value']},
    willtake: {label:'Seller Will Take',               key:'sellerWillTake',             type:'money',    ph:'$ —', al:['Seller Will Take Amount']}
  };

  var STAGE_UI = {
    'Fresh Leads': { tracks:[
      {l:'Ask for the VIN', t:'Hi [First Name], love the [Model]. Could you share the VIN so I can research the history?'},
      {l:'Ask why selling', t:'Hey [First Name], love the [Model]. Can I ask why you’re selling it?'}
    ], fields:['vin'], buttons:[
      {l:'Engaged / Asked for VIN', a:'stage', to:'Engaged - Awaiting VIN', p:1, i:'ti-message-2'} ] },
    'Engaged - Awaiting VIN': { fields:['vin'], buttons:[
      {l:'VIN Obtained', a:'stage', to:'VIN Received - Appraisal Needed', p:1, i:'ti-license'} ] },
    'VIN Received - Appraisal Needed': { fields:['conmax','convana','notes'], buttons:[
      {l:'Get CarMax Value',  a:'url', url:'https://www.carmax.com/sell-my-car',  i:'ti-external-link', showEmpty:'CarMax Offer'},
      {l:'Get Carvana Value', a:'url', url:'https://www.carvana.com/sell-my-car', i:'ti-external-link', showEmpty:'Carvana Offer'},
      {l:'Copy Notes for Appraisal', a:'copynotes', i:'ti-copy'},
      {l:'Mark Appraisal Complete', a:'stage', to:'Appraisal Complete - Enter Offer Sheet Values', p:1, i:'ti-clipboard-check'} ] },
    'Appraisal Complete - Enter Offer Sheet Values': { fields:['accident','ncomp','days','conmax','convana','pprv'], buttons:[
      {l:'Generate Offer Sheet', a:'gensheet', p:1, i:'ti-file-invoice'},
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'},
      {l:'Move to Offer Sheet Generated', a:'stage', to:'Offer Sheet Generated', i:'ti-arrow-right'} ] },
    'Offer Sheet Generated': { fields:[], buttons:[
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'},
      {l:'Offer Sheet Sent', a:'stage', to:'Offer Sent (0-2 Days)', p:1, i:'ti-send'} ] },
    'Offer Sent (0-2 Days)': { fields:['willtake'], buttons:[
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'},
      {l:'Generate New Offer Sheet', a:'regensheet', i:'ti-file-dollar'} ] },
    'Nurturing (Follow Up and Re-engage)': { fields:[], buttons:[
      {l:'Follow Up Sent', a:'followup', p:1, i:'ti-rotate-clockwise'},
      {l:'No Deal', a:'stage', to:'No Deal', i:'ti-x'} ] },
    'Appraisal Review Needed': { fields:['willtake_ro'], buttons:[
      {l:'Mark Review Complete', a:'stage', to:'Appraisal Review Complete', p:1, i:'ti-check'},
      {l:'Generate New Offer Sheet', a:'regensheet', i:'ti-file-dollar'} ] },
    'Appraisal Review Complete': { fields:[], buttons:[
      {l:'Generate Updated Offer Sheet', a:'regensheet', i:'ti-file-dollar'},
      {l:'View Offer Sheet', a:'viewsheet', i:'ti-eye'},
      {l:'Move to Nurturing', a:'stage', to:'Nurturing (Follow Up and Re-engage)', p:1, i:'ti-arrow-right'} ] },
    'Verbal Yes - Schedule Appt': { fields:[], buttons:[
      {l:'Mark Scheduled', a:'stage', to:'Scheduled', p:1, i:'ti-calendar-check'} ] },
    'Scheduled': { fields:[], buttons:[
      {l:'Appt Shown', a:'stage', to:'Appt Shown - Follow Up', p:1, i:'ti-user-check'},
      {l:'Acquired', a:'stage', to:'Acquired', p:1, i:'ti-circle-check'},
      {l:'No Show', a:'stage', to:'Verbal Yes - Schedule Appt', i:'ti-user-x'},
      {l:'Mark Lost', a:'stage', to:'No Deal', i:'ti-x'} ] },
    'Appt Shown - Follow Up': { fields:[], buttons:[
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
    var common = 'data-bfk="'+esc(def.key)+'" data-bfuuid="'+esc(uuid)+'" data-bftype="'+def.type+'" data-bflabel="'+esc(lbl)+'" data-bfval="'+esc(val)+'"';
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

  function bfButton(b, uuid){
    var cls='bf-btn '+(b.p?'bf-btn-p':'bf-btn-s');
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
  function bfFillTrack(t, F){
    var first=bfSellerFirst(F)||'there';
    var model=F['Model']||F['Vehicle Title']||'vehicle';
    return t.replace(/\[First Name\]/g, first).replace(/\[Model\]/g, model);
  }
  function bfTrack(wt, F){
    var filled=bfFillTrack(wt.t, F);
    return '<div class="bf-f bf-fcol"><span class="bf-fl">'+esc(wt.l)+'</span>'+
      '<div class="bf-wt" data-bfwt="'+esc(filled)+'"><span class="bf-wttext">'+esc(filled)+'</span><i class="ti ti-copy bf-wtcopy" aria-hidden="true"></i></div></div>';
  }

  function renderStageUI(F, card, uuid){
    var ui = STAGE_UI[stageOf(card)];
    if(!ui) return '';
    var html='';
    if(ui.tracks && ui.tracks.length){
      var th='';
      ui.tracks.forEach(function(wt){ th += bfTrack(wt, F); });
      if(th) html += '<div class="bf-tracks">'+th+'</div>';
    }
    if(ui.fields && ui.fields.length){
      var fh='';
      ui.fields.forEach(function(fid){
        var ro=false, id=fid;
        if(fid==='willtake_ro'){ ro=true; id='willtake'; }
        var def=IF[id]; if(!def) return;
        fh += bfInlineField(def, F, uuid, ro);
      });
      if(fh) html += '<div class="bf-fields">'+fh+'</div>';
    }
    if(ui.buttons && ui.buttons.length){
      var bh='';
      ui.buttons.forEach(function(b){
        if(b.showEmpty && (F[b.showEmpty]||'').trim()) return;
        bh += bfButton(b, uuid);
      });
      if(bh) html += '<div class="bf-btns">'+bh+'</div>';
    }
    if(!html) return '';
    var collapsed = bfLS('bfcol:'+uuid)==='1';
    var caret = collapsed?'ti-chevron-down':'ti-chevron-up';
    return '<div class="bf-actions'+(collapsed?' bf-collapsed':'')+'">'+
      '<div class="bf-collapse-bar" data-bfuuid="'+esc(uuid)+'" title="Collapse / expand actions"><span class="bf-collapse-line"></span><i class="ti '+caret+' bf-collapse-ic" aria-hidden="true"></i><span class="bf-collapse-line"></span></div>'+
      '<div class="bf-stageui">'+html+'</div></div>';
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

    var _n=function(x){var m=(x||'').replace(/[^0-9.]/g,'');return m?parseFloat(m):NaN;};
    var _acv=_n(F['ACV']);
    var _wt=_n(F['Seller Will Take']);
    var _ask=(!isNaN(_wt)&&_wt>0)?_wt:_n(F['Asking Price']);
    var _off=_n(F['Offer Amount']);
    var _badge='';
    if(!isNaN(_acv)&&_acv>0&&!isNaN(_ask)){
      var _cmp=compInfo(F['Competition']);
      var _cs=_cmp?(_cmp.color==='g'?40:(_cmp.color==='y'?20:0)):0;
      var _prem=_ask-_acv;
      var _ds=_prem<=0?30:(_prem>=4000?0:30*(1-_prem/4000));
      var _pct=_prem/_acv;
      var _ps=_pct<=0?20:(_pct>=0.20?0:20*(1-_pct/0.20));
      var _eq=(!isNaN(_off))?(_acv-_off):0;
      var _es=_eq>=2000?10:(_eq<=0?0:10*(_eq/2000));
      var _score=Math.round(_cs+_ds+_ps+_es);
      var _tier=_score>=75?{bg:'#e3f5cf',fg:'#2b6012',l:'Hot'}:(_score>=50?{bg:'#fbeecd',fg:'#7a4d13',l:'Warm'}:{bg:'#eceae3',fg:'#6b6b64',l:'Cool'});
      _badge='<span title="'+_tier.l+' '+_score+'/100 (beats '+_cs+', $gap '+Math.round(_ds)+', %gap '+Math.round(_ps)+', equity '+Math.round(_es)+')" style="flex:none;display:inline-flex;align-items:center;gap:3px;background:'+_tier.bg+';color:'+_tier.fg+';font-size:11px;font-weight:500;padding:3px 8px;border-radius:999px;"><i class="ti ti-flame" style="font-size:12px;" aria-hidden="true"></i>'+_score+'</span>';
    }
    var header='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:9px;"><div style="min-width:0;"><div style="font-size:15px;font-weight:500;color:#161616;">'+esc(F['Vehicle Title']||'')+'</div>'+
      (F['Vehicle Subtitle']?'<div style="font-size:12px;color:#7c7c7c;margin-top:1px;">'+esc(F['Vehicle Subtitle'])+'</div>':'')+ meta +'</div>'+ _badge +'</div>';

    var clock='';
    var se=F['Stage Entered At'];
    var lf=F['Last Follow Up At'];
    var seT=se?new Date(se).getTime():NaN;
    var lfT=lf?new Date(lf).getTime():NaN;
    var baseT=seT;
    if(!isNaN(lfT) && (isNaN(seT)||lfT>seT)) baseT=lfT;
    if(!isNaN(baseT)){ { var mins=Math.floor((Date.now()-baseT)/60000); if(mins<0)mins=0; var stage=stageOf(card); var th=THRESH.hasOwnProperty(stage)?THRESH[stage]:null; var dotCol='#9aa0a6'; var sev='green'; if(th){ if(mins>=th[1]){dotCol='#c93535';sev='red';} else if(mins>=th[0]){dotCol='#e8730c';sev='orange';} else {dotCol='#3b6d11';sev='green';} } var txtCol='#6b6b64'; var wt='400'; if(sev==='orange'){txtCol='#e8730c';wt='500';} else if(sev==='red'){txtCol='#c93535';wt='500';} clock='<div class="bf-clock" style="border-top:0.5px solid #ece9e0;margin-top:11px;padding-top:9px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:'+wt+';color:'+txtCol+';"><span style="width:8px;height:8px;border-radius:50%;background:'+dotCol+';flex:none;"></span><i class="ti ti-clock" style="font-size:13px;color:#a09e96;" aria-hidden="true"></i>'+fmtDuration(mins)+' in stage</div>'; } }

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
        '<span style="font-size:10px;line-height:1.15;color:' + (_ok ? '#3b3b38' : (_noDeal ? '#c93535' : '#9aa0a6')) + ';">' + _label + '</span></div>';
    }
    var checklist = '<div style="border-top:0.5px solid #ece9e0;padding-top:11px;padding-bottom:10px;margin-bottom:1px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:10px;font-weight:600;letter-spacing:0.4px;color:#9aa0a6;">DEAL PROGRESS</span>' +
      '<span style="font-size:10px;color:#9aa0a6;">' + _done + ' of ' + MILESTONES.length + '</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px 6px;">' + _items + '</div></div>';
    var _lc = F['Last Comment'];
    var commentLine = '';
    if (_lc) {
      var _txt = _lc.length > 60 ? _lc.slice(0,60).trim() + '…' : _lc;
      var _ago = F['Last Comment At'] ? agoShort(F['Last Comment At']) : '';
      commentLine = '<div class="bf-comment" style="display:flex;align-items:center;gap:5px;margin:9px -4px 0;padding:3px 4px;font-size:11px;color:#6b6b64;cursor:pointer;">' +
        '<i class="ti ti-message-2" style="font-size:13px;color:#9aa0a6;flex:none;" aria-hidden="true"></i>' +
        '<span style="line-height:1.3;flex:1;min-width:0;">“' + esc(_txt) + '”' + (_ago ? '<span style="color:#9aa0a6;"> · ' + _ago + '</span>' : '') + '</span>' +
        '<i class="ti ti-pencil bf-comment-hint" style="font-size:12px;color:#b4b2a9;flex:none;" aria-hidden="true"></i></div>';
    } else {
      commentLine = '<div class="bf-comment" style="display:flex;align-items:center;gap:5px;margin:9px -4px 0;padding:3px 4px;font-size:11px;color:#b4b2a9;cursor:pointer;">' +
        '<i class="ti ti-message-2" style="font-size:13px;color:#b4b2a9;flex:none;" aria-hidden="true"></i>No comments yet' +
        '<i class="ti ti-pencil bf-comment-hint" style="font-size:12px;color:#b4b2a9;flex:none;margin-left:auto;" aria-hidden="true"></i></div>';
    }
    return header + checklist + grid + pill + commentLine + renderStageUI(F, card, _uuid) + clock;
  }

  function addCards(force){
    if(bfEditing) return;
    document.querySelectorAll('[data-testid="collection-record"]').forEach(function(card){
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
        F[norm(lab.textContent)] = vNode ? vNode.textContent.trim() : '';
      });

      if(!('Vehicle Title' in F) && !('Offer Amount' in F)) return;
      var raw = [F['Vehicle Title'],F['Vehicle Subtitle'],F['Date Listed'],F['Listing Location'],F['Asking Price'],F['Seller Will Take'],F['ACV'],F['Offer Amount'],F['CarMax Offer'],F['Carvana Offer'],F['Competition'],F['Equity Display'],F['Estimated Payoff Value'],F['Stage Entered At'],F['Last Comment'],F['Last Comment At'],F['Offer Sheet Image URL'],F['Offer Sheet Status'],F['Last Follow Up At'],F['VIN'],F['Condition Notes'],F['Accident History'],F['# Competing Vehicles'],F['Est Dealer Days to Sale'],F['Est Private Party Retail Value'],stageOf(card)].join('|');

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
  var bfBackdrop;
  var bfCloseBtn;
  function manageBackdrop(){
    var rv = (location.pathname.indexOf('/preview/') > -1) ? document.querySelector('[data-testid="record-view"]') : null;
    if(rv){
      var panel = rv.closest('[class*="inset-y-0"]') || rv.parentElement;
      var parent = panel ? panel.parentNode : document.body;
      if(!bfBackdrop){
        bfBackdrop=document.createElement('div');
        bfBackdrop.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.45);';
        bfBackdrop.addEventListener('click',function(){ try{ history.back(); }catch(e){} });
      }
      if(panel && bfBackdrop.parentNode !== parent){ parent.insertBefore(bfBackdrop, panel); }
      else if(!bfBackdrop.parentNode){ document.body.appendChild(bfBackdrop); }
      bfBackdrop.style.display='block';
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
  function bfSC(){ return document.querySelector('[class*="min-h-screen-75"]'); }
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
    if(!sc.getAttribute('data-bfscroll')){ sc.addEventListener('scroll',function(){ if(!bfBusy) updateArrows(); },{passive:true}); sc.setAttribute('data-bfscroll','1'); }
    updateArrows();
  }
  var BF_HOOK='https://buyforce.app.n8n.cloud/webhook/update-stage';
  var bfStageBusy=false;
  function bfLS(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  document.addEventListener('mousedown', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-ms, .bf-comment, .bf-actions'):null;
    if(el){ e.stopPropagation(); }
  }, true);
  document.addEventListener('pointerdown', function(e){
    var el=(e.target&&e.target.closest)?e.target.closest('.bf-ms, .bf-comment, .bf-actions'):null;
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
  function bfReadF(card){
    var F={}; var first=card.querySelector('[data-testid="field-cell"]'); var cont=first?first.parentNode:card;
    (cont||card).querySelectorAll('[data-testid="field-cell"]').forEach(function(cell){
      var lab=cell.querySelector('[data-testid="field-cell-label"]'); if(!lab) return;
      var vn=lab.nextElementSibling; F[norm(lab.textContent)]=vn?vn.textContent.trim():'';
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
          var delta=(cr.top - vr.top) - (vr.height/2 - cr.height/2);
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
    host.innerHTML = multiline ? '<textarea class="bf-fedit" rows="2"></textarea>' : '<input type="text" class="bf-fedit" />';
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
    var card=btn.closest('[data-testid="collection-record"]'); if(!card) return;
    var uuid=btn.getAttribute('data-bfuuid')||'';
    var a=btn.getAttribute('data-bfaction');
    if(a==='url'){ var u=btn.getAttribute('data-bfurl'); if(u) window.open(u,'_blank','noopener'); return; }
    if(!uuid) return;
    if(a==='stage'){
      bfMoveCard(card, uuid, btn.getAttribute('data-bfto'));
      return;
    }
    if(a==='viewsheet'){
      var F=bfReadF(card); var img=F['Offer Sheet Image URL']||''; var nm=F['Vehicle Title']||'';
      if(!img){ bfToast('No offer sheet yet'); return; }
      window.open(VIEW_SHEET_PAGE+'?img='+encodeURIComponent(img)+'&name='+encodeURIComponent(nm),'_blank','noopener');
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
    if(wt){ e.preventDefault(); e.stopPropagation(); var wttxt=wt.getAttribute('data-bfwt')||''; try{ navigator.clipboard.writeText(wttxt); }catch(_){} bfToast('Copied — paste into Messenger'); return; }
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
  function run(){ fixLinks(); addIcons(); addCards(false); ensureArrow(); manageBackdrop(); bfLoadUsers(); }
  run();
  new MutationObserver(function(){ run(); }).observe(document.body, { childList: true, subtree: true });
  setInterval(function(){ addCards(true); }, 60000);
  window.addEventListener('resize', updateArrows);
})();

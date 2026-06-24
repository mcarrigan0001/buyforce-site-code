/* BuyForce Listing Capture - Facebook Marketplace listing content script.
 * Renders an EDITABLE capture form into the BuyForce sidebar. Free NHTSA VIN
 * decode and (paid) plate->VIN lookup both surface a confirm-before-apply
 * preview of Year/Make/Model/Trim. On Save it creates a Fresh Lead via the
 * listing-create proxy. Assist-only: it never acts on Facebook.
 */
(function () {
  var current = null;
  var lastId = null;
  var pendingDecode = null;

  function isListing() { return /\/marketplace\/item\/\d+/.test(location.pathname); }
  function itemId() { var m = location.pathname.match(/\/marketplace\/item\/(\d+)/); return m ? m[1] : ''; }
  function cleanUrl() { var id = itemId(); return id ? (location.origin + '/marketplace/item/' + id) : (location.origin + location.pathname).replace(/\/$/, ''); }
  function t(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tc(s) { if (!s) return ''; if (/^[A-Z0-9]{2,4}$/.test(s)) return s; return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  function agoToDays(s) {
    var m = (s || '').match(/(\d+|a|an)\s*(minute|hour|day|week|month|year)/i);
    if (!m) return '';
    var n = (/^a/i.test(m[1])) ? 1 : parseInt(m[1], 10);
    var f = { minute: 1 / 1440, hour: 1 / 24, day: 1, week: 7, month: 30, year: 365 }[m[2].toLowerCase()];
    return f ? String(Math.max(0, Math.round(n * f))) : '';
  }

  function extract() {
    var main = document.querySelector('div[role="main"]') || document.body;
    var h1 = main.querySelector('h1');
    var title = t(h1);
    var scope = main, node = h1;
    while (node && node !== main) {
      var it = node.innerText || '';
      if (/About this vehicle/i.test(it) && /(Seller.?s description|Seller information)/i.test(it)) { scope = node; break; }
      node = node.parentElement;
    }
    var x = (scope.innerText || '');

    var priceM = x.match(/\$\s?([\d,]{3,})/);
    var price = priceM ? '$' + priceM[1] : '';
    var milesM = x.match(/Driven\s+([\d,]{2,})\s*miles/i) || x.match(/([\d,]{3,})\s*miles/i);
    var mileage = milesM ? milesM[1].replace(/,/g, '') : '';
    var CITY = "[A-Z][a-zA-Z.'’\\-]*(?:[ '’\\-][A-Z][a-zA-Z.'’\\-]*){0,3}";
    var locM = x.match(new RegExp("Listed[^\\n]{0,40}?\\bin\\s+(" + CITY + ",\\s*[A-Z]{2})\\b")) ||
               x.match(new RegExp("(" + CITY + ",\\s*[A-Z]{2})\\s*\u00B7\\s*Location is approximate", 'i')) ||
               x.match(new RegExp("\\b(" + CITY + ",\\s*[A-Z]{2})\\b"));
    var loc = locM ? locM[1].trim() : '';
    var laM = x.match(/Listed\s+(.+?)\s+ago/i);
    var listedAgo = laM ? (laM[1].trim() + ' ago') : '';
    var listedDaysAgo = agoToDays(listedAgo);
    var vinM = x.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    var vin = vinM ? vinM[1] : '';

    var extC = (x.match(/Exterior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\s*Interior|\n|$)/i) || [, ''])[1].trim();
    var intC = (x.match(/Interior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\n|$)/i) || [, ''])[1].trim();
    var transRaw = (x.match(/\b(Manual|Automatic|CVT)\b\s*transmission/i) || [, ''])[1];
    var transmissionType = /cvt/i.test(transRaw) ? 'CVT' : (/manual/i.test(transRaw) ? 'Manual' : (/automatic/i.test(transRaw) ? 'Automatic' : ''));
    var fuel = (x.match(/Fuel type:\s*([A-Za-z]+)/i) || [, ''])[1];
    var owners = (x.match(/(\d+)\s+owners?\b/i) || [, ''])[1];
    var titleSt = (x.match(/\b(Clean title|Salvage title|Rebuilt title)\b/i) || [, ''])[1];
    var paidOff = /This vehicle is paid off/i.test(x);
    var stillOwed = /Money is still owed on this vehicle/i.test(x);

    var seller = '', sellerProfileId = '';
    var hdrs = [].slice.call(main.querySelectorAll('span, h2, h3'));
    for (var i = 0; i < hdrs.length; i++) {
      if (/^seller information$/i.test(t(hdrs[i]))) {
        var box = hdrs[i].closest('div'), hops = 0;
        while (box && hops++ < 6 && !seller) {
          var links = box.querySelectorAll('a[href*="/marketplace/profile/"]');
          for (var k = 0; k < links.length; k++) {
            var lt = t(links[k]);
            if (lt && lt.length > 2 && !/seller details|see details|^details$|view profile/i.test(lt)) {
              seller = lt; var pm = (links[k].getAttribute('href') || '').match(/\/marketplace\/profile\/([^/?]+)/); if (pm) sellerProfileId = pm[1]; break;
            }
          }
          box = box.parentElement;
        }
        break;
      }
    }
    if (!seller) { var sm = x.match(/Seller information\s*(?:Seller details)?\s*([A-Z][a-z’'\-]+(?:\s+[A-Z][a-z’'\-]+){1,2})/); if (sm) seller = sm[1]; }
    seller = (seller || '').replace(/\s*\bSeller details\b\s*/i, '');
    seller = seller.split(/\s*(?:Joined Facebook|Joined|Active now|Active|Typically replies|Lives in|·|\|)/i)[0];
    seller = seller.replace(/\s+/g, ' ').trim();

    var desc = (x.match(/Seller.?s description\s*([\s\S]*?)(?:\s*See (?:less|more)|Location is approximate|Seller information|$)/i) || [, ''])[1].trim();
    if (desc.length > 2000) desc = desc.slice(0, 2000);

    var yr = '', mk = '', md = '', tr = '';
    var tm = title.match(/\b(19|20)\d\d\b/);
    if (tm) {
      yr = tm[0];
      var rest = title.slice(title.indexOf(yr) + 4).trim().split(/\s+/).filter(Boolean);
      mk = tc(rest.shift() || ''); md = tc(rest.shift() || ''); tr = rest.join(' ');
    }
    return {
      title: title, year: yr, make: mk, model: md, trim: tr,
      price: price, mileage: mileage, location: loc, listedAgo: listedAgo, listedDaysAgo: listedDaysAgo,
      vin: vin, plateNumber: '', plateState: '', sellerName: seller, sellerProfileId: sellerProfileId,
      color: extC, transmissionType: transmissionType, description: desc,
      interiorColor: intC, fuelType: fuel, owners: owners, titleStatus: titleSt, paidOff: paidOff, stillOwed: stillOwed,
      _decode: null, listingUrl: cleanUrl()
    };
  }

  var US_STATES = ['', 'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  function field(label, key, val) { return '<label class="bfc-f"><span>' + esc(label) + '</span><input data-k="' + key + '" value="' + esc(val) + '"></label>'; }
  var TRANS_TYPES = ['', 'Automatic', 'Manual', 'CVT', 'DCT', 'Other'];
  function selField(label, key, val, options) {
    var list = options || US_STATES;
    var opts = list.map(function (s) { return '<option value="' + s + '"' + (s === (val || '') ? ' selected' : '') + '>' + (s || '—') + '</option>'; }).join('');
    return '<label class="bfc-f"><span>' + esc(label) + '</span><select data-k="' + key + '">' + opts + '</select></label>';
  }
  function taField(label, key, val) { return '<label class="bfc-f bfc-f-full"><span>' + esc(label) + '</span><textarea data-k="' + key + '" rows="2">' + esc(val || '') + '</textarea></label>'; }
  function detailsStrip(d) {
    var bits = [];
    if (d.interiorColor) bits.push('Int: ' + esc(d.interiorColor));
    if (d.fuelType) bits.push(esc(d.fuelType));
    if (d.owners) bits.push(esc(d.owners) + '-owner');
    if (d.titleStatus) bits.push(esc(d.titleStatus));
    var flag = d.paidOff ? '<span class="bfc-flag" style="color:#9fd86a">✓ Paid off — no payoff owed</span>' : (d.stillOwed ? '<span class="bfc-flag">⚠ Loan still owed — payoff likely</span>' : '');
    if (!bits.length && !flag) return '';
    return '<div class="bfc-meta">' + bits.join(' · ') + (bits.length && flag ? '<br>' : '') + flag + '</div>';
  }

  function formHTML(d) {
    var head = d.title ? '<div class="bf-sb-veh">' + esc(d.title) + '</div>' : '<div class="bf-sb-veh">New listing</div>';
    return head +
      '<div class="bf-sb-sub">Review &amp; save as a Fresh Lead</div>' +
      '<div class="bfc-grid">' +
        field('Year', 'year', d.year) + field('Make', 'make', d.make) +
        field('Model', 'model', d.model) + field('Trim', 'trim', d.trim) +
        field('Price', 'price', d.price) + field('Mileage', 'mileage', d.mileage) +
        field('Ext. color', 'color', d.color) + selField('Transmission', 'transmissionType', d.transmissionType, TRANS_TYPES) +
        field('Location', 'location', d.location) + field('Listed', 'listedAgo', d.listedAgo) +
        field('Seller', 'sellerName', d.sellerName) +
      '</div>' +
      '<div class="bfc-block">' +
        '<label class="bfc-f bfc-f-full"><span>VIN<button class="bfc-scan" data-r="scanVin" type="button" title="Scan VIN from a photo">Scan</button></span><input data-k="vin" value="' + esc(d.vin) + '"></label>' +
        '<div class="bfc-tools"><button class="bfc-tool" data-r="decodeVin" type="button">Decode VIN</button></div>' +
      '</div>' +
      '<div class="bfc-block">' +
        '<div class="bfc-grid">' +
          '<label class="bfc-f"><span>Plate #<button class="bfc-scan" data-r="scanPlate" type="button" title="Scan plate from a photo">Scan</button></span><input data-k="plateNumber" value="' + esc(d.plateNumber) + '"></label>' +
          selField('Plate state', 'plateState', d.plateState) +
        '</div>' +
        '<div class="bfc-tools"><button class="bfc-tool" data-r="findVin" type="button">Find VIN from plate</button></div>' +
      '</div>' +
      '<div class="bfc-preview" data-r="preview"></div>' +
      taField('Description', 'description', d.description) +
      detailsStrip(d) +
      (d.listingUrl ? '<div class="bfc-src">Source: <span>' + esc(d.listingUrl) + '</span></div>' : '') +
      '<div class="bfc-msg" data-r="msg"></div>' +
      '<div class="bfc-act"><button class="bfc-save" data-r="save" type="button">Save lead</button></div>';
  }

  function bodyEl() { return window.BFSidebar ? window.BFSidebar.body : null; }
  function val(key) { var body = bodyEl(); if (!body) return ''; var el = body.querySelector('[data-k="' + key + '"]'); return el ? (el.value || '').trim() : ''; }
  function setPreview(html) { var body = bodyEl(); if (!body) return; var p = body.querySelector('[data-r="preview"]'); if (p) p.innerHTML = html; }

  function decodeVin() {
    var vin = val('vin').toUpperCase();
    if (vin.length < 11) { setPreview('<div class="bfc-pv-msg bfc-warn">Enter a full VIN (17 chars) to decode.</div>'); return; }
    setPreview('<div class="bfc-pv-msg">Decoding…</div>');
    try {
      chrome.runtime.sendMessage({ type: 'BF_VIN_DECODE', vin: vin }, function (resp) {
        if (chrome.runtime.lastError || !resp) { setPreview('<div class="bfc-pv-msg bfc-err">Could not reach the decoder.</div>'); return; }
        if (resp.ok === false) { setPreview('<div class="bfc-pv-msg bfc-err">' + esc(resp.reason || 'Decode failed.') + '</div>'); return; }
        showPreview(resp, 'VIN decode');
      });
    } catch (e) { setPreview('<div class="bfc-pv-msg bfc-err">Something went wrong.</div>'); }
  }

  function findVin() {
    var plate = val('plateNumber'), state = val('plateState');
    if (!plate || !state) { setPreview('<div class="bfc-pv-msg bfc-warn">Enter a plate number and state first.</div>'); return; }
    setPreview('<div class="bfc-pv-msg">Looking up VIN (uses a paid lookup)…</div>');
    try {
      chrome.runtime.sendMessage({ type: 'BF_PLATE_TO_VIN', plate: plate, state: state }, function (resp) {
        if (chrome.runtime.lastError || !resp) { setPreview('<div class="bfc-pv-msg bfc-err">Could not reach the lookup.</div>'); return; }
        if (resp.ok === false) { setPreview('<div class="bfc-pv-msg bfc-err">' + esc(resp.reason || 'No VIN found for that plate.') + '</div>'); return; }
        var vin = (resp.vin || '').toUpperCase();
        var body = bodyEl(); var vinEl = body && body.querySelector('input[data-k="vin"]'); if (vinEl) vinEl.value = vin;
        setPreview('<div class="bfc-pv-msg">VIN ' + esc(vin) + ' found — decoding…</div>');
        chrome.runtime.sendMessage({ type: 'BF_VIN_DECODE', vin: vin }, function (dec) {
          if (chrome.runtime.lastError || !dec || dec.ok === false) {
            showPreview({ ok: true, vin: vin, year: resp.year || '', make: resp.make || '', model: resp.model || '', trim: resp.trim || '' }, 'Plate → VIN');
            return;
          }
          showPreview(dec, 'Plate → VIN');
        });
      });
    } catch (e) { setPreview('<div class="bfc-pv-msg bfc-err">Something went wrong.</div>'); }
  }

  function showPreview(r, sourceLabel) {
    pendingDecode = r;
    var line = [r.year, r.make, r.model, r.trim].filter(Boolean).join(' ') || '(no fields returned)';
    var extra = []; if (r.engine) extra.push(r.engine); if (r.fuel) extra.push(r.fuel); if (r.drive) extra.push(r.drive); if (r.body) extra.push(r.body); if (r.transmissionDetails) extra.push(r.transmissionDetails);
    setPreview(
      '<div class="bfc-pv">' +
        '<div class="bfc-pv-h">' + esc(sourceLabel || 'Decoded') + ' — confirm</div>' +
        '<div class="bfc-pv-veh">' + esc(line) + '</div>' +
        (extra.length ? '<div class="bfc-pv-x">' + esc(extra.join(' · ')) + '</div>' : '') +
        '<div class="bfc-pv-act"><button class="bfc-pv-apply" data-r="pvApply" type="button">Apply</button>' +
        '<button class="bfc-pv-no" data-r="pvDismiss" type="button">Dismiss</button></div>' +
      '</div>');
  }

  function applyDecode() {
    var r = pendingDecode; if (!r) return;
    var body = bodyEl(); if (!body) return;
    function setv(k, v) { if (v == null || v === '') return; var el = body.querySelector('[data-k="' + k + '"]'); if (el) el.value = v; }
    setv('year', r.year); setv('make', r.make); setv('model', r.model); setv('trim', r.trim);
    if (r.transmissionType) setv('transmissionType', r.transmissionType);
    if (r.vin) setv('vin', r.vin);
    if (current) current._decode = { engine: r.engine, fuel: r.fuel, drive: r.drive, body: r.body, cylinders: r.cylinders, displacement: r.displacement, transmissionDetails: r.transmissionDetails };
    setPreview('<div class="bfc-pv-msg bfc-ok">✓ Applied to Year/Make/Model/Trim. Review and Save.</div>');
  }
  function dismissDecode() { pendingDecode = null; setPreview(''); }

  function submit() {
    var body = bodyEl(); if (!body) return;
    var d = current || {};
    var fields = {};
    [].forEach.call(body.querySelectorAll('input[data-k], select[data-k], textarea[data-k]'), function (i) {
      var v = (i.value || '').trim(); if (v) fields[i.getAttribute('data-k')] = v;
    });
    if (d.sellerProfileId) fields.sellerProfileId = d.sellerProfileId;
    var details = {
      interiorColor: d.interiorColor, fuelType: d.fuelType, owners: d.owners,
      titleStatus: d.titleStatus, paidOff: !!d.paidOff, stillOwed: !!d.stillOwed, listedDaysAgo: d.listedDaysAgo
    };
    if (d._decode) details.decode = d._decode;
    var msg = body.querySelector('[data-r="msg"]'); var btn = body.querySelector('[data-r="save"]');
    if (!msg || !btn) return;
    btn.disabled = true; msg.className = 'bfc-msg'; msg.textContent = 'Saving…';
    try {
      chrome.runtime.sendMessage({ type: 'BF_CREATE_LISTING', payload: { fields: fields, details: details, listingUrl: d.listingUrl || cleanUrl() } }, function (resp) {
        btn.disabled = false;
        if (chrome.runtime.lastError || !resp) { msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Could not reach BuyForce. Open the app to sync your login, then retry.'; return; }
        if (resp.ok === false) { msg.className = 'bfc-msg bfc-err'; msg.textContent = resp.reason || 'Could not create the lead.'; return; }
        if (resp.duplicate) { msg.className = 'bfc-msg bfc-warn'; msg.innerHTML = 'Saved — but this looks like a <b>duplicate</b> of ' + esc(resp.dupVehicle || 'an existing deal') + '.'; }
        else { msg.className = 'bfc-msg bfc-ok'; msg.innerHTML = '✓ Lead created' + (resp.vehicle ? (' — ' + esc(resp.vehicle)) : '') + '.'; }
        btn.textContent = 'Saved';
      });
    } catch (e) { btn.disabled = false; msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Something went wrong.'; }
  }

  function autosize(ta) { if (!ta) return; ta.style.height = 'auto'; ta.style.height = (ta.scrollHeight + 2) + 'px'; }
  function autosizeAll() { var body = bodyEl(); if (!body) return; [].forEach.call(body.querySelectorAll('textarea[data-k]'), autosize); }

  // ---- On-device OCR (snip/upload a VIN or plate image) ----
  var ocrTarget = 'vin';
  var ocrInput = null;
  function ensureOcrInput() {
    if (ocrInput) return ocrInput;
    ocrInput = document.createElement('input');
    ocrInput.type = 'file'; ocrInput.accept = 'image/*'; ocrInput.style.display = 'none';
    ocrInput.setAttribute('data-bf', '1');
    ocrInput.addEventListener('change', function () {
      var f = ocrInput.files && ocrInput.files[0]; ocrInput.value = '';
      if (f) readImage(f, function (durl) { runOcr(durl, ocrTarget); });
    });
    document.documentElement.appendChild(ocrInput);
    return ocrInput;
  }
  function readImage(blob, cb) { var r = new FileReader(); r.onload = function () { cb(r.result); }; r.onerror = function () { setPreview('<div class="bfc-pv-msg bfc-err">Could not read that image.</div>'); }; r.readAsDataURL(blob); }
  function scanVin() { openOcrPanel('vin'); }
  function scanPlate() { openOcrPanel('plate'); }
  function openOcrPanel(target) {
    ocrTarget = target;
    setPreview('<div class="bfc-ocr"><div class="bfc-ocr-h">Scan ' + (target === 'plate' ? 'plate' : 'VIN') + '</div>' +
      '<div class="bfc-ocr-drop" data-r="ocrdrop" contenteditable="true" data-ph="Paste a screenshot (Ctrl+V) or drag an image here"></div>' +
      '<div class="bfc-ocr-act"><button class="bfc-tool" data-r="ocrfile" type="button">Choose file\u2026</button>' +
      '<button class="bfc-pv-no" data-r="ocrcancel" type="button">Cancel</button></div></div>');
    var body = bodyEl(); var dz = body && body.querySelector('[data-r="ocrdrop"]');
    if (dz) {
      dz.addEventListener('paste', function (e) { var its = (e.clipboardData && e.clipboardData.items) || []; for (var i = 0; i < its.length; i++) { if (its[i].type && its[i].type.indexOf('image') === 0) { var b = its[i].getAsFile(); if (b) { e.preventDefault(); e.stopPropagation(); readImage(b, function (u) { runOcr(u, target); }); } return; } } });
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('bfc-ocr-over'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('bfc-ocr-over'); });
      dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('bfc-ocr-over'); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) readImage(f, function (u) { runOcr(u, target); }); });
      try { dz.focus(); } catch (e) {}
    }
  }
  function cleanVinText(s) {
    var up = (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    up = up.replace(/[IOQ]/g, function (c) { return c === 'I' ? '1' : '0'; });
    var m = up.match(/[A-HJ-NPR-Z0-9]{17}/);
    return m ? m[0] : up;
  }
  function cleanPlateText(s) {
    var toks = (s || '').toUpperCase().replace(/[^A-Z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    var best = '';
    toks.forEach(function (tk) { var v = tk.replace(/-/g, ''); if (v.length >= 4 && v.length <= 8 && v.length > best.length) best = v; });
    return best || (toks.join('')).slice(0, 8);
  }
  function runOcr(dataUrl, target) {
    setPreview('<div class="bfc-pv-msg">Reading ' + (target === 'plate' ? 'plate' : 'VIN') + ' image on your device\u2026</div>');
    try {
      chrome.runtime.sendMessage({ type: 'BF_OCR', image: dataUrl, hint: target }, function (resp) {
        if (chrome.runtime.lastError || !resp) { setPreview('<div class="bfc-pv-msg bfc-err">OCR unavailable \u2014 reload the extension and retry.</div>'); return; }
        if (resp.ok === false) { setPreview('<div class="bfc-pv-msg bfc-err">Could not read the image' + (resp.reason ? ' (' + esc(resp.reason) + ')' : '') + '.</div>'); return; }
        var body = bodyEl(); if (!body) return;
        if (target === 'plate') {
          var pl = cleanPlateText(resp.text); var el = body.querySelector('input[data-k="plateNumber"]'); if (el) el.value = pl;
          setPreview('<div class="bfc-pv-msg bfc-ok">Plate read: <b>' + esc(pl || '(nothing)') + '</b> \u2014 verify it, set the state, then Find VIN.</div>');
        } else {
          var vn = cleanVinText(resp.text); var el2 = body.querySelector('input[data-k="vin"]'); if (el2) el2.value = vn;
          var okLen = /^[A-HJ-NPR-Z0-9]{17}$/.test(vn);
          setPreview('<div class="bfc-pv-msg ' + (okLen ? 'bfc-ok' : 'bfc-warn') + '">VIN read: <b>' + esc(vn || '(nothing)') + '</b>' + (okLen ? ' \u2014 looks valid, click Decode VIN.' : ' \u2014 verify the characters (not a clean 17).') + '</div>');
        }
      });
    } catch (e) { setPreview('<div class="bfc-pv-msg bfc-err">Something went wrong.</div>'); }
  }
  function onPaste(e) {
    if (!isListing() || !window.BFSidebar || !window.BFSidebar.isOpen()) return;
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') === 0) {
        var blob = items[i].getAsFile();
        if (blob) {
          var ae = document.activeElement;
          var tgt = (ae && ae.getAttribute && ae.getAttribute('data-k') === 'plateNumber') ? 'plate' : ocrTarget;
          e.preventDefault(); e.stopPropagation();
          readImage(blob, function (durl) { runOcr(durl, tgt); });
        }
        return;
      }
    }
  }

  function wire() {
    var body = bodyEl(); if (!body || body.__bfWired) return; body.__bfWired = true;
    body.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-r]') : null;
      if (!b || !body.contains(b)) return;
      var r = b.getAttribute('data-r');
      if (r === 'save') submit();
      else if (r === 'decodeVin') decodeVin();
      else if (r === 'findVin') findVin();
      else if (r === 'pvApply') applyDecode();
      else if (r === 'pvDismiss') dismissDecode();
      else if (r === 'scanVin') scanVin();
      else if (r === 'scanPlate') scanPlate();
      else if (r === 'ocrfile') ensureOcrInput().click();
      else if (r === 'ocrcancel') setPreview('');
    });
    body.addEventListener('input', function (e) {
      if (e.target && e.target.tagName === 'TEXTAREA' && e.target.getAttribute('data-k')) autosize(e.target);
    });
  }

  function render() {
    pendingDecode = null;
    current = extract();
    window.BFSidebar.setContext('Listing');
    window.BFSidebar.setHTML(formHTML(current));
    wire();
    setTimeout(autosizeAll, 0);
  }

  function tick() {
    if (!window.BFSidebar || !isListing()) return;
    var id = itemId();
    var hasForm = window.BFSidebar.body && window.BFSidebar.body.querySelector('[data-k]');
    if (id !== lastId || !hasForm) {
      var h1 = document.querySelector('div[role="main"] h1');
      if (!h1 || !t(h1)) return;
      lastId = id;
      render();
    }
  }

  var pend = null;
  function schedule() { if (pend) return; pend = setTimeout(function () { pend = null; tick(); }, 400); }
  function boot() {
    tick();
    document.addEventListener('paste', onPaste, true);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setInterval(tick, 1200);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

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
  var distOptions = null;
  var distSel = { d: {}, g: {}, m: {}, radius: 0 };
  var listingGeo = null, listingGeoKey = '';

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

  function mainPhoto(main) {
    // Largest real image in the listing = the hero photo. Avatars/thumbnails are small, so a min-dimension filter excludes them.
    var best = '', bestArea = 0;
    [].forEach.call((main || document).querySelectorAll('img'), function (im) {
      var src = im.currentSrc || im.src || ''; if (!/^https?:/.test(src)) return;
      var w = im.naturalWidth || im.width || 0, h = im.naturalHeight || im.height || 0;
      if (Math.min(w, h) >= 180 && (w * h) > bestArea) { bestArea = w * h; best = src; }
    });
    if (best) return best;
    var og = document.querySelector('meta[property="og:image"]');
    return og ? (og.getAttribute('content') || '') : '';
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
      _decode: null, listingUrl: cleanUrl(), mainPhotoUrl: mainPhoto(main)
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
      (d.mainPhotoUrl ? '<div class="bfc-photo"><img src="' + esc(d.mainPhotoUrl) + '" alt="Listing photo" referrerpolicy="no-referrer"></div>' : '') +
      '<div class="bfc-grid">' +
        field('Year', 'year', d.year) + field('Make', 'make', d.make) +
        field('Model', 'model', d.model) + field('Trim', 'trim', d.trim) +
        field('Price', 'price', d.price) + field('Mileage', 'mileage', d.mileage) +
        field('Ext. color', 'color', d.color) + selField('Transmission', 'transmissionType', d.transmissionType, TRANS_TYPES) +
        field('Location', 'location', d.location) + field('Listed', 'listedAgo', d.listedAgo) +
        field('Seller', 'sellerName', d.sellerName) +
      '</div>' +
      '<div class="bfc-block">' +
        '<div class="bfc-row">' +
          '<label class="bfc-f bfc-grow"><span>VIN<button class="bfc-scan" data-r="scanVin" type="button" title="Scan VIN from a photo">Scan photo for VIN</button></span><input data-k="vin" value="' + esc(d.vin) + '"></label>' +
          '<button class="bfc-tool bfc-tool-inline" data-r="decodeVin" type="button">Decode VIN</button>' +
        '</div>' +
        '<div class="bfc-preview" data-r="ocr-vin"></div>' +
      '</div>' +
      '<div class="bfc-block">' +
        '<div class="bfc-row">' +
          '<label class="bfc-f bfc-grow"><span>Plate #<button class="bfc-scan" data-r="scanPlate" type="button" title="Scan plate from a photo">Scan photo for Plate #</button></span><input data-k="plateNumber" value="' + esc(d.plateNumber) + '"></label>' +
          '<label class="bfc-f bfc-state"><span>State</span><select data-k="plateState">' + US_STATES.map(function (s) { return '<option value="' + s + '"' + (s === (d.plateState || '') ? ' selected' : '') + '>' + (s || '\u2014') + '</option>'; }).join('') + '</select></label>' +
          '<button class="bfc-tool bfc-tool-inline" data-r="findVin" type="button">Plate to VIN</button>' +
        '</div>' +
        '<div class="bfc-preview" data-r="ocr-plate"></div>' +
      '</div>' +
      '<div class="bfc-preview" data-r="preview"></div>' +
      taField('Description', 'description', d.description) +
      detailsStrip(d) +
      (d.listingUrl ? '<div class="bfc-src">Source: <span>' + esc(d.listingUrl) + '</span></div>' : '') +
      '<div class="bfc-dist" data-r="dist"></div>' +
      '<div class="bfc-msg" data-r="msg"></div>' +
      '<div class="bfc-act"><button class="bfc-save" data-r="save" type="button">Save lead</button></div>';
  }

  function bodyEl() { return window.BFSidebar ? window.BFSidebar.body : null; }
  function val(key) { var body = bodyEl(); if (!body) return ''; var el = body.querySelector('[data-k="' + key + '"]'); return el ? (el.value || '').trim() : ''; }
  function setPreview(html) { var body = bodyEl(); if (!body) return; var p = body.querySelector('[data-r="preview"]'); if (p) p.innerHTML = html; }
  function ocrSlotEl(target) { var body = bodyEl(); if (!body) return null; return body.querySelector('[data-r="ocr-' + (target === 'plate' ? 'plate' : 'vin') + '"]'); }
  function setOcr(target, html) { var s = ocrSlotEl(target); if (s) s.innerHTML = html; var o = ocrSlotEl(target === 'plate' ? 'vin' : 'plate'); if (o) o.innerHTML = ''; }

  function decodeVin() {
    var vin = val('vin').toUpperCase();
    if (vin.length < 11) { setPreview('<div class="bfc-pv-msg bfc-warn">Enter a full VIN (17 chars) to decode.</div>'); return; }
    setPreview('<div class="bfc-pv-msg">Decoding…</div>');
    try {
      chrome.runtime.sendMessage({ type: 'BF_VIN_DECODE', vin: vin }, function (resp) {
        if (chrome.runtime.lastError || !resp) { setPreview('<div class="bfc-pv-msg bfc-err">Could not reach the decoder.</div>'); return; }
        if (resp.ok === false) { setPreview('<div class="bfc-pv-msg bfc-err">' + esc(resp.reason || 'Decode failed.') + '</div>'); return; }
        showPreview(resp, 'VIN decode', 'vin');
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
            showPreview({ ok: true, vin: vin, year: resp.year || '', make: resp.make || '', model: resp.model || '', trim: resp.trim || '' }, 'Plate → VIN', 'plate');
            return;
          }
          showPreview(dec, 'Plate → VIN', 'plate');
        });
      });
    } catch (e) { setPreview('<div class="bfc-pv-msg bfc-err">Something went wrong.</div>'); }
  }

  function showPreview(r, sourceLabel, srcField) {
    pendingDecode = r;
    if (pendingDecode) pendingDecode.__src = srcField || 'vin';
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
    markConfirmed((r.__src) || 'vin');
    setPreview('<div class="bfc-pv-msg bfc-ok">✓ Applied to Year/Make/Model/Trim. Review and Save.</div>');
  }
  function markConfirmed(field) {
    var body = bodyEl(); if (!body) return;
    var key = (field === 'plate') ? 'plateNumber' : 'vin';
    var input = body.querySelector('input[data-k="' + key + '"]');
    var row = input && input.closest('.bfc-row');
    if (!row || row.querySelector('.bfc-confirm')) return;
    var c = document.createElement('span'); c.className = 'bfc-confirm'; c.title = 'Vehicle confirmed'; c.textContent = '\u2713';
    row.insertBefore(c, row.firstChild);
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
    var distribution = null;
    if (distOptions && distOptions.isAllAccess) {
      var tg = resolveTargets();
      if (!tg.length) { msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Choose at least one distribution target before saving.'; return; }
      distribution = { dealershipIds: tg.map(function (t) { return t.id; }) };
    }
    btn.disabled = true; msg.className = 'bfc-msg'; msg.textContent = 'Saving…';
    try {
      chrome.runtime.sendMessage({ type: 'BF_CREATE_LISTING', payload: { fields: fields, details: details, listingUrl: d.listingUrl || cleanUrl(), mainPhotoUrl: d.mainPhotoUrl || '', distribution: distribution } }, function (resp) {
        btn.disabled = false;
        if (chrome.runtime.lastError || !resp) { msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Could not reach BuyForce. Open the app to sync your login, then retry.'; return; }
        if (resp.ok === false) { msg.className = 'bfc-msg bfc-err'; msg.textContent = resp.reason || 'Could not create the lead.'; return; }
        if (resp.duplicate) { msg.className = 'bfc-msg bfc-warn'; msg.innerHTML = 'Saved — but this looks like a <b>duplicate</b> of ' + esc(resp.dupVehicle || 'an existing deal') + '.'; }
        else { msg.className = 'bfc-msg bfc-ok'; var nC = resp.created || 1; msg.innerHTML = '✓ ' + (nC > 1 ? (nC + ' leads created') : 'Lead created') + (resp.vehicle ? (' — ' + esc(resp.vehicle)) : '') + '.'; }
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
    setPreview('');
    setOcr(target, '<div class="bfc-ocr"><div class="bfc-ocr-h">Scan ' + (target === 'plate' ? 'plate' : 'VIN') + '</div>' +
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
    var raw = (s || '').toUpperCase();
    // OCR confusables are illegal in a real VIN (no I/O/Q), so mapping them is safe.
    function fix(t) { return t.replace(/[^A-Z0-9]/g, '').replace(/[IOQ]/g, function (c) { return c === 'I' ? '1' : '0'; }); }
    function find17(t) { var m = fix(t).match(/[A-HJ-NPR-Z0-9]{17}/); return m ? m[0] : ''; }
    // 1) Label-aware: prefer the string right after a "VIN" label (window stickers/door jambs).
    var lab = raw.match(/VIN\s*[:#.\-]?\s*([A-Z0-9][A-Z0-9 \-]{15,40})/);
    if (lab) { var v = find17(lab[1]); if (v) return v; }
    // 2) Otherwise scan each token (a real VIN prints as one 17-char block).
    var toks = raw.split(/[^A-Z0-9]+/).filter(Boolean).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < toks.length; i++) { var v2 = find17(toks[i]); if (v2) return v2; }
    // 3) Last resort: collapse everything and grab the first 17 valid chars.
    var v3 = find17(raw); return v3 || fix(raw);
  }
  function cleanPlateText(s) {
    var toks = (s || '').toUpperCase().replace(/[^A-Z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    var best = '';
    toks.forEach(function (tk) { var v = tk.replace(/-/g, ''); if (v.length >= 4 && v.length <= 8 && v.length > best.length) best = v; });
    return best || (toks.join('')).slice(0, 8);
  }
  function runOcr(dataUrl, target) {
    setOcr(target, '<div class="bfc-pv-msg">Reading ' + (target === 'plate' ? 'plate' : 'VIN') + ' image on your device\u2026</div>');
    try {
      chrome.runtime.sendMessage({ type: 'BF_OCR', image: dataUrl, hint: target }, function (resp) {
        if (chrome.runtime.lastError || !resp) { setOcr(target, '<div class="bfc-pv-msg bfc-err">OCR unavailable \u2014 reload the extension and retry.</div>'); return; }
        if (resp.ok === false) { setOcr(target, '<div class="bfc-pv-msg bfc-err">Could not read the image' + (resp.reason ? ' (' + esc(resp.reason) + ')' : '') + '.</div>'); return; }
        var body = bodyEl(); if (!body) return;
        if (target === 'plate') {
          var pl = cleanPlateText(resp.text); var el = body.querySelector('input[data-k="plateNumber"]'); if (el) el.value = pl;
          setOcr('plate', '<div class="bfc-pv-msg bfc-ok">Plate read: <b>' + esc(pl || '(nothing)') + '</b> \u2014 verify it, set the state, then Plate to VIN.</div>');
        } else {
          var vn = cleanVinText(resp.text); var el2 = body.querySelector('input[data-k="vin"]'); if (el2) el2.value = vn;
          var okLen = /^[A-HJ-NPR-Z0-9]{17}$/.test(vn);
          setOcr('vin', '<div class="bfc-pv-msg ' + (okLen ? 'bfc-ok' : 'bfc-warn') + '">VIN read: <b>' + esc(vn || '(nothing)') + '</b>' + (okLen ? ' \u2014 looks valid, click Decode VIN.' : ' \u2014 verify the characters (not a clean 17).') + '</div>');
        }
      });
    } catch (e) { setOcr(target, '<div class="bfc-pv-msg bfc-err">Something went wrong.</div>'); }
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
      else if (r === 'ocrcancel') setOcr(ocrTarget, '');
    });
    body.addEventListener('change', function (e) {
      var el = e.target; if (el && el.getAttribute && el.getAttribute('data-dist')) onDistChange(el);
    });
    body.addEventListener('input', function (e) {
      if (e.target && e.target.tagName === 'TEXTAREA' && e.target.getAttribute('data-k')) autosize(e.target);
      else if (e.target && e.target.getAttribute && e.target.getAttribute('data-dist') === 'radius') onDistChange(e.target);
    });
  }

  function distBox() { var b = bodyEl(); return b ? b.querySelector('[data-r="dist"]') : null; }
  function loadDist() {
    if (distOptions) { renderDist(); return; }
    try {
      chrome.runtime.sendMessage({ type: 'BF_GET_DIST_OPTIONS' }, function (resp) {
        if (chrome.runtime.lastError || !resp || resp.ok === false) return;
        distOptions = resp; renderDist();
      });
    } catch (e) {}
  }
  function renderDist() {
    var c = distBox(); if (!c || !distOptions || !distOptions.isAllAccess) return;
    function cb(kind, arr) {
      if (!arr || !arr.length) return '<div class="bfc-dist-empty">None available</div>';
      return arr.map(function (o) { return '<label class="bfc-dist-cb"><input type="checkbox" data-dist="' + kind + '" value="' + esc(String(o.id)) + '"><span>' + esc(o.name) + '</span></label>'; }).join('');
    }
    var loc = (current && current.location) || 'listing';
    c.innerHTML =
      '<div class="bfc-dist-h">Distribute lead to</div>' +
      '<div class="bfc-dist-sec"><div class="bfc-dist-lbl">Dealerships</div><div class="bfc-dist-list">' + cb('d', distOptions.dealerships) + '</div></div>' +
      '<div class="bfc-dist-sec"><div class="bfc-dist-lbl">Dealer groups</div><div class="bfc-dist-list">' + cb('g', distOptions.groups) + '</div></div>' +
      '<div class="bfc-dist-sec"><div class="bfc-dist-lbl">Markets</div><div class="bfc-dist-list">' + cb('m', distOptions.markets) + '</div></div>' +
      '<div class="bfc-dist-sec"><div class="bfc-dist-lbl">Within radius</div><div class="bfc-dist-rrow"><input type="number" min="0" step="5" data-dist="radius" placeholder="0"><span>mi of ' + esc(loc) + '</span></div></div>' +
      '<div class="bfc-dist-preview" data-r="distPreview"></div>';
    refreshPreview();
  }
  function haversineMi(lat1, lng1, lat2, lng2) {
    var R = 3958.8, toR = Math.PI / 180;
    var dLat = (lat2 - lat1) * toR, dLng = (lng2 - lng1) * toR;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function resolveTargets() {
    if (!distOptions || !distOptions.dealerships) return [];
    var pick = {};
    distOptions.dealerships.forEach(function (o) {
      var hit = false;
      if (distSel.d[o.id]) hit = true;
      if (!hit && o.groupId != null && distSel.g[o.groupId]) hit = true;
      if (!hit && (o.marketIds || []).some(function (mid) { return distSel.m[mid]; })) hit = true;
      if (!hit && distSel.radius > 0 && listingGeo && o.lat != null && o.lng != null) {
        if (haversineMi(listingGeo.lat, listingGeo.lng, o.lat, o.lng) <= distSel.radius) hit = true;
      }
      if (hit) pick[o.id] = { id: o.id, name: o.name };
    });
    return Object.keys(pick).map(function (k) { return pick[k]; });
  }
  function refreshPreview() {
    var c = distBox(); if (!c) return;
    var pv = c.querySelector('[data-r="distPreview"]'); if (!pv) return;
    var targets = resolveTargets();
    var b = bodyEl(); var saveBtn = b && b.querySelector('[data-r="save"]');
    if (distSel.radius > 0 && !listingGeo) {
      pv.innerHTML = '<div class="bfc-dist-msg">Locating ' + esc((current && current.location) || 'listing') + '…</div>';
    } else if (!targets.length) {
      pv.innerHTML = '<div class="bfc-dist-msg bfc-warn">No targets selected — pick at least one.</div>';
    } else {
      pv.innerHTML = '<div class="bfc-dist-msg bfc-ok">Goes to ' + targets.length + ' dealership' + (targets.length > 1 ? 's' : '') + ':</div><div class="bfc-dist-names">' + targets.map(function (t) { return esc(t.name); }).join(', ') + '</div>';
    }
    if (saveBtn && distOptions && distOptions.isAllAccess) saveBtn.disabled = !targets.length;
  }
  function onDistChange(el) {
    var kind = el.getAttribute('data-dist');
    if (kind === 'radius') {
      var v = parseFloat(el.value) || 0; if (v < 0) v = 0; distSel.radius = v;
      if (v > 0 && current && current.location && (listingGeoKey !== current.location || !listingGeo)) {
        listingGeoKey = current.location; listingGeo = null;
        try { chrome.runtime.sendMessage({ type: 'BF_GEOCODE', q: current.location }, function (resp) { if (resp && resp.ok && typeof resp.lat === 'number') listingGeo = { lat: resp.lat, lng: resp.lng }; refreshPreview(); }); } catch (e) { refreshPreview(); }
      }
      refreshPreview(); return;
    }
    var bucket = kind === 'd' ? distSel.d : kind === 'g' ? distSel.g : distSel.m;
    if (el.checked) bucket[el.value] = 1; else delete bucket[el.value];
    refreshPreview();
  }
  function render() {
    pendingDecode = null;
    distSel = { d: {}, g: {}, m: {}, radius: 0 };
    listingGeo = null; listingGeoKey = '';
    current = extract();
    window.BFSidebar.setContext('Listing');
    window.BFSidebar.setHTML(formHTML(current));
    wire();
    loadDist();
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

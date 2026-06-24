/* BuyForce Listing Capture - Facebook Marketplace listing content script.
 * On a /marketplace/item/ page, injects an "Add to BuyForce" button. On click it
 * extracts the vehicle fields, shows an EDITABLE confirm card, and creates a Fresh
 * Lead via the listing-create proxy. Assist-only: it never acts on Facebook - it
 * only writes to your BuyForce pipeline, and only when you click Save.
 */
(function () {
  var CFG = globalThis.BF_CONFIG || {};
  function isListing() { return /\/marketplace\/item\/\d+/.test(location.pathname); }
  function t(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function tc(s) { if (!s) return ''; if (/^[A-Z0-9]{2,4}$/.test(s)) return s; return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  function extract() {
    var main = document.querySelector('div[role="main"]') || document.body;
    var h1 = main.querySelector('h1');
    var title = t(h1);
    // Scope to the listing-detail container: nearest ancestor of the title that also
    // holds "About this vehicle" + seller sections. Avoids grabbing prices/locations
    // from the "Today's picks" grid below the listing.
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
    var locM = x.match(/Listed[\s\S]{0,40}?\bin\s+([A-Z][A-Za-z.'’\- ]+,\s*[A-Z]{2})\b/) ||
               x.match(/\b([A-Z][A-Za-z.'’\- ]+,\s*[A-Z]{2})\b/);
    var loc = locM ? locM[1].trim() : '';
    var vinM = x.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    var vin = vinM ? vinM[1] : '';

    // Rich "About this vehicle" fields
    var extC = (x.match(/Exterior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\s*Interior|\n|$)/i) || [, ''])[1].trim();
    var intC = (x.match(/Interior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\n|$)/i) || [, ''])[1].trim();
    var trans = (x.match(/\b(Manual|Automatic|CVT)\b\s*transmission/i) || [, ''])[1];
    var fuel = (x.match(/Fuel type:\s*([A-Za-z]+)/i) || [, ''])[1];
    var owners = (x.match(/(\d+)\s+owners?\b/i) || [, ''])[1];
    var titleSt = (x.match(/\b(Clean title|Salvage title|Rebuilt title)\b/i) || [, ''])[1];
    var owed = /Money is still owed on this vehicle/i.test(x);

    // Seller name from the "Seller information" block
    var seller = '';
    var hdrs = [].slice.call(main.querySelectorAll('span, h2, h3'));
    for (var i = 0; i < hdrs.length; i++) {
      if (/^seller information$/i.test(t(hdrs[i]))) {
        var blk = hdrs[i].closest('div'), a = null, hops = 0;
        while (blk && hops++ < 4 && !a) { a = blk.querySelector('a[href*="/marketplace/profile/"]'); blk = blk.parentElement; }
        if (a) seller = t(a);
        break;
      }
    }
    if (!seller) { var sm = x.match(/Seller information\s*(?:Seller details)?\s*([A-Z][a-z’'\-]+(?:\s+[A-Z][a-z’'\-]+){1,2})/); if (sm) seller = sm[1]; }

    var desc = (x.match(/Seller.?s description\s*([\s\S]*?)(?:\s*See (?:less|more)|Location is approximate|Seller information|$)/i) || [, ''])[1].trim();
    if (desc.length > 600) desc = desc.slice(0, 600);

    // Title parse: YEAR MAKE MODEL TRIM...
    var yr = '', mk = '', md = '', tr = '';
    var tm = title.match(/\b(19|20)\d\d\b/);
    if (tm) {
      yr = tm[0];
      var rest = title.slice(title.indexOf(yr) + 4).trim().split(/\s+/).filter(Boolean);
      mk = tc(rest.shift() || ''); md = tc(rest.shift() || ''); tr = rest.join(' ');
    }
    return {
      title: title, year: yr, make: mk, model: md, trim: tr,
      price: price, mileage: mileage, location: loc, vin: vin, sellerName: seller,
      color: extC, interiorColor: intC, transmission: trans, fuelType: fuel,
      owners: owners, titleStatus: titleSt, owed: owed, description: desc,
      listingUrl: location.href
    };
  }

  function field(label, key, val) {
    return '<label class="bfc-f"><span>' + esc(label) + '</span><input data-k="' + key + '" value="' + esc(val) + '"></label>';
  }
  function detailsStrip(d) {
    var bits = [];
    if (d.transmission) bits.push(esc(d.transmission));
    if (d.interiorColor) bits.push('Int: ' + esc(d.interiorColor));
    if (d.fuelType) bits.push(esc(d.fuelType));
    if (d.owners) bits.push(esc(d.owners) + '-owner');
    if (d.titleStatus) bits.push(esc(d.titleStatus));
    var owed = d.owed ? '<span class="bfc-flag">⚠ Loan still owed — payoff likely</span>' : '';
    if (!bits.length && !owed) return '';
    return '<div class="bfc-meta">' + bits.join(' · ') + (bits.length && owed ? '<br>' : '') + owed + '</div>';
  }

  function openCard(d) {
    closeCard();
    var card = document.createElement('div');
    card.className = 'bfc-card'; card.id = 'bfc-card'; card.setAttribute('data-bf', '1');
    card.innerHTML =
      '<div class="bfc-head"><b>Add to BuyForce</b><span class="bfc-x" title="Close">×</span></div>' +
      '<div class="bfc-grid">' +
        field('Year', 'year', d.year) + field('Make', 'make', d.make) +
        field('Model', 'model', d.model) + field('Trim', 'trim', d.trim) +
        field('Price', 'price', d.price) + field('Mileage', 'mileage', d.mileage) +
        field('Ext. color', 'color', d.color) + field('Location', 'location', d.location) +
        field('VIN', 'vin', d.vin) + field('Seller', 'sellerName', d.sellerName) +
      '</div>' +
      detailsStrip(d) +
      '<div class="bfc-msg" data-r="msg"></div>' +
      '<div class="bfc-act"><button class="bfc-save" data-r="save">Save lead</button></div>';
    document.body.appendChild(card);
    card.querySelector('.bfc-x').addEventListener('click', closeCard);
    card.querySelector('[data-r="save"]').addEventListener('click', function () { submit(card, d); });
  }
  function closeCard() { var c = document.getElementById('bfc-card'); if (c) c.remove(); }

  function submit(card, d) {
    var fields = {};
    [].forEach.call(card.querySelectorAll('input[data-k]'), function (i) { var v = i.value.trim(); if (v) fields[i.getAttribute('data-k')] = v; });
    var details = { interiorColor: d.interiorColor, transmission: d.transmission, fuelType: d.fuelType, owners: d.owners, titleStatus: d.titleStatus, loanOwed: !!d.owed, description: d.description };
    var msg = card.querySelector('[data-r="msg"]'); var btn = card.querySelector('[data-r="save"]');
    btn.disabled = true; msg.className = 'bfc-msg'; msg.textContent = 'Saving…';
    try {
      chrome.runtime.sendMessage({ type: 'BF_CREATE_LISTING', payload: { fields: fields, details: details, listingUrl: d.listingUrl } }, function (resp) {
        btn.disabled = false;
        if (chrome.runtime.lastError || !resp) { msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Could not reach BuyForce. Open the app to sync your login, then retry.'; return; }
        if (resp.ok === false) { msg.className = 'bfc-msg bfc-err'; msg.textContent = resp.reason || 'Could not create the lead.'; return; }
        if (resp.duplicate) { msg.className = 'bfc-msg bfc-warn'; msg.innerHTML = 'Saved — but this looks like a <b>duplicate</b> of ' + esc(resp.dupVehicle || 'an existing deal') + '.'; }
        else { msg.className = 'bfc-msg bfc-ok'; msg.innerHTML = '✓ Lead created' + (resp.vehicle ? (' — ' + esc(resp.vehicle)) : '') + '.'; }
        btn.textContent = 'Saved';
      });
    } catch (e) { btn.disabled = false; msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Something went wrong.'; }
  }

  function mountButton() {
    if (!isListing()) { var b = document.getElementById('bfc-fab'); if (b) b.remove(); return; }
    if (document.getElementById('bfc-fab')) return;
    var fab = document.createElement('button');
    fab.id = 'bfc-fab'; fab.className = 'bfc-fab'; fab.type = 'button'; fab.setAttribute('data-bf', '1');
    fab.innerHTML = '<span class="bfc-logo">B</span> Add to BuyForce';
    fab.addEventListener('click', function () { openCard(extract()); });
    document.body.appendChild(fab);
  }

  var pend = null;
  function schedule() { if (pend) return; pend = setTimeout(function () { pend = null; mountButton(); }, 400); }
  function boot() { mountButton(); new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

/* BuyForce Listing Capture - Facebook Marketplace listing content script.
 * On a /marketplace/item/ page, renders an EDITABLE capture form into the
 * BuyForce sidebar. On Save it creates a Fresh Lead via the listing-create
 * proxy. Assist-only: it never acts on Facebook - it only writes to your
 * BuyForce pipeline, and only when you click Save.
 */
(function () {
  var current = null;     // last extracted listing object
  var lastId = null;      // last item id we rendered

  function isListing() { return /\/marketplace\/item\/\d+/.test(location.pathname); }
  function itemId() { var m = location.pathname.match(/\/marketplace\/item\/(\d+)/); return m ? m[1] : ''; }
  function t(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tc(s) { if (!s) return ''; if (/^[A-Z0-9]{2,4}$/.test(s)) return s; return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

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
    var locM = x.match(/Listed[\s\S]{0,40}?\bin\s+([A-Z][A-Za-z.'’\- ]+,\s*[A-Z]{2})\b/) ||
               x.match(/\b([A-Z][A-Za-z.'’\- ]+,\s*[A-Z]{2})\b/);
    var loc = locM ? locM[1].trim() : '';
    var vinM = x.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    var vin = vinM ? vinM[1] : '';

    var extC = (x.match(/Exterior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\s*Interior|\n|$)/i) || [, ''])[1].trim();
    var intC = (x.match(/Interior color:\s*([A-Za-z][A-Za-z ]*?)(?:\s*·|\n|$)/i) || [, ''])[1].trim();
    var trans = (x.match(/\b(Manual|Automatic|CVT)\b\s*transmission/i) || [, ''])[1];
    var fuel = (x.match(/Fuel type:\s*([A-Za-z]+)/i) || [, ''])[1];
    var owners = (x.match(/(\d+)\s+owners?\b/i) || [, ''])[1];
    var titleSt = (x.match(/\b(Clean title|Salvage title|Rebuilt title)\b/i) || [, ''])[1];
    var owed = /Money is still owed on this vehicle/i.test(x);

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

  function formHTML(d) {
    var head = d.title ? '<div class="bf-sb-veh">' + esc(d.title) + '</div>' : '<div class="bf-sb-veh">New listing</div>';
    return head +
      '<div class="bf-sb-sub">Review &amp; save as a Fresh Lead</div>' +
      '<div class="bfc-grid">' +
        field('Year', 'year', d.year) + field('Make', 'make', d.make) +
        field('Model', 'model', d.model) + field('Trim', 'trim', d.trim) +
        field('Price', 'price', d.price) + field('Mileage', 'mileage', d.mileage) +
        field('Ext. color', 'color', d.color) + field('Location', 'location', d.location) +
        field('VIN', 'vin', d.vin) + field('Seller', 'sellerName', d.sellerName) +
      '</div>' +
      detailsStrip(d) +
      '<div class="bfc-msg" data-r="msg"></div>' +
      '<div class="bfc-act"><button class="bfc-save" data-r="save" type="button">Save lead</button></div>';
  }

  function submit() {
    var body = window.BFSidebar.body; if (!body) return;
    var d = current || {};
    var fields = {};
    [].forEach.call(body.querySelectorAll('input[data-k]'), function (i) { var v = i.value.trim(); if (v) fields[i.getAttribute('data-k')] = v; });
    var details = { interiorColor: d.interiorColor, transmission: d.transmission, fuelType: d.fuelType, owners: d.owners, titleStatus: d.titleStatus, loanOwed: !!d.owed, description: d.description };
    var msg = body.querySelector('[data-r="msg"]'); var btn = body.querySelector('[data-r="save"]');
    if (!msg || !btn) return;
    btn.disabled = true; msg.className = 'bfc-msg'; msg.textContent = 'Saving…';
    try {
      chrome.runtime.sendMessage({ type: 'BF_CREATE_LISTING', payload: { fields: fields, details: details, listingUrl: d.listingUrl || location.href } }, function (resp) {
        btn.disabled = false;
        if (chrome.runtime.lastError || !resp) { msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Could not reach BuyForce. Open the app to sync your login, then retry.'; return; }
        if (resp.ok === false) { msg.className = 'bfc-msg bfc-err'; msg.textContent = resp.reason || 'Could not create the lead.'; return; }
        if (resp.duplicate) { msg.className = 'bfc-msg bfc-warn'; msg.innerHTML = 'Saved — but this looks like a <b>duplicate</b> of ' + esc(resp.dupVehicle || 'an existing deal') + '.'; }
        else { msg.className = 'bfc-msg bfc-ok'; msg.innerHTML = '✓ Lead created' + (resp.vehicle ? (' — ' + esc(resp.vehicle)) : '') + '.'; }
        btn.textContent = 'Saved';
      });
    } catch (e) { btn.disabled = false; msg.className = 'bfc-msg bfc-err'; msg.textContent = 'Something went wrong.'; }
  }

  function render() {
    current = extract();
    window.BFSidebar.setContext('Listing');
    window.BFSidebar.setHTML(formHTML(current));
    var save = window.BFSidebar.body.querySelector('[data-r="save"]');
    if (save) save.addEventListener('click', submit);
  }

  function tick() {
    if (!window.BFSidebar || !isListing()) return;
    var id = itemId();
    var hasForm = window.BFSidebar.body && window.BFSidebar.body.querySelector('input[data-k]');
    // (Re)render when the listing changes, or our form isn't mounted, but only
    // once the page has a real title to avoid capturing an empty shell.
    if (id !== lastId || !hasForm) {
      var h1 = (document.querySelector('div[role="main"] h1'));
      if (!h1 || !t(h1)) return; // wait for the detail panel to populate
      lastId = id;
      render();
    }
  }

  var pend = null;
  function schedule() { if (pend) return; pend = setTimeout(function () { pend = null; tick(); }, 400); }
  function boot() {
    tick();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setInterval(tick, 1200);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();

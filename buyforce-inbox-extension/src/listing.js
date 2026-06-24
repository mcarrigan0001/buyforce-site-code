/* BuyForce Listing Capture — Facebook Marketplace listing content script.
 * On a /marketplace/item/ page, injects an "Add to BuyForce" button. On click it
 * extracts the vehicle fields, shows an EDITABLE confirm card, and creates a Fresh
 * Lead via the listing-create proxy. Assist-only: it never acts on Facebook — it
 * only writes to your BuyForce pipeline, and only when you click Save.
 */
(function () {
  var CFG = globalThis.BF_CONFIG || {};
  function isListing() { return /\/marketplace\/item\/\d+/.test(location.pathname); }
  function t(el) { return el ? (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }
  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function extract() {
    var main = document.querySelector('div[role="main"]') || document.body;
    var mt = (main.innerText || '');
    var h1 = main.querySelector('h1');
    var title = t(h1);
    var price = (mt.match(/\$[\d,]{2,}/) || [''])[0];
    var milesM = mt.match(/Driven\s+([\d,]{2,})\s*miles/i) || mt.match(/([\d,]{3,})\s*miles/i);
    var mileage = milesM ? milesM[1] : '';
    var locM = mt.match(/\b([A-Z][A-Za-z .'-]+,\s*[A-Z]{2})\b/);
    var loc = locM ? locM[1] : '';
    var vinM = mt.match(/\b([A-HJ-NPR-Z0-9]{17})\b/);
    var vin = vinM ? vinM[1] : '';
    // best-effort seller name (the "Seller information" block usually shows a profile name link)
    var seller = '';
    var hdrs = [].slice.call(main.querySelectorAll('span, h2'));
    for (var i = 0; i < hdrs.length; i++) {
      if (/seller information/i.test(t(hdrs[i]))) {
        var blk = hdrs[i].closest('div'); var a = blk && blk.parentElement ? blk.parentElement.querySelector('a[href*="/marketplace/profile/"], a[role="link"]') : null;
        if (a) seller = t(a);
        break;
      }
    }
    var yr = '', mk = '', md = '', tr = '';
    var tm = title.match(/\b(19|20)\d\d\b/);
    if (tm) { yr = tm[0]; var rest = title.slice(title.indexOf(yr) + 4).trim().split(' ').filter(Boolean); mk = rest.shift() || ''; md = rest.shift() || ''; tr = rest.join(' '); }
    return { title: title, year: yr, make: mk, model: md, trim: tr, price: price, mileage: mileage, location: loc, vin: vin, sellerName: seller, listingUrl: location.href };
  }

  function field(label, key, val) {
    return '<label class="bfc-f"><span>' + esc(label) + '</span><input data-k="' + key + '" value="' + esc(val) + '"></label>';
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
        field('Location', 'location', d.location) + field('VIN', 'vin', d.vin) +
        field('Seller', 'sellerName', d.sellerName) +
      '</div>' +
      '<div class="bfc-msg" data-r="msg"></div>' +
      '<div class="bfc-act"><button class="bfc-save" data-r="save">Save lead</button></div>';
    document.body.appendChild(card);
    card.querySelector('.bfc-x').addEventListener('click', closeCard);
    card.querySelector('[data-r="save"]').addEventListener('click', function () { submit(card, d.listingUrl); });
  }
  function closeCard() { var c = document.getElementById('bfc-card'); if (c) c.remove(); }

  function submit(card, url) {
    var fields = {};
    [].forEach.call(card.querySelectorAll('input[data-k]'), function (i) { var v = i.value.trim(); if (v) fields[i.getAttribute('data-k')] = v; });
    var msg = card.querySelector('[data-r="msg"]'); var btn = card.querySelector('[data-r="save"]');
    btn.disabled = true; msg.className = 'bfc-msg'; msg.textContent = 'Saving…';
    try {
      chrome.runtime.sendMessage({ type: 'BF_CREATE_LISTING', payload: { fields: fields, listingUrl: url } }, function (resp) {
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

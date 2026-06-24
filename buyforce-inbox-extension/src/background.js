/* BuyForce Inbox Overlay - background service worker (MV3).
 * Holds the agent's token (synced from the Noloco app via token-bridge.js),
 * proxies pipeline/lead/decode requests, and serves them to content scripts.
 * The Noloco API key never touches the extension. VIN decode goes direct to
 * NHTSA's free public database (no n8n execution).
 */
const N8N_ENDPOINT = 'https://buyforce.app.n8n.cloud/webhook/bf-inbox-index';
const REFRESH_MS = 60 * 1000;       // short dedupe window only; content script fetches once per inbox visit

async function bfGetToken() {
  const { bfToken } = await chrome.storage.local.get('bfToken');
  return bfToken || '';
}

async function bfFetchIndex() {
  const token = await bfGetToken();
  if (!token) return { ok: false, reason: 'no_token', items: [] };
  try {
    const res = await fetch(N8N_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bf-token': token },
      body: JSON.stringify({})
    });
    if (!res.ok) return { ok: false, reason: 'http_' + res.status, items: [] };
    const data = await res.json();
    return (data && Array.isArray(data.items)) ? data : { ok: false, reason: 'bad_shape', items: [] };
  } catch (e) {
    return { ok: false, reason: 'network', items: [] };
  }
}

async function bfRefresh() {
  const data = await bfFetchIndex();
  await chrome.storage.local.set({ bfIndex: data, bfIndexAt: Date.now() });
  return data;
}

function tcase(s) { s = (s == null ? '' : String(s)); if (/^[A-Z0-9]{2,4}$/.test(s)) return s; return s.replace(/\w\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }); }
function transType(s) { s = (s || '') + ''; var l = s.toLowerCase(); if (/cvt|continuously variable/.test(l)) return 'CVT'; if (/dual.?clutch|dct/.test(l)) return 'DCT'; if (/automated manual|amt/.test(l)) return 'Other'; if (/automatic/.test(l)) return 'Automatic'; if (/manual/.test(l)) return 'Manual'; return s ? 'Other' : ''; }

// Free NHTSA vPIC VIN decode. Returns proposed YMMT + a few specs. No n8n cost.
async function bfDecodeVin(vinRaw) {
  const vin = String(vinRaw || '').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (vin.length < 11) return { ok: false, reason: 'Enter a full VIN to decode.' };
  try {
    const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/' + encodeURIComponent(vin) + '?format=json');
    if (!res.ok) return { ok: false, reason: 'NHTSA http ' + res.status };
    const data = await res.json();
    const r = (data && data.Results && data.Results[0]) || {};
    const trim = r.Trim || r.Series || r.Series2 || '';
    const disp = r.DisplacementL ? (Math.round(parseFloat(r.DisplacementL) * 10) / 10 + 'L') : '';
    const cyl = r.EngineCylinders ? (r.EngineCylinders + 'cyl') : '';
    const engine = [disp, cyl].filter(Boolean).join(' ');
    const year = r.ModelYear || '';
    if (!year && !r.Make) return { ok: false, reason: (r.ErrorText && /[1-9]/.test(r.ErrorCode || '') ? 'No match for that VIN.' : 'No match for that VIN.') };
    return {
      ok: true, vin: vin,
      year: year, make: tcase(r.Make || ''), model: r.Model || '', trim: trim,
      engine: engine, fuel: r.FuelTypePrimary || '', drive: r.DriveType || '', body: r.BodyClass || '',
      cylinders: r.EngineCylinders || '', displacement: r.DisplacementL || '',
      transmissionType: transType(r.TransmissionStyle || ''),
      transmissionDetails: [(r.TransmissionSpeeds ? String(r.TransmissionSpeeds).replace(/[^0-9]/g, '') + '-speed' : ''), (r.TransmissionStyle || '')].filter(Boolean).join(' ')
    };
  } catch (e) { return { ok: false, reason: 'Could not reach NHTSA.' }; }
}


let bfOffscreenReady = null;
async function bfEnsureOffscreen() {
  try {
    if (chrome.offscreen.hasDocument && (await chrome.offscreen.hasDocument())) return;
  } catch (e) {}
  if (!bfOffscreenReady) {
    bfOffscreenReady = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Run on-device OCR (Tesseract) for VIN/plate images. The image never leaves the device.'
    }).catch(function () {}).finally(function () { bfOffscreenReady = null; });
  }
  await bfOffscreenReady;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'BF_GET_INDEX') {
    (async () => {
      const { bfIndex, bfIndexAt } = await chrome.storage.local.get(['bfIndex', 'bfIndexAt']);
      if (bfIndex && bfIndexAt && (Date.now() - bfIndexAt) < REFRESH_MS) sendResponse(bfIndex);
      else sendResponse(await bfRefresh());
    })();
    return true;
  }
  if (msg && msg.type === 'BF_LINK_THREAD' && msg.uuid && msg.threadId) {
    (async () => {
      const token = await bfGetToken();
      if (!token) { sendResponse({ ok: false, reason: 'no_token' }); return; }
      try {
        await fetch('https://buyforce.app.n8n.cloud/webhook/bf-inbox-link', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bf-token': token }, body: JSON.stringify({ uuid: String(msg.uuid), threadId: String(msg.threadId) }) });
        sendResponse({ ok: true });
      } catch (e) { sendResponse({ ok: false, reason: 'network' }); }
    })();
    return true;
  }
  if (msg && msg.type === 'BF_CREATE_LISTING' && msg.payload) {
    (async () => {
      const token = await bfGetToken();
      if (!token) { sendResponse({ ok: false, reason: 'no_token' }); return; }
      try {
        const res = await fetch('https://buyforce.app.n8n.cloud/webhook/listing-create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bf-token': token }, body: JSON.stringify(msg.payload) });
        const data = await res.json().catch(function () { return { ok: false, reason: 'bad_response' }; });
        sendResponse(data);
      } catch (e) { sendResponse({ ok: false, reason: 'network' }); }
    })();
    return true;
  }
  if (msg && msg.type === 'BF_VIN_DECODE' && msg.vin) {
    (async () => { sendResponse(await bfDecodeVin(msg.vin)); })();
    return true;
  }
  if (msg && msg.type === 'BF_PLATE_TO_VIN' && msg.plate && msg.state) {
    (async () => {
      const token = await bfGetToken();
      if (!token) { sendResponse({ ok: false, reason: 'no_token' }); return; }
      try {
        const res = await fetch('https://buyforce.app.n8n.cloud/webhook/plate-vin-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bf-token': token }, body: JSON.stringify({ plate: String(msg.plate), state: String(msg.state) }) });
        const data = await res.json().catch(function () { return { ok: false, reason: 'bad_response' }; });
        sendResponse(data);
      } catch (e) { sendResponse({ ok: false, reason: 'network' }); }
    })();
    return true;
  }
  if (msg && msg.type === 'BF_OCR' && msg.image) {
    (async () => {
      // Server-side OCR first (Azure for VIN, Plate Recognizer for plate); fall back to on-device Tesseract.
      var serverPath = msg.hint === 'vin' ? 'vin-ocr' : (msg.hint === 'plate' ? 'plate-ocr' : '');
      if (serverPath) {
        try {
          const token = await bfGetToken();
          if (token) {
            const res = await fetch('https://buyforce.app.n8n.cloud/webhook/' + serverPath, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-bf-token': token }, body: JSON.stringify({ image: msg.image }) });
            if (res.ok) {
              const data = await res.json().catch(function () { return null; });
              if (data && data.ok !== false && data.text) { sendResponse({ ok: true, text: data.text }); return; }
            }
          }
        } catch (e) {}
      }
      // Fallback (and plates): on-device Tesseract via offscreen.
      try {
        await bfEnsureOffscreen();
        chrome.runtime.sendMessage({ type: 'BF_OCR_RUN', image: msg.image, hint: msg.hint || '' }, function (resp) {
          if (chrome.runtime.lastError || !resp) { sendResponse({ ok: false, reason: 'ocr_unavailable' }); return; }
          sendResponse(resp);
        });
      } catch (e) { sendResponse({ ok: false, reason: 'ocr_init' }); }
    })();
    return true;
  }
  if (msg && msg.type === 'BF_REFRESH') {
    (async () => { sendResponse(await bfRefresh()); })();
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.bfToken && changes.bfToken.newValue) bfRefresh();
});

/* BuyForce Inbox Overlay — background service worker (MV3).
 * Holds the agent's token (synced from the Noloco app via token-bridge.js),
 * fetches the pipeline index from the n8n proxy, caches it, and serves it to the
 * Facebook content script. The Noloco API key never touches the extension.
 */
const N8N_ENDPOINT = 'https://buyforce.app.n8n.cloud/webhook/bf-inbox-index';
const REFRESH_MS = 5 * 60 * 1000;

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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'BF_GET_INDEX') {
    (async () => {
      const { bfIndex, bfIndexAt } = await chrome.storage.local.get(['bfIndex', 'bfIndexAt']);
      if (bfIndex && bfIndexAt && (Date.now() - bfIndexAt) < REFRESH_MS) sendResponse(bfIndex);
      else sendResponse(await bfRefresh());
    })();
    return true; // async response
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
  if (msg && msg.type === 'BF_REFRESH') {
    (async () => { sendResponse(await bfRefresh()); })();
    return true;
  }
});

// When a fresh token arrives from the Noloco app, refetch immediately.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.bfToken && changes.bfToken.newValue) bfRefresh();
});

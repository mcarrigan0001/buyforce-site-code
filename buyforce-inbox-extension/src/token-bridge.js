/* BuyForce Inbox Overlay — token bridge (runs on the Noloco app domain).
 * Listens for the footer's postMessage and stores the agent's apiToken so the
 * Facebook side can send it as x-bf-token. No token is ever fetched by identity.
 */
const NOLOCO_APP_ORIGIN = 'https://buyforce.noloco.co';

window.addEventListener('message', function (ev) {
  if (ev.origin !== NOLOCO_APP_ORIGIN) return;            // only trust the BuyForce app
  var d = ev.data || {};
  if (d.source === 'buyforce-noloco' && d.type === 'BF_TOKEN_SYNC' && d.token) {
    chrome.storage.local.set({ bfToken: String(d.token), bfTokenSyncedAt: Date.now() });
  }
});

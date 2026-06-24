# BuyForce Inbox Overlay (Chrome MV3)

Read-only overlay that decorates the Facebook Marketplace **Buying** inbox with each
conversation's BuyForce pipeline data — stage badge, time-in-stage (with a staleness
flag), and a suggested next action. It reads what's already on screen and adds labels;
it never sends messages, clicks, or takes any action on Facebook.

## How it works
1. You open the BuyForce app (`https://buyforce.noloco.co`) and log in. The footer JS
   posts your `apiToken`; `src/token-bridge.js` saves it to extension storage.
2. On Facebook, `src/background.js` calls the n8n proxy
   (`https://buyforce.app.n8n.cloud/webhook/bf-inbox-index`) with that token and gets
   back your dealership's deal index.
3. `src/content.js` matches each inbox row to a deal (FB thread id when available,
   otherwise a seller+vehicle fuzzy match shown with an `≈` prefix) and injects a badge.

## Load it (personal, unpacked — no Web Store)
1. `chrome://extensions` → toggle **Developer mode** (top right).
2. **Load unpacked** → select this `buyforce-inbox-extension` folder.
3. Open `https://buyforce.noloco.co` once and log in (syncs your token).
4. Open the **Facebook Marketplace Buying inbox** → badges appear on matched rows.
5. After any edit to the extension, click the **reload** icon on its card in `chrome://extensions`.

## Configuration (`src/config.js`)
- `endpoint` — the proxy URL (pre-filled, verified live).
- `stages` — stage → label / color / staleness-days / default next-action (pre-filled).
- `selectors.rowCandidates` — **the one thing that needs live verification.** Facebook
  randomizes class names, so these are anchored to `href`/`role`. Open the inbox,
  inspect a conversation row in DevTools, and adjust this selector to match. The matcher
  only badges rows whose text matches a real deal, so an over-broad selector is safe.

## Matching
- **ID-primary:** once the `threadId`/`fbThreadId` field exists on Noloco `opportunities`
  and is backfilled, matching is exact (the proxy already returns `threadId`).
- **Fuzzy fallback (current):** seller name + vehicle token overlap. Confident matches
  show clean; fuzzy guesses are prefixed with `≈`. Tune `matchThreshold` in config.

## Notes
- Token re-syncs every time you open the BuyForce app, so rotation is automatic.
- Index is cached and refreshed every 5 minutes.
- For Web Store distribution and the legal review, see the handoff package docs.

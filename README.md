# buyforce-site-code

Custom CSS/JS/HTML for BuyForce HighLevel pages. Claude edits these files; Michael commits & pushes in GitHub Desktop to back up and (where applicable) auto-update the live site.

## Library index — Main site home page (FULLY hands-off via loader)

| File | What it is | Auto-updates live site on push? |
|------|-----------|--------------------------------|
| `mainsite-home.body.html` | The page HTML content (all sections + case study) | ✅ Yes |
| `mainsite-home.css` | All page styling | ✅ Yes |
| `mainsite-home.js` | Hero canvas effect + Messenger-mock zoom script | ✅ Yes |
| `mainsite-home.loader.html` | The tiny snippet pasted ONCE into HighLevel. Never needs changing. | n/a (set once) |
| `mainsite-home.html` | Live preview that mirrors production (same loader pattern) | n/a (preview) |

## Preview

`https://mcarrigan0001.github.io/buyforce-site-code/mainsite-home.html`

## How updates work — fully hands-off

After the one-time loader paste, **every** change is automatic:

1. Claude edits `mainsite-home.body.html` (content), `mainsite-home.css` (styling), or `mainsite-home.js` (behavior).
2. Michael commits + pushes in GitHub Desktop.
3. The live HighLevel page updates within ~1 min. **No more HighLevel pasting, ever.**

The loader fetches a cache-busted copy each load (`?v=timestamp`), so updates appear immediately.

### One-time setup (do once)

Paste the full contents of `mainsite-home.loader.html` into the home page's HighLevel Custom Code element (replacing the old code), then Save + Publish. That's the last time you touch HighLevel for this page.

### Tradeoff (accepted)

Page content is loaded by script, so it's not in the initial HTML — weaker for Google SEO and social link previews. Chosen because traffic to this page is driven directly, not via search.

## Conventions

- Brand green: `#4cb826` (darker `#2d7a10`, hover `#3fa020`)
- Ink/near-black: `#1a1a1a`
- Light section background: `#f7f8f5` / `#F7F7F5`
- Font: Poppins (Google Fonts); icons: Tabler Icons (jsDelivr webfont)
- Never commit secrets (passwords, API tokens, the HighLevel PIT).

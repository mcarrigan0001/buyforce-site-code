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

### Tradeoff (accepted, for now)

Page content is loaded by script, so it's not in the initial HTML — weaker for Google SEO and social link previews. Chosen deliberately for the **build phase**: while the page changes often, fully hands-off speed matters more than SEO.

### Planned SEO switch (do this once the page is finalized)

When the design/content is locked and the page should rank in Google:
1. Take the current `mainsite-home.body.html` content.
2. Paste it inline into the HighLevel Custom Code element (replacing the loader's `<div id="bf-home">`).
3. Keep (or inline) the `<link>` to `mainsite-home.css` and `<script src>` to `mainsite-home.js`.
4. Save + Publish. Now the content is in the initial HTML = SEO-friendly.

GitHub stays the source of truth throughout — this is only a change in *where the HTML is served from*, not a rebuild.

## Noloco workspace theme

| File | What it is | Auto-updates? |
|------|-----------|--------------|
| `noloco-theme.css` | BuyForce theme for the Noloco app (green/red/amber scales, fonts, header, details-panel polish) | ✅ Yes — referenced by a `<link>` in Noloco's custom header code |


# buyforce-site-code

Custom CSS/JS/HTML for BuyForce HighLevel pages. Claude edits these files; Michael commits & pushes in GitHub Desktop to back up and (where applicable) auto-update the live site.

## Library index — Main site home page (split for auto-update)

| File | What it is | Auto-updates live site on push? |
|------|-----------|--------------------------------|
| `mainsite-home.css` | All page styling | ✅ Yes — referenced by `<link>` in HighLevel |
| `mainsite-home.js` | Hero canvas effect + Messenger-mock zoom script | ✅ Yes — referenced by `<script src>` in HighLevel |
| `mainsite-home.html` | Page HTML body + the two loader tags. This is the block pasted into HighLevel. | ⚠️ Only HTML/content changes need a re-paste |

## Preview

GitHub Pages is enabled:
`https://mcarrigan0001.github.io/buyforce-site-code/mainsite-home.html`

## How updates work (after one-time HighLevel paste)

1. **Styling change** → Claude edits `mainsite-home.css` → Michael commits + pushes → live in ~1 min. No HighLevel paste.
2. **Behavior change** → Claude edits `mainsite-home.js` → push → live. No HighLevel paste.
3. **HTML text/structure change** → Claude edits `mainsite-home.html` → push → Michael re-pastes the file into the HighLevel Custom Code element.

One-time setup: paste the full contents of `mainsite-home.html` into the home page's HighLevel Custom Code element (replacing the old code), then Save + Publish.

## Conventions

- Brand green: `#4cb826` (darker `#2d7a10`, hover `#3fa020`)
- Ink/near-black: `#1a1a1a`
- Light section background: `#f7f8f5` / `#F7F7F5`
- Font: Poppins (Google Fonts); icons: Tabler Icons (jsDelivr webfont)
- Never commit secrets (passwords, API tokens, the HighLevel PIT).

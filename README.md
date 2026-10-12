# Outloop website

Static site: no build step. `index.html` (landing, GSAP 3.12.5 from cdnjs), `privacy.html`, `terms.html`, `support.html`.

## Before publishing

- When the app is live, set `APP_STORE_URL` at the top of `js/main.js`. Until then the buttons read "Coming soon".

## Hosting

Any static host works: drag this folder into Netlify Drop, or `npx vercel` in this folder, or GitHub Pages / Cloudflare Pages with this folder as the root.

Then use `https://<your-domain>/privacy.html` as the Privacy Policy URL and `https://<your-domain>/support.html` as the Support URL in App Store Connect.

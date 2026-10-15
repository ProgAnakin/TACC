# Publishing the website

The site is plain HTML/CSS/JS: `index.html`, `privacy.html`, `styles.css`, `main.js`, `config.js`, `_headers` and `assets/`. No build step.

## Before publishing

1. **`config.js`**: set the contact e-mail. Optionally create a free form at [formspree.io](https://formspree.io) and paste its endpoint (`https://formspree.io/f/...`). Without it, the form opens the visitor's e-mail app with the request already written.
2. **`privacy.html`**: fill in the highlighted parts (who you are, address, VAT number, the e-mail and form services used).

## Cloudflare Pages (free, commercial use allowed)

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, and pick this repository.
2. Framework preset: **None**. Build command: *(empty)*. Build output directory: **`/`**.
3. **Save and Deploy**. Every push to `main` publishes again. Add your domain under **Custom domains**.

GitHub Pages and Vercel's free plan don't allow sites that sell a product.

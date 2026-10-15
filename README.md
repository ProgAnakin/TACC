# Caderninho Digital — website

The public website of **Caderninho Digital**, a counter-side CRM for shops that repair, order and follow up: one list of every customer who is waiting, the next step for each, reminders on time and WhatsApp messages in the client's language. On the iPad, the Mac and the phone.

<p align="center"><img src="assets/media/telas.png" width="100%" alt="Four screens of the app on an iPhone: the day's list, a case with its next step, a WhatsApp message in Italian and a new case with follow-ups planned"></p>

The videos and screens on this site are recorded from the real app with demo data. The app itself is a private product.

## What's here

| File | What it is |
|---|---|
| `index.html` | The page: what the app does, how it works, features (with videos), teams, FAQ, demo request |
| `privacy.html` | Privacy notice for the demo-request form — fill in the highlighted parts |
| `config.js` | **The two settings to change**: the contact e-mail and the form service |
| `styles.css`, `main.js` | Look and behaviour (no framework, no tracking, no cookies) |
| `_headers` | Security headers for Cloudflare Pages |
| `assets/` | Fonts (SIL Open Font Licence), videos and images |

## Before publishing

1. **`config.js`**: put your contact e-mail. Optionally create a free form at [formspree.io](https://formspree.io) and paste its endpoint (`https://formspree.io/f/...`) — without it, the form opens the visitor's e-mail app with the request already written.
2. **`privacy.html`**: fill in who you are (name or company, address, VAT number) and which e-mail / form service you use.

## Publishing on Cloudflare Pages (free, commercial use allowed)

1. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick this repository.
2. Framework preset: **None**. Build command: *(empty)*. Build output directory: **`/`**.
3. **Save and Deploy**. Every push to `main` publishes again. Add your own domain under **Custom domains**.

GitHub Pages and Vercel's free plan don't allow sites that sell a product, so they are not used here.

## Media

Recorded from the app with a script (Playwright + ffmpeg) and assembled with Remotion; they live in the app's private repository and are copied here.

© Caderninho Digital. All rights reserved.

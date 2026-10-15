<div align="center">

<img src="assets/readme/hero.svg" width="100%" alt="Caderninho Digital, the shop counter notebook, now smart: the list of cases with what needs attention, a reminder at the right time and a WhatsApp message ready in the client's language">

<p>
  <img src="https://img.shields.io/badge/app-React%2018%20%C2%B7%20TypeScript-2563eb?logo=react&logoColor=white" alt="React 18 and TypeScript">
  <img src="https://img.shields.io/badge/backend-Supabase%20%C2%B7%20Postgres-15803d?logo=supabase&logoColor=white" alt="Supabase and Postgres">
  <img src="https://img.shields.io/badge/PWA-iPad%20%C2%B7%20Mac%20%C2%B7%20phone-7c3aed" alt="Installable web app for iPad, Mac and phone">
  <img src="https://img.shields.io/badge/languages-EN%20%C2%B7%20IT%20%C2%B7%20PT%20%C2%B7%20ES-0f766e" alt="English, Italian, Portuguese and Spanish">
  <img src="https://img.shields.io/badge/tests-549%20automated%20checks-15803d" alt="549 automated checks">
</p>

**[See it in action](#in-30-seconds)** · **[How it works](#how-it-works)** · **[Inside](#inside)** · **[Website](#website)**

</div>

**Caderninho Digital is a CRM for the counter of shops that repair, order and follow up**: appliances, electronics, phones, optics, bikes. Every customer waiting on a part, a repair, an answer about a purchase or the fix for a complaint becomes a **case**. The app shows what to do next, reminds the team at the right moment and has the WhatsApp message ready, in the client's language.

It runs on the **iPad** at the counter, on the shop's Mac and on phones. One company can have **several stores** and a **team** with roles. Shops pay a monthly subscription per store.

<p align="center">
  <a href="assets/media/tour.mp4"><img src="assets/media/tour-poster.jpg" width="100%" alt="Watch the tour of Caderninho Digital, a video of about 50 seconds"></a>
  <br><b>The tour in 50 seconds</b> — click the image to watch.
</p>

---

## In 30 seconds

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="assets/readme/today.gif" width="100%" alt="On an iPhone: the list shows what needs attention first; an urgent complaint shows its next step, and the WhatsApp message comes out ready in Italian">
      <br><b>It tells you what to do now</b>
      <br>What needs you comes first. Each case shows its next step and a message in the client's language.
    </td>
    <td width="50%" align="center" valign="top">
      <img src="assets/readme/new-case.gif" width="100%" alt="On an iPhone: a new repair case with a ready-made template, name and phone; three follow-up reminders are set">
      <br><b>A new case in seconds</b>
      <br>Type, a ready-made template, name and phone. The follow-ups are planned for you.
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <img src="assets/readme/swipe.gif" width="100%" alt="On an iPhone: swiping a case to the right resolves it, with Undo">
      <br><b>Swipe to close a case</b>
      <br>Right to resolve, left to delete. Everything can be undone.
    </td>
    <td width="50%" align="center" valign="top">
      <img src="assets/readme/languages.gif" width="100%" alt="The same screen in English, Italian, Portuguese and Spanish">
      <br><b>Four languages</b>
      <br>Each person uses the app in theirs; clients get messages in their own.
    </td>
  </tr>
</table>

<p align="center">
  <img src="assets/readme/ipad.gif" width="100%" alt="On the iPad: a reminder slides in and is snoozed for one hour; the list and the case sit side by side">
  <br><b>Reminders that don't slip</b> — done, later or open the case; list and case side by side on the iPad.
</p>

<p align="center">
  <img src="assets/readme/stats.gif" width="100%" alt="On the iPad: the shop's stats by week, month and all time">
  <br><b>The shop in numbers</b> — conversion, sales, repair time and where clients come from, per store or per person.
</p>

---

## How it works

<img src="assets/readme/journey.svg" width="100%" alt="From the counter to the after-sale call: the customer comes in; a case is created in seconds; the app plans the follow-ups; the message is ready in the client's language; the case is closed and a check-in is scheduled">

<img src="assets/media/telas.png" width="100%" alt="Four screens on an iPhone: the day's list, a case with its next step, a WhatsApp message in Italian and a new case with follow-ups planned">

### What shops get

- **Four kinds of case**: special orders, repairs, sales leads and complaints. Each shop can rename them and the repair stages with its own words.
- **"Needs attention" first**, with the reason: urgent and not contacted today, ready for pickup but the client not told, return overdue, complaint waiting, follow-up due. The case screen gives the same next step, with a button.
- **Reminders**: one tap for tomorrow, 3 days or a week. Automatic follow-up plans per case type, and an after-sale check-in 7 days after closing. Alerts on screen, as push notifications when the app is closed.
- **WhatsApp messages for every step**: arrived, sent for repair, ready for pickup, follow-up, "is everything OK?", exchange available. They are written in the client's language (IT/PT/ES/EN), formal or informal, signed by the sender and logged as a contact.
- **Closing the loop**: leads won with the sale value or lost with the reason, repairs delivered, orders picked up. Everything has Undo.
- **Teams**: company → stores → people, with owner, manager and consultant roles. One-time invite links, a person responsible for each case, and open cases handed over when someone leaves.
- **Stats** by period with comparisons, and an archive with search and an Excel-ready export. Photos, voice notes and dictation.
- **Private by design**: sign-in by invitation, optional two-step login, each company's data kept apart by the database itself. The app stores no addresses and no payment details.

---

## Inside

<img src="assets/readme/inside.svg" width="100%" alt="Inside Caderninho: 15.6k lines of app code; 59 UI components across 11 screens; 16 database migrations; 58 access rules; 4 × 700 hand-written texts; 549 automated checks; 0.7 s to open 1,500 cases on a slow phone; 0 known vulnerabilities in the published app">

<img src="assets/readme/speed.svg" width="100%" alt="Server time in a company with 70,000 cases, before and after the access-rules rework: store list 243 ms to 1.3 ms; archive 5.7 s to 1.5 ms; this week's stats 2 min 7 s to 14 ms">

### How it is built

```mermaid
flowchart LR
  app["📱 Installable web app<br/>iPad · Mac · phone"]
  subgraph supabase["☁️ Supabase"]
    direction TB
    auth["🔐 Sign-in + two-step"]
    db[("🗄️ Postgres<br/>58 access rules")]
    files["🖼️ Private photos and audio"]
    invite["✉️ Invite function"]
    push["🔔 Notification function"]
  end
  wa["💬 The client's WhatsApp"]
  app --> auth
  app -- "cases · contacts · reminders" --> db
  app --> files
  app -- "invite" --> invite
  db -. "every minute" .-> push
  push -- "reminder on the phone" --> app
  app -. "message ready" .-> wa
```

| Layer | Technology |
|---|---|
| App | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, React Hook Form + Zod |
| Backend | Supabase: Postgres with row-level security, auth with TOTP, storage, Edge Functions (Deno) |
| Notifications | Web Push (VAPID) on a schedule (`pg_cron`) |
| Quality | Vitest (156 unit tests), a real Postgres for the access rules (113 checks), Playwright in the browser (19 suites, 280 checks), CI on every change |
| Media | Recorded from the app with Playwright + ffmpeg, the tour assembled with Remotion |

There is no app server: **who can see what is decided by the database**. That covers company and store isolation, roles, invites and hand-overs, and every rule is tested against a real Postgres. Big stores stay fast because the access check runs once per request instead of once per row (store list 243 ms → 1.3 ms with 70,000 cases).

The app's source code is private. This repository holds the public website and this page.

---

## Website

This repository is also the product's website (`index.html`, plain HTML/CSS/JS, no cookies or tracking). See [DEPLOY.md](DEPLOY.md) to publish it.

© Caderninho Digital. All rights reserved.

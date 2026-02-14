# Lusus — Website

Landing page for **Lusus**, the reverse memory game. Built with React, TypeScript, Vite, and Tailwind CSS.

## What it is

This is the public site that promotes the Lusus app. It includes:

- **Hero** — Tagline “Find the shape that wasn’t there”, short description, and App Store / TestFlight / Android download buttons
- **How it works** — Three steps: Memorize the shapes → Find the odd one out → Build your streak, plus an interactive mini-game demo
- **Features** — Beat the Clock, Real-time Multiplayer, Track Your Progress, Learn in Seconds, Custom Game Settings, Play Anywhere
- **Open source** — Links to the main repo and to the `main`, `server`, and `website` branches (App, Server, Website)
- **CTA** — “Ready to test your memory?” with download buttons

## Tech stack

- **React** + **TypeScript**
- **Vite** — dev server and build
- **Tailwind CSS** — styling
- **React Router** — routing (e.g. Home, Privacy)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port Vite prints).

## Build

```bash
npm run build
```

Output is in `dist/`. Preview with `npm run preview`.

## Configuration

Download links are driven by `src/config.ts`:

- **`STORE_LINKS.ios`** — App Store or TestFlight URL; leave empty to hide the iOS button
- **`STORE_LINKS.android`** — Google Play URL; leave empty to hide the Play Store button
- **`ANDROID_APK_PATH`** — Optional direct APK URL; used when `STORE_LINKS.android` is empty so the Android button still works (e.g. “Download APK”)

Update these for production or TestFlight/APK releases.

## Project structure

```
website/
├── index.html          # Entry HTML, title "Lusus — Reverse Memory Game", meta/OG/Twitter
├── src/
│   ├── config.ts       # STORE_LINKS, ANDROID_APK_PATH
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/          # HomePage, PrivacyPage, etc.
│   ├── components/     # Layout, shared UI
│   └── ...
├── public/             # Static assets (favicon, icon, screenshots)
└── README.md
```

## Related repos / branches

- **App (main)** — React Native · Expo — [lusus](https://github.com/collinsadi/lusus/tree/main)
- **Server** — Node.js · Express · Socket.io — [server](https://github.com/collinsadi/lusus/tree/server)
- **Website** — This repo — [website](https://github.com/collinsadi/lusus/tree/website)

---

**Lusus** — Memorize the shapes, find the odd one out, and build your streak. Available on iOS and Android.

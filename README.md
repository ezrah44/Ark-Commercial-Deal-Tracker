# Ark Commercial Deal Tracker

Tracks closed commercial solar deals and Meta ad spend, and calculates ad spend per closed deal plus your commission.

This is a fully static app — there is no backend. All data lives in **this browser's localStorage**, so it's only visible on the one device/browser you use it in. Don't clear this site's browser data, or your deals will be gone.

## First-time setup

```bash
npm run install:all
```

## Run it locally

```bash
npm run dev
```

Opens the dashboard at `http://localhost:5173`.

## Deploy to GitHub Pages

```bash
cd client
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch of this repo. Once GitHub Pages is enabled for that branch (Settings → Pages → Source: `gh-pages` branch), it'll be live at:

`https://<your-github-username>.github.io/Ark-Commercial-Deal-Tracker/`

## Using it

- **+ New Deal** — log a closed commercial deal (their name, optional business name, close date, optional notes).
- **+ Add Ad Spend** — log the amount spent **since your last entry** (not a running total — the app adds these up itself). Send Claude a screenshot of your Meta Ads totals and it'll tell you the number to type in here.
- The three top tiles update live: **Total Ad Spend**, **Deals Closed**, and **Ad Spend / Closed Deal**.
- Each deal stores a permanent snapshot of ad spend per deal *at the moment it closed*, and a commission: **$1,000** if that was under $2,000, **$500** if at or over.
- Click the **⋯** next to any deal to edit or delete it. Editing only fixes details (name/date/notes) — it won't change the historical spend snapshot or commission.

## Project structure

- `client/` — React + Vite + Framer Motion. `src/localDb.ts` is the whole "backend" — localStorage read/write plus the commission math.

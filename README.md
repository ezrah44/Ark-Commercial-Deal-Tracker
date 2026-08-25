# Ark Commercial Deal Dashboard

Tracks closed commercial solar deals and Meta ad spend, and calculates ad spend per closed deal.

## First-time setup

```bash
npm run install:all
```

## Run it

```bash
npm run dev
```

This starts the API server on `http://localhost:4000` and the dashboard on `http://localhost:5173`. Open the dashboard URL in your browser.

Data is stored locally in `server/dashboard.db` (SQLite) — it persists between restarts.

## Using it

- **+ New Deal** — log a closed commercial deal (client, amount, close date, optional notes).
- **+ Add Ad Spend** — log an ad spend entry. Paste a screenshot of your Meta Ads totals into chat with Claude and ask it to add the amount — Claude will read the number off the screenshot and log it here for you. You can also type entries in manually.
- The four top tiles update live: **Total Ad Spend**, **Deals Closed**, **Total Deal Value**, and **Ad Spend / Closed Deal** (total spend ÷ deals closed).
- Click the **×** next to any row to delete it.

## Project structure

- `server/` — Express + SQLite API (`/api/deals`, `/api/adspend`, `/api/summary`)
- `client/` — React + Vite + Framer Motion dashboard UI

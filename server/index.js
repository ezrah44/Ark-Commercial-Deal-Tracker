import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "dashboard.db"));

// Commission rule: if ad spend per closed deal (at the moment this deal
// closed) is under $2,000, commission is $1,000. At or above, it's $500.
const COMMISSION_THRESHOLD = 2000;
const COMMISSION_LOW = 1000;
const COMMISSION_HIGH = 500;

db.exec(`
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_name TEXT NOT NULL,
    business_name TEXT,
    closed_date TEXT NOT NULL,
    notes TEXT,
    ad_spend_snapshot REAL NOT NULL,
    deal_count_snapshot INTEGER NOT NULL,
    cost_per_deal_snapshot REAL NOT NULL,
    commission REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ad_spend (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    period_label TEXT,
    spend_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: older DBs may still have a "client" column instead of
// "contact_name" / "business_name" — move the data over once.
const dealColumns = db.prepare("PRAGMA table_info(deals)").all().map((c) => c.name);
if (dealColumns.includes("client") && !dealColumns.includes("business_name")) {
  db.exec(`ALTER TABLE deals RENAME COLUMN client TO contact_name;`);
  db.exec(`ALTER TABLE deals ADD COLUMN business_name TEXT;`);
} else if (dealColumns.includes("client") && dealColumns.includes("business_name")) {
  db.exec(`ALTER TABLE deals RENAME COLUMN client TO contact_name;`);
}

const app = express();
app.use(cors());
app.use(express.json());

function currentTotalSpend() {
  return db.prepare("SELECT COALESCE(SUM(amount),0) as total FROM ad_spend").get().total;
}

function currentDealCount() {
  return db.prepare("SELECT COUNT(*) as count FROM deals").get().count;
}

// ---- Deals ----
app.get("/api/deals", (req, res) => {
  const rows = db.prepare("SELECT * FROM deals ORDER BY closed_date DESC, id DESC").all();
  res.json(rows);
});

app.post("/api/deals", (req, res) => {
  const { contact_name, business_name, closed_date, notes } = req.body;
  if (!contact_name || !closed_date) {
    return res.status(400).json({ error: "contact_name and closed_date are required" });
  }

  const spendSoFar = currentTotalSpend();
  const newCount = currentDealCount() + 1;
  const costPerDealSnapshot = newCount > 0 ? spendSoFar / newCount : 0;
  const commission = costPerDealSnapshot < COMMISSION_THRESHOLD ? COMMISSION_LOW : COMMISSION_HIGH;

  const stmt = db.prepare(
    `INSERT INTO deals (contact_name, business_name, closed_date, notes, ad_spend_snapshot, deal_count_snapshot, cost_per_deal_snapshot, commission)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    contact_name,
    business_name || null,
    closed_date,
    notes || null,
    spendSoFar,
    newCount,
    costPerDealSnapshot,
    commission
  );
  const row = db.prepare("SELECT * FROM deals WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put("/api/deals/:id", (req, res) => {
  const { contact_name, business_name, closed_date, notes } = req.body;
  if (!contact_name || !closed_date) {
    return res.status(400).json({ error: "contact_name and closed_date are required" });
  }
  const existing = db.prepare("SELECT * FROM deals WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Deal not found" });
  }
  // Editing fixes typos/details only — it does not recompute the ad-spend
  // snapshot or commission, since those reflect what was true when the
  // deal actually closed.
  db.prepare(
    `UPDATE deals SET contact_name = ?, business_name = ?, closed_date = ?, notes = ? WHERE id = ?`
  ).run(contact_name, business_name || null, closed_date, notes || null, req.params.id);
  const row = db.prepare("SELECT * FROM deals WHERE id = ?").get(req.params.id);
  res.json(row);
});

app.delete("/api/deals/:id", (req, res) => {
  db.prepare("DELETE FROM deals WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---- Ad Spend ----
app.get("/api/adspend", (req, res) => {
  const rows = db.prepare("SELECT * FROM ad_spend ORDER BY spend_date DESC, id DESC").all();
  res.json(rows);
});

app.post("/api/adspend", (req, res) => {
  const { amount, period_label, spend_date, notes } = req.body;
  if (!amount || !spend_date) {
    return res.status(400).json({ error: "amount and spend_date are required" });
  }
  const stmt = db.prepare(
    "INSERT INTO ad_spend (amount, period_label, spend_date, notes) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(amount, period_label || null, spend_date, notes || null);
  const row = db.prepare("SELECT * FROM ad_spend WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.delete("/api/adspend/:id", (req, res) => {
  db.prepare("DELETE FROM ad_spend WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---- Summary ----
app.get("/api/summary", (req, res) => {
  const totalSpend = currentTotalSpend();
  const totalDeals = currentDealCount();
  const costPerDeal = totalDeals > 0 ? totalSpend / totalDeals : 0;
  res.json({ totalSpend, totalDeals, costPerDeal });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

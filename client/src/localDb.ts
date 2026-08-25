// All data lives in this browser's localStorage — there is no server.
// That means: no accounts, no hosting cost, but data only exists on
// whichever device/browser you use. Don't clear site data for this app.

import type { Deal, AdSpend, Summary } from "./api";

const DEALS_KEY = "ark-deal-tracker:deals";
const ADSPEND_KEY = "ark-deal-tracker:adspend";
const NEXT_ID_KEY = "ark-deal-tracker:next-id";

// Commission rule: if ad spend per closed deal (at the moment this deal
// closed) is under $2,000, commission is $1,000. At or above, it's $500.
const COMMISSION_THRESHOLD = 2000;
const COMMISSION_LOW = 1000;
const COMMISSION_HIGH = 500;

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function nextId(): number {
  const current = parseInt(localStorage.getItem(NEXT_ID_KEY) || "1", 10);
  localStorage.setItem(NEXT_ID_KEY, String(current + 1));
  return current;
}

function nowIso(): string {
  return new Date().toISOString();
}

function totalSpend(): number {
  return load<AdSpend>(ADSPEND_KEY).reduce((sum, s) => sum + s.amount, 0);
}

function dealCount(): number {
  return load<Deal>(DEALS_KEY).length;
}

function sortDeals(deals: Deal[]): Deal[] {
  return [...deals].sort((a, b) => {
    if (a.closed_date !== b.closed_date) return b.closed_date.localeCompare(a.closed_date);
    return b.id - a.id;
  });
}

function sortAdSpend(rows: AdSpend[]): AdSpend[] {
  return [...rows].sort((a, b) => {
    if (a.spend_date !== b.spend_date) return b.spend_date.localeCompare(a.spend_date);
    return b.id - a.id;
  });
}

export const localDb = {
  getDeals(): Deal[] {
    return sortDeals(load<Deal>(DEALS_KEY));
  },

  addDeal(input: { contact_name: string; business_name: string; closed_date: string; notes: string }): Deal {
    if (!input.contact_name.trim() || !input.closed_date) {
      throw new Error("contact_name and closed_date are required");
    }
    const spendSoFar = totalSpend();
    const newCount = dealCount() + 1;
    const costPerDealSnapshot = newCount > 0 ? spendSoFar / newCount : 0;
    const commission = costPerDealSnapshot < COMMISSION_THRESHOLD ? COMMISSION_LOW : COMMISSION_HIGH;

    const deal: Deal = {
      id: nextId(),
      contact_name: input.contact_name.trim(),
      business_name: input.business_name.trim() || null,
      closed_date: input.closed_date,
      notes: input.notes.trim() || null,
      ad_spend_snapshot: spendSoFar,
      deal_count_snapshot: newCount,
      cost_per_deal_snapshot: costPerDealSnapshot,
      commission,
      created_at: nowIso(),
    };
    const deals = load<Deal>(DEALS_KEY);
    deals.push(deal);
    save(DEALS_KEY, deals);
    return deal;
  },

  updateDeal(
    id: number,
    input: { contact_name: string; business_name: string; closed_date: string; notes: string }
  ): Deal {
    if (!input.contact_name.trim() || !input.closed_date) {
      throw new Error("contact_name and closed_date are required");
    }
    const deals = load<Deal>(DEALS_KEY);
    const idx = deals.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Deal not found");
    // Editing fixes typos/details only — it does not recompute the
    // ad-spend snapshot or commission, since those reflect what was true
    // when the deal actually closed.
    deals[idx] = {
      ...deals[idx],
      contact_name: input.contact_name.trim(),
      business_name: input.business_name.trim() || null,
      closed_date: input.closed_date,
      notes: input.notes.trim() || null,
    };
    save(DEALS_KEY, deals);
    return deals[idx];
  },

  deleteDeal(id: number): void {
    const deals = load<Deal>(DEALS_KEY).filter((d) => d.id !== id);
    save(DEALS_KEY, deals);
  },

  getAdSpend(): AdSpend[] {
    return sortAdSpend(load<AdSpend>(ADSPEND_KEY));
  },

  addAdSpend(input: { amount: number; period_label: string; spend_date: string; notes: string }): AdSpend {
    if (!input.amount || !input.spend_date) {
      throw new Error("amount and spend_date are required");
    }
    const entry: AdSpend = {
      id: nextId(),
      amount: input.amount,
      period_label: input.period_label.trim() || null,
      spend_date: input.spend_date,
      notes: input.notes.trim() || null,
      created_at: nowIso(),
    };
    const rows = load<AdSpend>(ADSPEND_KEY);
    rows.push(entry);
    save(ADSPEND_KEY, rows);
    return entry;
  },

  deleteAdSpend(id: number): void {
    const rows = load<AdSpend>(ADSPEND_KEY).filter((s) => s.id !== id);
    save(ADSPEND_KEY, rows);
  },

  getSummary(): Summary {
    const spend = totalSpend();
    const deals = dealCount();
    return {
      totalSpend: spend,
      totalDeals: deals,
      costPerDeal: deals > 0 ? spend / deals : 0,
    };
  },
};

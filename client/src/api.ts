// This app is fully static — there is no server. All data is read from
// and written to this browser's localStorage (see localDb.ts). The `api`
// object below keeps an async interface so the rest of the app doesn't
// need to know the difference.

export type Deal = {
  id: number;
  contact_name: string;
  business_name: string | null;
  closed_date: string;
  notes: string | null;
  ad_spend_snapshot: number;
  deal_count_snapshot: number;
  cost_per_deal_snapshot: number;
  commission: number;
  created_at: string;
};

export type AdSpend = {
  id: number;
  amount: number;
  period_label: string | null;
  spend_date: string;
  notes: string | null;
  created_at: string;
};

export type Summary = {
  totalSpend: number;
  totalDeals: number;
  costPerDeal: number;
};

// Imported lazily-ish via re-export to avoid a circular import at module
// load time (localDb.ts imports these types from this file).
import { localDb } from "./localDb";

export const api = {
  getDeals: async () => localDb.getDeals(),
  addDeal: async (d: { contact_name: string; business_name: string; closed_date: string; notes: string }) =>
    localDb.addDeal(d),
  updateDeal: async (
    id: number,
    d: { contact_name: string; business_name: string; closed_date: string; notes: string }
  ) => localDb.updateDeal(id, d),
  deleteDeal: async (id: number) => localDb.deleteDeal(id),

  getAdSpend: async () => localDb.getAdSpend(),
  addAdSpend: async (s: { amount: number; period_label: string; spend_date: string; notes: string }) =>
    localDb.addAdSpend(s),
  deleteAdSpend: async (id: number) => localDb.deleteAdSpend(id),

  getSummary: async () => localDb.getSummary(),
};

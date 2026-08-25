// Relative path works both in dev (proxied to localhost:4000 by Vite,
// see vite.config.ts) and in production (served by the same Express
// process that serves this build).
const BASE = "/api";

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

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getDeals: () => req<Deal[]>("/deals"),
  addDeal: (d: { contact_name: string; business_name: string; closed_date: string; notes: string }) =>
    req<Deal>("/deals", { method: "POST", body: JSON.stringify(d) }),
  updateDeal: (id: number, d: { contact_name: string; business_name: string; closed_date: string; notes: string }) =>
    req<Deal>(`/deals/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteDeal: (id: number) => req<void>(`/deals/${id}`, { method: "DELETE" }),

  getAdSpend: () => req<AdSpend[]>("/adspend"),
  addAdSpend: (s: Omit<AdSpend, "id" | "created_at">) =>
    req<AdSpend>("/adspend", { method: "POST", body: JSON.stringify(s) }),
  deleteAdSpend: (id: number) => req<void>(`/adspend/${id}`, { method: "DELETE" }),

  getSummary: () => req<Summary>("/summary"),
};

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { api, type Deal, type Summary } from "./api";
import { StatTile } from "./components/StatTile";
import { DealModal } from "./components/DealModal";
import { AdSpendModal } from "./components/AdSpendModal";
import { DealRow } from "./components/DealRow";
import "./index.css";
import "./App.css";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function App() {
  const [summary, setSummary] = useState<Summary>({
    totalSpend: 0,
    totalDeals: 0,
    costPerDeal: 0,
  });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([api.getSummary(), api.getDeals()]);
      setSummary(s);
      setDeals(d);
      setError(null);
    } catch {
      setError("Can't reach the server. Is it running on port 4000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddDeal = async (deal: {
    contact_name: string;
    business_name: string;
    closed_date: string;
    notes: string;
  }) => {
    await api.addDeal(deal);
    setDealModalOpen(false);
    refresh();
  };

  const handleEditDeal = async (deal: {
    contact_name: string;
    business_name: string;
    closed_date: string;
    notes: string;
  }) => {
    if (!editingDeal) return;
    await api.updateDeal(editingDeal.id, deal);
    setEditingDeal(null);
    refresh();
  };

  const handleDeleteDeal = async (id: number) => {
    await api.deleteDeal(id);
    refresh();
  };

  const handleAddSpend = async (spend: {
    amount: number;
    period_label: string;
    spend_date: string;
    notes: string;
  }) => {
    await api.addAdSpend(spend);
    setSpendModalOpen(false);
    refresh();
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Ark · Commercial Solar</p>
          <h1>Deal Dashboard</h1>
        </div>
        <div className="top-actions">
          <button className="btn btn-ghost" onClick={() => setSpendModalOpen(true)}>
            + Add Ad Spend
          </button>
          <button className="btn btn-primary" onClick={() => setDealModalOpen(true)}>
            + New Deal
          </button>
        </div>
      </header>

      {error && <div className="banner-error">{error}</div>}

      <section className="stat-grid stat-grid-3">
        <StatTile
          label="Total Ad Spend"
          value={summary.totalSpend}
          format={currency}
          loading={loading}
        />
        <StatTile
          label="Deals Closed"
          value={summary.totalDeals}
          format={(n) => n.toFixed(0)}
          loading={loading}
        />
        <StatTile
          label="Ad Spend / Closed Deal"
          value={summary.costPerDeal}
          format={currency}
          loading={loading}
          highlight
        />
      </section>

      <main className="tracker-section">
        <h2>Closed Deal Tracker</h2>
        <div className="deal-list">
          {deals.length === 0 ? (
            <p className="empty-state">
              No deals logged yet. Hit “New Deal” to add your first one.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {deals.map((d) => (
                <DealRow key={d.id} deal={d} onEdit={setEditingDeal} onDelete={handleDeleteDeal} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {dealModalOpen && (
          <DealModal onClose={() => setDealModalOpen(false)} onSubmit={handleAddDeal} />
        )}
        {editingDeal && (
          <DealModal
            key={editingDeal.id}
            initial={editingDeal}
            onClose={() => setEditingDeal(null)}
            onSubmit={handleEditDeal}
          />
        )}
        {spendModalOpen && (
          <AdSpendModal onClose={() => setSpendModalOpen(false)} onSubmit={handleAddSpend} />
        )}
      </AnimatePresence>
    </div>
  );
}

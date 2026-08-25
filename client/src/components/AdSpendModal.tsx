import { useState } from "react";
import { Modal } from "./Modal";
import { todayLocal } from "../dateUtils";

export function AdSpendModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (spend: { amount: number; period_label: string; spend_date: string; notes: string }) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [spendDate, setSpendDate] = useState(todayLocal());
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !spendDate) {
      setErr("Please enter a valid amount and date.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        amount: amt,
        period_label: periodLabel.trim(),
        spend_date: spendDate,
        notes: "",
      });
    } catch {
      setErr("Something went wrong saving this entry.");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Ad Spend" onClose={onClose}>
      <p className="modal-hint">
        Send Claude a screenshot of your Meta Ads totals — it'll tell you the amount spent since
        last time. Type that number in below (not the running total).
      </p>
      <form className="modal-form" onSubmit={submit}>
        <label>
          Amount Spent Since Last Time (CAD)
          <input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 245.10"
          />
        </label>
        <label>
          Label <span className="optional">(optional)</span>
          <input
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="e.g. Week of Aug 18"
          />
        </label>
        <label>
          Date
          <input type="date" value={spendDate} onChange={(e) => setSpendDate(e.target.value)} />
        </label>
        {err && <p className="form-error">{err}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Spend"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

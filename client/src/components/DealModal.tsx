import { useState } from "react";
import { Modal } from "./Modal";
import { todayLocal } from "../dateUtils";
import type { Deal } from "../api";

type DealFormValues = {
  contact_name: string;
  business_name: string;
  closed_date: string;
  notes: string;
};

export function DealModal({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (deal: DealFormValues) => Promise<void>;
  initial?: Deal;
}) {
  const isEdit = !!initial;
  const [contactName, setContactName] = useState(initial?.contact_name ?? "");
  const [businessName, setBusinessName] = useState(initial?.business_name ?? "");
  const [closedDate, setClosedDate] = useState(initial?.closed_date ?? todayLocal());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !closedDate) {
      setErr("Please fill in their name and the close date.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        contact_name: contactName.trim(),
        business_name: businessName.trim(),
        closed_date: closedDate,
        notes: notes.trim(),
      });
    } catch {
      setErr(`Something went wrong saving ${isEdit ? "the changes" : "the deal"}.`);
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Deal" : "New Deal"} onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <label>
          Their Name
          <input
            autoFocus
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Ryan Oracheski"
          />
        </label>
        <label>
          Business Name <span className="optional">(optional)</span>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Riverside Distribution Co."
          />
        </label>
        <label>
          Close Date
          <input type="date" value={closedDate} onChange={(e) => setClosedDate(e.target.value)} />
        </label>
        <label>
          Notes <span className="optional">(optional)</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 250kW rooftop system" />
        </label>
        {err && <p className="form-error">{err}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Save Deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

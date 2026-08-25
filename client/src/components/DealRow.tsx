import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Deal } from "../api";
import { formatDateLocal } from "../dateUtils";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function DealRow({
  deal,
  onEdit,
  onDelete,
}: {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isLowSpend = deal.cost_per_deal_snapshot < 2000;

  return (
    <motion.div
      className="deal-card"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="deal-card-main">
        <p className="deal-card-client">
          {deal.contact_name}
          {deal.business_name ? <span className="deal-card-business"> · {deal.business_name}</span> : null}
        </p>
        <p className="deal-card-date">
          {formatDateLocal(deal.closed_date)}
          {deal.notes ? ` · ${deal.notes}` : ""}
        </p>
      </div>

      <div className="deal-card-metric">
        <p className="deal-card-metric-label">Ad Spend / Deal</p>
        <p className="deal-card-metric-value">{currency(deal.cost_per_deal_snapshot)}</p>
      </div>

      <div className="deal-card-commission">
        <span className={`commission-badge${isLowSpend ? " commission-badge-high" : ""}`}>
          {currency(deal.commission)}
        </span>
      </div>

      <div className="deal-card-menu" ref={menuRef}>
        <button
          className="dots-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Deal options"
        >
          ⋯
        </button>
        {menuOpen && (
          <motion.div
            className="dots-menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              className="dots-menu-item"
              onClick={() => {
                setMenuOpen(false);
                onEdit(deal);
              }}
            >
              Edit deal
            </button>
            <button
              className="dots-menu-item dots-menu-danger"
              onClick={() => {
                setMenuOpen(false);
                onDelete(deal.id);
              }}
            >
              Delete deal
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useCountUp } from "../useCountUp";

export function StatTile({
  label,
  value,
  format,
  loading,
  highlight,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  loading?: boolean;
  highlight?: boolean;
}) {
  const animated = useCountUp(value);

  return (
    <motion.div
      className={`stat-tile${highlight ? " stat-tile-highlight" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="stat-label">{label}</p>
      <p className="stat-value">{loading ? "—" : format(animated)}</p>
    </motion.div>
  );
}

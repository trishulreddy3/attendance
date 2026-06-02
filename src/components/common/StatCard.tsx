import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

export function StatCard({
  label,
  value,
  icon,
  delay = 0,
  suffix = "",
  hint,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  delay?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="rounded-xl bg-accent/60 p-2.5 text-primary">{icon}</div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

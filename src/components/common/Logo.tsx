import { motion } from "framer-motion";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="relative rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h4v4H4zM4 13h4v4H4zM10 7h4v4h-4zM16 7h4v4h-4zM10 13h10v4H10z" />
        </svg>
      </motion.div>
      <span className="font-semibold tracking-tight">Pulse<span className="text-primary">.</span></span>
    </div>
  );
}

import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-B9TTyEne.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
function StatCard({
  label,
  value,
  icon,
  delay = 0,
  suffix = "",
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      whileHover: { y: -2 },
      className: "group relative overflow-hidden rounded-2xl border border-border bg-card p-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground font-medium", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-semibold tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value, suffix }) }),
            hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: hint })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-accent/60 p-2.5 text-primary", children: icon })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" })
      ]
    }
  );
}
export {
  StatCard as S
};

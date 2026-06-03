import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import { X } from "../_libs/lucide-react.mjs";
function Modal({
  open,
  onClose,
  title,
  children,
  width = 480
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 grid place-items-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        onClick: onClose,
        className: "absolute inset-0 bg-black/50 backdrop-blur-sm"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
        transition: { type: "spring", stiffness: 320, damping: 28 },
        style: { width: "100%", maxWidth: width },
        className: "relative rounded-2xl border border-border bg-card shadow-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold tracking-tight", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5", children })
        ]
      }
    )
  ] }) });
}
export {
  Modal as M
};

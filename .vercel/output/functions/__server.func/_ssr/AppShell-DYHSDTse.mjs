import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useLocation, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useApp, a as useTheme, L as Logo } from "./router-3KK7MBxu.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { e as LogOut, X, f as Menu, g as Sun, h as Moon } from "../_libs/lucide-react.mjs";
function AppShell({
  nav,
  children,
  title
}) {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { logout, currentFaculty, currentStudent } = useApp();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = reactExports.useState(false);
  const me = currentFaculty() ?? currentStudent();
  const Sidebar = /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 space-y-1 px-3", children: nav.map((n) => {
      const active = loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: n.to,
          onClick: () => setOpen(false),
          className: cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
          ),
          children: [
            active && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.span,
              {
                layoutId: "nav-pill",
                className: "absolute inset-0 rounded-lg bg-sidebar-accent",
                transition: { type: "spring", stiffness: 380, damping: 32 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 [&_svg]:size-4", children: n.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 font-medium", children: n.label })
          ]
        },
        n.to
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-sidebar-border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg px-2 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 place-items-center rounded-full bg-primary/15 text-primary text-xs font-semibold", children: me?.name?.[0] ?? "U" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: me?.name ?? "User" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: me?.email })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            logout();
            nav2({ to: "/" });
          },
          className: "rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors",
          "aria-label": "Sign out",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" })
        }
      )
    ] }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block sticky top-0 h-screen", children: Sidebar }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: () => setOpen(false),
          className: "fixed inset-0 z-40 bg-black/40 md:hidden"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { x: -280 },
          animate: { x: 0 },
          exit: { x: -280 },
          transition: { type: "spring", stiffness: 320, damping: 32 },
          className: "fixed inset-y-0 left-0 z-50 md:hidden",
          children: Sidebar
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setOpen((v) => !v),
            className: "md:hidden rounded-md p-2 hover:bg-accent",
            "aria-label": "Menu",
            children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-sm font-semibold tracking-tight", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggle,
            className: "rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
            "aria-label": "Toggle theme",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { initial: { rotate: -90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, transition: { duration: 0.25 }, className: "inline-flex", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4" }) }, theme)
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.main,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          className: "flex-1 p-4 md:p-8",
          children
        },
        loc.pathname
      )
    ] })
  ] });
}
export {
  AppShell as A
};

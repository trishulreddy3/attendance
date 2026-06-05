import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useApp, L as Logo } from "./router-CTeEyVFc.mjs";
import "../_libs/sonner.mjs";
import { o as ShieldCheck, t as Sparkles, u as ArrowRight, Q as QrCode, c as CircleCheck } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Landing() {
  const {
    user
  } = useApp();
  const nav = useNavigate();
  reactExports.useEffect(() => {
    if (user?.kind === "faculty") nav({
      to: "/faculty/dashboard"
    });
    else if (user?.kind === "student") nav({
      to: "/student/dashboard"
    });
    else if (user?.kind === "admin") nav({
      to: "/admin/dashboard"
    });
  }, [user, nav]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/student-login", className: "rounded-md px-3 py-2 text-muted-foreground hover:text-foreground", children: "Student login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "rounded-md px-3 py-2 text-muted-foreground hover:text-foreground", children: "Faculty login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin-login", className: "inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3.5 py-2 text-primary hover:bg-primary/20", children: [
          "Admin ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3.5" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }, className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary" }),
          " Now with live geo-verified sessions"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-balance text-4xl font-semibold tracking-tight md:text-6xl", children: [
          "Attendance that feels",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent", children: "invisible." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-xl text-balance text-muted-foreground md:text-lg", children: "One scan. One second. Pulse handles the rest — for every period, every classroom, every campus." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 flex flex-wrap items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90", children: [
            "Faculty Login ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/student-login", className: "rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent", children: "I'm a Student" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        y: 30
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.2,
        duration: 0.7
      }, className: "mt-16 grid gap-4 md:grid-cols-3", children: [{
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "size-5" }),
        t: "Dynamic QR",
        d: "Rotating tokens every 30s — impossible to share."
      }, {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5" }),
        t: "Geo-verified",
        d: "Pinpoint location checks before marking present."
      }, {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5" }),
        t: "Real-time feed",
        d: "Watch attendance fill in, live."
      }].map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.3 + i * 0.08
      }, className: "rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-lg bg-accent text-primary", children: f.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-medium", children: f.t }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.d })
      ] }, f.t)) })
    ] })
  ] });
}
export {
  Landing as component
};

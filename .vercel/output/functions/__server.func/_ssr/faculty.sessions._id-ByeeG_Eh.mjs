import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { Q as QRCodeSVG } from "../_libs/qrcode.react.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-B9TTyEne.mjs";
import { u as useApp } from "./router-BUawHviS.mjs";
import { f as fmtTime } from "./format-DWYTrrSZ.mjs";
import "../_libs/sonner.mjs";
import { w as ArrowLeft, x as RefreshCcw, c as Users, j as CircleCheck } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
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
function LiveSession() {
  const {
    id
  } = useParams({
    from: "/faculty/sessions/$id"
  });
  const {
    sessions,
    students,
    refreshQr
  } = useApp();
  const session = sessions.find((s) => s.id === id);
  const [countdown, setCountdown] = reactExports.useState(30);
  const [now, setNow] = reactExports.useState(Date.now());
  reactExports.useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(i);
  }, []);
  reactExports.useEffect(() => {
    if (!session) return;
    const i = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refreshQr(session.id);
          return 30;
        }
        return c - 1;
      });
    }, 1e3);
    return () => clearInterval(i);
  }, [session?.id]);
  const remaining = reactExports.useMemo(() => {
    if (!session) return "—";
    const ms = new Date(session.endTime).getTime() - now;
    if (ms <= 0) return "Ended";
    const m = Math.floor(ms / 6e4);
    const s = Math.floor(ms % 6e4 / 1e3);
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }, [session, now]);
  if (!session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid place-items-center py-24 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Session not found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/faculty/sessions", className: "mt-3 text-primary hover:underline", children: "Back to sessions" })
    ] });
  }
  const attendees = [...session.attendees].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const payload = `pulse://session/${session.id}/${session.qrToken}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/faculty/sessions", className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
        " All sessions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex size-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-success/70" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative size-1.5 rounded-full bg-success" })
        ] }),
        "Live"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.96
      }, animate: {
        opacity: 1,
        scale: 1
      }, className: "lg:col-span-3 rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Now collecting" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-2xl font-semibold tracking-tight", children: session.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              session.subject,
              " · ",
              session.branch
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Ends in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-semibold tabular-nums tracking-tight", children: remaining })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
            opacity: 0,
            scale: 0.92,
            rotate: -3
          }, animate: {
            opacity: 1,
            scale: 1,
            rotate: 0
          }, exit: {
            opacity: 0,
            scale: 0.96
          }, transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1]
          }, className: "rounded-3xl border border-border bg-white p-5 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_40%,transparent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: payload, size: 260, bgColor: "#ffffff", fgColor: "#111827", level: "M" }) }, session.qrToken) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium shadow", children: [
            "Refreshes in ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-primary", children: [
              countdown,
              "s"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono truncate", children: session.qrToken }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            refreshQr(session.id);
            setCountdown(30);
          }, className: "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 hover:bg-accent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "size-3.5" }),
            " Refresh now"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: 0.1
        }, className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Attendance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-3xl font-semibold tracking-tight", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: attendees.length }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base text-muted-foreground", children: [
                  "/ ",
                  students.filter((s) => s.branch === session.branch).length
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 place-items-center rounded-xl bg-accent text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full bg-primary", initial: {
            width: 0
          }, animate: {
            width: `${Math.min(100, attendees.length / Math.max(1, students.filter((s) => s.branch === session.branch).length) * 100)}%`
          }, transition: {
            type: "spring",
            stiffness: 80,
            damping: 18
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: 0.15
        }, className: "rounded-2xl border border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-5 py-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Live feed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Students appear as they scan." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "max-h-[380px] overflow-y-auto scrollbar-thin p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: attendees.map((a) => {
              const st = students.find((s) => s.id === a.studentId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.li, { layout: true, initial: {
                opacity: 0,
                x: -10,
                height: 0
              }, animate: {
                opacity: 1,
                x: 0,
                height: "auto"
              }, exit: {
                opacity: 0
              }, transition: {
                type: "spring",
                stiffness: 380,
                damping: 32
              }, className: "flex items-center gap-3 rounded-lg px-2 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-7 place-items-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-sm font-medium", children: [
                    st?.name ?? "Unknown",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "joined" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                    st?.studentId,
                    " · ",
                    fmtTime(a.at)
                  ] })
                ] })
              ] }, a.studentId + a.at);
            }) }),
            attendees.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-3 py-10 text-center text-sm text-muted-foreground", children: "Waiting for the first scan…" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  LiveSession as component
};

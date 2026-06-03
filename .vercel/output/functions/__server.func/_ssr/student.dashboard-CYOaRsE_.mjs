import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AnimatedCounter } from "./AnimatedCounter-B9TTyEne.mjs";
import { S as StatCard } from "./StatCard-RViNGq2g.mjs";
import { u as useApp, b as api } from "./router-BUawHviS.mjs";
import { a as fmtDate, f as fmtTime } from "./format-DWYTrrSZ.mjs";
import "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { B as BookOpen, j as CircleCheck, m as CircleX, n as TrendingUp, S as ScanLine } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Line } from "../_libs/recharts.mjs";
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
import "../_libs/es-toolkit.mjs";
import "../_libs/clsx.mjs";
import "../_libs/reselect.mjs";
import "../_libs/react-is.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/reduxjs__toolkit.mjs";
import "../_libs/redux.mjs";
import "../_libs/immer.mjs";
import "../_libs/redux-thunk.mjs";
import "../_libs/react-redux.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function StudentDashboard() {
  const {
    currentStudent
  } = useApp();
  const me = currentStudent();
  const [data, setData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (me) api.getStudentDashboard(me.id).then(setData).catch(console.error);
  }, [me]);
  if (!me || !data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Loading dashboard..." });
  const R = 60;
  const C = 2 * Math.PI * R;
  const dash = data.attendancePct / 100 * C;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.h2, { initial: {
        opacity: 0,
        y: 6
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "text-2xl font-semibold tracking-tight", children: [
        "Hey ",
        me.name.split(" ")[0],
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Here's how your attendance is shaping up." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Classes", value: data.totalClasses, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Present", value: data.present, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4" }), delay: 0.05 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Absent", value: data.absent, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-4" }), delay: 0.1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Attendance %", value: data.attendancePct, suffix: "%", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4" }), delay: 0.15 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.2
      }, className: "rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Overall" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid place-items-center py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid place-items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "160", height: "160", viewBox: "0 0 160 160", className: "-rotate-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "80", cy: "80", r: R, stroke: "var(--muted)", strokeWidth: "12", fill: "none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.circle, { cx: "80", cy: "80", r: R, stroke: "var(--primary)", strokeWidth: "12", fill: "none", strokeLinecap: "round", strokeDasharray: C, initial: {
              strokeDashoffset: C
            }, animate: {
              strokeDashoffset: C - dash
            }, transition: {
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1]
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-semibold tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: data.attendancePct, suffix: "%" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "attendance" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/student/scan", className: "mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "size-4" }),
          " Mark attendance"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.25
      }, className: "lg:col-span-2 rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Attendance trend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: data.last7Days, margin: {
          left: -20,
          top: 8
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "value", stroke: "var(--primary)", strokeWidth: 2.5, dot: {
            r: 3
          }, activeDot: {
            r: 5
          } })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: 0.3
    }, className: "rounded-2xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Recent attendance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/student/history", className: "text-xs text-primary hover:underline", children: "View all →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-border", children: [
        data.recentAttendance.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-5 py-10 text-center text-sm text-muted-foreground", children: "No attendance yet — scan a QR to begin." }),
        data.recentAttendance.map((s, i) => {
          const att = s.attendees.find((a) => a.studentId === me.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.li, { initial: {
            opacity: 0,
            x: -6
          }, animate: {
            opacity: 1,
            x: 0
          }, transition: {
            delay: 0.35 + i * 0.04
          }, className: "flex items-center gap-3 px-5 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 place-items-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-sm font-medium", children: [
                s.name,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
                  "· ",
                  s.subject
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                fmtDate(s.startTime),
                " · ",
                fmtTime(att.at)
              ] })
            ] })
          ] }, s.id);
        })
      ] })
    ] })
  ] });
}
export {
  StudentDashboard as component
};

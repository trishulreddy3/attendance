import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useApp, B as BRANCHES } from "./router-Ce1zj9WY.mjs";
import "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, b as Bar, P as PieChart, c as Pie, d as Cell } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
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
const PALETTE = ["var(--primary)", "color-mix(in oklab, var(--primary) 65%, white)", "color-mix(in oklab, var(--primary) 45%, white)", "color-mix(in oklab, var(--primary) 30%, white)", "color-mix(in oklab, var(--primary) 80%, black)", "color-mix(in oklab, var(--primary) 50%, black)", "color-mix(in oklab, var(--primary) 25%, black)"];
function Reports() {
  const {
    students,
    sessions
  } = useApp();
  const byBranch = BRANCHES.map((b) => {
    const total = students.filter((s) => s.branch === b).length;
    const attended = sessions.filter((s) => s.branch === b).reduce((a, s) => a + s.attendees.length, 0);
    return {
      branch: b,
      students: total,
      attendance: attended
    };
  });
  const subjectPie = Object.entries(sessions.reduce((acc, s) => {
    acc[s.subject || "Other"] = (acc[s.subject || "Other"] || 0) + s.attendees.length;
    return acc;
  }, {})).map(([name, value]) => ({
    name,
    value
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Reports" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Drill into attendance trends across branches and subjects." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "lg:col-span-2 rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Attendance by branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byBranch, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--border)", strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "branch", stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "attendance", fill: "var(--primary)", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.1
      }, className: "rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "By subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-72", children: subjectPie.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full place-items-center text-sm text-muted-foreground", children: "No data yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: subjectPie, dataKey: "value", nameKey: "name", innerRadius: 48, outerRadius: 88, paddingAngle: 3, children: subjectPie.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PALETTE[i % PALETTE.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12
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
      delay: 0.15
    }, className: "overflow-hidden rounded-2xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Session log" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Subject" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Attendees" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          sessions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-sm text-muted-foreground", children: "No sessions yet." }) }),
          sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: s.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-accent px-2 py-0.5 text-xs", children: s.branch }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: new Date(s.startTime).toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: s.attendees.length })
          ] }, s.id))
        ] })
      ] })
    ] })
  ] });
}
export {
  Reports as component
};

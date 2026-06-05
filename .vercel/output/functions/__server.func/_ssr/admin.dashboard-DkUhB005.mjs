import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as api } from "./router-CTeEyVFc.mjs";
import "../_libs/sonner.mjs";
import { V as Server, U as Users, G as GraduationCap, m as Radio, c as CircleCheck, K as Activity, J as UserPlus, W as Ellipsis, y as TrendingUp } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, b as Bar, P as PieChart, c as Pie, d as Cell } from "../_libs/recharts.mjs";
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
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
function AnimatedStatCard({
  title,
  value,
  icon,
  delay,
  trend,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 20
  }, animate: {
    opacity: 1,
    y: 0
  }, transition: {
    duration: 0.5,
    delay
  }, className: "relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 text-primary/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scale-75 opacity-70", children: icon }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-bold tracking-tight", children: value.toLocaleString() }),
          trend && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center text-xs font-medium text-emerald-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "mr-1 size-3" }),
            trend
          ] })
        ] })
      ] })
    ] }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: description })
  ] });
}
function AdminDashboard() {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.getAdminDashboard()
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-48 bg-muted rounded-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 bg-muted rounded-2xl" }, i)) })
    ] });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "size-12 text-destructive mx-auto opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive font-medium", children: "Failed to load dashboard data." })
    ] }) });
  }
  const activityData = data.activityData || [];
  const branchCounts = data.facultyList.reduce((acc, f) => {
    acc[f.branch] = (acc[f.branch] || 0) + 1;
    return acc;
  }, {});
  const branchData = Object.entries(branchCounts).map(([name, value]) => ({
    name,
    value
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: -20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-border p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 -translate-y-1/4 translate-x-1/4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-96 rounded-full bg-primary/10 blur-3xl" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight mb-2", children: "Welcome back, Admin 👋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground max-w-xl", children: "Here's what's happening in the Pulse Attendance System today. The system is running smoothly." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedStatCard, { title: "Total Faculty", value: data.totalFaculty, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-full" }), delay: 0.1, description: "Active teaching staff accounts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedStatCard, { title: "Total Students", value: data.totalStudents, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "size-full" }), delay: 0.2, description: "Registered student devices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedStatCard, { title: "Active Sessions", value: data.totalSessions, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-full" }), delay: 0.3, description: "Total attendance sessions created" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedStatCard, { title: "Total Pings", value: data.totalAttendance, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-full" }), delay: 0.4, description: "Successful attendance marks recorded" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.95
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        duration: 0.5,
        delay: 0.5
      }, className: "lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "size-5 text-primary" }),
            "Weekly Attendance Activity"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Number of attendances marked per day (Last 7 Days)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[300px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: activityData, margin: {
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "currentColor", className: "opacity-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", axisLine: false, tickLine: false, tick: {
            fontSize: 12
          }, className: "text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { axisLine: false, tickLine: false, tick: {
            fontSize: 12
          }, className: "text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: {
            fill: "rgba(var(--primary), 0.1)"
          }, contentStyle: {
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "var(--primary)", radius: [4, 4, 0, 0], maxBarSize: 50 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.95
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        duration: 0.5,
        delay: 0.6
      }, className: "rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Faculty by Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Distribution across departments" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-[250px] w-full mt-4", children: branchData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: branchData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: branchData.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)"
          } })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-muted-foreground text-sm", children: "No faculty data" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mt-4", children: branchData.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full", style: {
            backgroundColor: COLORS[i % COLORS.length]
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: b.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-medium", children: b.value })
        ] }, b.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      duration: 0.5,
      delay: 0.7
    }, className: "rounded-2xl border border-border bg-card shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border/50 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Faculty Directory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage system administrators and teaching staff." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/faculty", className: "inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 size-4" }),
          " Add Faculty"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/30 text-left text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Faculty Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Department" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/50", children: [
          data.facultyList.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 transition-colors group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold", children: f.name.substring(0, 2).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: f.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: f.email })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground", children: f.branch }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-muted-foreground", children: f.mobile }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-emerald-500" }),
              " Active"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "size-4" }) }) })
          ] }, f.id)),
          data.facultyList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "py-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-sm flex-col items-center justify-center text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-12 items-center justify-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-6 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg font-semibold", children: "No faculty members" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Get started by adding teaching staff to the system." })
          ] }) }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminDashboard as component
};

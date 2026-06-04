import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as api } from "./router-BMl-Hn6m.mjs";
import { S as StatCard } from "./StatCard-RViNGq2g.mjs";
import "../_libs/sonner.mjs";
import { c as Users, G as GraduationCap, R as Radio, j as CircleCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "./AnimatedCounter-B9TTyEne.mjs";
function AdminDashboard() {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.getAdminDashboard()
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground animate-pulse", children: "Loading dashboard data..." });
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-destructive", children: "Failed to load dashboard data" });
  if (!data) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "System Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "High-level statistics for the Pulse Attendance System." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Faculty", value: data.totalFaculty, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Students", value: data.totalStudents, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Sessions", value: data.totalSessions, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Attendances", value: data.totalAttendance, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-4", children: "Faculty Directory" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 text-left text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 font-medium text-right", children: "Mobile" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          data.facultyList.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: f.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: f.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary", children: f.branch }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: f.mobile })
          ] }, f.id)),
          data.facultyList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: "No faculty members found." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminDashboard as component
};

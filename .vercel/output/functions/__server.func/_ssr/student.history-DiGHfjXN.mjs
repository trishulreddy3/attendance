import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useApp } from "./router-3KK7MBxu.mjs";
import { a as fmtDate, f as fmtTime } from "./format-DWYTrrSZ.mjs";
import "../_libs/sonner.mjs";
import { F as Funnel, j as CircleCheck, m as CircleX } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
function HistoryPage() {
  const {
    sessions,
    currentStudent
  } = useApp();
  const me = currentStudent();
  const [subject, setSubject] = reactExports.useState("ALL");
  const [month, setMonth] = reactExports.useState("ALL");
  const data = reactExports.useMemo(() => {
    if (!me) return [];
    return sessions.filter((s) => s.branch === me.branch).map((s) => ({
      s,
      present: !!s.attendees.find((a) => a.studentId === me.id),
      at: s.attendees.find((a) => a.studentId === me.id)?.at
    })).filter((r) => subject === "ALL" ? true : r.s.subject === subject).filter((r) => {
      if (month === "ALL") return true;
      const d = new Date(r.s.startTime);
      return `${d.getFullYear()}-${d.getMonth()}` === month;
    }).sort((a, b) => +new Date(b.s.startTime) - +new Date(a.s.startTime));
  }, [sessions, me, subject, month]);
  const subjects = Array.from(new Set(sessions.map((s) => s.subject)));
  const months = Array.from(new Set(sessions.map((s) => {
    const d = new Date(s.startTime);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })));
  if (!me) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Attendance history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Every class, every scan, all in one place." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: subject, onChange: (e) => setSubject(e.target.value), className: "h-9 rounded-md border border-input bg-card px-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All subjects" }),
        subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: month, onChange: (e) => setMonth(e.target.value), className: "h-9 rounded-md border border-input bg-card px-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All months" }),
        months.map((m) => {
          const [y, mo] = m.split("-").map(Number);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: new Date(y, mo).toLocaleDateString([], {
            month: "long",
            year: "numeric"
          }) }, m);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "relative ml-3 border-l border-border", children: [
      data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "py-12 text-center text-sm text-muted-foreground", children: "No records." }),
      data.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.li, { initial: {
        opacity: 0,
        x: -10
      }, whileInView: {
        opacity: 1,
        x: 0
      }, viewport: {
        once: true,
        margin: "-40px"
      }, transition: {
        delay: Math.min(i, 6) * 0.04
      }, className: "relative pl-6 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -left-[7px] top-2 size-3 rounded-full ring-4 ring-background ${r.present ? "bg-success" : "bg-destructive"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: r.s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                r.s.subject,
                " · ",
                fmtDate(r.s.startTime),
                " · ",
                fmtTime(r.s.startTime)
              ] })
            ] }),
            r.present ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3" }),
              " Present"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-3" }),
              " Absent"
            ] })
          ] }),
          r.at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Marked at ",
            fmtTime(r.at)
          ] })
        ] })
      ] }, r.s.id))
    ] })
  ] });
}
export {
  HistoryPage as component
};

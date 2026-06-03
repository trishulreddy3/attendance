import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { M as Modal } from "./Modal-DpPPOXPU.mjs";
import { u as useApp, B as BRANCHES } from "./router-Ce1zj9WY.mjs";
import { t as toLocalInput, d as durationLabel, a as fmtDate, f as fmtTime } from "./format-DWYTrrSZ.mjs";
import { o as Plus, u as Calendar, v as Clock, Q as QrCode } from "../_libs/lucide-react.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const TYPE_LABELS = {
  single: "Single Period",
  multiple: "Multiple Periods",
  half: "Half Day",
  full: "Full Day"
};
function defaultEndFor(type, start) {
  const e = new Date(start);
  if (type === "single") e.setMinutes(e.getMinutes() + 50);
  else if (type === "multiple") e.setHours(e.getHours() + 2);
  else if (type === "half") e.setHours(e.getHours() + 4);
  else e.setHours(e.getHours() + 7);
  return e;
}
function SessionsPage() {
  const {
    sessions,
    createSession
  } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = reactExports.useState(false);
  const [filter, setFilter] = reactExports.useState("all");
  const now = /* @__PURE__ */ new Date();
  now.setMinutes(0, 0, 0);
  const [form, setForm] = reactExports.useState({
    name: "",
    subject: "",
    branch: "CSE",
    type: "single",
    startTime: toLocalInput(now),
    endTime: toLocalInput(defaultEndFor("single", now))
  });
  const onType = (type) => {
    const start = new Date(form.startTime);
    setForm({
      ...form,
      type,
      endTime: toLocalInput(defaultEndFor(type, start))
    });
  };
  const onStart = (v) => {
    const start = new Date(v);
    setForm({
      ...form,
      startTime: v,
      endTime: toLocalInput(defaultEndFor(form.type, start))
    });
  };
  const duration = reactExports.useMemo(() => durationLabel(new Date(form.startTime).toISOString(), new Date(form.endTime).toISOString()), [form.startTime, form.endTime]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.subject) {
      toast.error("Add a name & subject");
      return;
    }
    const s = await createSession({
      name: form.name,
      subject: form.subject,
      branch: form.branch,
      type: form.type,
      startTime: form.startTime + ":00",
      // Send exact local time (e.g. "2026-06-03T09:30:00")
      endTime: form.endTime + ":00"
    });
    toast.success("Session created");
    setOpen(false);
    nav({
      to: "/faculty/sessions/$id",
      params: {
        id: s.id
      }
    });
  };
  const sorted = [...sessions].sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Spin up a QR-powered attendance session in seconds." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen(true), className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " New session"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit", children: ["all", "active", "ended"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${filter === f ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`, children: f }, f)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3", children: [
      sorted.filter((s) => {
        if (filter === "all") return true;
        const isLive = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
        return filter === "active" ? isLive : !isLive;
      }).map((s, i) => {
        const live = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: i * 0.04
        }, whileHover: {
          y: -2
        }, className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold tracking-tight", children: s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                s.subject,
                " · ",
                s.branch
              ] })
            ] }),
            live ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex size-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-success/70" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative size-1.5 rounded-full bg-success" })
              ] }),
              "Live"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground", children: TYPE_LABELS[s.type] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-3.5" }),
              " ",
              fmtDate(s.startTime)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5" }),
              " ",
              fmtTime(s.startTime),
              " → ",
              fmtTime(s.endTime)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              s.attendees.length,
              " present"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/faculty/sessions/$id", params: {
              id: s.id
            }, className: "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "size-3.5" }),
              " Open"
            ] })
          ] })
        ] }, s.id);
      }),
      sorted.filter((s) => {
        if (filter === "all") return true;
        const isLive = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
        return filter === "active" ? isLive : !isLive;
      }).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-12 place-items-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "size-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-medium", children: "No sessions found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Try changing your filters or create a new session." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open, onClose: () => setOpen(false), title: "New attendance session", width: 560, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Session name", value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }), placeholder: "Morning Lecture", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subject", value: form.subject, onChange: (e) => setForm({
          ...form,
          subject: e.target.value
        }), placeholder: "Operating Systems", required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.branch, onChange: (e) => setForm({
            ...form,
            branch: e.target.value
          }), className: "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm", children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: "Session type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.type, onChange: (e) => onType(e.target.value), className: "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm", children: Object.keys(TYPE_LABELS).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: TYPE_LABELS[t] }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Start time", type: "datetime-local", value: form.startTime, onChange: (e) => onStart(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "End time", type: "datetime-local", value: form.endTime, onChange: (e) => setForm({
          ...form,
          endTime: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, className: "flex items-center gap-3 rounded-xl border border-border bg-accent/40 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-lg bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Session duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: duration })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setOpen(false), className: "rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "size-4" }),
          " Generate QR"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SessionsPage as component
};

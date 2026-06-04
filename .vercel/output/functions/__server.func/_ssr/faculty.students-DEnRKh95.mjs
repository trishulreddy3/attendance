import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { M as Modal } from "./Modal-DpPPOXPU.mjs";
import { u as useApp, B as BRANCHES } from "./router-3KK7MBxu.mjs";
import { P as Plus, o as Search, p as Pencil, q as Trash2, r as UserPlus, l as LoaderCircle } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
import "../_libs/isbot.mjs";
import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const empty = {
  name: "",
  studentId: "",
  mobile: "",
  email: "",
  branch: "CSE",
  password: ""
};
function StudentsPage() {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent
  } = useApp();
  const [q, setQ] = reactExports.useState("");
  const [branch, setBranch] = reactExports.useState("ALL");
  const [page, setPage] = reactExports.useState(1);
  const perPage = 8;
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(empty);
  const [confirmId, setConfirmId] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const filtered = reactExports.useMemo(() => {
    return students.filter((s) => {
      const matchQ = !q || [s.name, s.studentId, s.email].some((x) => x.toLowerCase().includes(q.toLowerCase()));
      const matchB = branch === "ALL" || s.branch === branch;
      return matchQ && matchB;
    });
  }, [students, q, branch]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);
  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      studentId: s.studentId,
      mobile: s.mobile,
      email: s.email,
      branch: s.branch,
      password: s.password
    });
    setOpen(true);
  };
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (editing) {
        await updateStudent(editing.id, form);
        toast.success("Student updated");
      } else {
        const r = await addStudent(form);
        if (!r.ok) {
          toast.error(r.error ?? "Failed");
          return;
        }
        toast.success("Student added");
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Students" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          students.length,
          " enrolled across ",
          new Set(students.map((s) => s.branch)).size,
          " branches."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: startCreate, className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " Add student"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-10 flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => {
          setQ(e.target.value);
          setPage(1);
        }, placeholder: "Search by name, ID, email", className: "h-full w-full bg-transparent text-sm outline-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: branch, onChange: (e) => {
        setBranch(e.target.value);
        setPage(1);
      }, className: "h-10 rounded-lg border border-input bg-card px-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All branches" }),
        BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layout: true, className: "overflow-hidden rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Student" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium hidden md:table-cell", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium hidden lg:table-cell", children: "Mobile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: slice.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.tr, { layout: true, initial: {
          opacity: 0,
          y: 4
        }, animate: {
          opacity: 1,
          y: 0
        }, exit: {
          opacity: 0
        }, transition: {
          delay: i * 0.02
        }, className: "border-t border-border hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: s.name[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: s.name })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: s.studentId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground hidden md:table-cell", children: s.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground hidden lg:table-cell", children: s.mobile }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground", children: s.branch }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => startEdit(s), className: "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground", "aria-label": "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmId(s.id), className: "rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive", "aria-label": "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] }) })
        ] }, s.id)) }),
        slice.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 6, className: "px-4 py-16 text-center text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-12 place-items-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-medium text-foreground", children: "No students found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Try adjusting your filters or add a new student." })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Showing ",
        slice.length,
        " of ",
        filtered.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, className: "rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent", children: "Prev" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2", children: [
          page,
          " / ",
          pages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPage((p) => Math.min(pages, p + 1)), disabled: page === pages, className: "rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent", children: "Next" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open, onClose: () => setOpen(false), title: editing ? "Edit student" : "Add student", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Student ID", value: form.studentId, onChange: (e) => setForm({
          ...form,
          studentId: e.target.value
        }), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile", maxLength: 10, value: form.mobile, onChange: (e) => setForm({
          ...form,
          mobile: e.target.value.replace(/\D/g, "")
        }), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: form.email, onChange: (e) => setForm({
        ...form,
        email: e.target.value
      }), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: "Branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.branch, onChange: (e) => setForm({
            ...form,
            branch: e.target.value
          }), className: "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm", children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "text", value: form.password, onChange: (e) => setForm({
          ...form,
          password: e.target.value
        }), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setOpen(false), disabled: loading, className: "rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50", children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          editing ? loading ? "Saving..." : "Save" : loading ? "Adding..." : "Add"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal, { open: !!confirmId, onClose: () => setConfirmId(null), title: "Delete student?", width: 380, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will permanently remove the student record. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmId(null), className: "rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          await deleteStudent(confirmId);
          setConfirmId(null);
          toast.success("Student deleted");
        }, className: "rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90", children: "Delete" })
      ] })
    ] })
  ] });
}
export {
  StudentsPage as component
};

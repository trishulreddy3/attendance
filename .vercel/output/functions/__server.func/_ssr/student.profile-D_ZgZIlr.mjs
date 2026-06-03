import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { u as useApp } from "./router-Ce1zj9WY.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
function StudentProfile() {
  const {
    currentStudent,
    updateSelfStudent
  } = useApp();
  const me = currentStudent();
  const [form, setForm] = reactExports.useState({
    name: me?.name ?? "",
    mobile: me?.mobile ?? "",
    email: me?.email ?? ""
  });
  if (!me) return null;
  const save = (e) => {
    e.preventDefault();
    updateSelfStudent(form);
    toast.success("Profile updated");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Keep your details up to date." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "rounded-2xl border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-16 place-items-center rounded-full bg-primary/15 text-2xl font-semibold text-primary", children: me.name[0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: me.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            me.studentId,
            " · ",
            me.branch
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "mt-6 grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile", maxLength: 10, value: form.mobile, onChange: (e) => setForm({
          ...form,
          mobile: e.target.value.replace(/\D/g, "")
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: form.email, onChange: (e) => setForm({
          ...form,
          email: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Branch", value: me.branch, disabled: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Save changes" }) })
      ] })
    ] })
  ] });
}
export {
  StudentProfile as component
};

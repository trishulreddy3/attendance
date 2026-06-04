import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { u as useApp, A as AuthShell } from "./router-3KK7MBxu.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { I as IdCard, M as Mail, E as EyeOff, a as Eye, L as Lock } from "../_libs/lucide-react.mjs";
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
function StudentLoginPage() {
  const {
    user,
    loginStudent
  } = useApp();
  const nav = useNavigate();
  const [studentId, setStudentId] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [show, setShow] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState();
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (user) {
      nav({
        to: user.kind === "faculty" ? "/faculty/dashboard" : "/student/dashboard"
      });
    }
  }, [user, nav]);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await loginStudent(studentId, password);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    toast.success("Welcome back");
    nav({
      to: "/student/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.form, { onSubmit: submit, initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, transition: {
    duration: 0.4
  }, className: "w-full max-w-sm space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Student sign in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Use credentials shared by your faculty." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Student ID", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(IdCard, {}), value: studentId, onChange: (e) => setStudentId(e.target.value), placeholder: "S101" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {}), value: email, onChange: (e) => setEmail(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}), type: show ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), error: err, rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "text-muted-foreground hover:text-foreground", children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60", children: busy ? "Signing in…" : "Sign in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "Faculty? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Go to faculty login" }),
      " | ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin-login", className: "text-primary hover:underline", children: "Admin Login" })
    ] })
  ] }) });
}
export {
  StudentLoginPage as component
};

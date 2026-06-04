import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { L as Logo, u as useApp } from "./router-BMl-Hn6m.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { M as Mail, E as EyeOff, a as Eye, L as Lock } from "../_libs/lucide-react.mjs";
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
function LoginPage() {
  const {
    user,
    loginFaculty
  } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [show, setShow] = reactExports.useState(false);
  const [remember, setRemember] = reactExports.useState(true);
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
    setErr(void 0);
    setBusy(true);
    const r = await loginFaculty(email, password);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    toast.success("Welcome back");
    nav({
      to: "/faculty/dashboard"
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Welcome back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to your faculty account." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {}), placeholder: "you@college.edu", required: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: show ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}), required: true, error: err, rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "text-muted-foreground hover:text-foreground", children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: remember, onChange: (e) => setRemember(e.target.checked), className: "size-3.5 accent-[var(--primary)]" }),
        "Remember me"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toast("Reset link sent"), className: "text-primary hover:underline", children: "Forgot password?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "relative h-10 w-full overflow-hidden rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60", children: busy ? "Signing in…" : "Sign in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "Student? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/student-login", className: "text-foreground hover:underline", children: "Sign in here" })
    ] })
  ] }) });
}
function AuthShell({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-screen md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
      children
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_60%),radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.96
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        duration: 0.7
      }, className: "max-w-sm rounded-3xl border border-border bg-card/70 p-6 backdrop-blur", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-primary", children: "Live" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xl font-semibold tracking-tight", children: '"Attendance dropped from 8 minutes to under 30 seconds."' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "— Faculty, Computer Science" })
      ] }) })
    ] })
  ] });
}
export {
  AuthShell,
  LoginPage as component
};

import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { u as useApp, A as AuthShell, B as BRANCHES } from "./router-CzkqOVHL.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { U as User, P as Phone, M as Mail, E as EyeOff, a as Eye, L as Lock } from "../_libs/lucide-react.mjs";
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
function SignupPage() {
  const {
    signupFaculty
  } = useApp();
  const nav = useNavigate();
  const [f, setF] = reactExports.useState({
    name: "",
    mobile: "",
    email: "",
    branch: "CSE",
    password: "",
    confirm: ""
  });
  const [show, setShow] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\d{10}$/.test(f.mobile)) e.mobile = "Enter a 10-digit mobile";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
    if (f.password.length < 8) e.password = "Min 8 characters";
    if (f.password !== f.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    await new Promise((r2) => setTimeout(r2, 600));
    const r = await signupFaculty({
      name: f.name,
      mobile: f.mobile,
      email: f.email,
      branch: f.branch,
      password: f.password
    });
    setBusy(false);
    if (!r.ok) {
      setErrors({
        email: r.error || "Failed to create account"
      });
      return;
    }
    toast.success("Account created");
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Create your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Faculty access — manage students & sessions." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, {}), value: f.name, onChange: (e) => setF({
      ...f,
      name: e.target.value
    }), error: errors.name, placeholder: "Dr. Anika Mehra" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {}), value: f.mobile, maxLength: 10, onChange: (e) => setF({
        ...f,
        mobile: e.target.value.replace(/\D/g, "")
      }), error: errors.mobile, placeholder: "9876543210" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-xs font-medium text-muted-foreground", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: f.branch, onChange: (e) => setF({
          ...f,
          branch: e.target.value
        }), className: "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15", children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {}), value: f.email, onChange: (e) => setF({
      ...f,
      email: e.target.value
    }), error: errors.email, placeholder: "you@college.edu" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}), type: show ? "text" : "password", value: f.password, onChange: (e) => setF({
      ...f,
      password: e.target.value
    }), error: errors.password, rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "text-muted-foreground hover:text-foreground", children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}), type: show ? "text" : "password", value: f.confirm, onChange: (e) => setF({
      ...f,
      confirm: e.target.value
    }), error: errors.confirm }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60", children: busy ? "Creating…" : "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "Already have an account? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Sign in" })
    ] })
  ] }) });
}
export {
  SignupPage as component
};

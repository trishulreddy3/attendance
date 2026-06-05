import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { u as useApp, A as AuthShell } from "./router-CTeEyVFc.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { o as ShieldCheck, g as Mail, h as EyeOff, E as Eye, i as Lock } from "../_libs/lucide-react.mjs";
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
function AdminLoginPage() {
  const {
    user,
    loginAdmin
  } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [show, setShow] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState();
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (user) {
      if (user.kind === "admin") nav({
        to: "/admin/dashboard"
      });
      else if (user.kind === "faculty") nav({
        to: "/faculty/dashboard"
      });
      else nav({
        to: "/student/dashboard"
      });
    }
  }, [user, nav]);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(void 0);
    setBusy(true);
    const r = await loginAdmin(email, password);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    toast.success("Welcome, Admin");
    nav({
      to: "/admin/dashboard"
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 w-fit text-xs font-medium text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3.5" }),
      " Admin Portal"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "System Administration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in with your administrative credentials." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, {}), placeholder: "admin@college.edu", required: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: show ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}), required: true, error: err, rightSlot: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "text-muted-foreground hover:text-foreground", children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: busy, className: "mt-4 relative h-10 w-full overflow-hidden rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60", children: busy ? "Authenticating…" : "Secure Sign In" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-foreground hover:underline", children: "Return to home" }) })
  ] }) });
}
export {
  AdminLoginPage as component
};

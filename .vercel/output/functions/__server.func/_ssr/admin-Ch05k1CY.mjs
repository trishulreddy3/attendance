import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useLocation, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-Dg4atMlS.mjs";
import { u as useApp } from "./router-BMl-Hn6m.mjs";
import "../_libs/sonner.mjs";
import { b as LayoutDashboard, c as Users, G as GraduationCap } from "../_libs/lucide-react.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/stomp__stompjs.mjs";
const NAV = [{
  to: "/admin/dashboard",
  label: "Dashboard",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, {})
}, {
  to: "/admin/faculty",
  label: "Faculty",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, {})
}, {
  to: "/admin/students",
  label: "Students",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, {})
}];
const TITLES = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/faculty": "Manage Faculty",
  "/admin/students": "Manage Students"
};
function AdminLayout() {
  const {
    user,
    loading
  } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) nav({
      to: "/admin-login"
    });
    else if (user.kind !== "admin") nav({
      to: "/"
    });
  }, [user, nav, loading]);
  if (loading || !user) return null;
  const title = TITLES[loc.pathname] ?? "Admin Portal";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { nav: NAV, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  AdminLayout as component
};

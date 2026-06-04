import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useLocation, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-Dg4atMlS.mjs";
import { u as useApp } from "./router-BMl-Hn6m.mjs";
import "../_libs/sonner.mjs";
import { b as LayoutDashboard, c as Users, R as Radio, C as ChartColumn, U as User } from "../_libs/lucide-react.mjs";
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
  to: "/faculty/dashboard",
  label: "Dashboard",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, {})
}, {
  to: "/faculty/students",
  label: "Students",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, {})
}, {
  to: "/faculty/sessions",
  label: "Sessions",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {})
}, {
  to: "/faculty/reports",
  label: "Reports",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, {})
}, {
  to: "/faculty/profile",
  label: "Profile",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, {})
}];
const TITLES = {
  "/faculty/dashboard": "Dashboard",
  "/faculty/students": "Students",
  "/faculty/sessions": "Sessions",
  "/faculty/reports": "Reports",
  "/faculty/profile": "Profile"
};
function FacultyLayout() {
  const {
    user,
    loading
  } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) nav({
      to: "/login"
    });
    else if (user.kind !== "faculty") nav({
      to: "/student/dashboard"
    });
  }, [user, nav, loading]);
  if (loading || !user) return null;
  const title = TITLES[loc.pathname] ?? (loc.pathname.includes("/sessions/") ? "Live session" : "Pulse");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { nav: NAV, title, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
export {
  FacultyLayout as component
};

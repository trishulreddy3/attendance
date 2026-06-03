import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { C as Client } from "../_libs/stomp__stompjs.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const appCss = "/assets/styles-BqVGAro6.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE = isLocal ? "http://localhost:8080/api" : "https://attendance-dhvi.onrender.com/api";
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sas.jwt");
}
function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("sas.jwt", token);
  else localStorage.removeItem("sas.jwt");
}
async function fetchApi(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(data && data.error || data.message || res.statusText);
  }
  return data;
}
const api = {
  // Auth
  registerFaculty: (data) => fetchApi("/auth/register/faculty", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchApi("/auth/me", { method: "GET" }),
  changePassword: (data) => fetchApi("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
  // Faculty
  getFacultyProfile: () => fetchApi("/faculty/profile", { method: "GET" }),
  updateFacultyProfile: (data) => fetchApi("/faculty/profile", { method: "PUT", body: JSON.stringify(data) }),
  getFacultyDashboard: () => fetchApi("/faculty/dashboard", { method: "GET" }),
  getFacultyReports: () => fetchApi("/faculty/reports", { method: "GET" }),
  // Students
  createStudent: (data) => fetchApi("/students", { method: "POST", body: JSON.stringify(data) }),
  getAllStudents: () => fetchApi("/students", { method: "GET" }),
  getStudent: (id) => fetchApi(`/students/${id}`, { method: "GET" }),
  updateStudent: (id, data) => fetchApi(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id) => fetchApi(`/students/${id}`, { method: "DELETE" }),
  searchStudents: (q, branch) => fetchApi(`/students/search?q=${q}&branch=${branch}`, { method: "GET" }),
  getStudentsByBranch: (branch) => fetchApi(`/students/branch/${branch}`, { method: "GET" }),
  getStudentAttendance: (id) => fetchApi(`/students/${id}/attendance`, { method: "GET" }),
  getStudentDashboard: (id) => fetchApi(`/students/${id}/statistics`, { method: "GET" }),
  // Sessions
  createSession: (data) => fetchApi("/sessions", { method: "POST", body: JSON.stringify(data) }),
  getFacultySessions: () => fetchApi("/sessions", { method: "GET" }),
  getSession: (id) => fetchApi(`/sessions/${id}`, { method: "GET" }),
  updateSession: (id, data) => fetchApi(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSession: (id) => fetchApi(`/sessions/${id}`, { method: "DELETE" }),
  startSession: (id) => fetchApi(`/sessions/${id}/start`, { method: "POST" }),
  endSession: (id) => fetchApi(`/sessions/${id}/end`, { method: "POST" }),
  getActiveSessions: (branch) => fetchApi(`/sessions/active/${branch}`, { method: "GET" }),
  getSessionAttendance: (id) => fetchApi(`/sessions/${id}/attendance`, { method: "GET" }),
  markAttendance: (id, data) => fetchApi(`/sessions/${id}/attendance`, { method: "POST", body: JSON.stringify(data) }),
  refreshQr: (id) => fetchApi(`/sessions/${id}/qr/refresh`, { method: "POST" })
};
const BRANCHES = ["AIML", "CSE", "AI", "AIDS", "IT", "MECH", "CIVIL"];
const AppCtx = reactExports.createContext(null);
function AppProvider({ children }) {
  const [state, setState] = reactExports.useState({ faculties: [], students: [], sessions: [], user: null, loading: true });
  const update = (patch) => setState((s) => typeof patch === "function" ? patch(s) : { ...s, ...patch });
  const stompClient = reactExports.useRef(null);
  const setupWebSockets = (sessions) => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }
    const client = new Client({
      brokerURL: window.location.hostname === "localhost" ? "ws://localhost:8080/ws" : "wss://attendance-dhvi.onrender.com/ws",
      reconnectDelay: 5e3,
      heartbeatIncoming: 4e3,
      heartbeatOutgoing: 4e3,
      onConnect: () => {
        sessions.forEach((s) => {
          client.subscribe(`/topic/session/${s.id}/attendance`, (msg) => {
            const dto = JSON.parse(msg.body);
            update((cur) => ({
              ...cur,
              sessions: cur.sessions.map(
                (x) => x.id === s.id ? { ...x, attendees: [...x.attendees.filter((a) => a.studentId !== dto.studentId), { studentId: dto.studentId, at: dto.at }] } : x
              )
            }));
          });
          client.subscribe(`/topic/session/${s.id}/qr`, (msg) => {
            const newToken = msg.body;
            update((cur) => ({
              ...cur,
              sessions: cur.sessions.map(
                (x) => x.id === s.id ? { ...x, qrToken: newToken } : x
              )
            }));
          });
        });
      }
    });
    client.activate();
    stompClient.current = client;
  };
  const refreshData = async () => {
    try {
      if (!getToken()) {
        update({ loading: false });
        if (stompClient.current) stompClient.current.deactivate();
        return;
      }
      const me = await api.getMe();
      const kind = me.studentId ? "student" : "faculty";
      update({ user: { kind, id: me.id } });
      if (kind === "faculty") {
        update({ faculties: [me] });
        const [students, sessions] = await Promise.all([
          api.getAllStudents(),
          api.getFacultySessions()
        ]);
        update({ students, sessions });
        setupWebSockets(sessions.filter((s) => new Date(s.endTime).getTime() >= Date.now()));
      } else {
        update({ students: [me] });
        const data = await api.getActiveSessions(me.branch);
        update({ sessions: data });
        setupWebSockets(data);
      }
    } catch (e) {
      console.error(e);
      setToken(null);
      update({ user: null });
      if (stompClient.current) stompClient.current.deactivate();
    } finally {
      update({ loading: false });
    }
  };
  reactExports.useEffect(() => {
    refreshData();
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);
  const ctx = {
    ...state,
    refreshData,
    signupFaculty: async (f) => {
      try {
        const res = await api.registerFaculty(f);
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    loginFaculty: async (email, password) => {
      try {
        const res = await api.login({ username: email, password, kind: "faculty" });
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    loginStudent: async (studentId, password) => {
      try {
        const res = await api.login({ username: studentId, password, kind: "student" });
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    logout: () => {
      setToken(null);
      update({ user: null, faculties: [], students: [], sessions: [] });
    },
    addStudent: async (s) => {
      try {
        const ns = await api.createStudent(s);
        update((cur) => ({ ...cur, students: [...cur.students, ns] }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    updateStudent: async (id, p) => {
      const ns = await api.updateStudent(id, p);
      update((cur) => ({ ...cur, students: cur.students.map((x) => x.id === id ? ns : x) }));
    },
    deleteStudent: async (id) => {
      await api.deleteStudent(id);
      update((cur) => ({ ...cur, students: cur.students.filter((x) => x.id !== id) }));
    },
    createSession: async (s) => {
      const ns = await api.createSession(s);
      await refreshData();
      return ns;
    },
    refreshQr: async (sessionId) => {
      const res = await api.refreshQr(sessionId);
      update((cur) => ({
        ...cur,
        sessions: cur.sessions.map((x) => x.id === sessionId ? { ...x, qrToken: res.qrToken } : x)
      }));
    },
    markAttendance: async (sessionId, studentId, qrToken, lat, lng) => {
      try {
        await api.markAttendance(sessionId, { sessionId, qrToken, latitude: lat, longitude: lng });
        update((cur) => ({
          ...cur,
          sessions: cur.sessions.map(
            (x) => x.id === sessionId ? { ...x, attendees: [...x.attendees, { studentId, at: (/* @__PURE__ */ new Date()).toISOString() }] } : x
          )
        }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },
    currentFaculty: () => state.user?.kind === "faculty" ? state.faculties.find((f) => f.id === state.user.id) ?? null : null,
    currentStudent: () => state.user?.kind === "student" ? state.students.find((f) => f.id === state.user.id) ?? null : null,
    updateFaculty: async (id, p) => {
      const nf = await api.updateFacultyProfile(p);
      update((cur) => ({ ...cur, faculties: cur.faculties.map((x) => x.id === id ? nf : x) }));
    },
    updateSelfStudent: async (p) => {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppCtx.Provider, { value: ctx, children });
}
function useApp() {
  const c = reactExports.useContext(AppCtx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
const Ctx = reactExports.createContext(null);
function ThemeProvider({ children }) {
  const [theme, setTheme] = reactExports.useState("light");
  reactExports.useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    const initial = saved ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);
  reactExports.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value: { theme, toggle: () => setTheme((t) => t === "dark" ? "light" : "dark") }, children });
}
function useTheme() {
  const c = reactExports.useContext(Ctx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    if (error.message.includes("Failed to fetch dynamically imported module") || error.message.includes("Importing a module script failed")) {
      window.location.reload();
      return;
    }
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong. Try again or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent", children: "Go home" })
    ] })
  ] }) });
}
const Route$g = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pulse — Smart Attendance" },
      { name: "description", content: "A modern smart attendance system for colleges." }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$g.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AppProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) }) });
}
const $$splitComponentImporter$f = () => import("./student-login-B2g0NEhl.mjs");
const Route$f = createFileRoute("/student-login")({
  head: () => ({
    meta: [{
      title: "Student Login — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./student-4K2DS8Mp.mjs");
const Route$e = createFileRoute("/student")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./signup-CUVgymHx.mjs");
const Route$d = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Faculty Signup — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
function Logo({ size = 28 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { rotate: -20, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        transition: { type: "spring", stiffness: 180, damping: 14 },
        className: "relative rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)]",
        style: { width: size, height: size },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", width: size * 0.6, height: size * 0.6, fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 7h4v4H4zM4 13h4v4H4zM10 7h4v4h-4zM16 7h4v4h-4zM10 13h10v4H10z" }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold tracking-tight", children: [
      "Pulse",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "." })
    ] })
  ] });
}
const $$splitComponentImporter$c = () => import("./login-C7o7yn4e.mjs");
const Route$c = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Faculty Login — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
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
const $$splitComponentImporter$b = () => import("./faculty-sM_isjOW.mjs");
const Route$b = createFileRoute("/faculty")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-CtxVDE5v.mjs");
const Route$a = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Pulse — Smart Attendance for Modern Campuses"
    }, {
      name: "description",
      content: "QR + geo-verified attendance that students and faculty actually love."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./student.scan-CWk-zeAa.mjs");
const Route$9 = createFileRoute("/student/scan")({
  head: () => ({
    meta: [{
      title: "Scan QR — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./student.profile-DxMWXHc-.mjs");
const Route$8 = createFileRoute("/student/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./student.history-DeUe_7Qa.mjs");
const Route$7 = createFileRoute("/student/history")({
  head: () => ({
    meta: [{
      title: "History — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./student.dashboard-CYOaRsE_.mjs");
const Route$6 = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [{
      title: "My attendance — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./faculty.students-ByiNGMEn.mjs");
const Route$5 = createFileRoute("/faculty/students")({
  head: () => ({
    meta: [{
      title: "Students — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./faculty.reports-CXW-BkOt.mjs");
const Route$4 = createFileRoute("/faculty/reports")({
  head: () => ({
    meta: [{
      title: "Reports — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./faculty.profile-Ccw5BAlx.mjs");
const Route$3 = createFileRoute("/faculty/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./faculty.dashboard-B1Y39h6P.mjs");
const Route$2 = createFileRoute("/faculty/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./faculty.sessions.index-BvIecepi.mjs");
const Route$1 = createFileRoute("/faculty/sessions/")({
  head: () => ({
    meta: [{
      title: "Sessions — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./faculty.sessions._id-ByeeG_Eh.mjs");
const Route = createFileRoute("/faculty/sessions/$id")({
  head: () => ({
    meta: [{
      title: "Live Session — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const StudentLoginRoute = Route$f.update({
  id: "/student-login",
  path: "/student-login",
  getParentRoute: () => Route$g
});
const StudentRoute = Route$e.update({
  id: "/student",
  path: "/student",
  getParentRoute: () => Route$g
});
const SignupRoute = Route$d.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$g
});
const LoginRoute = Route$c.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$g
});
const FacultyRoute = Route$b.update({
  id: "/faculty",
  path: "/faculty",
  getParentRoute: () => Route$g
});
const IndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$g
});
const StudentScanRoute = Route$9.update({
  id: "/scan",
  path: "/scan",
  getParentRoute: () => StudentRoute
});
const StudentProfileRoute = Route$8.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => StudentRoute
});
const StudentHistoryRoute = Route$7.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => StudentRoute
});
const StudentDashboardRoute = Route$6.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => StudentRoute
});
const FacultyStudentsRoute = Route$5.update({
  id: "/students",
  path: "/students",
  getParentRoute: () => FacultyRoute
});
const FacultyReportsRoute = Route$4.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => FacultyRoute
});
const FacultyProfileRoute = Route$3.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => FacultyRoute
});
const FacultyDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => FacultyRoute
});
const FacultySessionsIndexRoute = Route$1.update({
  id: "/sessions/",
  path: "/sessions/",
  getParentRoute: () => FacultyRoute
});
const FacultySessionsIdRoute = Route.update({
  id: "/sessions/$id",
  path: "/sessions/$id",
  getParentRoute: () => FacultyRoute
});
const FacultyRouteChildren = {
  FacultyDashboardRoute,
  FacultyProfileRoute,
  FacultyReportsRoute,
  FacultyStudentsRoute,
  FacultySessionsIdRoute,
  FacultySessionsIndexRoute
};
const FacultyRouteWithChildren = FacultyRoute._addFileChildren(FacultyRouteChildren);
const StudentRouteChildren = {
  StudentDashboardRoute,
  StudentHistoryRoute,
  StudentProfileRoute,
  StudentScanRoute
};
const StudentRouteWithChildren = StudentRoute._addFileChildren(StudentRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  FacultyRoute: FacultyRouteWithChildren,
  LoginRoute,
  SignupRoute,
  StudentRoute: StudentRouteWithChildren,
  StudentLoginRoute
};
const routeTree = Route$g._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AuthShell as A,
  BRANCHES as B,
  Logo as L,
  useTheme as a,
  api as b,
  router as r,
  useApp as u
};

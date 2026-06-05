import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent, d as useParams } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { C as Client } from "../_libs/stomp__stompjs.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { B as BookOpen, U as Users, C as Calendar, L as LoaderCircle, a as ChevronRight, A as ArrowLeft, R as RefreshCw, D as Download, S as Search, M as Minus, b as CircleX, c as CircleCheck, F as FileSpreadsheet, P as Plus, G as GraduationCap, E as Eye, T as Trash2, d as ChevronLeft, X, e as CircleAlert, f as Upload } from "../_libs/lucide-react.mjs";
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
const appCss = "/assets/styles-DQvD8bMB.css";
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
const API_BASE = "https://attendance-dhvi.onrender.com/api";
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
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...!isFormData ? { "Content-Type": "application/json" } : {},
    ...options.headers
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data && data.error || data.message || res.statusText);
  return data;
}
async function fetchBlob(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error("Download failed: " + res.statusText);
  return res.blob();
}
const api = {
  // Auth
  login: (data) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchApi("/auth/me", { method: "GET" }),
  changePassword: (data) => fetchApi("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
  // Admin
  getAdminDashboard: () => fetchApi("/admin/dashboard", { method: "GET" }),
  addFaculty: (data) => fetchApi("/admin/faculty", { method: "POST", body: JSON.stringify(data) }),
  getAllFaculty: () => fetchApi("/admin/faculty", { method: "GET" }),
  updateFaculty: (id, data) => fetchApi(`/admin/faculty/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFaculty: (id) => fetchApi(`/admin/faculty/${id}`, { method: "DELETE" }),
  getAllStudentsAdmin: () => fetchApi("/admin/students", { method: "GET" }),
  resetStudentDevice: (id) => fetchApi(`/admin/students/${id}/reset-device`, { method: "POST" }),
  // Admin — Batch Module
  getAllBatches: () => fetchApi("/admin/batch", { method: "GET" }),
  getBatch: (id) => fetchApi(`/admin/batch/${id}`, { method: "GET" }),
  createBatch: (formData) => fetchApi("/admin/batch", { method: "POST", body: formData }),
  getBatchStudents: (id) => fetchApi(`/admin/batch/${id}/students`, { method: "GET" }),
  getAdminBatchAttendance: (id) => fetchApi(`/admin/batch/${id}/attendance`, { method: "GET" }),
  downloadAttendanceReport: (id) => fetchBlob(`/admin/batch/${id}/report/download`),
  downloadBatchTemplate: () => fetchBlob("/admin/batch/template"),
  deleteBatch: (id) => fetchApi(`/admin/batch/${id}`, { method: "DELETE" }),
  // Faculty
  getFacultyProfile: () => fetchApi("/faculty/profile", { method: "GET" }),
  updateFacultyProfile: (data) => fetchApi("/faculty/profile", { method: "PUT", body: JSON.stringify(data) }),
  getFacultyDashboard: () => fetchApi("/faculty/dashboard", { method: "GET" }),
  getFacultyReports: () => fetchApi("/faculty/reports", { method: "GET" }),
  // Faculty — Batch Module
  getFacultyBatches: () => fetchApi("/faculty/batches", { method: "GET" }),
  getFacultyBatch: (id) => fetchApi(`/faculty/batches/${id}`, { method: "GET" }),
  getFacultyBatchStudents: (id) => fetchApi(`/faculty/batches/${id}/students`, { method: "GET" }),
  getFacultyBatchAttendance: (id) => fetchApi(`/faculty/batches/${id}/attendance`, { method: "GET" }),
  markAttendance: (batchId, data) => fetchApi(`/faculty/batches/${batchId}/attendance`, { method: "PUT", body: JSON.stringify(data) }),
  bulkMarkAttendance: (batchId, data) => fetchApi(`/faculty/batches/${batchId}/attendance/bulk`, { method: "PUT", body: JSON.stringify(data) }),
  downloadFacultyBatchReport: (id) => fetchBlob(`/faculty/batches/${id}/report/download`),
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
  markQrAttendance: (id, data) => fetchApi(`/sessions/${id}/attendance`, { method: "POST", body: JSON.stringify(data) }),
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
      brokerURL: "wss://attendance-dhvi.onrender.com/ws",
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
      let kind = "admin";
      if (me.studentId) kind = "student";
      else if (me.branch) kind = "faculty";
      update({ user: { kind, id: me.id } });
      if (kind === "admin") {
      } else if (kind === "faculty") {
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
    loginAdmin: async (email, password) => {
      try {
        const res = await api.login({ username: email, password, kind: "admin" });
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
        const { getDeviceFingerprint } = await import("./device-Bft0Rafe.mjs");
        const deviceFingerprint = await getDeviceFingerprint();
        const res = await api.login({ username: studentId, password, kind: "student", deviceFingerprint });
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
    deleteSession: async (id) => {
      await api.deleteSession(id);
      update((cur) => ({ ...cur, sessions: cur.sessions.filter((x) => x.id !== id) }));
    },
    startSession: async (id) => {
      const ns = await api.startSession(id);
      update((cur) => ({ ...cur, sessions: cur.sessions.map((x) => x.id === id ? ns : x) }));
    },
    endSession: async (id) => {
      const ns = await api.endSession(id);
      update((cur) => ({ ...cur, sessions: cur.sessions.map((x) => x.id === id ? ns : x) }));
    },
    createSession: async (s) => {
      const ns = await api.createSession(s);
      update((cur) => ({ ...cur, sessions: [ns, ...cur.sessions] }));
      refreshData();
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
        const { getDeviceFingerprint } = await import("./device-Bft0Rafe.mjs");
        const deviceFingerprint = await getDeviceFingerprint();
        await api.markAttendance(sessionId, { sessionId, qrToken, latitude: lat, longitude: lng, deviceFingerprint });
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
const Route$o = createRootRouteWithContext()({
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
  const { queryClient } = Route$o.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AppProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) }) });
}
const $$splitComponentImporter$j = () => import("./student-login-DnxD9DTL.mjs");
const Route$n = createFileRoute("/student-login")({
  head: () => ({
    meta: [{
      title: "Student Login — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./student-DSGJQ_oW.mjs");
const Route$m = createFileRoute("/student")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
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
const $$splitComponentImporter$h = () => import("./login-DjnkCTbx.mjs");
const Route$l = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Faculty Login — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
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
const $$splitComponentImporter$g = () => import("./faculty-DlM3hc6-.mjs");
const Route$k = createFileRoute("/faculty")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./admin-login-BN2Ymt7R.mjs");
const Route$j = createFileRoute("/admin-login")({
  head: () => ({
    meta: [{
      title: "Admin Login — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./admin-oXHr0jEA.mjs");
const Route$i = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./index-Cv89tapg.mjs");
const Route$h = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Pulse — Smart Attendance for Modern Campuses"
    }, {
      name: "description",
      content: "QR + geo-verified attendance that students and faculty actually love."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./student.scan-lUs1G76g.mjs");
const Route$g = createFileRoute("/student/scan")({
  head: () => ({
    meta: [{
      title: "Scan QR — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./student.profile-awKdCzPV.mjs");
const Route$f = createFileRoute("/student/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./student.history-Ct2Dz-qx.mjs");
const Route$e = createFileRoute("/student/history")({
  head: () => ({
    meta: [{
      title: "History — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./student.dashboard-D2dySDRg.mjs");
const Route$d = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [{
      title: "My attendance — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./faculty.students-LerRyKAe.mjs");
const Route$c = createFileRoute("/faculty/students")({
  head: () => ({
    meta: [{
      title: "Students — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./faculty.reports-fUGhea2g.mjs");
const Route$b = createFileRoute("/faculty/reports")({
  head: () => ({
    meta: [{
      title: "Reports — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./faculty.profile-VLIawK7V.mjs");
const Route$a = createFileRoute("/faculty/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./faculty.dashboard-BZMz-OSG.mjs");
const Route$9 = createFileRoute("/faculty/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const Route$8 = createFileRoute("/faculty/batches")({ component: FacultyBatchesPage });
function formatDate$3(s) {
  if (!s) return "—";
  return (/* @__PURE__ */ new Date(s + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function getDaysDiff(start, end) {
  const s = /* @__PURE__ */ new Date(start + "T00:00:00");
  const e = /* @__PURE__ */ new Date(end + "T00:00:00");
  return Math.ceil((e.getTime() - s.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
}
function FacultyBatchesPage() {
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["faculty-batches"],
    queryFn: api.getFacultyBatches
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        className: "flex items-center justify-between",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-7 text-primary" }),
            " My Batches"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "View and manage attendance for your assigned batches" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4", children: [
      { label: "Total Batches", value: batches.length, icon: BookOpen },
      { label: "Total Students", value: batches.reduce((a, b) => a + b.studentCount, 0), icon: Users },
      { label: "Training Days", value: batches.reduce((a, b) => a + getDaysDiff(b.startDate, b.endDate), 0), icon: Calendar }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.08 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-5 text-primary mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: s.label })
        ]
      },
      s.label
    )) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-primary" }) }) : batches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        className: "flex flex-col items-center py-24 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-16 text-muted-foreground/30 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-muted-foreground", children: "No batches assigned yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ask the admin to assign you to a batch." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: batches.map((batch, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.06 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/faculty/batches/${batch.id}`,
            className: "block rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5 hover:border-primary/40 hover:shadow-md transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg group-hover:text-primary transition-colors", children: batch.batchName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    formatDate$3(batch.startDate),
                    " → ",
                    formatDate$3(batch.endDate)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-5 text-muted-foreground group-hover:text-primary transition-colors" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4" }),
                  " ",
                  batch.studentCount,
                  " students"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-4" }),
                  " ",
                  getDaysDiff(batch.startDate, batch.endDate),
                  " days"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
                getDaysDiff(batch.startDate, batch.endDate) * 2,
                " total sessions (FN + AN)"
              ] })
            ]
          }
        )
      },
      batch.id
    )) })
  ] });
}
const $$splitComponentImporter$4 = () => import("./admin.students-Dfj3gfaC.mjs");
const Route$7 = createFileRoute("/admin/students")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin.faculty-BdUSXx9h.mjs");
const Route$6 = createFileRoute("/admin/faculty")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.dashboard-DkUhB005.mjs");
const Route$5 = createFileRoute("/admin/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const Route$4 = createFileRoute("/admin/batches")({ component: AdminBatchesPage });
function downloadBlob$2(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function formatDate$2(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function AdminBatchesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["admin-batches"],
    queryFn: api.getAllBatches
  });
  const { data: faculties = [] } = useQuery({
    queryKey: ["faculty-list"],
    queryFn: api.getAllFaculty
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.deleteBatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-batches"] });
      toast.success("Batch deleted");
      setDeletingId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  const handleDownload = async (id, name) => {
    try {
      const blob = await api.downloadAttendanceReport(id);
      downloadBlob$2(blob, `${name}-attendance.xlsx`);
      toast.success("Report downloaded");
    } catch (e) {
      toast.error(e.message);
    }
  };
  const handleTemplate = async () => {
    try {
      const blob = await api.downloadBatchTemplate();
      downloadBlob$2(blob, "student-upload-template.xlsx");
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        className: "flex items-center justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-7 text-primary" }),
              " Batch Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Create and manage student batches with Excel upload" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleTemplate,
                className: "flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4" }),
                  " Download Template"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowCreate(true),
                className: "flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
                  " Create Batch"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Total Batches", value: batches.length, icon: BookOpen },
      { label: "Total Students", value: batches.reduce((a, b) => a + b.studentCount, 0), icon: GraduationCap },
      { label: "Active Faculty", value: new Set(batches.map((b) => b.facultyId)).size, icon: Users },
      { label: "Avg. Batch Size", value: batches.length ? Math.round(batches.reduce((a, b) => a + b.studentCount, 0) / batches.length) : 0, icon: Calendar }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.07 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-5 text-primary mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: s.label })
        ]
      },
      s.label
    )) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-primary" }) }) : batches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        className: "flex flex-col items-center justify-center py-24 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-16 text-muted-foreground/30 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-muted-foreground", children: "No batches yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Create your first batch by uploading a student Excel file." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowCreate(true),
              className: "mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
                " Create First Batch"
              ]
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Batch Name", "Faculty", "Students", "Training Period", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3 text-left font-semibold", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/40", children: batches.map((batch, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.tr,
            {
              initial: { opacity: 0, x: -10 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.04 },
              className: "hover:bg-muted/20 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: batch.batchName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: formatDate$2(batch.createdAt) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: batch.facultyName || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: batch.facultyEmail })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3" }),
                  " ",
                  batch.studentCount
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4 text-muted-foreground", children: [
                  formatDate$2(batch.startDate),
                  " → ",
                  formatDate$2(batch.endDate)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: `/admin/batches/${batch.id}`,
                      className: "rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleDownload(batch.id, batch.batchName),
                      className: "rounded-lg bg-green-500/10 p-1.5 text-green-600 hover:bg-green-500/20 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setDeletingId(batch.id),
                      className: "rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
                    }
                  )
                ] }) })
              ]
            },
            batch.id
          )) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showCreate && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateBatchModal,
      {
        faculties,
        onClose: () => setShowCreate(false),
        onSuccess: () => {
          setShowCreate(false);
          qc.invalidateQueries({ queryKey: ["admin-batches"] });
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: deletingId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9 },
            animate: { scale: 1 },
            exit: { scale: 0.9 },
            className: "rounded-2xl border border-border bg-card p-6 shadow-2xl w-full max-w-sm mx-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Delete Batch?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "This will permanently delete the batch, all students, and all attendance records. This cannot be undone." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setDeletingId(null),
                    className: "flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-accent transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => deletingId && deleteMut.mutate(deletingId),
                    disabled: deleteMut.isPending,
                    className: "flex-1 rounded-xl bg-destructive py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors",
                    children: deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mx-auto" }) : "Delete"
                  }
                )
              ] })
            ]
          }
        )
      }
    ) })
  ] });
}
function CreateBatchModal({ faculties, onClose, onSuccess }) {
  const [step, setStep] = reactExports.useState(1);
  const [batchName, setBatchName] = reactExports.useState("");
  const [startDate, setStartDate] = reactExports.useState("");
  const [endDate, setEndDate] = reactExports.useState("");
  const [facultyMode, setFacultyMode] = reactExports.useState("existing");
  const [selectedFacultyId, setSelectedFacultyId] = reactExports.useState("");
  const [newFaculty, setNewFaculty] = reactExports.useState({ name: "", email: "", mobile: "", password: "" });
  const [file, setFile] = reactExports.useState(null);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) setFile(f);
    else toast.error("Please upload an Excel file (.xlsx or .xls)");
  };
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }
    setIsSubmitting(true);
    try {
      const reqData = {
        batchName,
        startDate,
        endDate,
        ...facultyMode === "existing" ? { facultyId: selectedFacultyId } : { facultyName: newFaculty.name, facultyEmail: newFaculty.email, facultyMobile: newFaculty.mobile, facultyPassword: newFaculty.password }
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(reqData));
      formData.append("file", file);
      const res = await api.createBatch(formData);
      setResult(res);
      setStep(4);
      if (res.importedStudents?.length > 0) {
        try {
          const response = await fetch(
            (false ? "http://localhost:8080/api" : "https://attendance-dhvi.onrender.com/api") + `/admin/batch/${res.batchId}/report/creation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("sas.jwt")}` },
              body: JSON.stringify(res.importedStudents)
            }
          );
          if (response.ok) {
            const blob = await response.blob();
            downloadBlob$2(blob, `${res.batchName}-batch-report.xlsx`);
          }
        } catch {
        }
      }
      onSuccess();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const step1Valid = batchName.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate);
  const step2Valid = facultyMode === "existing" ? !!selectedFacultyId : newFaculty.name && newFaculty.email && newFaculty.password;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.95, y: 20 },
          animate: { scale: 1, y: 0 },
          exit: { scale: 0.95 },
          className: "relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/60 px-6 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "Create New Batch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 hover:bg-accent transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) })
            ] }),
            step < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex px-6 pt-4 gap-2", children: ["Batch Details", "Assign Faculty", "Upload Students"].map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 rounded-full transition-all ${i + 1 <= step ? "bg-primary" : "bg-muted"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-1 ${i + 1 === step ? "text-primary font-medium" : "text-muted-foreground"}`, children: label })
            ] }, label)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
              step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 },
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Batch Name *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          value: batchName,
                          onChange: (e) => setBatchName(e.target.value),
                          placeholder: "e.g. Java-June-2026, Python-Batch-A",
                          className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Start Date *" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "date",
                            value: startDate,
                            onChange: (e) => setStartDate(e.target.value),
                            className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1.5", children: "End Date *" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "date",
                            value: endDate,
                            onChange: (e) => setEndDate(e.target.value),
                            min: startDate,
                            className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          }
                        )
                      ] })
                    ] }),
                    startDate && endDate && new Date(endDate) < new Date(startDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5" }),
                      " End date must be after start date"
                    ] })
                  ]
                },
                "step1"
              ),
              step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 },
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-xl border border-border overflow-hidden", children: ["existing", "new"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => setFacultyMode(mode),
                        className: `flex-1 py-2.5 text-sm font-medium transition-colors ${facultyMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`,
                        children: mode === "existing" ? "Select Existing Faculty" : "Create New Faculty"
                      },
                      mode
                    )) }),
                    facultyMode === "existing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1.5", children: "Select Faculty *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          value: selectedFacultyId,
                          onChange: (e) => setSelectedFacultyId(e.target.value),
                          className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select faculty —" }),
                            faculties.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
                              f.name,
                              " (",
                              f.email,
                              ")"
                            ] }, f.id))
                          ]
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [
                      { label: "Full Name *", key: "name", placeholder: "Dr. John Smith", type: "text" },
                      { label: "Email *", key: "email", placeholder: "faculty@college.edu", type: "email" },
                      { label: "Mobile", key: "mobile", placeholder: "9876543210", type: "tel" },
                      { label: "Password *", key: "password", placeholder: "••••••••", type: "password" }
                    ].map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium mb-1", children: field.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: field.type,
                          placeholder: field.placeholder,
                          value: newFaculty[field.key],
                          onChange: (e) => setNewFaculty((prev) => ({ ...prev, [field.key]: e.target.value })),
                          className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }
                      )
                    ] }, field.key)) })
                  ]
                },
                "step2"
              ),
              step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 },
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        onDragOver: (e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        },
                        onDragLeave: () => setIsDragging(false),
                        onDrop: handleDrop,
                        onClick: () => fileInputRef.current?.click(),
                        className: `cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              ref: fileInputRef,
                              type: "file",
                              accept: ".xlsx,.xls",
                              className: "hidden",
                              onChange: (e) => {
                                const f = e.target.files?.[0];
                                if (f) setFile(f);
                              }
                            }
                          ),
                          file ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-10 text-green-500 mx-auto" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-600", children: file.name }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                              (file.size / 1024).toFixed(1),
                              " KB"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                onClick: (e) => {
                                  e.stopPropagation();
                                  setFile(null);
                                },
                                className: "text-xs text-destructive underline",
                                children: "Remove file"
                              }
                            )
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-10 text-muted-foreground mx-auto" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Drop your Excel file here" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "or click to browse" })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Required columns: Name, Roll Number, Email" })
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
                      "Need a template? ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => api.downloadBatchTemplate().then((b) => downloadBlob$2(b, "student-upload-template.xlsx")).catch(() => {
                          }),
                          className: "text-primary underline",
                          children: "Download blank template"
                        }
                      )
                    ] })
                  ]
                },
                "step3"
              ),
              step === 4 && result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  initial: { opacity: 0, scale: 0.95 },
                  animate: { opacity: 1, scale: 1 },
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-14 text-green-500 mx-auto" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: "Batch Created Successfully!" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "The Excel report with student credentials has been downloaded." })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
                      { label: "Total Found", value: result.totalFound, color: "bg-blue-500/10 text-blue-600" },
                      { label: "Imported", value: result.imported, color: "bg-green-500/10 text-green-600" },
                      { label: "Duplicates Skipped", value: result.duplicatesSkipped, color: "bg-yellow-500/10 text-yellow-600" },
                      { label: "Invalid Skipped", value: result.invalidSkipped, color: "bg-red-500/10 text-red-600" }
                    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl p-3 text-center ${s.color}`, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: s.value }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: s.label })
                    ] }, s.label)) }),
                    result.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-destructive/20 bg-destructive/5 p-4 max-h-36 overflow-y-auto", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-destructive mb-2", children: "Import Errors:" }),
                      result.errors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive/80", children: [
                        "• ",
                        e
                      ] }, i))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Link,
                        {
                          to: `/admin/batches/${result.batchId}`,
                          className: "flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center hover:bg-primary/90 transition-colors",
                          children: [
                            "View Batch ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "inline size-4" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: onClose,
                          className: "flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors",
                          children: "Close"
                        }
                      )
                    ] })
                  ]
                },
                "step4"
              )
            ] }) }),
            step < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 border-t border-border/60 px-6 py-4", children: [
              step > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setStep((s) => s - 1),
                  className: "rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors",
                  children: "Back"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
              step < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setStep((s) => s + 1),
                  disabled: step === 1 ? !step1Valid : !step2Valid,
                  className: "rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2",
                  children: [
                    "Next ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleSubmit,
                  disabled: !file || isSubmitting,
                  className: "rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2",
                  children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
                    " Creating..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4" }),
                    " Create Batch"
                  ] })
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const $$splitComponentImporter$1 = () => import("./faculty.sessions.index-Ca-qtPUd.mjs");
const Route$3 = createFileRoute("/faculty/sessions/")({
  head: () => ({
    meta: [{
      title: "Sessions — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./faculty.sessions._id-DGT4ux0V.mjs");
const Route$2 = createFileRoute("/faculty/sessions/$id")({
  head: () => ({
    meta: [{
      title: "Live Session — Pulse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Route$1 = createFileRoute("/faculty/batches/$batchId")({ component: FacultyBatchAttendancePage });
function downloadBlob$1(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function formatDate$1(s) {
  if (!s) return "—";
  return (/* @__PURE__ */ new Date(s + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
const STATUS_CYCLE = {
  NOT_MARKED: "PRESENT",
  PRESENT: "ABSENT",
  ABSENT: "NOT_MARKED"
};
const STATUS_STYLE = {
  PRESENT: "bg-green-500/15 text-green-600 border-green-500/20",
  ABSENT: "bg-red-500/15 text-red-600 border-red-500/20",
  NOT_MARKED: "bg-muted text-muted-foreground border-border"
};
const STATUS_ICON = {
  PRESENT: CircleCheck,
  ABSENT: CircleX,
  NOT_MARKED: Minus
};
function FacultyBatchAttendancePage() {
  const { batchId } = useParams({ from: "/faculty/batches/$batchId" });
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [selectedDate, setSelectedDate] = reactExports.useState("");
  const [bulkModal, setBulkModal] = reactExports.useState(null);
  const [pendingMarks, setPendingMarks] = reactExports.useState(/* @__PURE__ */ new Map());
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const { data: grid, isLoading, refetch } = useQuery({
    queryKey: ["faculty-batch-attendance", batchId],
    queryFn: () => api.getFacultyBatchAttendance(batchId),
    refetchInterval: false
  });
  useMutation({
    mutationFn: ({ studentId, date, session, status }) => api.markAttendance(batchId, { studentId, date, session, status }),
    onError: (e) => toast.error(e.message)
  });
  const bulkMut = useMutation({
    mutationFn: ({ date, session, status }) => api.bulkMarkAttendance(batchId, { date, session, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faculty-batch-attendance", batchId] });
      toast.success("Bulk mark applied");
      setBulkModal(null);
    },
    onError: (e) => toast.error(e.message)
  });
  const dates = reactExports.useMemo(() => {
    if (!grid) return [];
    const set = /* @__PURE__ */ new Set();
    grid.rows[0]?.records.forEach((r) => set.add(r.attendanceDate));
    return Array.from(set).sort();
  }, [grid]);
  const visibleDates = reactExports.useMemo(() => {
    if (!selectedDate) return dates;
    return dates.filter((d) => d === selectedDate);
  }, [dates, selectedDate]);
  const filteredRows = reactExports.useMemo(() => {
    if (!grid) return [];
    const q = search.toLowerCase();
    return grid.rows.filter(
      (r) => r.studentName.toLowerCase().includes(q) || (r.rollNumber || "").toLowerCase().includes(q)
    );
  }, [grid, search]);
  function getStatus(studentId, date, session, records) {
    const key = `${studentId}|${date}|${session}`;
    if (pendingMarks.has(key)) return pendingMarks.get(key);
    const rec = records.find((r) => r.attendanceDate === date && r.session === session);
    return rec?.status || "NOT_MARKED";
  }
  async function handleCellClick(studentId, date, session, records) {
    const current = getStatus(studentId, date, session, records);
    const next = STATUS_CYCLE[current] || "PRESENT";
    const key = `${studentId}|${date}|${session}`;
    setPendingMarks((m) => new Map(m).set(key, next));
    try {
      await api.markAttendance(batchId, { studentId, date, session, status: next });
    } catch (e) {
      setPendingMarks((m) => {
        const nm = new Map(m);
        nm.delete(key);
        return nm;
      });
      toast.error(e.message);
    }
  }
  async function handleDownload() {
    try {
      const blob = await api.downloadFacultyBatchReport(batchId);
      downloadBlob$1(blob, `${grid?.batchName || batchId}-attendance.xlsx`);
      toast.success("Report downloaded");
    } catch (e) {
      toast.error(e.message);
    }
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-primary" }) });
  if (!grid) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Failed to load attendance data." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/faculty/batches", className: "text-primary underline text-sm", children: "← Back to batches" })
  ] });
  const totalSessions = grid.rows[0]?.totalSessions || 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        className: "flex items-center gap-4 flex-wrap",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/faculty/batches",
              className: "rounded-xl border border-border p-2 hover:bg-accent transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2 truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-6 text-primary flex-shrink-0" }),
              " ",
              grid.batchName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              (/* @__PURE__ */ new Date(grid.startDate + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
              " →",
              " ",
              (/* @__PURE__ */ new Date(grid.endDate + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => refetch(),
                className: "flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4" }),
                  " Refresh"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleDownload,
                className: "flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
                  " Download Report"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [
      { label: "Students", value: grid.rows.length, color: "text-primary" },
      { label: "Total Sessions", value: totalSessions, color: "text-foreground" },
      { label: "Avg. Present", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.totalPresent, 0) / grid.rows.length) : 0, color: "text-green-600" },
      { label: "Avg. Absent", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.totalAbsent, 0) / grid.rows.length) : 0, color: "text-red-600" },
      { label: "Avg. Attendance%", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.attendancePct, 0) / grid.rows.length) + "%" : "—", color: "text-primary" }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.06 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${s.color}`, children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: s.label })
        ]
      },
      s.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search student or roll no...",
            className: "rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-primary w-56"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm text-muted-foreground", children: "Filter Date:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedDate,
            onChange: (e) => setSelectedDate(e.target.value),
            className: "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Dates" }),
              dates.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }, d))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground ml-auto hidden md:block", children: [
        "Click a cell to toggle: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "P" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "A" }),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.1 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs min-w-max w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "sticky left-0 z-10 bg-muted/80 backdrop-blur px-4 py-2 text-left font-semibold border-r border-border/60 min-w-[180px]", children: "Student" }),
              visibleDates.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { colSpan: 2, className: "px-2 py-2 text-center font-semibold border-r border-border/40 min-w-[100px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatDate$1(d) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 justify-center mt-0.5", children: ["FN", "AN"].map((sess) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => setBulkModal({ date: d, session: sess }),
                    className: "text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium",
                    children: [
                      sess,
                      " ▾"
                    ]
                  },
                  sess
                )) })
              ] }, d)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "sticky right-0 z-10 bg-muted/80 backdrop-blur px-4 py-2 text-center font-semibold border-l border-border/60 min-w-[100px]", children: "Summary" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/30", children: filteredRows.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "sticky left-0 z-10 bg-card/95 backdrop-blur px-4 py-2 border-r border-border/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: row.studentName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground font-mono", children: row.rollNumber || "—" })
              ] }),
              visibleDates.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: ["FN", "AN"].map((sess) => {
                const status = getStatus(row.studentId, d, sess, row.records);
                const Icon = STATUS_ICON[status] || Minus;
                return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1.5 text-center border-r border-border/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleCellClick(row.studentId, d, sess, row.records),
                    className: `inline-flex items-center justify-center size-8 rounded-lg border transition-all hover:scale-110 ${STATUS_STYLE[status]}`,
                    title: `${row.studentName} | ${d} ${sess} | Click to toggle`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3.5" })
                  }
                ) }, `${d}-${sess}`);
              }) })),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "sticky right-0 z-10 bg-card/95 backdrop-blur px-3 py-2 border-l border-border/40 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-bold ${row.attendancePct >= 75 ? "text-green-600" : row.attendancePct >= 50 ? "text-yellow-600" : "text-red-600"}`, children: [
                  row.attendancePct,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
                  row.totalPresent,
                  "/",
                  row.totalSessions
                ] })
              ] })
            ] }, row.studentId)) })
          ] }) }),
          filteredRows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-10 mx-auto mb-2 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No students match your search" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Legend:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5 text-green-600" }),
        " Present"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-3.5 text-red-600" }),
        " Absent"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "size-3.5" }),
        " Not Marked"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: bulkModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.9 },
            animate: { scale: 1 },
            exit: { scale: 0.9 },
            className: "rounded-2xl border border-border bg-card p-6 shadow-2xl w-full max-w-sm mx-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-1", children: "Bulk Mark Attendance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                  formatDate$1(bulkModal.date),
                  " — ",
                  bulkModal.session
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Apply to all ",
                filteredRows.length,
                " student",
                filteredRows.length !== 1 ? "s" : "",
                " in current view"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                { label: "Present", value: "PRESENT", cls: "bg-green-500/10 border-green-500/30 text-green-700 hover:bg-green-500/20" },
                { label: "Absent", value: "ABSENT", cls: "bg-red-500/10 border-red-500/30 text-red-700 hover:bg-red-500/20" },
                { label: "Reset", value: "NOT_MARKED", cls: "bg-muted border-border text-muted-foreground hover:bg-muted/80" }
              ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => bulkMut.mutate({ date: bulkModal.date, session: bulkModal.session, status: opt.value }),
                  disabled: bulkMut.isPending,
                  className: `rounded-xl border py-3 text-sm font-semibold transition-colors ${opt.cls} disabled:opacity-50`,
                  children: bulkMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mx-auto" }) : opt.label
                },
                opt.value
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setBulkModal(null),
                  className: "w-full mt-3 rounded-xl border border-border py-2 text-sm hover:bg-accent transition-colors",
                  children: "Cancel"
                }
              )
            ]
          }
        )
      }
    ) })
  ] });
}
const Route = createFileRoute("/admin/batches/$id")({ component: AdminBatchDetailPage });
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function formatDate(s) {
  if (!s) return "—";
  return (/* @__PURE__ */ new Date(s + "T00:00:00")).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function AdminBatchDetailPage() {
  const { id } = useParams({ from: "/admin/batches/$id" });
  const [search, setSearch] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const PER_PAGE = 20;
  const { data: batch, isLoading: batchLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: () => api.getBatch(id)
  });
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["batch-students", id],
    queryFn: () => api.getBatchStudents(id)
  });
  const filtered = reactExports.useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.rollNumber || "").toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, search]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleDownload = async () => {
    try {
      const blob = await api.downloadAttendanceReport(id);
      downloadBlob(blob, `${batch?.batchName || id}-attendance.xlsx`);
      toast.success("Attendance report downloaded");
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (batchLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-primary" }) });
  }
  if (!batch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Batch not found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/batches", className: "text-primary underline text-sm", children: "← Back to batches" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        className: "flex items-center gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/batches",
              className: "rounded-xl border border-border p-2 hover:bg-accent transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-6 text-primary" }),
              " ",
              batch.batchName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Batch Detail & Student Management" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleDownload,
              className: "flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
                " Download Attendance Report"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Faculty", value: batch.facultyName || "—", icon: "👨‍🏫" },
      { label: "Faculty Email", value: batch.facultyEmail || "—", icon: "📧" },
      { label: "Training Period", value: `${formatDate(batch.startDate)} → ${formatDate(batch.endDate)}`, icon: "📅" },
      { label: "Total Students", value: batch.studentCount.toString(), icon: "👥" }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.07 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl mb-1", children: s.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: s.label })
        ]
      },
      s.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.2 },
        className: "rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-5 text-primary" }),
              " Students (",
              filtered.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: search,
                  onChange: (e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  },
                  placeholder: "Search name, roll no, email...",
                  className: "rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-primary w-64"
                }
              )
            ] })
          ] }),
          studentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-7 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: search ? "No students match your search" : "No students in this batch" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["#", "Roll No.", "Name", "Login ID", "Email"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3 text-left font-semibold", children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/40", children: paginated.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground", children: (page - 1) * PER_PAGE + i + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-mono text-xs font-semibold text-primary", children: s.rollNumber || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-medium", children: s.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-mono text-xs text-muted-foreground", children: s.studentId }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground", children: s.email })
              ] }, s.id)) })
            ] }) }),
            totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Showing ",
                (page - 1) * PER_PAGE + 1,
                "–",
                Math.min(page * PER_PAGE, filtered.length),
                " of ",
                filtered.length
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setPage((p) => Math.max(1, p - 1)),
                    disabled: page === 1,
                    className: "rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm self-center", children: [
                  page,
                  " / ",
                  totalPages
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                    disabled: page === totalPages,
                    className: "rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
                  }
                )
              ] })
            ] })
          ] })
        ]
      }
    )
  ] });
}
const StudentLoginRoute = Route$n.update({
  id: "/student-login",
  path: "/student-login",
  getParentRoute: () => Route$o
});
const StudentRoute = Route$m.update({
  id: "/student",
  path: "/student",
  getParentRoute: () => Route$o
});
const LoginRoute = Route$l.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$o
});
const FacultyRoute = Route$k.update({
  id: "/faculty",
  path: "/faculty",
  getParentRoute: () => Route$o
});
const AdminLoginRoute = Route$j.update({
  id: "/admin-login",
  path: "/admin-login",
  getParentRoute: () => Route$o
});
const AdminRoute = Route$i.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$o
});
const IndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$o
});
const StudentScanRoute = Route$g.update({
  id: "/scan",
  path: "/scan",
  getParentRoute: () => StudentRoute
});
const StudentProfileRoute = Route$f.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => StudentRoute
});
const StudentHistoryRoute = Route$e.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => StudentRoute
});
const StudentDashboardRoute = Route$d.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => StudentRoute
});
const FacultyStudentsRoute = Route$c.update({
  id: "/students",
  path: "/students",
  getParentRoute: () => FacultyRoute
});
const FacultyReportsRoute = Route$b.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => FacultyRoute
});
const FacultyProfileRoute = Route$a.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => FacultyRoute
});
const FacultyDashboardRoute = Route$9.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => FacultyRoute
});
const FacultyBatchesRoute = Route$8.update({
  id: "/batches",
  path: "/batches",
  getParentRoute: () => FacultyRoute
});
const AdminStudentsRoute = Route$7.update({
  id: "/students",
  path: "/students",
  getParentRoute: () => AdminRoute
});
const AdminFacultyRoute = Route$6.update({
  id: "/faculty",
  path: "/faculty",
  getParentRoute: () => AdminRoute
});
const AdminDashboardRoute = Route$5.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AdminRoute
});
const AdminBatchesRoute = Route$4.update({
  id: "/batches",
  path: "/batches",
  getParentRoute: () => AdminRoute
});
const FacultySessionsIndexRoute = Route$3.update({
  id: "/sessions/",
  path: "/sessions/",
  getParentRoute: () => FacultyRoute
});
const FacultySessionsIdRoute = Route$2.update({
  id: "/sessions/$id",
  path: "/sessions/$id",
  getParentRoute: () => FacultyRoute
});
const FacultyBatchesBatchIdRoute = Route$1.update({
  id: "/$batchId",
  path: "/$batchId",
  getParentRoute: () => FacultyBatchesRoute
});
const AdminBatchesIdRoute = Route.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminBatchesRoute
});
const AdminBatchesRouteChildren = {
  AdminBatchesIdRoute
};
const AdminBatchesRouteWithChildren = AdminBatchesRoute._addFileChildren(
  AdminBatchesRouteChildren
);
const AdminRouteChildren = {
  AdminBatchesRoute: AdminBatchesRouteWithChildren,
  AdminDashboardRoute,
  AdminFacultyRoute,
  AdminStudentsRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const FacultyBatchesRouteChildren = {
  FacultyBatchesBatchIdRoute
};
const FacultyBatchesRouteWithChildren = FacultyBatchesRoute._addFileChildren(
  FacultyBatchesRouteChildren
);
const FacultyRouteChildren = {
  FacultyBatchesRoute: FacultyBatchesRouteWithChildren,
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
  AdminRoute: AdminRouteWithChildren,
  AdminLoginRoute,
  FacultyRoute: FacultyRouteWithChildren,
  LoginRoute,
  StudentRoute: StudentRouteWithChildren,
  StudentLoginRoute
};
const routeTree = Route$o._addFileChildren(rootRouteChildren)._addFileTypes();
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

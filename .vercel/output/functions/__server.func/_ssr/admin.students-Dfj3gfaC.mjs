import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as api } from "./router-CTeEyVFc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { N as Smartphone, O as MonitorX } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/stomp__stompjs.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function AdminStudents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const {
    data: students = [],
    isLoading
  } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => api.getAllStudentsAdmin()
  });
  const resetMutation = useMutation({
    mutationFn: (id) => api.resetStudentDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "students"]
      });
      toast.success("Device binding reset successfully");
    },
    onError: (e) => toast.error(e.message || "Failed to reset device")
  });
  const filtered = students.filter((s) => s.studentName.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase()));
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground animate-pulse", children: "Loading students..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Student Devices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage student device bindings and reset access." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Search students...", value: search, onChange: (e) => setSearch(e.target.value), className: "flex h-10 w-full max-w-sm rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Student" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Device Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Fingerprint / Bound At" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-medium", children: s.studentName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: s.status === "Bound" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "size-3.5" }),
            " Bound"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground", children: "Unbound" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 text-xs text-muted-foreground", children: s.deviceFingerprint ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground", children: [
              s.deviceFingerprint.substring(0, 16),
              "..."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(s.boundAt).toLocaleString() })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (confirm(`Reset device binding for ${s.studentName}? They will need to bind a new device on next login.`)) {
              resetMutation.mutate(s.studentId);
            }
          }, disabled: s.status !== "Bound" || resetMutation.isPending, className: "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorX, { className: "size-3.5" }),
            " Reset Device"
          ] }) })
        ] }, s.studentId)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-8 text-center text-muted-foreground", children: "No students found." }) })
      ] })
    ] }) }) })
  ] });
}
export {
  AdminStudents as component
};

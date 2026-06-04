import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { B as BRANCHES, b as api } from "./router-BMl-Hn6m.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./Field-BoSfS6nt.mjs";
import { P as Plus, q as Trash2 } from "../_libs/lucide-react.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function AdminFaculty() {
  const queryClient = useQueryClient();
  const {
    data: faculties = [],
    isLoading
  } = useQuery({
    queryKey: ["admin", "faculty"],
    queryFn: () => api.getAllFaculty()
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "faculty"]
      });
      toast.success("Faculty deleted successfully");
    },
    onError: (e) => toast.error(e.message || "Failed to delete faculty")
  });
  const addMutation = useMutation({
    mutationFn: (data) => api.addFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "faculty"]
      });
      toast.success("Faculty added successfully");
      setIsAdding(false);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        password: "",
        branch: "CSE"
      });
    },
    onError: (e) => toast.error(e.message || "Failed to add faculty")
  });
  const [isAdding, setIsAdding] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    branch: "CSE"
  });
  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground animate-pulse", children: "Loading faculty..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Manage Faculty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Add, update, or remove faculty members." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsAdding(!isAdding), className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90", children: isAdding ? "Cancel" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " Add Faculty"
      ] }) })
    ] }),
    isAdding && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "rounded-xl border border-border bg-card p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium text-lg", children: "Add New Faculty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", required: true, value: formData.name, onChange: (e) => setFormData({
          ...formData,
          name: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", required: true, value: formData.email, onChange: (e) => setFormData({
          ...formData,
          email: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile", required: true, value: formData.mobile, onChange: (e) => setFormData({
          ...formData,
          mobile: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", required: true, value: formData.password, onChange: (e) => setFormData({
          ...formData,
          password: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1.5 text-sm font-medium", children: [
          "Branch",
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", value: formData.branch, onChange: (e) => setFormData({
            ...formData,
            branch: e.target.value
          }), children: BRANCHES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: addMutation.isPending, className: "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: addMutation.isPending ? "Adding..." : "Save Faculty" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium", children: "Branch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-medium text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        faculties.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-medium", children: f.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: f.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f.mobile })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary", children: f.branch }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            if (confirm(`Are you sure you want to delete ${f.name}?`)) {
              deleteMutation.mutate(f.id);
            }
          }, disabled: deleteMutation.isPending, className: "inline-flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50", title: "Delete Faculty", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
        ] }, f.id)),
        faculties.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "px-6 py-8 text-center text-muted-foreground", children: "No faculty found." }) })
      ] })
    ] }) }) })
  ] });
}
export {
  AdminFaculty as component
};

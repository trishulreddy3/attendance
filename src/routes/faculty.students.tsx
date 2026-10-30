import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Modal } from "@/components/common/Modal";
import { BRANCHES, useApp, type Branch, type Student } from "@/lib/store";

export const Route = createFileRoute("/faculty/students")({
  head: () => ({ meta: [{ title: "Students — Pulse" }] }),
  component: StudentsPage,
});

type FormState = {
  name: string;
  rollNumber: string;
  studentId: string;
  mobile: string;
  email: string;
  branch: Branch;
  password: string;
};

const empty: FormState = {
  name: "",
  rollNumber: "",
  studentId: "",
  mobile: "",
  email: "",
  branch: "CSE",
  password: "",
};

export function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useApp();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<Branch | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchQ =
        !q ||
        [s.name, s.rollNumber || "", s.studentId, s.email].some((x) =>
          x.toLowerCase().includes(q.toLowerCase()),
        );
      const matchB = branch === "ALL" || s.branch === branch;
      return matchQ && matchB;
    });
  }, [students, q, branch]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setFormErrors({});
    setOpen(true);
  };

  const startEdit = (s: Student) => {
    setEditing(s);
    setForm({
      name: s.name,
      rollNumber: s.rollNumber || s.studentId,
      studentId: s.studentId,
      mobile: s.mobile || "",
      email: s.email,
      branch: (s.branch as Branch) || "CSE",
      password: "",
    });
    setFormErrors({});
    setOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Student name is required";
    if (!form.rollNumber.trim()) errs.rollNumber = "Roll number is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.branch) errs.branch = "Department is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        rollNumber: form.rollNumber.trim().toUpperCase(),
        studentId: form.rollNumber.trim().toUpperCase(),
        mobile: form.mobile.trim() || undefined,
        email: form.email.trim(),
        branch: form.branch,
        password: form.password.trim() || undefined,
      };

      if (editing) {
        await updateStudent(editing.id, payload);
        toast.success("Student updated successfully");
      } else {
        const r = await addStudent(payload);
        if (!r.ok) {
          const errMsg = r.error || "Failed to add student";
          if (errMsg.toLowerCase().includes("roll")) {
            setFormErrors((prev) => ({ ...prev, rollNumber: errMsg }));
          } else if (errMsg.toLowerCase().includes("email")) {
            setFormErrors((prev) => ({ ...prev, email: errMsg }));
          }
          toast.error(errMsg);
          return;
        }
        toast.success("Student added successfully");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Student Management</h2>
          <p className="text-sm text-muted-foreground">
            {students.length} students enrolled across departments. Add or edit student records
            directly.
          </p>
        </div>
        <button
          onClick={startCreate}
          data-testid="open-add-student-btn"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-2xs transition-all"
        >
          <Plus className="size-4" /> Add Student
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Roll No, name, or email..."
            className="h-full w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value as Branch | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm font-medium"
        >
          <option value="ALL">All Departments</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
      >
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Roll No.</th>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Student</th>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Department</th>
              <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground hidden md:table-cell">
                Email
              </th>
              <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground hidden lg:table-cell">
                Mobile
              </th>
              <th className="px-5 py-3.5 text-right font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {slice.map((s, i) => (
                <motion.tr
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                    {s.rollNumber || s.studentId}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      {s.branch || "CSE"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                    {s.email}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                    {s.mobile || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Edit student"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setConfirmId(s.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete student"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {slice.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
                    <UserPlus className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-medium text-foreground">No students found</p>
                  <p className="text-xs">
                    Try adjusting your search filters or click "Add Student" above.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {slice.length} of {filtered.length} students
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent"
          >
            Prev
          </button>
          <span className="px-2">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Student Details" : "Add New Student"}
      >
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Roll Number *"
              data-testid="student-roll-input"
              placeholder="e.g. 23CS011"
              value={form.rollNumber}
              error={formErrors.rollNumber}
              onChange={(e) => {
                setForm({ ...form, rollNumber: e.target.value.toUpperCase() });
                if (formErrors.rollNumber) setFormErrors({ ...formErrors, rollNumber: "" });
              }}
              required
            />
            <Field
              label="Full Name *"
              data-testid="student-name-input"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              error={formErrors.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-muted-foreground">
                Department / Branch *
              </label>
              <select
                value={form.branch}
                data-testid="student-dept-select"
                onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Mobile Number"
              data-testid="student-mobile-input"
              placeholder="10 digits"
              maxLength={10}
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
            />
          </div>

          <Field
            label="Email Address *"
            type="email"
            data-testid="student-email-input"
            placeholder="e.g. student@example.com"
            value={form.email}
            error={formErrors.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
            }}
            required
          />

          <Field
            label={
              editing
                ? "Reset Password (leave empty to keep unchanged)"
                : "Password (defaults to 12345678)"
            }
            type="text"
            data-testid="student-password-input"
            placeholder={editing ? "Leave blank to keep current password" : "12345678"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="student-submit-btn"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-2xs hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {editing
                ? loading
                  ? "Saving..."
                  : "Save Changes"
                : loading
                  ? "Adding..."
                  : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete Student Record?"
        width={380}
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete the student from the system. This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setConfirmId(null)}
            className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await deleteStudent(confirmId!);
              setConfirmId(null);
              toast.success("Student deleted successfully");
            }}
            className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default StudentsPage;

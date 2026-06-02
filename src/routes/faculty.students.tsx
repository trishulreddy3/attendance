import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Modal } from "@/components/common/Modal";
import { BRANCHES, useApp, type Branch, type Student } from "@/lib/store";

export const Route = createFileRoute("/faculty/students")({
  head: () => ({ meta: [{ title: "Students — Pulse" }] }),
  component: StudentsPage,
});

type FormState = { name: string; studentId: string; mobile: string; email: string; branch: Branch; password: string };
const empty: FormState = { name: "", studentId: "", mobile: "", email: "", branch: "CSE", password: "" };

function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useApp();
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState<Branch | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchQ = !q || [s.name, s.studentId, s.email].some((x) => x.toLowerCase().includes(q.toLowerCase()));
      const matchB = branch === "ALL" || s.branch === branch;
      return matchQ && matchB;
    });
  }, [students, q, branch]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (s: Student) => {
    setEditing(s);
    setForm({ name: s.name, studentId: s.studentId, mobile: s.mobile, email: s.email, branch: s.branch, password: s.password });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateStudent(editing.id, form);
      toast.success("Student updated");
    } else {
      const r = await addStudent(form);
      if (!r.ok) { toast.error(r.error ?? "Failed"); return; }
      toast.success("Student added");
    }
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
          <p className="text-sm text-muted-foreground">{students.length} enrolled across {new Set(students.map((s) => s.branch)).size} branches.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Add student
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name, ID, email" className="h-full w-full bg-transparent text-sm outline-none" />
        </div>
        <select value={branch} onChange={(e) => { setBranch(e.target.value as Branch | "ALL"); setPage(1); }} className="h-10 rounded-lg border border-input bg-card px-3 text-sm">
          <option value="ALL">All branches</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <motion.div layout className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Mobile</th>
              <th className="px-4 py-3 text-left font-medium">Branch</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {slice.map((s, i) => (
                <motion.tr
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{s.name[0]}</div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.studentId}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.mobile}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{s.branch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(s)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => setConfirmId(s.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {slice.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-muted-foreground">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted"><UserPlus className="size-5 text-muted-foreground" /></div>
                <p className="mt-3 font-medium text-foreground">No students found</p>
                <p>Try adjusting your filters or add a new student.</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {slice.length} of {filtered.length}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent">Prev</button>
          <span className="px-2">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-accent">Next</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit student" : "Add student"}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
            <Field label="Mobile" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Branch</span>
              <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm">
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <Field label="Password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">{editing ? "Save" : "Add"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete student?" width={380}>
        <p className="text-sm text-muted-foreground">This will permanently remove the student record. This action cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setConfirmId(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">Cancel</button>
          <button onClick={async () => { await deleteStudent(confirmId!); setConfirmId(null); toast.success("Student deleted"); }} className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

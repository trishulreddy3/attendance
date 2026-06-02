import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "Profile — Pulse" }] }),
  component: StudentProfile,
});

function StudentProfile() {
  const { currentStudent, updateSelfStudent } = useApp();
  const me = currentStudent();
  const [form, setForm] = useState({
    name: me?.name ?? "",
    mobile: me?.mobile ?? "",
    email: me?.email ?? "",
  });
  if (!me) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateSelfStudent(form);
    toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">Keep your details up to date.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">{me.name[0]}</div>
          <div>
            <p className="font-semibold">{me.name}</p>
            <p className="text-sm text-muted-foreground">{me.studentId} · {me.branch}</p>
          </div>
        </div>
        <form onSubmit={save} className="mt-6 grid gap-3 md:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Mobile" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} />
          <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Branch" value={me.branch} disabled />
          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

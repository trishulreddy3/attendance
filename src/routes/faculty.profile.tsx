import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { BRANCHES, useApp, type Branch } from "@/lib/store";

export const Route = createFileRoute("/faculty/profile")({
  head: () => ({ meta: [{ title: "Profile — Pulse" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentFaculty, updateFaculty } = useApp();
  const me = currentFaculty();
  const [form, setForm] = useState({
    name: me?.name ?? "",
    mobile: me?.mobile ?? "",
    email: me?.email ?? "",
    branch: (me?.branch ?? "CSE") as Branch,
  });

  if (!me) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateFaculty(me.id, form);
    toast.success("Profile updated");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">{me.name[0]}</div>
          <div>
            <p className="font-semibold">{me.name}</p>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 grid gap-3 md:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Mobile" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} />
          <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Branch</span>
            <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm">
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
          </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-semibold">Settings</p>
        <p className="text-xs text-muted-foreground">Use the sun/moon button in the header to switch themes.</p>
      </motion.div>
    </div>
  );
}

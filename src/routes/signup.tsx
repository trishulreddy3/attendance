import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { AuthShell } from "./login";
import { BRANCHES, useApp, type Branch } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Faculty Signup — Pulse" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signupFaculty } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: "", mobile: "", email: "", branch: "CSE" as Branch, password: "", confirm: "",
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\d{10}$/.test(f.mobile)) e.mobile = "Enter a 10-digit mobile";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
    if (f.password.length < 8) e.password = "Min 8 characters";
    if (f.password !== f.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!validate()) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    const r = await signupFaculty({ name: f.name, mobile: f.mobile, email: f.email, branch: f.branch, password: f.password });
    setBusy(false);
    if (!r.ok) { setErrors({ email: r.error || "Failed to create account" }); return; }
    toast.success("Account created");
    nav({ to: "/faculty/dashboard" });
  };

  return (
    <AuthShell>
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Faculty access — manage students & sessions.</p>
        </div>
        <Field label="Full name" leftIcon={<User />} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} placeholder="Dr. Anika Mehra" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile" leftIcon={<Phone />} value={f.mobile} maxLength={10} onChange={(e) => setF({ ...f, mobile: e.target.value.replace(/\D/g, "") })} error={errors.mobile} placeholder="9876543210" />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Branch</span>
            <select
              value={f.branch}
              onChange={(e) => setF({ ...f, branch: e.target.value as Branch })}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
        </div>
        <Field label="Email" type="email" leftIcon={<Mail />} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} placeholder="you@college.edu" />
        <Field
          label="Password" leftIcon={<Lock />} type={show ? "text" : "password"}
          value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errors.password}
          rightSlot={<button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}
        />
        <Field label="Confirm password" leftIcon={<Lock />} type={show ? "text" : "password"} value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={errors.confirm} />
        <button type="submit" disabled={busy} className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

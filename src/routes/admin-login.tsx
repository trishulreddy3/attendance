import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Logo } from "@/components/common/Logo";
import { useApp } from "@/lib/store";
import { AuthShell } from "./login";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Login — Pulse" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, loginAdmin } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.kind === "admin") nav({ to: "/admin/dashboard" });
      else if (user.kind === "faculty") nav({ to: "/faculty/dashboard" });
      else nav({ to: "/student/dashboard" });
    }
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr(undefined);
    setBusy(true);

    const r = await loginAdmin(email, password);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    toast.success("Welcome, Admin");
    nav({ to: "/admin/dashboard" });
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
        <div className="mb-2 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 w-fit text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" /> Admin Portal
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">System Administration</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your administrative credentials.</p>
        </div>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail />} placeholder="admin@college.edu" required />
        <Field
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock />}
          required
          error={err}
          rightSlot={
            <button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-4 relative h-10 w-full overflow-hidden rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Authenticating…" : "Secure Sign In"}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/" className="text-foreground hover:underline">Return to home</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

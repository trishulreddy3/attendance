import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Logo } from "@/components/common/Logo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Faculty Login — Pulse" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loginFaculty } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      nav({ to: user.kind === "faculty" ? "/faculty/dashboard" : "/student/dashboard" });
    }
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr(undefined);
    setBusy(true);

    const r = await loginFaculty(email, password);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    toast.success("Welcome back");
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
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your faculty account.</p>
        </div>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail />} placeholder="you@college.edu" required />
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
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-3.5 accent-[var(--primary)]" />
            Remember me
          </label>
          <button type="button" onClick={() => toast("Reset link sent")} className="text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="relative h-10 w-full overflow-hidden rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Student? <Link to="/student-login" className="text-foreground hover:underline">Sign in here</Link>
          {" | "}
          <Link to="/admin-login" className="text-foreground hover:underline">Admin Login</Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8"><Logo /></div>
          {children}
        </div>
      </div>
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--primary)_25%,transparent),transparent_60%),radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 grid place-items-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="max-w-sm rounded-3xl border border-border bg-card/70 p-6 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-wider text-primary">Live</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              "Attendance dropped from 8 minutes to under 30 seconds."
            </p>
            <p className="mt-3 text-sm text-muted-foreground">— Faculty, Computer Science</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

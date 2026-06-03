import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, IdCard, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { AuthShell } from "./login";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/student-login")({
  head: () => ({ meta: [{ title: "Student Login — Pulse" }] }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const { user, loginStudent } = useApp();
  const nav = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    setBusy(true);

    const r = await loginStudent(studentId, password);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    toast.success("Welcome back");
    nav({ to: "/student/dashboard" });
  };

  return (
    <AuthShell>
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Student sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use credentials shared by your faculty.</p>
        </div>
        <Field label="Student ID" leftIcon={<IdCard />} value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="S101" />
        <Field label="Email" type="email" leftIcon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password" leftIcon={<Lock />} type={show ? "text" : "password"}
          value={password} onChange={(e) => setPassword(e.target.value)} error={err}
          rightSlot={<button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}
        />
        <button type="submit" disabled={busy} className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Faculty? <Link to="/login" className="text-primary hover:underline">Go to faculty login</Link>
        </p>

      </motion.form>
    </AuthShell>
  );
}

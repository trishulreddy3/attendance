import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Logo } from "@/components/common/Logo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Smart Attendance for Modern Campuses" },
      { name: "description", content: "QR + geo-verified attendance that students and faculty actually love." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    if (user?.kind === "faculty") nav({ to: "/faculty/dashboard" });
    else if (user?.kind === "student") nav({ to: "/student/dashboard" });
    else if (user?.kind === "admin") nav({ to: "/admin/dashboard" });
  }, [user, nav]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/student-login" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">Student login</Link>
          <Link to="/login" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">Faculty login</Link>
          <Link to="/admin-login" className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3.5 py-2 text-primary hover:bg-primary/20">
            Admin <ShieldCheck className="size-3.5" />
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Now with live geo-verified sessions
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Attendance that feels{" "}
            <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">invisible.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground md:text-lg">
            One scan. One second. Pulse handles the rest — for every period, every classroom, every campus.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Faculty Login <ArrowRight className="size-4" />
            </Link>
            <Link to="/student-login" className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent">
              I'm a Student
            </Link>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-16 grid gap-4 md:grid-cols-3"
        >
          {[
            { icon: <QrCode className="size-5" />, t: "Dynamic QR", d: "Rotating tokens every 30s — impossible to share." },
            { icon: <ShieldCheck className="size-5" />, t: "Geo-verified", d: "Pinpoint location checks before marking present." },
            { icon: <CheckCircle2 className="size-5" />, t: "Real-time feed", d: "Watch attendance fill in, live." },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-accent text-primary">{f.icon}</div>
              <p className="mt-3 font-medium">{f.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

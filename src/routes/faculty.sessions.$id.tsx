import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, RefreshCcw, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { useApp } from "@/lib/store";
import { fmtTime } from "@/lib/format";

export const Route = createFileRoute("/faculty/sessions/$id")({
  head: () => ({ meta: [{ title: "Live Session — Pulse" }] }),
  component: LiveSession,
});

function LiveSession() {
  const { id } = useParams({ from: "/faculty/sessions/$id" });
  const { sessions, students, refreshQr, endSession } = useApp();
  const session = sessions.find((s) => s.id === id);
  const [countdown, setCountdown] = useState(30);
  const [now, setNow] = useState(Date.now());
  const [terminating, setTerminating] = useState(false);
  const isRefreshing = useRef(false);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!session) return;
    const i = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { refreshQr(session.id); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [session?.id]); // eslint-disable-line

  const remaining = useMemo(() => {
    if (!session) return "—";
    const ms = new Date(session.endTime).getTime() - now;
    if (ms <= 0) return "Ended";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }, [session, now]);

  if (!session) {
    return (
      <div className="grid place-items-center py-24 text-center text-sm text-muted-foreground">
        <p>Session not found.</p>
        <Link to="/faculty/sessions" className="mt-3 text-primary hover:underline">Back to sessions</Link>
      </div>
    );
  }

  const attendees = [...session.attendees].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const payload = `pulse://session/${session.id}/${session.qrToken}`;
  const isEnded = new Date(session.endTime).getTime() <= now;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between">
        <Link to="/faculty/sessions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All sessions
        </Link>
        {isEnded ? (
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Ended
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Now collecting</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{session.name}</h2>
              <p className="text-sm text-muted-foreground">{session.subject} · {session.branch}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{isEnded ? "Status" : "Ends in"}</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{isEnded ? "Ended" : remaining}</p>
            </div>
          </div>

          <div className="mt-6 grid place-items-center">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={session.qrToken}
                  initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl border border-border bg-white p-5 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
                >
                  <QRCodeSVG value={payload} size={260} bgColor="#ffffff" fgColor="#111827" level="M" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium shadow">
                Refreshes in <span className="tabular-nums text-primary">{countdown}s</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono truncate">{session.qrToken}</span>
            <div className="flex items-center gap-2">
              {!isEnded && (
                <button 
                  disabled={terminating}
                  onClick={async () => {
                    setTerminating(true);
                    try { await endSession(session.id); } catch (e) { console.error(e); }
                    setTerminating(false);
                  }} 
                  className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-2.5 py-1 hover:bg-destructive/20 disabled:opacity-50"
                >
                  {terminating ? "Ending..." : "End Session"}
                </button>
              )}
              <button disabled={isEnded || isRefreshing.current} onClick={async () => { 
                if (isRefreshing.current) return;
                isRefreshing.current = true;
                try {
                  await refreshQr(session.id); 
                  setCountdown(30);
                } finally {
                  setTimeout(() => { isRefreshing.current = false; }, 500); // 500ms debounce
                }
              }} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 hover:bg-accent disabled:opacity-50">
                <RefreshCcw className="size-3.5" /> Refresh now
              </button>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Attendance</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  <AnimatedCounter value={attendees.length} /> <span className="text-base text-muted-foreground">/ {students.filter((s) => s.branch === session.branch).length}</span>
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-accent text-primary"><Users className="size-5" /></div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (attendees.length / Math.max(1, students.filter((s) => s.branch === session.branch).length)) * 100)}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold">Live feed</p>
              <p className="text-xs text-muted-foreground">Students appear as they scan.</p>
            </div>
            <ul className="max-h-[380px] overflow-y-auto scrollbar-thin p-3">
              <AnimatePresence initial={false}>
                {attendees.map((a) => {
                  const st = students.find((s) => s.id === a.studentId);
                  return (
                    <motion.li
                      key={a.studentId + a.at}
                      layout
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="flex items-center gap-3 rounded-lg px-2 py-2"
                    >
                      <div className="grid size-7 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{st?.name ?? "Unknown"} <span className="text-muted-foreground font-normal">joined</span></p>
                        <p className="text-[11px] text-muted-foreground">{st?.studentId} · {fmtTime(a.at)}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {attendees.length === 0 && (
                <li className="px-3 py-10 text-center text-sm text-muted-foreground">Waiting for the first scan…</li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

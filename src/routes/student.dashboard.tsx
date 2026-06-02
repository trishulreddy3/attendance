import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, ScanLine, TrendingUp, XCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { StatCard } from "@/components/common/StatCard";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/format";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "My attendance — Pulse" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { currentStudent } = useApp();
  const me = currentStudent();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (me) api.getStudentDashboard(me.id).then(setData).catch(console.error);
  }, [me]);

  if (!me || !data) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  // Ring math
  const R = 60;
  const C = 2 * Math.PI * R;
  const dash = (data.attendancePct / 100) * C;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold tracking-tight">
          Hey {me.name.split(" ")[0]}.
        </motion.h2>
        <p className="text-sm text-muted-foreground">Here's how your attendance is shaping up.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Classes" value={data.totalClasses} icon={<BookOpen className="size-4" />} />
        <StatCard label="Present" value={data.present} icon={<CheckCircle2 className="size-4" />} delay={0.05} />
        <StatCard label="Absent" value={data.absent} icon={<XCircle className="size-4" />} delay={0.1} />
        <StatCard label="Attendance %" value={data.attendancePct} suffix="%" icon={<TrendingUp className="size-4" />} delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Overall</p>
          <div className="mt-2 grid place-items-center py-4">
            <div className="relative grid place-items-center">
              <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                <circle cx="80" cy="80" r={R} stroke="var(--muted)" strokeWidth="12" fill="none" />
                <motion.circle
                  cx="80" cy="80" r={R} stroke="var(--primary)" strokeWidth="12" fill="none" strokeLinecap="round"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C - dash }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-semibold tracking-tight"><AnimatedCounter value={data.attendancePct} suffix="%" /></p>
                <p className="text-xs text-muted-foreground">attendance</p>
              </div>
            </div>
          </div>
          <Link to="/student/scan" className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <ScanLine className="size-4" /> Mark attendance
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Attendance trend</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.last7Days} margin={{ left: -20, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold">Recent attendance</p>
          <Link to="/student/history" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <ul className="divide-y divide-border">
          {data.recentAttendance.length === 0 && <li className="px-5 py-10 text-center text-sm text-muted-foreground">No attendance yet — scan a QR to begin.</li>}
          {data.recentAttendance.map((s: any, i: number) => {
            const att = s.attendees.find((a: any) => a.studentId === me.id);
            return (
              <motion.li key={s.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.04 }} className="flex items-center gap-3 px-5 py-3">
                <div className="grid size-8 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name} <span className="text-muted-foreground font-normal">· {s.subject}</span></p>
                  <p className="text-xs text-muted-foreground">{fmtDate(s.startTime)} · {fmtTime(att!.at)}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Radio, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { fmtTime } from "@/lib/format";

export const Route = createFileRoute("/faculty/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Pulse" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { currentFaculty } = useApp();
  const me = currentFaculty();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getFacultyDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold tracking-tight">
          Good {greet()}, {me?.name?.split(" ")[1] ?? me?.name}.
        </motion.h2>
        <p className="text-sm text-muted-foreground">Here's what's happening across your classes today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={<Users className="size-4" />} />
        <StatCard label="Active Sessions" value={data.activeSessions} icon={<Radio className="size-4" />} delay={0.05} hint={data.activeSessions ? "Live now" : "None active"} />
        <StatCard label="Present Today" value={data.presentToday} icon={<CheckCircle2 className="size-4" />} delay={0.1} />
        <StatCard label="Attendance Rate" value={data.attendanceRate} suffix="%" icon={<TrendingUp className="size-4" />} delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Attendance Analytics</p>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Link to="/faculty/reports" className="text-xs text-primary hover:underline">View reports →</Link>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.last7Days} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Activity</p>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <ul className="mt-4 space-y-3">
            {data.recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet — start a session.</p>
            )}
            {data.recentActivity.map((r: any, i: number) => (
              <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="flex items-start gap-3">
                <div className="mt-1.5 size-2 rounded-full bg-success" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">Marked present in <span className="font-medium">{r.sessionName}</span></p>
                  <p className="text-xs text-muted-foreground">{fmtTime(r.markedAt)}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-dashed border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Ready to take attendance?</p>
            <p className="text-xs text-muted-foreground">Create a new session with a dynamic QR.</p>
          </div>
          <Link to="/faculty/sessions" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Create session
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

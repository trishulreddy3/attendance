import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BRANCHES, useApp } from "@/lib/store";

export const Route = createFileRoute("/faculty/reports")({
  head: () => ({ meta: [{ title: "Reports — Pulse" }] }),
  component: Reports,
});

const PALETTE = ["var(--primary)", "color-mix(in oklab, var(--primary) 65%, white)", "color-mix(in oklab, var(--primary) 45%, white)", "color-mix(in oklab, var(--primary) 30%, white)", "color-mix(in oklab, var(--primary) 80%, black)", "color-mix(in oklab, var(--primary) 50%, black)", "color-mix(in oklab, var(--primary) 25%, black)"];

function Reports() {
  const { students, sessions } = useApp();

  const byBranch = BRANCHES.map((b) => {
    const total = students.filter((s) => s.branch === b).length;
    const attended = sessions.filter((s) => s.branch === b).reduce((a, s) => a + s.attendees.length, 0);
    return { branch: b, students: total, attendance: attended };
  });

  const subjectPie = Object.entries(
    sessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.subject || "Other"] = (acc[s.subject || "Other"] || 0) + s.attendees.length;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-sm text-muted-foreground">Drill into attendance trends across branches and subjects.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Attendance by branch</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBranch}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="attendance" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">By subject</p>
          <div className="mt-4 h-72">
            {subjectPie.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={3}>
                    {subjectPie.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold">Session log</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Session</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-left font-medium">Branch</th>
              <th className="px-4 py-3 text-left font-medium">Start</th>
              <th className="px-4 py-3 text-left font-medium">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No sessions yet.</td></tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.subject}</td>
                <td className="px-4 py-3"><span className="rounded-md bg-accent px-2 py-0.5 text-xs">{s.branch}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.startTime).toLocaleString()}</td>
                <td className="px-4 py-3">{s.attendees.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

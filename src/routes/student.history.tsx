import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Filter, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDate, fmtTime } from "@/lib/format";

export const Route = createFileRoute("/student/history")({
  head: () => ({ meta: [{ title: "History — Pulse" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { sessions, currentStudent } = useApp();
  const me = currentStudent();
  const [subject, setSubject] = useState("ALL");
  const [month, setMonth] = useState("ALL");

  const data = useMemo(() => {
    if (!me) return [];
    return sessions
      .filter((s) => s.branch === me.branch)
      .map((s) => ({
        s,
        present: !!s.attendees.find((a) => a.studentId === me.id),
        at: s.attendees.find((a) => a.studentId === me.id)?.at,
      }))
      .filter((r) => (subject === "ALL" ? true : r.s.subject === subject))
      .filter((r) => {
        if (month === "ALL") return true;
        const d = new Date(r.s.startTime);
        return `${d.getFullYear()}-${d.getMonth()}` === month;
      })
      .sort((a, b) => +new Date(b.s.startTime) - +new Date(a.s.startTime));
  }, [sessions, me, subject, month]);

  const subjects = Array.from(new Set(sessions.map((s) => s.subject)));
  const months = Array.from(new Set(sessions.map((s) => {
    const d = new Date(s.startTime);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })));

  if (!me) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Attendance history</h2>
        <p className="text-sm text-muted-foreground">Every class, every scan, all in one place.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <Filter className="size-4 text-muted-foreground" />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
          <option value="ALL">All subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm">
          <option value="ALL">All months</option>
          {months.map((m) => {
            const [y, mo] = m.split("-").map(Number);
            return <option key={m} value={m}>{new Date(y, mo).toLocaleDateString([], { month: "long", year: "numeric" })}</option>;
          })}
        </select>
      </div>

      <ol className="relative ml-3 border-l border-border">
        {data.length === 0 && (
          <li className="py-12 text-center text-sm text-muted-foreground">No records.</li>
        )}
        {data.map((r, i) => (
          <motion.li
            key={r.s.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: Math.min(i, 6) * 0.04 }}
            className="relative pl-6 pb-4"
          >
            <span className={`absolute -left-[7px] top-2 size-3 rounded-full ring-4 ring-background ${r.present ? "bg-success" : "bg-destructive"}`} />
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.s.name}</p>
                  <p className="text-xs text-muted-foreground">{r.s.subject} · {fmtDate(r.s.startTime)} · {fmtTime(r.s.startTime)}</p>
                </div>
                {r.present ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <CheckCircle2 className="size-3" /> Present
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    <XCircle className="size-3" /> Absent
                  </span>
                )}
              </div>
              {r.at && <p className="mt-1 text-xs text-muted-foreground">Marked at {fmtTime(r.at)}</p>}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

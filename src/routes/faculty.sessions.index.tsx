import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, QrCode, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Modal } from "@/components/common/Modal";
import { BRANCHES, useApp, type Branch, type SessionType } from "@/lib/store";
import { durationLabel, fmtDate, fmtTime, toLocalInput } from "@/lib/format";

export const Route = createFileRoute("/faculty/sessions/")({
  head: () => ({ meta: [{ title: "Sessions — Pulse" }] }),
  component: SessionsPage,
});

const TYPE_LABELS: Record<SessionType, string> = {
  single: "Single Period",
  multiple: "Multiple Periods",
  half: "Half Day",
  full: "Full Day",
};

function defaultEndFor(type: SessionType, start: Date) {
  const e = new Date(start);
  if (type === "single") e.setMinutes(e.getMinutes() + 50);
  else if (type === "multiple") e.setHours(e.getHours() + 2);
  else if (type === "half") e.setHours(e.getHours() + 4);
  else e.setHours(e.getHours() + 7);
  return e;
}

function SessionsPage() {
  const { sessions, createSession } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [loading, setLoading] = useState(false);
  const now = new Date(); now.setMinutes(0, 0, 0);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    branch: "CSE" as Branch,
    type: "single" as SessionType,
    startTime: toLocalInput(now),
    endTime: toLocalInput(defaultEndFor("single", now)),
  });

  const onType = (type: SessionType) => {
    const start = new Date(form.startTime);
    setForm({ ...form, type, endTime: toLocalInput(defaultEndFor(type, start)) });
  };
  const onStart = (v: string) => {
    const start = new Date(v);
    setForm({ ...form, startTime: v, endTime: toLocalInput(defaultEndFor(form.type, start)) });
  };

  const duration = useMemo(() => durationLabel(new Date(form.startTime).toISOString(), new Date(form.endTime).toISOString()), [form.startTime, form.endTime]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!form.name || !form.subject) { toast.error("Add a name & subject"); return; }
    setLoading(true);
    try {
      const s = await createSession({
        name: form.name,
        subject: form.subject,
        branch: form.branch,
        type: form.type,
        startTime: form.startTime + ":00", // Send exact local time (e.g. "2026-06-03T09:30:00")
        endTime: form.endTime + ":00",

      });
      toast.success("Session created");
      setOpen(false);
      nav({ to: "/faculty/sessions/$id", params: { id: s.id } });
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...sessions].sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
          <p className="text-sm text-muted-foreground">Spin up a QR-powered attendance session in seconds.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> New session
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {(["all", "active", "ended"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${filter === f ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sorted.filter(s => {
          if (filter === "all") return true;
          const isLive = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
          return filter === "active" ? isLive : !isLive;
        }).map((s, i) => {
          const live = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold tracking-tight">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.subject} · {s.branch}</p>
                </div>
                {live ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <span className="relative flex size-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
                      <span className="relative size-1.5 rounded-full bg-success" />
                    </span>
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{TYPE_LABELS[s.type]}</span>
                )}
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="size-3.5" /> {fmtDate(s.startTime)}</div>
                <div className="flex items-center gap-2"><Clock className="size-3.5" /> {fmtTime(s.startTime)} → {fmtTime(s.endTime)}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.attendees.length} present</span>
                <Link to="/faculty/sessions/$id" params={{ id: s.id }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent">
                  <QrCode className="size-3.5" /> Open
                </Link>
              </div>
            </motion.div>
          );
        })}
        {sorted.filter(s => {
          if (filter === "all") return true;
          const isLive = Date.now() >= new Date(s.startTime).getTime() && Date.now() <= new Date(s.endTime).getTime();
          return filter === "active" ? isLive : !isLive;
        }).length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted"><QrCode className="size-5 text-muted-foreground" /></div>
            <p className="mt-3 font-medium">No sessions found</p>
            <p className="text-sm text-muted-foreground">Try changing your filters or create a new session.</p>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New attendance session" width={560}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Session name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Morning Lecture" required />
            <Field label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Operating Systems" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Branch</span>
              <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm">
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Session type</span>
              <select value={form.type} onChange={(e) => onType(e.target.value as SessionType)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm">
                {(Object.keys(TYPE_LABELS) as SessionType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" type="datetime-local" value={form.startTime} onChange={(e) => onStart(e.target.value)} />
            <Field label="End time" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>

          <motion.div layout className="flex items-center gap-3 rounded-xl border border-border bg-accent/40 p-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary"><Clock className="size-4" /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Session duration</p>
              <p className="text-sm font-semibold">{duration}</p>
            </div>
          </motion.div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} disabled={loading} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />} {loading ? "Generating..." : "Generate QR"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

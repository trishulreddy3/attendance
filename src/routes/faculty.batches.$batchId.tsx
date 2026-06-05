import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/faculty/batches/$batchId")({ component: FacultyBatchAttendancePage });


import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Users, CheckCircle2, XCircle, Minus, Search,
  Loader2, BookOpen, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
  id: string; studentId: string; studentName: string; rollNumber: string;
  attendanceDate: string; session: string; status: string;
}
interface StudentRow {
  studentId: string; studentName: string; rollNumber: string; email: string;
  records: AttendanceRecord[];
  totalPresent: number; totalAbsent: number; totalNotMarked: number;
  totalSessions: number; attendancePct: number;
}
interface Grid {
  batchId: string; batchName: string; startDate: string; endDate: string;
  rows: StudentRow[];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const STATUS_CYCLE: Record<string, string> = {
  NOT_MARKED: "PRESENT",
  PRESENT: "ABSENT",
  ABSENT: "NOT_MARKED",
};

const STATUS_STYLE: Record<string, string> = {
  PRESENT: "bg-green-500/15 text-green-600 border-green-500/20",
  ABSENT: "bg-red-500/15 text-red-600 border-red-500/20",
  NOT_MARKED: "bg-muted text-muted-foreground border-border",
};

const STATUS_ICON: Record<string, any> = {
  PRESENT: CheckCircle2,
  ABSENT: XCircle,
  NOT_MARKED: Minus,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FacultyBatchAttendancePage() {
  const { batchId } = useParams({ from: "/faculty/batches/$batchId" });
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [bulkModal, setBulkModal] = useState<{ date: string; session: string } | null>(null);
  const [pendingMarks, setPendingMarks] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const { data: grid, isLoading, refetch } = useQuery<Grid>({
    queryKey: ["faculty-batch-attendance", batchId],
    queryFn: () => api.getFacultyBatchAttendance(batchId),
    refetchInterval: false,
  });

  const markMut = useMutation({
    mutationFn: ({ studentId, date, session, status }: any) =>
      api.markAttendance(batchId, { studentId, date, session, status }),
    onError: (e: any) => toast.error(e.message),
  });

  const bulkMut = useMutation({
    mutationFn: ({ date, session, status }: any) =>
      api.bulkMarkAttendance(batchId, { date, session, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faculty-batch-attendance", batchId] });
      toast.success("Bulk mark applied");
      setBulkModal(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Collect unique dates from the grid
  const dates = useMemo(() => {
    if (!grid) return [];
    const set = new Set<string>();
    grid.rows[0]?.records.forEach(r => set.add(r.attendanceDate));
    return Array.from(set).sort();
  }, [grid]);

  // Filter dates
  const visibleDates = useMemo(() => {
    if (!selectedDate) return dates;
    return dates.filter(d => d === selectedDate);
  }, [dates, selectedDate]);

  // Filter students
  const filteredRows = useMemo(() => {
    if (!grid) return [];
    const q = search.toLowerCase();
    return grid.rows.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      (r.rollNumber || "").toLowerCase().includes(q)
    );
  }, [grid, search]);

  // Get status for a student+date+session (considering pending local changes)
  function getStatus(studentId: string, date: string, session: string, records: AttendanceRecord[]) {
    const key = `${studentId}|${date}|${session}`;
    if (pendingMarks.has(key)) return pendingMarks.get(key)!;
    const rec = records.find(r => r.attendanceDate === date && r.session === session);
    return rec?.status || "NOT_MARKED";
  }

  async function handleCellClick(studentId: string, date: string, session: string, records: AttendanceRecord[]) {
    const current = getStatus(studentId, date, session, records);
    const next = STATUS_CYCLE[current] || "PRESENT";
    const key = `${studentId}|${date}|${session}`;
    setPendingMarks(m => new Map(m).set(key, next));
    try {
      await api.markAttendance(batchId, { studentId, date, session, status: next });
    } catch (e: any) {
      // Revert on error
      setPendingMarks(m => { const nm = new Map(m); nm.delete(key); return nm; });
      toast.error(e.message);
    }
  }

  async function handleDownload() {
    try {
      const blob = await api.downloadFacultyBatchReport(batchId);
      downloadBlob(blob, `${grid?.batchName || batchId}-attendance.xlsx`);
      toast.success("Report downloaded");
    } catch (e: any) { toast.error(e.message); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  if (!grid) return (
    <div className="p-6">
      <p className="text-destructive">Failed to load attendance data.</p>
      <Link to="/faculty/batches" className="text-primary underline text-sm">← Back to batches</Link>
    </div>
  );

  const totalSessions = grid.rows[0]?.totalSessions || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 flex-wrap">
        <Link to="/faculty/batches"
          className="rounded-xl border border-border p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold flex items-center gap-2 truncate">
            <BookOpen className="size-6 text-primary flex-shrink-0" /> {grid.batchName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(grid.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} →{" "}
            {new Date(grid.endDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <RefreshCw className="size-4" /> Refresh
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download className="size-4" /> Download Report
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Students", value: grid.rows.length, color: "text-primary" },
          { label: "Total Sessions", value: totalSessions, color: "text-foreground" },
          { label: "Avg. Present", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.totalPresent, 0) / grid.rows.length) : 0, color: "text-green-600" },
          { label: "Avg. Absent", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.totalAbsent, 0) / grid.rows.length) : 0, color: "text-red-600" },
          { label: "Avg. Attendance%", value: grid.rows.length ? Math.round(grid.rows.reduce((a, r) => a + r.attendancePct, 0) / grid.rows.length) + "%" : "—", color: "text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student or roll no..."
            className="rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-primary w-56" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filter Date:</label>
          <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">All Dates</option>
            {dates.map(d => (
              <option key={d} value={d}>{new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-muted-foreground ml-auto hidden md:block">
          Click a cell to toggle: <span className="text-muted-foreground">—</span> → <span className="text-green-600">P</span> → <span className="text-red-600">A</span> → <span className="text-muted-foreground">—</span>
        </div>
      </div>

      {/* Attendance Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-xs min-w-max w-full">
            <thead>
              {/* Date header row */}
              <tr className="bg-muted/60">
                <th className="sticky left-0 z-10 bg-muted/80 backdrop-blur px-4 py-2 text-left font-semibold border-r border-border/60 min-w-[180px]">
                  Student
                </th>
                {visibleDates.map(d => (
                  <th key={d} colSpan={2} className="px-2 py-2 text-center font-semibold border-r border-border/40 min-w-[100px]">
                    <div>{formatDate(d)}</div>
                    <div className="flex gap-1 justify-center mt-0.5">
                      {["FN", "AN"].map(sess => (
                        <button key={sess}
                          onClick={() => setBulkModal({ date: d, session: sess })}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                          {sess} ▾
                        </button>
                      ))}
                    </div>
                  </th>
                ))}
                <th className="sticky right-0 z-10 bg-muted/80 backdrop-blur px-4 py-2 text-center font-semibold border-l border-border/60 min-w-[100px]">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredRows.map((row, ri) => (
                <tr key={row.studentId} className="hover:bg-muted/10 transition-colors">
                  <td className="sticky left-0 z-10 bg-card/95 backdrop-blur px-4 py-2 border-r border-border/40">
                    <div className="font-semibold text-foreground">{row.studentName}</div>
                    <div className="text-muted-foreground font-mono">{row.rollNumber || "—"}</div>
                  </td>
                  {visibleDates.map(d => (
                    <>
                      {["FN", "AN"].map(sess => {
                        const status = getStatus(row.studentId, d, sess, row.records);
                        const Icon = STATUS_ICON[status] || Minus;
                        return (
                          <td key={`${d}-${sess}`} className="px-1 py-1.5 text-center border-r border-border/20">
                            <button
                              onClick={() => handleCellClick(row.studentId, d, sess, row.records)}
                              className={`inline-flex items-center justify-center size-8 rounded-lg border transition-all hover:scale-110 ${STATUS_STYLE[status]}`}
                              title={`${row.studentName} | ${d} ${sess} | Click to toggle`}>
                              <Icon className="size-3.5" />
                            </button>
                          </td>
                        );
                      })}
                    </>
                  ))}
                  <td className="sticky right-0 z-10 bg-card/95 backdrop-blur px-3 py-2 border-l border-border/40 text-center">
                    <div className={`font-bold ${row.attendancePct >= 75 ? "text-green-600" : row.attendancePct >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {row.attendancePct}%
                    </div>
                    <div className="text-muted-foreground text-[10px]">{row.totalPresent}/{row.totalSessions}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="size-10 mx-auto mb-2 opacity-30" />
            <p>No students match your search</p>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-green-600" /> Present</span>
        <span className="flex items-center gap-1"><XCircle className="size-3.5 text-red-600" /> Absent</span>
        <span className="flex items-center gap-1"><Minus className="size-3.5" /> Not Marked</span>
      </div>

      {/* Bulk Mark Modal */}
      <AnimatePresence>
        {bulkModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-2xl w-full max-w-sm mx-4">
              <h3 className="font-bold text-lg mb-1">Bulk Mark Attendance</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">{formatDate(bulkModal.date)} — {bulkModal.session}</span>
                <br />Apply to all {filteredRows.length} student{filteredRows.length !== 1 ? "s" : ""} in current view
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Present", value: "PRESENT", cls: "bg-green-500/10 border-green-500/30 text-green-700 hover:bg-green-500/20" },
                  { label: "Absent", value: "ABSENT", cls: "bg-red-500/10 border-red-500/30 text-red-700 hover:bg-red-500/20" },
                  { label: "Reset", value: "NOT_MARKED", cls: "bg-muted border-border text-muted-foreground hover:bg-muted/80" },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => bulkMut.mutate({ date: bulkModal.date, session: bulkModal.session, status: opt.value })}
                    disabled={bulkMut.isPending}
                    className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${opt.cls} disabled:opacity-50`}>
                    {bulkMut.isPending ? <Loader2 className="size-4 animate-spin mx-auto" /> : opt.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setBulkModal(null)}
                className="w-full mt-3 rounded-xl border border-border py-2 text-sm hover:bg-accent transition-colors">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

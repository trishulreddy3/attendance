import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/batches/$id")({ component: AdminBatchDetailPage });


import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Users, Calendar, Search, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, XCircle, Minus, BookOpen,
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface BatchDTO {
  id: string; batchName: string; facultyName: string; facultyEmail: string;
  facultyMobile: string; startDate: string; endDate: string; studentCount: number;
}
interface StudentDTO {
  id: string; studentId: string; rollNumber: string; name: string; email: string;
  batchName: string;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminBatchDetailPage() {
  const { id } = useParams({ from: "/admin/batches/$id" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const { data: batch, isLoading: batchLoading } = useQuery<BatchDTO>({
    queryKey: ["batch", id],
    queryFn: () => api.getBatch(id),
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<StudentDTO[]>({
    queryKey: ["batch-students", id],
    queryFn: () => api.getBatchStudents(id),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.rollNumber || "").toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDownload = async () => {
    try {
      const blob = await api.downloadAttendanceReport(id);
      downloadBlob(blob, `${batch?.batchName || id}-attendance.xlsx`);
      toast.success("Attendance report downloaded");
    } catch (e: any) { toast.error(e.message); }
  };

  if (batchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6">
        <p className="text-destructive">Batch not found.</p>
        <Link to="/admin/batches" className="text-primary underline text-sm">← Back to batches</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4">
        <Link to="/admin/batches"
          className="rounded-xl border border-border p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="size-6 text-primary" /> {batch.batchName}
          </h1>
          <p className="text-sm text-muted-foreground">Batch Detail & Student Management</p>
        </div>
        <button onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
          <Download className="size-4" /> Download Attendance Report
        </button>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Faculty", value: batch.facultyName || "—", icon: "👨‍🏫" },
          { label: "Faculty Email", value: batch.facultyEmail || "—", icon: "📧" },
          { label: "Training Period", value: `${formatDate(batch.startDate)} → ${formatDate(batch.endDate)}`, icon: "📅" },
          { label: "Total Students", value: batch.studentCount.toString(), icon: "👥" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-sm font-semibold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Students Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="size-5 text-primary" /> Students ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, roll no, email..."
              className="rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-primary w-64" />
          </div>
        </div>

        {studentsLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="size-12 mx-auto mb-3 opacity-30" />
            <p>{search ? "No students match your search" : "No students in this batch"}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    {["#", "Roll No.", "Name", "Login ID", "Email"].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginated.map((s, i) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{s.rollNumber || "—"}</td>
                      <td className="px-5 py-3 font-medium">{s.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{s.studentId}</td>
                      <td className="px-5 py-3 text-muted-foreground">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent transition-colors">
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-sm self-center">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent transition-colors">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

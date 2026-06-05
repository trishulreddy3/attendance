import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/batches")({ component: AdminBatchesPage });


import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Download, Trash2, Eye, Users, Calendar, ChevronRight,
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle,
  X, Loader2, BookOpen, GraduationCap,
} from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Batch {
  id: string; batchName: string; facultyId: string; facultyName: string;
  facultyEmail: string; facultyMobile: string;
  startDate: string; endDate: string; studentCount: number; createdAt: string;
}
interface Faculty { id: string; name: string; email: string; mobile: string; }
interface ImportResult {
  batchId: string; batchName: string; totalFound: number; imported: number;
  duplicatesSkipped: number; invalidSkipped: number; errors: string[];
  importedStudents: { studentId: string; rollNumber: string; name: string; email: string; plainPassword: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBatchesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: batches = [], isLoading } = useQuery<Batch[]>({
    queryKey: ["admin-batches"],
    queryFn: api.getAllBatches,
  });

  const { data: faculties = [] } = useQuery<Faculty[]>({
    queryKey: ["faculty-list"],
    queryFn: api.getAllFaculty,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteBatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-batches"] });
      toast.success("Batch deleted");
      setDeletingId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleDownload = async (id: string, name: string) => {
    try {
      const blob = await api.downloadAttendanceReport(id);
      downloadBlob(blob, `${name}-attendance.xlsx`);
      toast.success("Report downloaded");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleTemplate = async () => {
    try {
      const blob = await api.downloadBatchTemplate();
      downloadBlob(blob, "student-upload-template.xlsx");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-7 text-primary" /> Batch Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage student batches with Excel upload
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleTemplate}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <FileSpreadsheet className="size-4" /> Download Template
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="size-4" /> Create Batch
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Batches", value: batches.length, icon: BookOpen },
          { label: "Total Students", value: batches.reduce((a, b) => a + b.studentCount, 0), icon: GraduationCap },
          { label: "Active Faculty", value: new Set(batches.map(b => b.facultyId)).size, icon: Users },
          { label: "Avg. Batch Size", value: batches.length ? Math.round(batches.reduce((a, b) => a + b.studentCount, 0) / batches.length) : 0, icon: Calendar },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5">
            <s.icon className="size-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Batch Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : batches.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="size-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">No batches yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Create your first batch by uploading a student Excel file.</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="size-4" /> Create First Batch
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                {["Batch Name", "Faculty", "Students", "Training Period", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {batches.map((batch, i) => (
                <motion.tr key={batch.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground">{batch.batchName}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(batch.createdAt)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">{batch.facultyName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{batch.facultyEmail}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold">
                      <Users className="size-3" /> {batch.studentCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(batch.startDate)} → {formatDate(batch.endDate)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/batches/${batch.id}`}
                        className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20 transition-colors">
                        <Eye className="size-4" />
                      </Link>
                      <button onClick={() => handleDownload(batch.id, batch.batchName)}
                        className="rounded-lg bg-green-500/10 p-1.5 text-green-600 hover:bg-green-500/20 transition-colors">
                        <Download className="size-4" />
                      </button>
                      <button onClick={() => setDeletingId(batch.id)}
                        className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Create Batch Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateBatchModal
            faculties={faculties}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setShowCreate(false);
              qc.invalidateQueries({ queryKey: ["admin-batches"] });
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deletingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-2xl w-full max-w-sm mx-4">
              <h3 className="font-bold text-lg">Delete Batch?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This will permanently delete the batch, all students, and all attendance records. This cannot be undone.
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeletingId(null)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button onClick={() => deletingId && deleteMut.mutate(deletingId)}
                  disabled={deleteMut.isPending}
                  className="flex-1 rounded-xl bg-destructive py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
                  {deleteMut.isPending ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Batch Modal (Multi-Step Wizard) ───────────────────────────────────
function CreateBatchModal({ faculties, onClose, onSuccess }: {
  faculties: Faculty[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1); // 1=Batch, 2=Faculty, 3=Upload, 4=Result
  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [facultyMode, setFacultyMode] = useState<"existing" | "new">("existing");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [newFaculty, setNewFaculty] = useState({ name: "", email: "", mobile: "", password: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) setFile(f);
    else toast.error("Please upload an Excel file (.xlsx or .xls)");
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select an Excel file"); return; }
    setIsSubmitting(true);
    try {
      const reqData: any = {
        batchName, startDate, endDate,
        ...(facultyMode === "existing"
          ? { facultyId: selectedFacultyId }
          : { facultyName: newFaculty.name, facultyEmail: newFaculty.email, facultyMobile: newFaculty.mobile, facultyPassword: newFaculty.password }),
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(reqData));
      formData.append("file", file);
      const res: ImportResult = await api.createBatch(formData);
      setResult(res);
      setStep(4);
      // Auto-download the creation report
      if (res.importedStudents?.length > 0) {
        try {
          const response = await fetch(
            (import.meta.env.DEV ? "http://localhost:8080/api" : "https://attendance-dhvi.onrender.com/api") +
            `/admin/batch/${res.batchId}/report/creation`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("sas.jwt")}` },
              body: JSON.stringify(res.importedStudents),
            }
          );
          if (response.ok) {
            const blob = await response.blob();
            downloadBlob(blob, `${res.batchName}-batch-report.xlsx`);
          }
        } catch { /* non-critical */ }
      }
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setIsSubmitting(false); }
  };

  const step1Valid = batchName.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate);
  const step2Valid = facultyMode === "existing" ? !!selectedFacultyId
    : newFaculty.name && newFaculty.email && newFaculty.password;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 className="font-bold text-lg">Create New Batch</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors"><X className="size-5" /></button>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex px-6 pt-4 gap-2">
            {["Batch Details", "Assign Faculty", "Upload Students"].map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? "bg-primary" : "bg-muted"}`} />
                <p className={`text-xs mt-1 ${i + 1 === step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Batch Name *</label>
                  <input value={batchName} onChange={e => setBatchName(e.target.value)}
                    placeholder="e.g. Java-June-2026, Python-Batch-A"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Date *</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Date *</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                {startDate && endDate && new Date(endDate) < new Date(startDate) && (
                  <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3.5" /> End date must be after start date</p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {(["existing", "new"] as const).map(mode => (
                    <button key={mode} onClick={() => setFacultyMode(mode)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${facultyMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                      {mode === "existing" ? "Select Existing Faculty" : "Create New Faculty"}
                    </button>
                  ))}
                </div>

                {facultyMode === "existing" ? (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Select Faculty *</label>
                    <select value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <option value="">— Select faculty —</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "Full Name *", key: "name", placeholder: "Dr. John Smith", type: "text" },
                      { label: "Email *", key: "email", placeholder: "faculty@college.edu", type: "email" },
                      { label: "Mobile", key: "mobile", placeholder: "9876543210", type: "tel" },
                      { label: "Password *", key: "password", placeholder: "••••••••", type: "password" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium mb-1">{field.label}</label>
                        <input type={field.type} placeholder={field.placeholder}
                          value={(newFaculty as any)[field.key]}
                          onChange={e => setNewFaculty(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="size-10 text-green-500 mx-auto" />
                      <p className="font-semibold text-green-600">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      <button onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-destructive underline">Remove file</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="size-10 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Drop your Excel file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Required columns: Name, Roll Number, Email</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Need a template? <button onClick={() => api.downloadBatchTemplate().then(b => downloadBlob(b, "student-upload-template.xlsx")).catch(() => {})}
                    className="text-primary underline">Download blank template</button>
                </p>
              </motion.div>
            )}

            {step === 4 && result && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-4">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="size-14 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold">Batch Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground">The Excel report with student credentials has been downloaded.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Found", value: result.totalFound, color: "bg-blue-500/10 text-blue-600" },
                    { label: "Imported", value: result.imported, color: "bg-green-500/10 text-green-600" },
                    { label: "Duplicates Skipped", value: result.duplicatesSkipped, color: "bg-yellow-500/10 text-yellow-600" },
                    { label: "Invalid Skipped", value: result.invalidSkipped, color: "bg-red-500/10 text-red-600" },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
                {result.errors.length > 0 && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 max-h-36 overflow-y-auto">
                    <p className="text-sm font-semibold text-destructive mb-2">Import Errors:</p>
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-destructive/80">• {e}</p>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <Link to={`/admin/batches/${result.batchId}`}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center hover:bg-primary/90 transition-colors">
                    View Batch <ChevronRight className="inline size-4" />
                  </Link>
                  <button onClick={onClose}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="flex gap-3 border-t border-border/60 px-6 py-4">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                Next <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!file || isSubmitting}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : <><CheckCircle2 className="size-4" /> Create Batch</>}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

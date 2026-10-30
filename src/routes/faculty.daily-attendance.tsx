import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  RotateCcw,
  Save,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import {
  api,
  type DailyAttendanceGridDTO,
  type DailyPeriodStatusDTO,
  type PeriodMark,
  type PeriodStatus,
} from "@/lib/api";
import { BRANCHES, type Branch } from "@/lib/store";

export const Route = createFileRoute("/faculty/daily-attendance")({
  head: () => ({ meta: [{ title: "Daily Attendance — Pulse" }] }),
  component: DailyAttendancePage,
});

const PERIODS = [1, 2, 3, 4, 5, 6, 7];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DailyAttendancePage() {
  const [department, setDepartment] = useState<string>("CSE");
  const [date, setDate] = useState<string>(getTodayString());
  const [grid, setGrid] = useState<DailyAttendanceGridDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Local editable student rows: studentId -> record of period numbers to status
  const [studentEdits, setStudentEdits] = useState<Record<string, Record<number, PeriodStatus>>>(
    {},
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Dialog for confirming date/department change when unsaved edits exist
  const [pendingChange, setPendingChange] = useState<{
    type: "date" | "dept";
    value: string;
  } | null>(null);

  // Load grid for selected department and date
  const loadGrid = async (dept: string, targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDailyAttendanceGrid(dept, targetDate);
      setGrid(data);

      // Initialize edit state directly from backend response
      const initialEdits: Record<string, Record<number, PeriodStatus>> = {};
      data.students.forEach((s) => {
        initialEdits[s.studentId] = {};
        PERIODS.forEach((p) => {
          initialEdits[s.studentId][p] = s.periods[String(p)] || "NOT_MARKED";
        });
      });
      setStudentEdits(initialEdits);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error("Failed to load daily attendance grid:", err);
      setError(err.message || "Failed to load attendance grid");
      toast.error(err.message || "Failed to load attendance grid");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .getDailyAttendanceGrid(department, date)
      .then((data) => {
        if (!active) return;
        setGrid(data);

        // Initialize edit state directly from backend response
        const initialEdits: Record<string, Record<number, PeriodStatus>> = {};
        data.students.forEach((s) => {
          initialEdits[s.studentId] = {};
          PERIODS.forEach((p) => {
            initialEdits[s.studentId][p] = s.periods[String(p)] || "NOT_MARKED";
          });
        });
        setStudentEdits(initialEdits);
        setHasUnsavedChanges(false);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error("Failed to load daily attendance grid:", err);
        setError(err.message || "Failed to load attendance grid");
        toast.error(err.message || "Failed to load attendance grid");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [department, date]);

  // Request change with unsaved protection
  const handleDateChangeRequest = (newDate: string) => {
    if (newDate === date) return;
    if (hasUnsavedChanges) {
      setPendingChange({ type: "date", value: newDate });
    } else {
      setDate(newDate);
    }
  };

  const handleDeptChangeRequest = (newDept: string) => {
    if (newDept === department) return;
    if (hasUnsavedChanges) {
      setPendingChange({ type: "dept", value: newDept });
    } else {
      setDepartment(newDept);
    }
  };

  const confirmPendingChange = () => {
    if (!pendingChange) return;
    if (pendingChange.type === "date") {
      setDate(pendingChange.value);
    } else {
      setDepartment(pendingChange.value);
    }
    setPendingChange(null);
    setHasUnsavedChanges(false);
  };

  // Toggle single period cell status
  // Sequence: NOT_MARKED -> PRESENT -> ABSENT -> NOT_MARKED
  const togglePeriodStatus = (studentId: string, period: number) => {
    setStudentEdits((prev) => {
      const current = prev[studentId]?.[period] || "NOT_MARKED";
      let next: PeriodStatus = "PRESENT";
      if (current === "PRESENT") next = "ABSENT";
      else if (current === "ABSENT") next = "NOT_MARKED";
      else next = "PRESENT";

      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [period]: next,
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Set explicit status for a specific cell
  const setPeriodExplicit = (studentId: string, period: number, status: PeriodStatus) => {
    setStudentEdits((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [period]: status,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Mark all periods for all students locally
  const markAllLocal = (status: "PRESENT" | "ABSENT") => {
    if (!grid || grid.students.length === 0) return;
    setStudentEdits((prev) => {
      const nextEdits = { ...prev };
      grid.students.forEach((s) => {
        nextEdits[s.studentId] = { ...(nextEdits[s.studentId] || {}) };
        PERIODS.forEach((p) => {
          nextEdits[s.studentId][p] = status;
        });
      });
      return nextEdits;
    });
    setHasUnsavedChanges(true);
    toast.info(`Marked all ${status.toLowerCase()} for all 7 periods (unsaved)`);
  };

  // Reset to originally fetched state
  const resetEdits = () => {
    if (!grid) return;
    const initialEdits: Record<string, Record<number, PeriodStatus>> = {};
    grid.students.forEach((s) => {
      initialEdits[s.studentId] = {};
      PERIODS.forEach((p) => {
        initialEdits[s.studentId][p] = s.periods[String(p)] || "NOT_MARKED";
      });
    });
    setStudentEdits(initialEdits);
    setHasUnsavedChanges(false);
    toast.success("Unsaved changes reset");
  };

  // Save changes to backend
  const saveAttendance = async () => {
    if (!grid || saving) return;
    setSaving(true);
    try {
      const entries: PeriodMark[] = [];
      grid.students.forEach((s) => {
        const studentPeriods = studentEdits[s.studentId] || {};
        PERIODS.forEach((p) => {
          const currentStatus = studentPeriods[p];
          // We persist only marked periods (PRESENT or ABSENT).
          // NOT_MARKED periods are omitted from the update payload.
          if (currentStatus === "PRESENT" || currentStatus === "ABSENT") {
            entries.push({
              studentId: s.rollNumber || s.studentId,
              period: p,
              status: currentStatus,
            });
          }
        });
      });

      if (entries.length === 0) {
        toast.info("No marked attendance periods to save");
        setSaving(false);
        return;
      }

      const updatedGrid = await api.saveDailyAttendance({
        department,
        date,
        entries,
      });

      setGrid(updatedGrid);
      // Re-sync edit state
      const refreshedEdits: Record<string, Record<number, PeriodStatus>> = {};
      updatedGrid.students.forEach((s) => {
        refreshedEdits[s.studentId] = {};
        PERIODS.forEach((p) => {
          refreshedEdits[s.studentId][p] = s.periods[String(p)] || "NOT_MARKED";
        });
      });
      setStudentEdits(refreshedEdits);
      setHasUnsavedChanges(false);
      toast.success("Daily attendance saved successfully!");
    } catch (err: any) {
      console.error("Save attendance failed:", err);
      toast.error(err.message || "Failed to save daily attendance");
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation for the summary bar
  const summaryStats = useMemo(() => {
    if (!grid) return { presentCount: 0, absentCount: 0, notMarkedCount: 0, totalSlots: 0 };
    let presentCount = 0;
    let absentCount = 0;
    let notMarkedCount = 0;
    const totalSlots = grid.students.length * 7;

    grid.students.forEach((s) => {
      const pMap = studentEdits[s.studentId] || {};
      PERIODS.forEach((p) => {
        const st = pMap[p] || "NOT_MARKED";
        if (st === "PRESENT") presentCount++;
        else if (st === "ABSENT") absentCount++;
        else notMarkedCount++;
      });
    });

    return { presentCount, absentCount, notMarkedCount, totalSlots };
  }, [grid, studentEdits]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily 7-Period Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Manage period-wise attendance (P1 to P7) with live corrections and duplicate prevention.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={resetEdits}
              data-testid="reset-attendance"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <RotateCcw className="size-4 text-muted-foreground" />
              Reset
            </button>
          )}

          <button
            onClick={saveAttendance}
            data-testid="save-attendance"
            disabled={saving || !hasUnsavedChanges}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Filter and Date Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Department Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dept:
            </span>
            <select
              value={department}
              data-testid="dept-select"
              onChange={(e) => handleDeptChangeRequest(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date:
            </span>
            <div className="relative">
              <input
                type="date"
                data-testid="date-picker"
                value={date}
                onChange={(e) => handleDateChangeRequest(e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllLocal("PRESENT")}
            data-testid="mark-all-present"
            disabled={loading || saving || !grid?.students.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Mark All Present
          </button>

          <button
            onClick={() => markAllLocal("ABSENT")}
            data-testid="mark-all-absent"
            disabled={loading || saving || !grid?.students.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
          >
            <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary Indicator Strip */}
      {grid && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Total Students:{" "}
              <strong data-testid="total-students-count" className="text-foreground">
                {grid.students.length}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Present Slots:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {summaryStats.presentCount}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Absent Slots:{" "}
              <strong className="text-rose-600 dark:text-rose-400">
                {summaryStats.absentCount}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/40" />
              Not Marked: <strong className="text-foreground">{summaryStats.notMarkedCount}</strong>
            </span>
          </div>

          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3.5" />
              You have unsaved changes!
            </span>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">Loading attendance grid...</p>
            <p className="text-xs">
              Fetching students and period records for {department} on {date}.
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>
            <button
              onClick={() => loadGrid(department, date)}
              className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Retry
            </button>
          </div>
        ) : !grid || grid.students.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <Users className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">No students found</p>
            <p className="text-xs">No registered students found for department {department}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-semibold text-foreground w-28">Roll No.</th>
                  <th className="px-4 py-3.5 font-semibold text-foreground min-w-[160px]">
                    Student
                  </th>
                  <th className="px-3 py-3.5 font-semibold text-foreground w-20">Dept</th>
                  {PERIODS.map((p) => (
                    <th key={p} className="px-2 py-3.5 font-semibold text-center w-20">
                      P{p}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 font-semibold text-right w-24">Day Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <AnimatePresence initial={false}>
                  {grid.students.map((student, idx) => {
                    const studentPeriods = studentEdits[student.studentId] || {};
                    let presentInDay = 0;
                    let absentInDay = 0;
                    PERIODS.forEach((p) => {
                      if (studentPeriods[p] === "PRESENT") presentInDay++;
                      else if (studentPeriods[p] === "ABSENT") absentInDay++;
                    });

                    const sid = student.rollNumber || student.studentId;

                    return (
                      <motion.tr
                        key={student.studentId}
                        data-testid={`student-row-${sid}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Roll Number */}
                        <td
                          data-testid={`roll-number-${sid}`}
                          className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap"
                        >
                          {student.rollNumber || "—"}
                        </td>

                        {/* Student Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {student.studentName
                                ? student.studentName.charAt(0).toUpperCase()
                                : "S"}
                            </div>
                            <span
                              data-testid={`student-name-${sid}`}
                              className="font-medium text-foreground truncate max-w-[200px]"
                            >
                              {student.studentName}
                            </span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-3 py-3">
                          <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                            {student.department || department}
                          </span>
                        </td>

                        {/* Periods 1 to 7 interactive toggle cells */}
                        {PERIODS.map((period) => {
                          const status = studentPeriods[period] || "NOT_MARKED";

                          return (
                            <td key={period} className="px-1.5 py-3 text-center">
                              <div className="inline-flex items-center justify-center">
                                <button
                                  type="button"
                                  data-testid={`period-btn-${sid}-${period}`}
                                  onClick={() => togglePeriodStatus(student.studentId, period)}
                                  aria-label={`Toggle period ${period} for ${student.studentName}. Currently ${status}`}
                                  className={`group relative flex items-center justify-center size-9 rounded-lg font-bold text-xs transition-all shadow-2xs ${
                                    status === "PRESENT"
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 ring-emerald-500/20"
                                      : status === "ABSENT"
                                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/25 ring-rose-500/20"
                                        : "bg-muted/40 text-muted-foreground border border-dashed border-border/80 hover:bg-muted/80 hover:text-foreground"
                                  }`}
                                  title={`Click to cycle (Currently: ${status})`}
                                >
                                  {status === "PRESENT" ? (
                                    <span className="flex items-center gap-0.5">P</span>
                                  ) : status === "ABSENT" ? (
                                    <span className="flex items-center gap-0.5">A</span>
                                  ) : (
                                    <span className="text-muted-foreground/60">—</span>
                                  )}
                                </button>
                              </div>
                            </td>
                          );
                        })}

                        {/* Day Status Summary */}
                        <td
                          data-testid={`day-status-${sid}`}
                          className="px-4 py-3 text-right whitespace-nowrap"
                        >
                          {presentInDay + absentInDay === 0 ? (
                            <span className="text-xs text-muted-foreground">Unmarked</span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-medium">
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {presentInDay}P
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-rose-600 dark:text-rose-400">
                                {absentInDay}A
                              </span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal for Unsaved Changes */}
      <Modal
        open={!!pendingChange}
        onClose={() => setPendingChange(null)}
        title="Discard Unsaved Changes?"
        width={400}
      >
        <p className="text-sm text-muted-foreground">
          You have unsaved attendance marks on this page. Switching the{" "}
          {pendingChange?.type === "date" ? "date" : "department"} will discard your unsaved edits.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setPendingChange(null)}
            className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-accent"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={confirmPendingChange}
            className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
          >
            Discard & Switch
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DailyAttendancePage;

import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, type MonthlyClassReportDTO, type MonthlyStudentReportDTO } from "@/lib/api";
import { BRANCHES, type Branch } from "@/lib/store";

export const Route = createFileRoute("/faculty/monthly-reports")({
  head: () => ({ meta: [{ title: "Monthly Reports — Pulse" }] }),
  component: MonthlyReportsPage,
});

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function MonthlyReportsPage() {
  const now = new Date();
  const [department, setDepartment] = useState<string>("CSE");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [threshold, setThreshold] = useState<number>(75);
  const [belowThresholdOnly, setBelowThresholdOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const [report, setReport] = useState<MonthlyClassReportDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<
    "rollNumber" | "studentName" | "presentPeriods" | "attendancePercentage"
  >("rollNumber");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Fetch report data from backend
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMonthlyReport(
        department,
        year,
        month,
        threshold,
        belowThresholdOnly,
      );
      setReport(data);
    } catch (err: any) {
      console.error("Failed to fetch monthly report:", err);
      setError(err.message || "Failed to load monthly report");
      toast.error(err.message || "Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .getMonthlyReport(department, year, month, threshold, belowThresholdOnly)
      .then((data) => {
        if (active) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (active) {
          console.error("Failed to fetch monthly report:", err);
          setError(err.message || "Failed to load monthly report");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [department, year, month, threshold, belowThresholdOnly]);

  // Handle CSV Download directly from backend
  const handleDownloadCsv = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await api.downloadMonthlyReportCsv(department, year, month, threshold);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeDept = department.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `attendance-report-${safeDept}-${year}-${String(month).padStart(2, "0")}.csv`;

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${fileName}`);
    } catch (err: any) {
      console.error("Failed to export monthly CSV:", err);
      toast.error(err.message || "Failed to download CSV export");
    } finally {
      setDownloading(false);
    }
  };

  // Filter and sort students list locally for display
  const displayedStudents = useMemo(() => {
    if (!report?.students) return [];
    let list = [...report.students];

    // Local Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)),
      );
    }

    // Sort
    list.sort((a, b) => {
      let va: any = a[sortField];
      let vb: any = b[sortField];
      if (typeof va === "string") {
        va = va.toLowerCase();
        vb = (vb || "").toLowerCase();
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [report, search, sortField, sortAsc]);

  const toggleSort = (
    field: "rollNumber" | "studentName" | "presentPeriods" | "attendancePercentage",
  ) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Class Summary Calculations
  const classSummary = useMemo(() => {
    if (!report?.students || report.students.length === 0) {
      return {
        avgPercentage: 0,
        totalShortage: 0,
        totalWorkingPeriods: report?.totalWorkingPeriods || 0,
      };
    }
    const sum = report.students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
    const avg = sum / report.students.length;
    return {
      avgPercentage: Number(avg.toFixed(2)),
      totalShortage:
        report.studentsBelowThreshold ?? report.students.filter((s) => s.belowThreshold).length,
      totalWorkingPeriods: report.totalWorkingPeriods,
    };
  }, [report]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monthly Attendance Reports</h2>
          <p className="text-sm text-muted-foreground">
            Aggregated working periods, present/absent counts, percentage calculations, and CSV
            export.
          </p>
        </div>

        {/* CSV Download Button */}
        <button
          onClick={handleDownloadCsv}
          data-testid="report-export-csv"
          disabled={downloading || loading || !report?.students.length}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {downloading ? "Generating CSV..." : "Export CSV"}
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Dept:
              </span>
              <select
                value={department}
                data-testid="report-dept-select"
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Month:
              </span>
              <select
                value={month}
                data-testid="report-month-select"
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-9 rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Year:
              </span>
              <input
                type="number"
                data-testid="report-year-select"
                min={2020}
                max={2035}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 w-24 rounded-lg border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Threshold Input */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Threshold:
              </span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  data-testid="report-threshold-input"
                  min={1}
                  max={100}
                  step={5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="h-9 w-20 rounded-lg border border-input bg-card px-2.5 text-sm font-medium pr-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <span className="absolute right-2 text-xs text-muted-foreground font-semibold">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Below Threshold Only */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground">
            <input
              type="checkbox"
              data-testid="report-low-toggle"
              checked={belowThresholdOnly}
              onChange={(e) => setBelowThresholdOnly(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            Show Low Attendance Only (&lt; {threshold}%)
          </label>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <div className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              data-testid="report-search-input"
              placeholder="Filter by student name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/60 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Class Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Class Enrolled
            </span>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{report?.totalStudents || 0}</p>
          <span className="text-xs text-muted-foreground">Department {department}</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Working Periods
            </span>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {classSummary.totalWorkingPeriods}
          </p>
          <span className="text-xs text-muted-foreground">
            Held in {MONTHS.find((m) => m.value === month)?.label} {year}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Attendance
            </span>
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{classSummary.avgPercentage}%</p>
          <span className="text-xs text-muted-foreground">Benchmark target: {threshold}%</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Shortage Alerts
            </span>
            <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {classSummary.totalShortage}
          </p>
          <span className="text-xs text-muted-foreground">
            Students below {threshold}% threshold
          </span>
        </div>
      </div>

      {/* Main Report Table Container */}
      <motion.div
        layout
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Calculating monthly attendance...
            </p>
            <p className="text-xs">Aggregating periods and calculating percentage metrics.</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto size-8 text-destructive" />
            <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Retry
            </button>
          </div>
        ) : !report || displayedStudents.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <FileSpreadsheet className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">No records to display</p>
            <p className="text-xs">
              {belowThresholdOnly
                ? `No students have attendance below the ${threshold}% threshold.`
                : `No attendance records found for ${department} in ${MONTHS.find((m) => m.value === month)?.label} ${year}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th
                    onClick={() => toggleSort("rollNumber")}
                    className="px-5 py-3.5 font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors w-32"
                  >
                    <div className="flex items-center gap-1.5">
                      Roll No.
                      <ArrowUpDown className="size-3 text-muted-foreground/70" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("studentName")}
                    className="px-5 py-3.5 font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Student
                      <ArrowUpDown className="size-3 text-muted-foreground/70" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-center text-foreground w-36">
                    Working periods
                  </th>
                  <th
                    onClick={() => toggleSort("presentPeriods")}
                    className="px-5 py-3.5 font-semibold text-center text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-muted/70 transition-colors w-28"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      Present
                      <ArrowUpDown className="size-3 text-muted-foreground/70" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-center text-rose-700 dark:text-rose-400 w-28">
                    Absent
                  </th>
                  <th
                    onClick={() => toggleSort("attendancePercentage")}
                    className="px-5 py-3.5 font-semibold text-right text-foreground cursor-pointer hover:bg-muted/70 transition-colors w-36"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Attendance %
                      <ArrowUpDown className="size-3 text-muted-foreground/70" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <AnimatePresence initial={false}>
                  {displayedStudents.map((s) => {
                    const sid = s.rollNumber || s.studentId;
                    return (
                      <motion.tr
                        key={s.studentId}
                        data-testid={`report-row-${sid}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-muted/30 transition-colors ${
                          s.belowThreshold ? "bg-rose-500/5 dark:bg-rose-500/10" : ""
                        }`}
                      >
                        {/* Roll Number */}
                        <td
                          data-testid={`report-roll-${sid}`}
                          className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground whitespace-nowrap"
                        >
                          {s.rollNumber || "—"}
                        </td>

                        {/* Student Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {s.studentName ? s.studentName.charAt(0).toUpperCase() : "S"}
                            </div>
                            <span
                              data-testid={`report-name-${sid}`}
                              className="font-medium text-foreground"
                            >
                              {s.studentName}
                            </span>
                          </div>
                        </td>

                        {/* Working Periods */}
                        <td
                          data-testid={`report-working-${sid}`}
                          className="px-5 py-3.5 text-center font-mono text-sm text-foreground"
                        >
                          {s.workingPeriods}
                        </td>

                        {/* Present Periods */}
                        <td
                          data-testid={`report-present-${sid}`}
                          className="px-5 py-3.5 text-center font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                          {s.presentPeriods}
                        </td>

                        {/* Absent Periods */}
                        <td
                          data-testid={`report-absent-${sid}`}
                          className="px-5 py-3.5 text-center font-mono text-sm font-semibold text-rose-600 dark:text-rose-400"
                        >
                          {s.absentPeriods}
                        </td>

                        {/* Attendance Percentage & Badge */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <span
                              data-testid={`report-percentage-${sid}`}
                              className="font-mono text-sm font-bold text-foreground"
                            >
                              {s.attendancePercentage.toFixed(2)}%
                            </span>
                            {s.belowThreshold ? (
                              <span
                                data-testid={`report-badge-${sid}`}
                                className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400"
                              >
                                <AlertTriangle className="size-3" />
                                Shortage
                              </span>
                            ) : (
                              <span
                                data-testid={`report-badge-${sid}`}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                              >
                                <CheckCircle className="size-3" />
                                Normal
                              </span>
                            )}
                          </div>
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
    </div>
  );
}

export default MonthlyReportsPage;

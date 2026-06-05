import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/faculty/batches")({ component: FacultyBatchesPage });


import { motion } from "framer-motion";
import { BookOpen, Users, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface BatchDTO {
  id: string; batchName: string; facultyName: string; startDate: string;
  endDate: string; studentCount: number; createdAt: string;
}

function formatDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getDaysDiff(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function FacultyBatchesPage() {
  const { data: batches = [], isLoading } = useQuery<BatchDTO[]>({
    queryKey: ["faculty-batches"],
    queryFn: api.getFacultyBatches,
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="size-7 text-primary" /> My Batches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage attendance for your assigned batches
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Batches", value: batches.length, icon: BookOpen },
          { label: "Total Students", value: batches.reduce((a, b) => a + b.studentCount, 0), icon: Users },
          { label: "Training Days", value: batches.reduce((a, b) => a + getDaysDiff(b.startDate, b.endDate), 0), icon: Calendar },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5">
            <s.icon className="size-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Batch Cards */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
      ) : batches.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center">
          <BookOpen className="size-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground">No batches assigned yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Ask the admin to assign you to a batch.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch, i) => (
            <motion.div key={batch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}>
              <Link to={`/faculty/batches/${batch.id}`}
                className="block rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-5 hover:border-primary/40 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{batch.batchName}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(batch.startDate)} → {formatDate(batch.endDate)}</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" /> {batch.studentCount} students
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-4" /> {getDaysDiff(batch.startDate, batch.endDate)} days
                  </span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {getDaysDiff(batch.startDate, batch.endDate) * 2} total sessions (FN + AN)
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

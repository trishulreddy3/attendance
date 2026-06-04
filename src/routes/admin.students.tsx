import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MonitorX, Smartphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudents,
});

function AdminStudents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => api.getAllStudentsAdmin(),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => api.resetStudentDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast.success("Device binding reset successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to reset device"),
  });

  const filtered = students.filter((s: any) => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-6 text-muted-foreground animate-pulse">Loading students...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Devices</h1>
        <p className="text-muted-foreground">Manage student device bindings and reset access.</p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-10 w-full max-w-sm rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Device Status</th>
                <th className="px-6 py-4 font-medium">Fingerprint / Bound At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.studentId} className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{s.studentName}</td>
                  <td className="px-6 py-4">
                    {s.status === "Bound" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="size-3.5" /> Bound
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        Unbound
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {s.deviceFingerprint ? (
                        <>
                          <span className="font-mono text-foreground">{s.deviceFingerprint.substring(0, 16)}...</span>
                          <span>{new Date(s.boundAt).toLocaleString()}</span>
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Reset device binding for ${s.studentName}? They will need to bind a new device on next login.`)) {
                          resetMutation.mutate(s.studentId);
                        }
                      }}
                      disabled={s.status !== "Bound" || resetMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    >
                      <MonitorX className="size-3.5" /> Reset Device
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

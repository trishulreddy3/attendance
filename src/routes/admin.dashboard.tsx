import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatCard } from "@/components/common/StatCard";
import { Users, GraduationCap, Radio, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.getAdminDashboard(),
  });

  if (isLoading) return <div className="p-6 text-muted-foreground animate-pulse">Loading dashboard data...</div>;
  if (error) return <div className="p-6 text-destructive">Failed to load dashboard data</div>;
  if (!data) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">High-level statistics for the Pulse Attendance System.</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Faculty" value={data.totalFaculty} icon={<Users />} />
        <StatCard title="Total Students" value={data.totalStudents} icon={<GraduationCap />} />
        <StatCard title="Total Sessions" value={data.totalSessions} icon={<Radio />} />
        <StatCard title="Total Attendances" value={data.totalAttendance} icon={<CheckCircle2 />} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Faculty Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Branch</th>
                <th className="pb-3 font-medium text-right">Mobile</th>
              </tr>
            </thead>
            <tbody>
              {data.facultyList.map((f: any) => (
                <tr key={f.id} className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="py-3 pr-4">{f.name}</td>
                  <td className="py-3 pr-4">{f.email}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {f.branch}
                    </span>
                  </td>
                  <td className="py-3 text-right">{f.mobile}</td>
                </tr>
              ))}
              {data.facultyList.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">No faculty members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, GraduationCap, Radio, CheckCircle2, MoreHorizontal, TrendingUp, Activity, UserPlus, Server } from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function AnimatedStatCard({ title, value, icon, delay, trend, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group"
    >
      <div className="absolute -right-6 -top-6 text-primary/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
        <div className="scale-75 opacity-70">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</h3>
            {trend && (
              <span className="flex items-center text-xs font-medium text-emerald-500">
                <TrendingUp className="mr-1 size-3" />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
      {description && <p className="mt-4 text-xs text-muted-foreground">{description}</p>}
    </motion.div>
  );
}

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.getAdminDashboard(),
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Server className="size-12 text-destructive mx-auto opacity-50" />
          <p className="text-destructive font-medium">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  // We don't need mock data since we get it from backend!
  const activityData = data.activityData || [];

  // Group faculty by branch for pie chart
  const branchCounts = data.facultyList.reduce((acc: any, f: any) => {
    acc[f.branch] = (acc[f.branch] || 0) + 1;
    return acc;
  }, {});
  const branchData = Object.entries(branchCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header section with gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-border p-8"
      >
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4">
          <div className="size-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Admin 👋</h1>
          <p className="text-muted-foreground max-w-xl">
            Here's what's happening in the Pulse Attendance System today. The system is running smoothly.
          </p>
        </div>
      </motion.div>
      
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard 
          title="Total Faculty" 
          value={data.totalFaculty} 
          icon={<Users className="size-full" />} 
          delay={0.1}
          description="Active teaching staff accounts"
        />
        <AnimatedStatCard 
          title="Total Students" 
          value={data.totalStudents} 
          icon={<GraduationCap className="size-full" />} 
          delay={0.2}
          description="Registered student devices"
        />
        <AnimatedStatCard 
          title="Active Sessions" 
          value={data.totalSessions} 
          icon={<Radio className="size-full" />} 
          delay={0.3}
          description="Total attendance sessions created"
        />
        <AnimatedStatCard 
          title="Total Pings" 
          value={data.totalAttendance} 
          icon={<CheckCircle2 className="size-full" />} 
          delay={0.4}
          description="Successful attendance marks recorded"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Weekly Attendance Activity
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Number of attendances marked per day (Last 7 Days)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(var(--primary), 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col"
        >
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Faculty by Branch</h2>
            <p className="text-xs text-muted-foreground">Distribution across departments</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full mt-4">
            {branchData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={branchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {branchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No faculty data</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {branchData.map((b, i) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{b.name}</span>
                <span className="ml-auto font-medium">{b.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modern Data Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border/50 gap-4">
          <div>
            <h2 className="text-lg font-semibold">Faculty Directory</h2>
            <p className="text-sm text-muted-foreground">Manage system administrators and teaching staff.</p>
          </div>
          <Link to="/admin/faculty" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
            <UserPlus className="mr-2 size-4" /> Add Faculty
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left text-muted-foreground">
                <th className="px-6 py-4 font-medium">Faculty Member</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.facultyList.map((f: any) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {f.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {f.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {f.mobile}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {data.facultyList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Users className="size-6 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-lg font-semibold">No faculty members</p>
                      <p className="mt-2 text-sm text-muted-foreground">Get started by adding teaching staff to the system.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

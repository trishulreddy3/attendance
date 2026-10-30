import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  LayoutDashboard,
  Radio,
  User,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/faculty")({
  component: FacultyLayout,
});

const NAV = [
  { to: "/faculty/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { to: "/faculty/daily-attendance", label: "Daily Attendance", icon: <CalendarCheck /> },
  { to: "/faculty/monthly-reports", label: "Monthly Reports", icon: <FileSpreadsheet /> },
  { to: "/faculty/batches", label: "Batches", icon: <BookOpen /> },
  { to: "/faculty/students", label: "Students", icon: <Users /> },
  { to: "/faculty/sessions", label: "Sessions", icon: <Radio /> },
  { to: "/faculty/reports", label: "Analytics", icon: <BarChart3 /> },
  { to: "/faculty/profile", label: "Profile", icon: <User /> },
];

const TITLES: Record<string, string> = {
  "/faculty/dashboard": "Dashboard",
  "/faculty/daily-attendance": "Daily 7-Period Attendance",
  "/faculty/monthly-reports": "Monthly Attendance Reports",
  "/faculty/batches": "My Batches",
  "/faculty/students": "Students",
  "/faculty/sessions": "Sessions",
  "/faculty/reports": "Analytics",
  "/faculty/profile": "Profile",
};

function FacultyLayout() {
  const { user, loading } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (user.kind !== "faculty") nav({ to: "/student/dashboard" });
  }, [user, nav, loading]);

  if (loading || !user) return null;
  const title =
    TITLES[loc.pathname] ?? (loc.pathname.includes("/sessions/") ? "Live session" : "Pulse");
  return (
    <AppShell nav={NAV} title={title}>
      <Outlet />
    </AppShell>
  );
}

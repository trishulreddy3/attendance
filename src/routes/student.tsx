import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { History, LayoutDashboard, ScanLine, User } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const NAV = [
  { to: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { to: "/student/scan", label: "Scan QR", icon: <ScanLine /> },
  { to: "/student/history", label: "History", icon: <History /> },
  { to: "/student/profile", label: "Profile", icon: <User /> },
];

const TITLES: Record<string, string> = {
  "/student/dashboard": "Dashboard",
  "/student/scan": "Scan QR",
  "/student/history": "Attendance history",
  "/student/profile": "Profile",
};

function StudentLayout() {
  const { user, loading } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/student-login" });
    else if (user.kind !== "student") nav({ to: "/faculty/dashboard" });
  }, [user, nav, loading]);

  if (loading || !user) return null;
  return (
    <AppShell nav={NAV} title={TITLES[loc.pathname] ?? "Pulse"}>
      <Outlet />
    </AppShell>
  );
}

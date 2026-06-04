import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, GraduationCap } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { to: "/admin/faculty", label: "Faculty", icon: <Users /> },
  { to: "/admin/students", label: "Students", icon: <GraduationCap /> },
];

const TITLES: Record<string, string> = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/faculty": "Manage Faculty",
  "/admin/students": "Manage Students",
};

function AdminLayout() {
  const { user, loading } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/admin-login" });
    else if (user.kind !== "admin") nav({ to: "/" });
  }, [user, nav, loading]);

  if (loading || !user) return null;
  const title = TITLES[loc.pathname] ?? "Admin Portal";

  return (
    <AppShell nav={NAV} title={title}>
      <Outlet />
    </AppShell>
  );
}

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { useApp } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function AppShell({
  nav,
  children,
  title,
}: {
  nav: NavItem[];
  children: ReactNode;
  title: string;
}) {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { logout, currentFaculty, currentStudent } = useApp();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const me = currentFaculty() ?? currentStudent();

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = loc.pathname === n.to || loc.pathname.startsWith(n.to + "/");
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 [&_svg]:size-4">{n.icon}</span>
              <span className="relative z-10 font-medium">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
            {me?.name?.[0] ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{me?.name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{me?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              nav2({ to: "/" });
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block sticky top-0 h-screen">{Sidebar}</div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-md p-2 hover:bg-accent"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggle}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="inline-flex">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </motion.span>
            </button>
          </div>
        </header>
        <motion.main
          key={loc.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-4 md:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

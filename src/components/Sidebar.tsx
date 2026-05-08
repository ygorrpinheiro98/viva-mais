"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Bike,
  Dumbbell,
  Trophy,
  Medal,
  Users,
  Calendar,
  ClipboardList,
  Sparkles,
  Calculator,
  FileText,
  User,
  LogOut,
  Sun,
  Moon,
  Activity,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { NotificationManager } from "./NotificationManager";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const mainNavItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/dashboard/feed", label: "Feed", icon: Zap },
    { href: "/dashboard/strava", label: "Strava", icon: Bike, highlight: true },
    { href: "/dashboard/workouts", label: "Treinos", icon: Dumbbell },
    { href: "/dashboard/challenges", label: "Desafios", icon: Trophy },
    { href: "/dashboard/rankings", label: "Rankings", icon: Medal },
    { href: "/dashboard/groups", label: "Grupos", icon: Users },
    { href: "/dashboard/events", label: "Eventos", icon: Calendar },
  ];

  const secondaryNavItems = [
    { href: "/dashboard/plans", label: "Planos", icon: ClipboardList },
    { href: "/dashboard/ai-generator", label: "IA", icon: Sparkles },
    { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
    { href: "/dashboard/calculators", label: "Calculadoras", icon: Calculator },
    { href: "/dashboard/blog", label: "Blog", icon: FileText },
    { href: "/dashboard/profile", label: "Perfil", icon: User },
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg card"
      >
        <Menu className="w-5 h-5" style={{ color: "var(--primary)" }} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 flex flex-col transition-all duration-300 z-[60] ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        <div
          className="h-16 flex items-center justify-between px-4"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                  VIVA
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#F97316]">
                  KINETIC LAB
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ background: "var(--primary)" }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <div
                      className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap card"
                    >
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
                Ferramentas
              </p>
            )}
            <div className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {collapsed && (
                      <div
                        className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap card"
                      >
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="mb-2">
            <NotificationManager variant="button" />
          </div>

          <button
            onClick={toggleTheme}
            className="sidebar-item w-full justify-center lg:justify-start"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5 text-[#EAB308]" />
                {!collapsed && <span className="text-[#EAB308]">Modo Claro</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-[#6366F1]" />
                {!collapsed && <span className="text-[#6366F1]">Modo Escuro</span>}
              </>
            )}
          </button>

          <form action="/auth/signout" method="post" className="mt-1">
            <button
              type="submit"
              className="sidebar-item w-full justify-center lg:justify-start"
              style={{ color: "var(--danger)" }}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Sair</span>}
            </button>
          </form>

          <button
            onClick={onToggle}
            className="sidebar-item w-full justify-center lg:justify-start mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

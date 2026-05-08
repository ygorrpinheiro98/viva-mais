"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Activity,
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
  Menu,
  X,
  Dumbbell,
  Bike,
} from "lucide-react";

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/dashboard/feed", label: "Feed", icon: Zap },
    { href: "/dashboard/strava", label: "Strava", icon: Bike, highlight: true },
    { href: "/dashboard/workouts", label: "Treinos", icon: Dumbbell },
    { href: "/dashboard/challenges", label: "Desafios", icon: Trophy },
    { href: "/dashboard/rankings", label: "Rankings", icon: Medal },
    { href: "/dashboard/groups", label: "Grupos", icon: Users },
    { href: "/dashboard/events", label: "Eventos", icon: Calendar },
    { href: "/dashboard/plans", label: "Planos", icon: ClipboardList },
    { href: "/dashboard/ai-generator", label: "IA", icon: Sparkles },
    { href: "/dashboard/calculators", label: "Calculadoras", icon: Calculator },
    { href: "/dashboard/blog", label: "Blog", icon: FileText },
    { href: "/dashboard/profile", label: "Perfil", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-[#0ea5e9]/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] opacity-30 blur-sm -z-10 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">VIVA</span>
              <span className="text-[10px] font-medium tracking-widest text-[#0ea5e9] -mt-1">PLUS</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                      : item.highlight
                      ? "text-[#f8fafc] hover:bg-white/5 hover:text-[#38bdf8]"
                      : "text-[#94a3b8] hover:bg-white/5 hover:text-[#f8fafc]"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-[#0ea5e9]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <form action="/auth/signout" method="post" className="hidden lg:block">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-[#94a3b8] hover:bg-white/5 hover:text-[#f8fafc] transition-all duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </form>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-white/10 text-[#94a3b8] hover:bg-white/5 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a0f1c]/98 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#0ea5e9]/10 text-[#0ea5e9]"
                        : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#0ea5e9]" : ""}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <form action="/auth/signout" method="post" className="mt-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da conta</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

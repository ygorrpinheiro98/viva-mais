"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Início", icon: "🏠" },
    { href: "/dashboard/feed", label: "Feed", icon: "📱" },
    { href: "/dashboard/strava", label: "Strava", icon: "🚴" },
    { href: "/dashboard/challenges", label: "Desafios", icon: "🏆" },
    { href: "/dashboard/rankings", label: "Rankings", icon: "🏅" },
    { href: "/dashboard/groups", label: "Grupos", icon: "👥" },
    { href: "/dashboard/events", label: "Eventos", icon: "📅" },
    { href: "/dashboard/plans", label: "Planos", icon: "📋" },
    { href: "/dashboard/ai-generator", label: "IA", icon: "🤖" },
    { href: "/dashboard/calculators", label: "Calculadoras", icon: "🧮" },
    { href: "/dashboard/blog", label: "Blog", icon: "📰" },
    { href: "/dashboard/profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">V+</span>
            </div>
            <span className="text-xl font-bold gradient-text">VIVA+</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <span>{item.icon}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <form action="/auth/signout" method="post" className="hidden lg:block">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              Sair
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
            <form action="/auth/signout" method="post" className="mt-4 pt-4 border-t border-border">
              <button
                type="submit"
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Dumbbell, TrendingUp, Clock, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  title: string;
  description: string;
  sport: string;
  level: string;
  duration_weeks: number;
  workouts_per_week: number;
  content: any;
  downloads: number;
  user_id?: string;
  start_date?: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myPlans, setMyPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "running" | "cycling">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("workout_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPlans(data);
      if (user) {
        const userPlans = data.filter((p) => p.user_id === user.id);
        setMyPlans(userPlans);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("workout_plans").delete().eq("id", id);
    setShowDeleteConfirm(null);
    fetchPlans();
  };

  const filteredPlans = plans.filter((p) => {
    if (filter === "all") return true;
    return p.sport === filter;
  });

  const levels = {
    beginner: { label: "Iniciante", color: "text-green-500" },
    intermediate: { label: "Intermediário", color: "text-yellow-500" },
    advanced: { label: "Avançado", color: "text-red-500" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            Planos de Treino
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Gerencie seus planos e acompanhe seu progresso
          </p>
        </div>
        <Link
          href="/dashboard/plans/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Criar Plano
        </Link>
      </div>

      {myPlans.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Meus Planos
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <Link href={`/dashboard/plans/${plan.id}`} className="block p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "var(--primary)", opacity: 0.1 }}
                    >
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      {plan.duration_weeks} semanas
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{plan.title}</h3>
                  <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--muted-foreground)" }}>
                    {plan.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" />
                      {plan.workouts_per_week}x/semana
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {plan.downloads} downloads
                    </span>
                  </div>
                </Link>
                <div
                  className="flex border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Link
                    href={`/dashboard/plans/${plan.id}`}
                    className="flex-1 py-2 text-center text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    style={{ color: "var(--primary)" }}
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Explorar Planos
        </h2>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "all", label: "Todos" },
          { id: "running", label: "🏃 Corrida" },
          { id: "cycling", label: "🚴 Ciclismo" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f.id ? "bg-primary text-white" : ""
            }`}
            style={filter !== f.id ? { backgroundColor: "var(--muted)" } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <Link href={`/dashboard/plans/${plan.id}`} className="block p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: plan.sport === "running" ? "#22c55e20" : "#3b82f620",
                    color: plan.sport === "running" ? "#22c55e" : "#3b82f6",
                  }}
                >
                  {plan.sport === "running" ? "🏃" : "🚴"}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    levels[plan.level as keyof typeof levels]?.color || ""
                  }`}
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  {levels[plan.level as keyof typeof levels]?.label || plan.level}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{plan.title}</h3>
              <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--muted-foreground)" }}>
                {plan.description}
              </p>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {plan.duration_weeks} semanas
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {plan.workouts_per_week}x/semana
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)" }}>Nenhum plano encontrado</p>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-sm rounded-xl p-6"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Excluir plano?</h2>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg border font-medium"
                style={{ borderColor: "var(--border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

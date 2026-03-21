"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "running" | "cycling">("all");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("workout_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPlans(data);
    setLoading(false);
  };

  const filteredPlans = plans.filter(p => {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📋 Planos de Treino</h1>
        <p className="text-muted-foreground">Treinos prontos para você baixar e seguir</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[
          { id: "all", label: "🌐 Todos" },
          { id: "running", label: "🏃 Corrida" },
          { id: "cycling", label: "🚴 Ciclismo" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.id ? "bg-primary text-white" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selectedPlan ? (
        <div className="glass-effect rounded-2xl p-6">
          <button
            onClick={() => setSelectedPlan(null)}
            className="mb-4 text-primary hover:underline"
          >
            ← Voltar para lista
          </button>

          <h2 className="text-2xl font-bold mb-4">{selectedPlan.title}</h2>
          <p className="text-muted-foreground mb-6">{selectedPlan.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <div className="text-2xl font-bold gradient-text">{selectedPlan.duration_weeks}</div>
              <div className="text-sm text-muted-foreground">semanas</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <div className="text-2xl font-bold gradient-text">{selectedPlan.workouts_per_week}x</div>
              <div className="text-sm text-muted-foreground">por semana</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <div className="text-2xl font-bold gradient-text">{selectedPlan.downloads}</div>
              <div className="text-sm text-muted-foreground">downloads</div>
            </div>
          </div>

          {selectedPlan.content && (
            <div className="space-y-3">
              <h3 className="font-bold">Treinos:</h3>
              {Object.entries(selectedPlan.content).map(([week, workouts]) => (
                <div key={week} className="p-4 rounded-xl bg-muted/30">
                  <div className="font-medium mb-2 capitalize">{week.replace(/(\d)/g, ' $1 ').trim()}</div>
                  <div className="space-y-2">
                    {Object.entries(workouts as any).map(([day, workout]) => (
                      <div key={day} className="flex items-center gap-2 text-sm">
                        <span className="font-medium capitalize w-16">{day}:</span>
                        <span className="text-muted-foreground">{workout as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90">
            📥 Baixar Plano
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-2xl glass-effect cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-2xl">
                    {plan.sport === "running" ? "🏃" : "🚴"}
                  </span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{plan.duration_weeks} semanas</div>
                  <div>{plan.workouts_per_week}x/semana</div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2">{plan.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${levels[plan.level as keyof typeof levels]?.color}`}>
                  {levels[plan.level as keyof typeof levels]?.label || plan.level}
                </span>
                <span className="text-sm text-muted-foreground">
                  📥 {plan.downloads}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPlans.length === 0 && !selectedPlan && (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg">Nenhum plano encontrado</p>
          <p className="text-muted-foreground">Novos planos em breve!</p>
        </div>
      )}
    </div>
  );
}

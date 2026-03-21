"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Plan = {
  title: string;
  description: string;
  sport: string;
  level: string;
  duration_weeks: number;
  workouts_per_week: number;
  content: any;
};

export default function AIGeneratorPage() {
  const [formData, setFormData] = useState({
    goal: "5k",
    level: "iniciante",
    daysPerWeek: 3,
    sport: "running",
    timeAvailable: 45,
    durationWeeks: 8,
    hasEvent: false,
    eventDate: "",
    eventName: "",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const supabase = createClient();

  const goals = [
    { value: "5k", label: "5km", icon: "5" },
    { value: "10k", label: "10km", icon: "10" },
    { value: "meia", label: "Meia Maratona", icon: "21" },
    { value: "maratona", label: "Maratona", icon: "42" },
    { value: "perda_peso", label: "Perda de peso", icon: "⚖️" },
    { value: "saude", label: "Melhorar saúde", icon: "💚" },
  ];

  const levels = [
    { value: "iniciante", label: "Iniciante", desc: "Nunca correu" },
    { value: "intermediário", label: "Intermediário", desc: "Corre às vezes" },
    { value: "avançado", label: "Avançado", desc: "Corre regularmente" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);
        setCurrentWeek(1);
      } else {
        setError(data.error || "Erro ao gerar plano");
      }
    } catch (err) {
      setError("Erro de conexão");
    }

    setLoading(false);
  };

  const savePlan = async () => {
    if (!plan) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from("workout_plans").insert({
        title: plan.title,
        description: plan.description,
        sport: plan.sport,
        level: plan.level,
        duration_weeks: plan.duration_weeks,
        workouts_per_week: plan.workouts_per_week,
        content: plan.content,
      });
    }

    setSaving(false);
    alert("Plano salvo com sucesso!");
  };

  const getDayLabel = (day: string) => {
    const labels: Record<string, string> = {
      day1: "Segunda",
      day2: "Terça",
      day3: "Quarta",
      day4: "Quinta",
      day5: "Sexta",
      day6: "Sábado",
      day7: "Domingo",
    };
    return labels[day] || day;
  };

  const getWeekDates = (weekNum: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (weekNum - 1) * 7);
    return startOfWeek;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🤖 Gerador de Planos com IA</h1>
        <p className="text-muted-foreground">
          Receba um plano personalizado baseado nos melhores métodos de treino
        </p>
      </div>

      {!plan ? (
        <div className="p-8 rounded-2xl glass-effect">
          <div className="space-y-8">
            {/* Objetivo */}
            <div>
              <label className="block text-lg font-semibold mb-4">🎯 Qual seu objetivo?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goals.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setFormData({ ...formData, goal: g.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.goal === g.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g.icon}km</div>
                    <div className="font-medium text-sm">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-lg font-semibold mb-4">📊 Nível atual</label>
              <div className="grid md:grid-cols-3 gap-3">
                {levels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setFormData({ ...formData, level: l.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.level === l.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{l.label}</div>
                    <div className="text-sm text-muted-foreground">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dias por semana */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                📅 Quantos dias por semana?
              </label>
              <div className="flex gap-3">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFormData({ ...formData, daysPerWeek: d })}
                    className={`w-14 h-14 rounded-xl border-2 font-semibold transition-all ${
                      formData.daysPerWeek === d
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                📆 Duração do plano
              </label>
              <div className="flex gap-3">
                {[4, 8, 12, 16].map((w) => (
                  <button
                    key={w}
                    onClick={() => setFormData({ ...formData, durationWeeks: w })}
                    className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all ${
                      formData.durationWeeks === w
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {w} semanas
                  </button>
                ))}
              </div>
            </div>

            {/* Prova */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                🏅 Tem alguma prova no horizonte?
              </label>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, hasEvent: false })}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      !formData.hasEvent
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    Não tenho prova específica
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, hasEvent: true })}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.hasEvent
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    Sim, tenho uma prova!
                  </button>
                </div>

                {formData.hasEvent && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50">
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none"
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      placeholder="Nome da prova (ex: Maratona de SP)"
                      className="px-4 py-3 rounded-xl bg-card border border-border focus:border-primary outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Esporte */}
            <div>
              <label className="block text-lg font-semibold mb-4">🏃 Esporte</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData({ ...formData, sport: "running" })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.sport === "running"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-1">🏃</div>
                  <div className="font-medium">Corrida</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, sport: "cycling" })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.sport === "cycling"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-1">🚴</div>
                  <div className="font-medium">Ciclismo</div>
                </button>
              </div>
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                ⏱️ Tempo por treino: <span className="gradient-text">{formData.timeAvailable} min</span>
              </label>
              <input
                type="range"
                min="20"
                max="120"
                step="5"
                value={formData.timeAvailable}
                onChange={(e) => setFormData({ ...formData, timeAvailable: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>20 min</span>
                <span>120 min</span>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  Gerando plano...
                </>
              ) : (
                "🤖 Gerar Plano Personalizado"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{plan.title}</h2>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <button
                onClick={() => setPlan(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
              >
                ✏️ Novo Plano
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <div className="text-2xl font-bold gradient-text">{plan.duration_weeks}</div>
                <div className="text-sm text-muted-foreground">semanas</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <div className="text-2xl font-bold gradient-text">{plan.workouts_per_week}x</div>
                <div className="text-sm text-muted-foreground">por semana</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <div className="text-2xl font-bold gradient-text capitalize">{plan.level}</div>
                <div className="text-sm text-muted-foreground">nível</div>
              </div>
            </div>

            {/* Navegação de Semanas */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-50"
              >
                ← Semana Anterior
              </button>
              <h3 className="text-xl font-bold">
                Semana {currentWeek} de {plan.duration_weeks}
              </h3>
              <button
                onClick={() => setCurrentWeek(Math.min(plan.duration_weeks, currentWeek + 1))}
                disabled={currentWeek === plan.duration_weeks}
                className="px-4 py-2 rounded-lg border border-border disabled:opacity-50"
              >
                Próxima Semana →
              </button>
            </div>

            {/* Seletor de Semana */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {Array.from({ length: plan.duration_weeks }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    currentWeek === week
                      ? "bg-primary text-white"
                      : "bg-muted hover:bg-muted/70"
                  }`}
                >
                  S{week}
                </button>
              ))}
            </div>

            {/* Calendário da Semana */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📅 {getWeekDates(currentWeek).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
              </h4>
              <div className="grid gap-3">
                {["day1", "day2", "day3", "day4", "day5", "day6", "day7"].map((day) => {
                  const weekKey = `Semana ${currentWeek}`;
                  const weekData = plan.content[weekKey] || plan.content[currentWeek] || {};
                  let workout = weekData[day];
                  
                  const isRestDay = !workout || 
                    workout.toLowerCase().includes("descanso") || 
                    workout.toLowerCase().includes("repouso") ||
                    workout.toLowerCase().includes("dia livre");
                  
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-xl flex items-center gap-4 ${
                        isRestDay
                          ? "bg-muted/30 opacity-60"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className="w-24 font-medium">{getDayLabel(day)}</div>
                      <div className="flex-1">
                        {workout ? (
                          <span className={isRestDay ? "text-muted-foreground" : ""}>
                            {workout}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Dia de descanso</span>
                        )}
                      </div>
                      {!isRestDay && workout && (
                        <span className="text-2xl">🏃</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={savePlan}
              disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Salvando..." : "💾 Salvar Plano"}
            </button>
          </div>

          <Link
            href="/dashboard/plans"
            className="block text-center py-3 text-primary hover:underline"
          >
            Ver todos os meus planos →
          </Link>
        </div>
      )}
    </div>
  );
}

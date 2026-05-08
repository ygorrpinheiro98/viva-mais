"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Plus, Trash2, Save, Dumbbell, Clock, TrendingUp } from "lucide-react";

type WorkoutDay = {
  day: string;
  title: string;
  type: string;
  duration_minutes: number;
  distance_km: number;
  pace: string;
  intensity: string;
  notes: string;
};

type WeekPlan = {
  week: number;
  focus: string;
  workouts: Record<string, WorkoutDay>;
};

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState({
    title: "",
    description: "",
    sport: "running",
    level: "beginner",
    duration_weeks: 4,
    workouts_per_week: 3,
  });
  const [weeks, setWeeks] = useState<WeekPlan[]>([
    { week: 1, focus: "Adaptação", workouts: {} },
  ]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const supabase = createClient();

  const daysOfWeek = [
    { key: "monday", label: "Segunda" },
    { key: "tuesday", label: "Terça" },
    { key: "wednesday", label: "Quarta" },
    { key: "thursday", label: "Quinta" },
    { key: "friday", label: "Sexta" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const workoutTypes = [
    { key: "rest", label: "Descanso", icon: "😴" },
    { key: "easy", label: "Leve", icon: "🚶" },
    { key: "moderate", label: "Moderado", icon: "🏃" },
    { key: "tempo", label: "Treino Tempo", icon: "⚡" },
    { key: "interval", label: "Intervalado", icon: "🔥" },
    { key: "long", label: "Longão", icon: "🏔️" },
    { key: "strength", label: "Força", icon: "💪" },
  ];

  const intensities = [
    { key: "low", label: "Leve", color: "bg-green-500" },
    { key: "medium", label: "Moderado", color: "bg-yellow-500" },
    { key: "high", label: "Intenso", color: "bg-red-500" },
  ];

  const addWeek = () => {
    const newWeek = {
      week: weeks.length + 1,
      focus: `Semana ${weeks.length + 1}`,
      workouts: {},
    };
    setWeeks([...weeks, newWeek]);
    setPlan({ ...plan, duration_weeks: weeks.length + 1 });
  };

  const removeWeek = (weekNum: number) => {
    if (weeks.length <= 1) return;
    const newWeeks = weeks.filter((w) => w.week !== weekNum);
    setWeeks(newWeeks.map((w, i) => ({ ...w, week: i + 1 })));
    setPlan({ ...plan, duration_weeks: newWeeks.length });
    if (selectedWeek > newWeeks.length) {
      setSelectedWeek(newWeeks.length);
    }
  };

  const updateWeekFocus = (weekNum: number, focus: string) => {
    setWeeks(weeks.map((w) => (w.week === weekNum ? { ...w, focus } : w)));
  };

  const updateWorkout = (weekNum: number, dayKey: string, workout: Partial<WorkoutDay>) => {
    setWeeks(
      weeks.map((w) => {
        if (w.week !== weekNum) return w;
        const currentWorkout = w.workouts[dayKey] || {
          day: dayKey,
          title: "",
          type: "rest",
          duration_minutes: 0,
          distance_km: 0,
          pace: "",
          intensity: "low",
          notes: "",
        };
        return {
          ...w,
          workouts: {
            ...w.workouts,
            [dayKey]: { ...currentWorkout, ...workout },
          },
        };
      })
    );
  };

  const getWorkoutForDay = (weekNum: number, dayKey: string): WorkoutDay | null => {
    const week = weeks.find((w) => w.week === weekNum);
    return week?.workouts[dayKey] || null;
  };

  const handleSubmit = async () => {
    if (!plan.title) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const content: Record<string, any> = {};
      weeks.forEach((w) => {
        content[`week${w.week}`] = {
          focus: w.focus,
          ...w.workouts,
        };
      });

      const { error } = await supabase.from("workout_plans").insert({
        title: plan.title,
        description: plan.description,
        sport: plan.sport,
        level: plan.level,
        duration_weeks: plan.duration_weeks,
        workouts_per_week: plan.workouts_per_week,
        content,
        user_id: user.id,
      });

      if (!error) {
        router.push("/dashboard/plans");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentWeek = weeks.find((w) => w.week === selectedWeek) || weeks[0];

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/dashboard/plans")}
        className="flex items-center gap-2 text-sm mb-4 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar para planos
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Criar Novo Plano
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Personalize seu plano de treino
        </p>
      </div>

      <div
        className="rounded-xl border p-6 mb-6"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-semibold mb-4">Informações do Plano</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={plan.title}
              onChange={(e) => setPlan({ ...plan, title: e.target.value })}
              placeholder="Ex: Meu Plano de Corrida 5K"
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={plan.description}
              onChange={(e) => setPlan({ ...plan, description: e.target.value })}
              placeholder="Descreva o objetivo do plano..."
              className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
              style={{ borderColor: "var(--border)" }}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Esporte</label>
              <select
                value={plan.sport}
                onChange={(e) => setPlan({ ...plan, sport: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="running">Corrida</option>
                <option value="cycling">Ciclismo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível</label>
              <select
                value={plan.level}
                onChange={(e) => setPlan({ ...plan, level: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Semanas</label>
              <input
                type="number"
                value={plan.duration_weeks}
                onChange={(e) => {
                  const num = parseInt(e.target.value) || 1;
                  setPlan({ ...plan, duration_weeks: num });
                  while (weeks.length < num) addWeek();
                  while (weeks.length > num && weeks.length > 1) removeWeek(weeks.length);
                }}
                min={1}
                max={52}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Treinos/semana</label>
              <input
                type="number"
                value={plan.workouts_per_week}
                onChange={(e) => setPlan({ ...plan, workouts_per_week: parseInt(e.target.value) || 1 })}
                min={1}
                max={7}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 mb-6"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Treinos</h2>
          <div className="flex gap-2">
            {weeks.map((w) => (
              <div key={w.week} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedWeek(w.week)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    selectedWeek === w.week ? "bg-primary text-white" : ""
                  }`}
                  style={selectedWeek !== w.week ? { backgroundColor: "var(--muted)" } : {}}
                >
                  {w.week}
                </button>
                {weeks.length > 1 && (
                  <button
                    onClick={() => removeWeek(w.week)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                )}
              </div>
            ))}
            {weeks.length < plan.duration_weeks && (
              <button
                onClick={addWeek}
                className="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: "var(--border)" }}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Foco da semana</label>
          <input
            type="text"
            value={currentWeek?.focus || ""}
            onChange={(e) => updateWeekFocus(selectedWeek, e.target.value)}
            placeholder="Ex: Adaptação, Aumentar volume, Taper..."
            className="w-full px-3 py-2 rounded-lg border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="space-y-3">
          {daysOfWeek.map(({ key, label }) => {
            const workout = getWorkoutForDay(selectedWeek, key);
            const isRest = workout?.type === "rest" || !workout?.type;

            return (
              <div
                key={key}
                className="p-4 rounded-lg border"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{label}</span>
                  <select
                    value={workout?.type || "rest"}
                    onChange={(e) => updateWorkout(selectedWeek, key, { type: e.target.value, title: e.target.value })}
                    className="px-3 py-1 rounded-lg border text-sm bg-transparent"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {workoutTypes.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!isRest && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Título
                      </label>
                      <input
                        type="text"
                        value={workout?.title || ""}
                        onChange={(e) => updateWorkout(selectedWeek, key, { title: e.target.value })}
                        placeholder="Nome do treino"
                        className="w-full px-2 py-1.5 rounded text-sm border bg-transparent"
                        style={{ borderColor: "var(--border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Duração (min)
                      </label>
                      <input
                        type="number"
                        value={workout?.duration_minutes || ""}
                        onChange={(e) => updateWorkout(selectedWeek, key, { duration_minutes: parseInt(e.target.value) || 0 })}
                        placeholder="30"
                        className="w-full px-2 py-1.5 rounded text-sm border bg-transparent"
                        style={{ borderColor: "var(--border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Distância (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={workout?.distance_km || ""}
                        onChange={(e) => updateWorkout(selectedWeek, key, { distance_km: parseFloat(e.target.value) || 0 })}
                        placeholder="5"
                        className="w-full px-2 py-1.5 rounded text-sm border bg-transparent"
                        style={{ borderColor: "var(--border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                        Intensidade
                      </label>
                      <select
                        value={workout?.intensity || "medium"}
                        onChange={(e) => updateWorkout(selectedWeek, key, { intensity: e.target.value })}
                        className="w-full px-2 py-1.5 rounded text-sm border bg-transparent"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {intensities.map((i) => (
                          <option key={i.key} value={i.key}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard/plans")}
          className="flex-1 py-3 rounded-xl border font-medium"
          style={{ borderColor: "var(--border)" }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !plan.title}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {loading ? "Salvando..." : "Salvar Plano"}
        </button>
      </div>
    </div>
  );
}

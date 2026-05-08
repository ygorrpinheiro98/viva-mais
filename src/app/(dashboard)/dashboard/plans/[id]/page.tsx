"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  Target,
  TrendingUp,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  Play,
  Heart,
  Flame,
  MapPin,
} from "lucide-react";

type WorkoutDay = {
  day: string;
  type: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  distance_km?: number;
  pace?: string;
  intensity?: "low" | "medium" | "high";
  notes?: string;
};

type WeekPlan = {
  week: number;
  focus: string;
  workouts: WorkoutDay[];
};

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

const intensityColors = {
  low: { bg: "bg-green-500/10", text: "text-green-500", label: "Leve" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Moderado" },
  high: { bg: "bg-red-500/10", text: "text-red-500", label: "Intenso" },
};

const dayLabels: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarWorkouts, setCalendarWorkouts] = useState<Record<string, WorkoutDay>>({});
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const supabase = createClient();

  useEffect(() => {
    if (planId) {
      fetchPlan(planId);
    }
  }, [planId]);

  const fetchPlan = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setPlan(data);
        setEditForm({ title: data.title, description: data.description });
        
        if (user && data.user_id === user.id) {
          setIsOwner(true);
        }

        generateCalendarFromPlan(data);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarFromPlan = (planData: Plan) => {
    const workouts: Record<string, WorkoutDay> = {};
    if (planData.content && planData.start_date) {
      const startDate = new Date(planData.start_date);
      
      Object.entries(planData.content).forEach(([weekKey, weekData]: [string, any]) => {
        const weekNum = parseInt(weekKey.replace(/\D/g, "")) || 1;
        
        Object.entries(weekData).forEach(([dayKey, dayData]: [string, any]) => {
          const dayOffset = (weekNum - 1) * 7 + Object.keys(dayLabels).indexOf(dayKey.toLowerCase());
          const workoutDate = new Date(startDate);
          workoutDate.setDate(startDate.getDate() + dayOffset);
          const dateKey = workoutDate.toISOString().split("T")[0];
          
          workouts[dateKey] = {
            day: dayLabels[dayKey.toLowerCase()] || dayKey,
            type: dayData.type || "rest",
            title: dayData.title || dayData.description || "Descanso",
            description: dayData.description,
            duration_minutes: dayData.duration_minutes,
            distance_km: dayData.distance_km,
            pace: dayData.pace,
            intensity: dayData.intensity,
            notes: dayData.notes,
          };
        });
      });
    }
    
    setCalendarWorkouts(workouts);
  };

  const handleStartPlan = async () => {
    if (!plan) return;

    const startDate = currentDate.toISOString().split("T")[0];
    
    await supabase
      .from("workout_plans")
      .update({ start_date: startDate })
      .eq("id", plan.id);

    setPlan({ ...plan, start_date: startDate });
    generateCalendarFromPlan({ ...plan, start_date: startDate });
  };

  const handleDelete = async () => {
    if (!plan) return;

    await supabase
      .from("workout_plans")
      .delete()
      .eq("id", plan.id);

    router.push("/dashboard/plans");
  };

  const handleEdit = async () => {
    if (!plan) return;

    await supabase
      .from("workout_plans")
      .update({
        title: editForm.title,
        description: editForm.description,
      })
      .eq("id", plan.id);

    setPlan({ ...plan, ...editForm });
    setShowEditModal(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const parsePlanContent = (planData: Plan): WeekPlan[] => {
    if (!planData.content) return [];
    
    const weeks: WeekPlan[] = [];
    
    Object.entries(planData.content).forEach(([weekKey, weekData]: [string, any]) => {
      const weekNum = parseInt(weekKey.replace(/\D/g, "")) || parseInt(weekKey) || 1;
      
      const workouts: WorkoutDay[] = Object.entries(weekData).map(([dayKey, dayData]: [string, any]) => ({
        day: dayLabels[dayKey.toLowerCase()] || dayKey,
        type: dayData.type || "rest",
        title: dayData.title || dayData.description || "Descanso",
        description: dayData.description,
        duration_minutes: dayData.duration_minutes,
        distance_km: dayData.distance_km,
        pace: dayData.pace,
        intensity: dayData.intensity,
        notes: dayData.notes,
      }));

      weeks.push({
        week: weekNum,
        focus: weekData.focus || `Semana ${weekNum}`,
        workouts,
      });
    });

    return weeks.sort((a, b) => a.week - b.week);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Plano não encontrado</p>
        <button onClick={() => router.push("/dashboard/plans")} className="mt-4 text-primary">
          Voltar para planos
        </button>
      </div>
    );
  }

  const weeks = parsePlanContent(plan);
  const currentWeek = weeks.find(w => w.week === selectedWeek) || weeks[0];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <button
        onClick={() => router.push("/dashboard/plans")}
        className="flex items-center gap-2 text-sm mb-4 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar para planos
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
              {plan.title}
            </h1>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Edit2 className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
            {plan.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {plan.sport === "running" ? "🏃 Corrida" : "🚴 Ciclismo"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
              {plan.level}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
              {plan.duration_weeks} semanas
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
              {plan.workouts_per_week}x/semana
            </span>
          </div>
        </div>

        {!plan.start_date && (
          <button
            onClick={handleStartPlan}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Iniciar Plano
          </button>
        )}

        {plan.start_date && (
          <div className="text-right">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Iniciado em
            </p>
            <p className="font-semibold" style={{ color: "var(--primary)" }}>
              {new Date(plan.start_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendário de Treinos
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium min-w-[120px] text-center">
                  {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium py-2" style={{ color: "var(--muted-foreground)" }}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
                
                const dateKey = day.toISOString().split("T")[0];
                const workout = calendarWorkouts[dateKey];
                const isToday = new Date().toDateString() === day.toDateString();
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => workout && setSelectedDay(workout)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                      workout ? "bg-primary/10 hover:bg-primary/20" : ""
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                    style={{ color: workout ? "var(--primary)" : "var(--foreground)" }}
                  >
                    {day.getDate()}
                    {workout && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Programação da Semana</h2>
              <div className="flex gap-1">
                {weeks.map((w) => (
                  <button
                    key={w.week}
                    onClick={() => setSelectedWeek(w.week)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedWeek === w.week ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    S{w.week}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {currentWeek?.workouts.map((workout, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(workout)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-primary/50"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: workout.intensity
                        ? intensityColors[workout.intensity].bg
                        : "var(--muted)",
                      color: workout.intensity
                        ? intensityColors[workout.intensity].text
                        : "var(--muted-foreground)",
                    }}
                  >
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{workout.day}</div>
                    <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {workout.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {workout.distance_km && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {workout.distance_km}km
                      </span>
                    )}
                    {workout.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {workout.duration_minutes}min
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="rounded-xl border p-4 sticky top-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <h3 className="font-semibold mb-4">Resumo do Plano</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total de semanas</span>
                <span className="font-medium">{plan.duration_weeks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Treinos/semana</span>
                <span className="font-medium">{plan.workouts_per_week}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total de treinos</span>
                <span className="font-medium">{plan.duration_weeks * plan.workouts_per_week}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Downloads</span>
                <span className="font-medium">{plan.downloads}</span>
              </div>
            </div>
          </div>

          {currentWeek && (
            <div
              className="rounded-xl border p-4"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <h3 className="font-semibold mb-3">Semana {currentWeek.week}</h3>
              <div
                className="p-3 rounded-lg text-sm mb-3"
                style={{ backgroundColor: "var(--background)" }}
              >
                <Target className="w-4 h-4 inline mr-2 text-primary" />
                {currentWeek.focus}
              </div>
              <div className="space-y-2">
                {currentWeek.workouts.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: w.intensity
                          ? intensityColors[w.intensity].text.replace("text-", "")
                          : "var(--muted-foreground)",
                      }}
                    />
                    <span style={{ color: "var(--muted-foreground)" }}>{w.day}:</span>
                    <span className="truncate">{w.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: selectedDay.intensity
                    ? intensityColors[selectedDay.intensity].bg
                    : "var(--muted)",
                  color: selectedDay.intensity
                    ? intensityColors[selectedDay.intensity].text
                    : "var(--foreground)",
                }}
              >
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedDay.title}</h2>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {selectedDay.day}
                </p>
              </div>
            </div>

            {selectedDay.description && (
              <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
                {selectedDay.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {selectedDay.distance_km && (
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                    <TrendingUp className="w-4 h-4" />
                    Distância
                  </div>
                  <div className="font-semibold">{selectedDay.distance_km} km</div>
                </div>
              )}
              {selectedDay.duration_minutes && (
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                    <Clock className="w-4 h-4" />
                    Duração
                  </div>
                  <div className="font-semibold">{selectedDay.duration_minutes} min</div>
                </div>
              )}
              {selectedDay.pace && (
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                    <Flame className="w-4 h-4" />
                    Ritmo
                  </div>
                  <div className="font-semibold">{selectedDay.pace}/km</div>
                </div>
              )}
              {selectedDay.intensity && (
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
                    <Heart className="w-4 h-4" />
                    Intensidade
                  </div>
                  <div className={`font-semibold ${intensityColors[selectedDay.intensity].text}`}>
                    {intensityColors[selectedDay.intensity].label}
                  </div>
                </div>
              )}
            </div>

            {selectedDay.notes && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--background)" }}>
                <p className="text-sm font-medium mb-1">Observações:</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {selectedDay.notes}
                </p>
              </div>
            )}

            <button className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Marcar como Concluído
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Excluir Plano?</h2>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">Editar Plano</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
                  style={{ borderColor: "var(--border)" }}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 rounded-lg border font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

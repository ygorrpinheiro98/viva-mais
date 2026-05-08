"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Dumbbell,
  Bike,
  Activity,
  Clock,
  Target,
  Zap,
} from "lucide-react";

type Workout = {
  id: string;
  title: string;
  type: "easy" | "tempo" | "interval" | "long" | "race" | "rest";
  sport: "run" | "bike" | "swim";
  scheduled_date: string;
  duration_minutes: number;
  description?: string;
  completed: boolean;
  tss?: number;
};

const workoutTypeColors: Record<string, { bg: string; border: string; text: string }> = {
  easy: { bg: "rgba(34, 197, 94, 0.15)", border: "#22c55e", text: "#22c55e" },
  tempo: { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#3b82f6" },
  interval: { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#ef4444" },
  long: { bg: "rgba(255, 122, 80, 0.15)", border: "#ff7a50", text: "#ff7a50" },
  race: { bg: "rgba(168, 85, 247, 0.15)", border: "#a855f7", text: "#a855f7" },
  rest: { bg: "rgba(148, 163, 184, 0.15)", border: "#94a3b8", text: "#94a3b8" },
};

const workoutTypeLabels: Record<string, string> = {
  easy: "Leve",
  tempo: "Tempo",
  interval: "Intervalado",
  long: "Longo",
  race: "Prova",
  rest: "Descanso",
};

const sportIcons: Record<string, any> = {
  run: Dumbbell,
  bike: Bike,
  swim: Activity,
};

interface WorkoutCalendarProps {
  userId: string;
}

export default function WorkoutCalendar({ userId }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const supabase = createClient();

  useEffect(() => {
    fetchWorkouts();
  }, [currentDate]);

  const fetchWorkouts = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from("scheduled_workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_date", startOfMonth.toISOString().split("T")[0])
      .lte("scheduled_date", endOfMonth.toISOString().split("T")[0])
      .order("scheduled_date", { ascending: true });

    if (data) {
      setWorkouts(data);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getWorkoutsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return workouts.filter((w) => w.scheduled_date === dateStr);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleAddWorkout = async (workout: Partial<Workout>) => {
    if (!selectedDate) return;

    const newWorkout = {
      user_id: userId,
      title: workout.title,
      type: workout.type || "easy",
      sport: workout.sport || "run",
      scheduled_date: selectedDate.toISOString().split("T")[0],
      duration_minutes: workout.duration_minutes || 60,
      description: workout.description,
      completed: false,
      tss: workout.tss || Math.round((workout.duration_minutes || 60) / 2),
    };

    const { error } = await supabase.from("scheduled_workouts").insert(newWorkout);

    if (!error) {
      fetchWorkouts();
      setShowModal(false);
    }
  };

  const handleToggleComplete = async (workout: Workout) => {
    await supabase
      .from("scheduled_workouts")
      .update({ completed: !workout.completed })
      .eq("id", workout.id);
    fetchWorkouts();
  };

  const handleDeleteWorkout = async (id: string) => {
    await supabase.from("scheduled_workouts").delete().eq("id", id);
    fetchWorkouts();
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  const getWeeklyStats = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekWorkouts = workouts.filter((w) => {
      const date = new Date(w.scheduled_date);
      return date >= weekStart && date <= weekEnd;
    });

    const totalMinutes = weekWorkouts.reduce((acc, w) => acc + w.duration_minutes, 0);
    const totalTSS = weekWorkouts.reduce((acc, w) => acc + (w.tss || 0), 0);
    const completedCount = weekWorkouts.filter((w) => w.completed).length;

    return { count: weekWorkouts.length, completedCount, totalMinutes, totalTSS };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold font-display text-lg" style={{ color: "var(--foreground)" }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs rounded-lg hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              Hoje
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="px-2 py-1 rounded bg-[var(--muted)]">
            {weeklyStats.count} treinos
          </span>
          <span className="px-2 py-1 rounded bg-[var(--muted)] lime-glow">
            {weeklyStats.totalTSS} TSS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium py-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth().map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayWorkouts = getWorkoutsForDay(day);
          const completedWorkouts = dayWorkouts.filter((w) => w.completed);
          const pendingWorkouts = dayWorkouts.filter((w) => !w.completed);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all hover:scale-105 ${
                isToday(day) ? "ring-2 ring-[var(--coral)]" : ""
              }`}
              style={{
                backgroundColor: dayWorkouts.length > 0
                  ? pendingWorkouts.length > 0
                    ? "rgba(255, 122, 80, 0.1)"
                    : "rgba(34, 197, 94, 0.1)"
                  : "transparent",
                border: dayWorkouts.length > 0 ? "1px solid rgba(255, 122, 80, 0.2)" : "1px solid transparent",
              }}
            >
              <span
                className={`text-sm font-medium ${
                  isToday(day) ? "coral-glow" : ""
                }`}
                style={{ color: "var(--foreground)" }}
              >
                {day}
              </span>
              {dayWorkouts.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayWorkouts.slice(0, 3).map((w) => {
                    const colors = workoutTypeColors[w.type];
                    const SportIcon = sportIcons[w.sport];
                    return (
                      <div
                        key={w.id}
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: w.completed ? "#22c55e" : colors.border }}
                        title={`${w.title} - ${workoutTypeLabels[w.type]}`}
                      >
                        <SportIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    );
                  })}
                  {dayWorkouts.length > 3 && (
                    <span className="text-[8px]" style={{ color: "var(--muted-foreground)" }}>
                      +{dayWorkouts.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        {Object.entries(workoutTypeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <span style={{ color: "var(--muted-foreground)" }}>
              {workoutTypeLabels[type]}
            </span>
          </div>
        ))}
      </div>

      {showModal && selectedDate && (
        <WorkoutModal
          date={selectedDate}
          workouts={getWorkoutsForDay(selectedDate.getDate())}
          onClose={() => setShowModal(false)}
          onAdd={handleAddWorkout}
          onToggle={handleToggleComplete}
          onDelete={handleDeleteWorkout}
        />
      )}
    </div>
  );
}

function WorkoutModal({
  date,
  workouts,
  onClose,
  onAdd,
  onToggle,
  onDelete,
}: {
  date: Date;
  workouts: Workout[];
  onClose: () => void;
  onAdd: (workout: Partial<Workout>) => void;
  onToggle: (workout: Workout) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Workout["type"]>("easy");
  const [sport, setSport] = useState<Workout["sport"]>("run");
  const [duration, setDuration] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, type, sport, duration_minutes: duration });
    setTitle("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="card relative w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {workouts.length > 0 && (
          <div className="space-y-2 mb-4">
            {workouts.map((workout) => {
              const colors = workoutTypeColors[workout.type];
              const SportIcon = sportIcons[workout.sport];
              return (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: workout.completed
                      ? "rgba(34, 197, 94, 0.1)"
                      : colors.bg,
                    border: `1px solid ${colors.border}30`,
                  }}
                >
                  <button
                    onClick={() => onToggle(workout)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      workout.completed ? "bg-green-500 border-green-500" : ""
                    }`}
                    style={{ borderColor: colors.border }}
                  >
                    {workout.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <SportIcon className="w-5 h-5" style={{ color: colors.text }} />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${workout.completed ? "line-through opacity-60" : ""}`}
                      style={{ color: "var(--foreground)" }}
                    >
                      {workout.title}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {workoutTypeLabels[workout.type]} • {workout.duration_minutes} min • {workout.tss} TSS
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(workout.id)}
                    className="p-1 rounded hover:bg-red-500/20"
                    style={{ color: "var(--energy)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do treino..."
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Workout["type"])}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                {Object.entries(workoutTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                Esporte
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as Workout["sport"])}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--muted)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <option value="run">Corrida</option>
                <option value="bike">Ciclismo</option>
                <option value="swim">Natação</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
              Duração (minutos)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="10"
              max="300"
              className="w-full px-4 py-3 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--secondary))" }}
          >
            <Plus className="w-5 h-5" />
            Adicionar Treino
          </button>
        </form>
      </div>
    </div>
  );
}

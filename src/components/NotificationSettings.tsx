"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Clock, TrendingUp, Calendar, Dumbbell } from "lucide-react";

interface NotificationPrefs {
  enabled: boolean;
  workoutReminders: boolean;
  reminderTime: number;
  weeklyReport: boolean;
  groupActivity: boolean;
  challengeUpdates: boolean;
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    enabled: false,
    workoutReminders: true,
    reminderTime: 60,
    weeklyReport: true,
    groupActivity: true,
    challengeUpdates: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    loadPrefs();
  }, []);

  const loadPrefs = () => {
    const stored = localStorage.getItem("notificationPrefs");
    if (stored) {
      setPrefs(JSON.parse(stored));
    }
  };

  const savePrefs = (newPrefs: NotificationPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem("notificationPrefs", JSON.stringify(newPrefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações push");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === "granted") {
      savePrefs({ ...prefs, enabled: true });
      new Notification("Notificações ativadas!", {
        body: "Você receberá lembretes de treino no Viva Plus",
        icon: "/favicon.ico",
      });
    }
  };

  const toggleNotifications = () => {
    if (permission === "granted") {
      savePrefs({ ...prefs, enabled: !prefs.enabled });
    } else {
      requestPermission();
    }
  };

  const scheduleWorkoutReminder = (workoutTitle: string, timeInMinutes: number) => {
    if (permission !== "granted" || !prefs.enabled) return;

    const reminderTime = new Date(Date.now() + timeInMinutes * 60 * 1000);
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Lembrete: ${workoutTitle}`, {
        body: `Treino em ${timeInMinutes} minutos!`,
        tag: "workout-reminder",
        requireInteraction: true,
      });
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--coral)", opacity: 0.1 }}>
            {prefs.enabled && permission === "granted" ? (
              <Bell className="w-5 h-5" style={{ color: "var(--coral)" }} />
            ) : (
              <BellOff className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
            )}
          </div>
          <div>
            <h3 className="font-bold" style={{ color: "var(--foreground)" }}>
              Notificações
            </h3>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {permission === "granted" ? "Permissão concedida" : permission === "denied" ? "Bloqueadas" : "Não configuradas"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleNotifications}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            prefs.enabled && permission === "granted" ? "bg-[var(--coral)]" : "bg-[var(--muted)]"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              prefs.enabled && permission === "granted" ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {prefs.enabled && permission === "granted" && (
        <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>
                Lembrete de treino
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.workoutReminders}
              onChange={(e) => savePrefs({ ...prefs, workoutReminders: e.target.checked })}
              className="w-4 h-4 accent-[var(--coral)]"
            />
          </label>

          {prefs.workoutReminders && (
            <div className="flex items-center gap-2 pl-6">
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Antecedência:
              </span>
              <select
                value={prefs.reminderTime}
                onChange={(e) => savePrefs({ ...prefs, reminderTime: Number(e.target.value) })}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          )}

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>
                Relatório semanal
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.weeklyReport}
              onChange={(e) => savePrefs({ ...prefs, weeklyReport: e.target.checked })}
              className="w-4 h-4 accent-[var(--coral)]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
              <span className="text-sm" style={{ color: "var(--foreground)" }}>
                Atividades do grupo
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.groupActivity}
              onChange={(e) => savePrefs({ ...prefs, groupActivity: e.target.checked })}
              className="w-4 h-4 accent-[var(--coral)]"
            />
          </label>

          {saved && (
            <div className="flex items-center gap-2 text-xs lime-glow pt-2">
              <Check className="w-4 h-4" />
              Configurações salvas
            </div>
          )}
        </div>
      )}

      {permission !== "granted" && (
        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={requestPermission}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--secondary))" }}
          >
            Ativar notificações
          </button>
        </div>
      )}
    </div>
  );
}

export function useWorkoutNotifications() {
  const scheduleReminder = (workout: { title: string; scheduled_date: string }) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    
    const prefs = JSON.parse(localStorage.getItem("notificationPrefs") || "{}");
    if (!prefs.enabled || !prefs.workoutReminders) return;

    const workoutTime = new Date(workout.scheduled_date).getTime();
    const reminderTime = workoutTime - (prefs.reminderTime || 60) * 60 * 1000;
    const now = Date.now();

    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Lembrete: ${workout.title}`, {
            body: `Treino agendado para agora!`,
            tag: "workout-reminder",
            requireInteraction: true,
          });
        }
      }, reminderTime - now);

      return () => clearTimeout(timeoutId);
    }
  };

  return { scheduleReminder };
}

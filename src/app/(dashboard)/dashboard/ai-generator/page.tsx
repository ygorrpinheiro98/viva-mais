"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Upload,
  Zap,
  Settings,
  Check,
  X,
  Loader2,
  Calendar,
  Bike,
  Dumbbell,
  ChevronRight,
  Edit3,
  Copy,
  Clipboard,
  BookOpen,
  TestTube2,
  MessageCircle,
} from "lucide-react";
import { downloadZWO, downloadText, copyToClipboard, generateWorkoutFromAI, uploadToIntervalsICU, testIntervalsICUConnection } from "@/lib/zwo-generator";
import WorkoutEditor, { WorkoutStep, stepsToWorkout } from "@/components/WorkoutEditor";

type Plan = {
  title: string;
  description: string;
  sport: string;
  level: string;
  duration_weeks: number;
  workouts_per_week: number;
  content: Record<string, Record<string, string>>;
};

function getInitialIntervalsICU() {
  if (typeof window === "undefined") return { apiKey: "", athleteId: "" };
  const stored = localStorage.getItem("intervalsICU");
  if (stored) {
    return JSON.parse(stored);
  }
  return { apiKey: "", athleteId: "" };
}

export default function AIGeneratorPage() {
  const initialIntervals = getInitialIntervalsICU();
  
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
  const [intervalsICUKey, setIntervalsICUKey] = useState(initialIntervals.apiKey);
  const [intervalsAthleteId, setIntervalsAthleteId] = useState(initialIntervals.athleteId);
  const [uploadingToIntervals, setUploadingToIntervals] = useState(false);
  const [intervalsMessage, setIntervalsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<{ dayKey: string; workoutName: string; content: string } | null>(null);
  const [explainingWorkout, setExplainingWorkout] = useState<{ dayKey: string; name: string } | null>(null);
  const [workoutExplanation, setWorkoutExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase.auth]);

  const intervalsICUEnabled = useMemo(() => !!intervalsICUKey, [intervalsICUKey]);

  const goals = [
    { value: "5k", label: "5km" },
    { value: "10k", label: "10km" },
    { value: "meia", label: "Meia Maratona" },
    { value: "maratona", label: "Maratona" },
    { value: "perda_peso", label: "Perda de peso" },
    { value: "saude", label: "Melhorar saúde" },
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
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await response.json();

      if (data.success) {
        setPlan(data.plan);
        setCurrentWeek(1);
      } else {
        setError(data.error || "Erro ao gerar plano");
      }
    } catch {
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
  };

  const handleDownloadZWO = (dayKey: string) => {
    if (!plan) return;
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent || dayContent.toLowerCase().includes("descanso")) {
      alert("Este dia é um dia de descanso!");
      return;
    }
    
    const sportType = plan.sport === "cycling" ? "bike" : "run";
    const workout = generateWorkoutFromAI(dayContent, dayKey, currentWeek, sportType);
    const filename = `${plan.title.replace(/\s+/g, "-").toLowerCase()}-semana${currentWeek}-${dayKey}`;
    downloadZWO(workout, filename);
  };

  const handleEditWorkout = (dayKey: string) => {
    if (!plan) return;
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent) return;
    
    setEditingWorkout({
      dayKey,
      workoutName: `${getDayLabel(dayKey)} - Semana ${currentWeek}`,
      content: dayContent,
    });
  };

  const handleSaveEditedWorkout = (steps: WorkoutStep[], name: string) => {
    if (!plan || !editingWorkout) return;
    
    const sportType = plan.sport === "cycling" ? "bike" : "run";
    const workout = stepsToWorkout(steps, name, sportType);
    
    const filename = `${plan.title.replace(/\s+/g, "-").toLowerCase()}-${editingWorkout.dayKey}-editado`;
    downloadZWO(workout, filename);
    
    setEditingWorkout(null);
    setIntervalsMessage({ type: "success", text: `Treino "${name}" exportado com sucesso!` });
  };

  const handleDownloadAllZWF = () => {
    if (!plan) return;
    
    const sportType = plan.sport === "cycling" ? "bike" : "run";
    
    for (let week = 1; week <= plan.duration_weeks; week++) {
      const weekKey = `Semana ${week}`;
      for (const dayKey of ["day1", "day2", "day3", "day4", "day5", "day6", "day7"]) {
        const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[week]?.[dayKey];
        
        if (dayContent && !dayContent.toLowerCase().includes("descanso")) {
          const workout = generateWorkoutFromAI(dayContent, dayKey, week, sportType);
          const filename = `${plan.title.replace(/\s+/g, "-").toLowerCase()}-semana${week}-${dayKey}`;
          downloadZWO(workout, filename);
        }
      }
    }
    
    setIntervalsMessage({ type: "success", text: "Todos os treinos foram exportados!" });
  };

  const handleDownloadText = (dayKey: string) => {
    if (!plan) return;
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent || dayContent.toLowerCase().includes("descanso")) {
      alert("Este dia é um dia de descanso!");
      return;
    }
    
    const sportType = plan.sport === "cycling" ? "bike" : "run";
    const workout = generateWorkoutFromAI(dayContent, dayKey, currentWeek, sportType);
    const filename = `${plan.title.replace(/\s+/g, "-").toLowerCase()}-semana${currentWeek}-${dayKey}`;
    downloadText(workout, filename);
  };

  const handleCopyToClipboard = (dayKey: string) => {
    if (!plan) return;
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent) return;
    
    const lines = dayContent.split(/[.;]/).map(s => `- ${s.trim()}`).filter(Boolean);
    const text = lines.join("\n");
    
    copyToClipboard(text);
    setIntervalsMessage({ type: "success", text: "Texto copiado! Cole direto no Intervals.icu" });
  };

  const handleExplainWorkout = async (dayKey: string) => {
    if (!plan) return;
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent || dayContent.toLowerCase().includes("descanso")) {
      return;
    }
    
    const sportType = plan.sport === "cycling" ? "bike" : "run";
    const workout = generateWorkoutFromAI(dayContent, dayKey, currentWeek, sportType);
    
    setExplainingWorkout({ dayKey, name: workout.name });
    setExplaining(true);
    setWorkoutExplanation(null);
    
    try {
      const steps = dayContent.split(/[.;]/).map((desc, i) => ({
        duration: 600,
        intensity: 70,
        description: desc.trim(),
      }));
      
      const response = await fetch("/api/ai/explain-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workout: { ...workout, steps } }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWorkoutExplanation(data.explanation);
      } else {
        setWorkoutExplanation("Erro ao gerar explicação. Tente novamente.");
      }
    } catch {
      setWorkoutExplanation("Erro de conexão.");
    }
    
    setExplaining(false);
  };

  const handleTestConnection = async () => {
    if (!intervalsICUKey || !intervalsAthleteId) {
      setConnectionTestResult({ success: false, message: "Preencha API Key e Athlete ID primeiro" });
      return;
    }
    
    setTestingConnection(true);
    setConnectionTestResult(null);
    
    try {
      const result = await testIntervalsICUConnection(intervalsICUKey, intervalsAthleteId);
      
      if (result.success) {
        setConnectionTestResult({ 
          success: true, 
          message: `Conexão OK! Bem-vindo, ${(result.data as { display_name?: string })?.display_name || "Atleta"}!` 
        });
      } else {
        setConnectionTestResult({ 
          success: false, 
          message: result.error || "Erro na conexão" 
        });
      }
    } catch {
      setConnectionTestResult({ success: false, message: "Erro de conexão" });
    }
    
    setTestingConnection(false);
  };

  const handleSaveIntervalsICU = () => {
    localStorage.setItem("intervalsICU", JSON.stringify({
      apiKey: intervalsICUKey,
      athleteId: intervalsAthleteId,
    }));
    alert("Configurações salvas! A página será atualizada.");
    window.location.reload();
  };

  const handleUploadDayToIntervals = async (dayKey: string) => {
    if (!plan || !intervalsICUKey || !intervalsAthleteId) {
      alert("Configure sua API do Intervals.icu primeiro!");
      return;
    }
    
    const weekKey = `Semana ${currentWeek}`;
    const dayContent = plan.content[weekKey]?.[dayKey] || plan.content[currentWeek]?.[dayKey];
    
    if (!dayContent || dayContent.toLowerCase().includes("descanso")) {
      alert("Este dia é um dia de descanso!");
      return;
    }
    
    setUploadingToIntervals(true);
    setIntervalsMessage(null);
    
    try {
      const sportType = plan.sport === "cycling" ? "bike" : "run";
      const workout = generateWorkoutFromAI(dayContent, dayKey, currentWeek, sportType);
      
      const result = await uploadToIntervalsICU(workout, intervalsICUKey, intervalsAthleteId);
      
      if (result.success) {
        setIntervalsMessage({ type: "success", text: `Treino "${workout.name}" enviado com sucesso!` });
      } else {
        setIntervalsMessage({ type: "error", text: result.error || "Erro ao enviar treino" });
      }
    } catch {
      setIntervalsMessage({ type: "error", text: "Erro de conexão" });
    }
    
    setUploadingToIntervals(false);
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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
          <span>Ferramentas</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary font-medium">Gerador IA</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Gerador de Planos com IA
        </h1>
        <p style={{ color: "var(--muted-foreground)" }}>
          Receba um plano personalizado baseado nos melhores métodos de treino
        </p>
      </div>

      {!plan ? (
        <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Qual seu objetivo?
              </label>
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
                    style={{ borderColor: formData.goal === g.value ? "var(--primary)" : "var(--border)" }}
                  >
                    <div className="font-medium text-sm">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">Nível atual</label>
              <div className="grid md:grid-cols-3 gap-3">
                {levels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setFormData({ ...formData, level: l.value })}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: formData.level === l.value ? "var(--primary)" : "var(--border)",
                      backgroundColor: formData.level === l.value ? "var(--primary)" + "15" : "transparent",
                    }}
                  >
                    <div className="font-medium">{l.label}</div>
                    <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">
                Quantos dias por semana?
              </label>
              <div className="flex gap-3">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFormData({ ...formData, daysPerWeek: d })}
                    className="w-14 h-14 rounded-xl border-2 font-semibold transition-all"
                    style={{
                      borderColor: formData.daysPerWeek === d ? "var(--primary)" : "var(--border)",
                      backgroundColor: formData.daysPerWeek === d ? "var(--primary)" : "transparent",
                      color: formData.daysPerWeek === d ? "white" : "inherit",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">
                Duração do plano
              </label>
              <div className="flex gap-3">
                {[4, 8, 12, 16].map((w) => (
                  <button
                    key={w}
                    onClick={() => setFormData({ ...formData, durationWeeks: w })}
                    className="px-6 py-3 rounded-xl border-2 font-semibold transition-all"
                    style={{
                      borderColor: formData.durationWeeks === w ? "var(--primary)" : "var(--border)",
                      backgroundColor: formData.durationWeeks === w ? "var(--primary)" : "transparent",
                      color: formData.durationWeeks === w ? "white" : "inherit",
                    }}
                  >
                    {w} semanas
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">
                Tem alguma prova no horizonte?
              </label>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, hasEvent: false })}
                    className="flex-1 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: !formData.hasEvent ? "var(--primary)" : "var(--border)",
                      backgroundColor: !formData.hasEvent ? "var(--primary)" + "15" : "transparent",
                    }}
                  >
                    Não tenho prova específica
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, hasEvent: true })}
                    className="flex-1 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: formData.hasEvent ? "var(--primary)" : "var(--border)",
                      backgroundColor: formData.hasEvent ? "var(--primary)" + "15" : "transparent",
                    }}
                  >
                    Sim, tenho uma prova!
                  </button>
                </div>

                {formData.hasEvent && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      placeholder="Nome da prova (ex: Maratona de SP)"
                      className="px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">Esporte</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData({ ...formData, sport: "running" })}
                  className="flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center"
                  style={{
                    borderColor: formData.sport === "running" ? "var(--primary)" : "var(--border)",
                    backgroundColor: formData.sport === "running" ? "var(--primary)" + "15" : "transparent",
                  }}
                >
                  <Dumbbell className="w-8 h-8 mb-2" style={{ color: formData.sport === "running" ? "var(--primary)" : "var(--muted-foreground)" }} />
                  <div className="font-medium">Corrida</div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, sport: "cycling" })}
                  className="flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center"
                  style={{
                    borderColor: formData.sport === "cycling" ? "var(--primary)" : "var(--border)",
                    backgroundColor: formData.sport === "cycling" ? "var(--primary)" + "15" : "transparent",
                  }}
                >
                  <Bike className="w-8 h-8 mb-2" style={{ color: formData.sport === "cycling" ? "var(--primary)" : "var(--muted-foreground)" }} />
                  <div className="font-medium">Ciclismo</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">
                Tempo por treino: <span className="gradient-text">{formData.timeAvailable} min</span>
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
              <div className="flex justify-between text-sm" style={{ color: "var(--muted-foreground)" }}>
                <span>20 min</span>
                <span>120 min</span>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20" style={{ color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "white" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Gerando plano...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Gerar Plano Personalizado
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{plan.title}</h2>
                <p style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
              </div>
              <button
                onClick={() => setPlan(null)}
                className="px-4 py-2 rounded-lg"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--muted)" }}
              >
                Novo Plano
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--muted)" }}>
                <div className="text-2xl font-bold gradient-text">{plan.duration_weeks}</div>
                <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>semanas</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--muted)" }}>
                <div className="text-2xl font-bold gradient-text">{plan.workouts_per_week}x</div>
                <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>por semana</div>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "var(--muted)" }}>
                <div className="text-2xl font-bold gradient-text capitalize">{plan.level}</div>
                <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>nível</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleDownloadAllZWF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: "var(--primary)", color: "white" }}
              >
                <Download className="w-4 h-4" />
                Baixar todos ZWO
              </button>
              <Link
                href="/dashboard/plans"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                style={{ border: "1px solid var(--border)" }}
              >
                <Calendar className="w-4 h-4" />
                Ver Planos
              </Link>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className="px-4 py-2 rounded-lg"
                style={{ border: "1px solid var(--border)", opacity: currentWeek === 1 ? 0.5 : 1 }}
              >
                ← Anterior
              </button>
              <h3 className="text-xl font-bold">
                Semana {currentWeek} de {plan.duration_weeks}
              </h3>
              <button
                onClick={() => setCurrentWeek(Math.min(plan.duration_weeks, currentWeek + 1))}
                disabled={currentWeek === plan.duration_weeks}
                className="px-4 py-2 rounded-lg"
                style={{ border: "1px solid var(--border)", opacity: currentWeek === plan.duration_weeks ? 0.5 : 1 }}
              >
                Próxima →
              </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {Array.from({ length: plan.duration_weeks }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: currentWeek === week ? "var(--primary)" : "var(--muted)",
                    color: currentWeek === week ? "white" : "inherit",
                  }}
                >
                  S{week}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {getWeekDates(currentWeek).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
              </h4>
              <div className="grid gap-3">
                {["day1", "day2", "day3", "day4", "day5", "day6", "day7"].map((day) => {
                  const weekKey = `Semana ${currentWeek}`;
                  const weekData = plan.content[weekKey] || plan.content[currentWeek] || {};
                  const workout = weekData[day];
                  
                  const isRestDay = !workout || 
                    workout.toLowerCase().includes("descanso") || 
                    workout.toLowerCase().includes("repouso") ||
                    workout.toLowerCase().includes("dia livre");
                  
                  return (
                    <div
                      key={day}
                      className="p-4 rounded-xl flex items-center gap-4"
                      style={{
                        backgroundColor: isRestDay ? "var(--muted)" : "var(--card)",
                        border: isRestDay ? "none" : "1px solid var(--border)",
                        opacity: isRestDay ? 0.6 : 1,
                      }}
                    >
                      <div className="w-24 font-medium">{getDayLabel(day)}</div>
                      <div className="flex-1">
                        {workout ? (
                          <span style={isRestDay ? { color: "var(--muted-foreground)" } : {}}>
                            {workout}
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted-foreground)" }}>Dia de descanso</span>
                        )}
                      </div>
                      {!isRestDay && workout && (
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleExplainWorkout(day)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Ver explicação do treino"
                          >
                            <MessageCircle className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleEditWorkout(day)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Editar treino"
                          >
                            <Edit3 className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleCopyToClipboard(day)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Copiar texto (Intervals.icu)"
                          >
                            <Clipboard className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDownloadZWO(day)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Baixar ZWO"
                          >
                            <Download className="w-4 h-4 text-primary" />
                          </button>
                          {intervalsICUEnabled && (
                            <button
                              onClick={() => handleUploadDayToIntervals(day)}
                              disabled={uploadingToIntervals}
                              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                              title="Enviar para Intervals.icu"
                            >
                              <Upload className="w-4 h-4 text-primary" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {intervalsMessage && (
              <div
                className="p-4 rounded-xl mb-4 flex items-center gap-2"
                style={{
                  backgroundColor: intervalsMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: intervalsMessage.type === "success" ? "#22c55e" : "#ef4444",
                }}
              >
                {intervalsMessage.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {intervalsMessage.text}
              </div>
            )}

            <button
              onClick={savePlan}
              disabled={saving}
              className="w-full py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white" }}
            >
              {saving ? "Salvando..." : "💾 Salvar Plano"}
            </button>
          </div>

          <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Integração Intervals.icu</h3>
            </div>
            
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Conecte ao Intervals.icu para exportar treinos diretamente para sua conta.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API Key do Intervals.icu</label>
                <input
                  type="password"
                  value={intervalsICUKey}
                  onChange={(e) => setIntervalsICUKey(e.target.value)}
                  placeholder="Sua API key do intervals.icu"
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Athlete ID</label>
                <input
                  type="text"
                  value={intervalsAthleteId}
                  onChange={(e) => setIntervalsAthleteId(e.target.value)}
                  placeholder="Seu ID de atleta (encontre em intervals.icu/settings)"
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  style={{ border: "1px solid var(--primary)", color: "var(--primary)" }}
                >
                  {testingConnection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube2 className="w-4 h-4" />
                  )}
                  Testar Conexão
                </button>
                <button
                  onClick={handleSaveIntervalsICU}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                >
                  Salvar
                </button>
              </div>

              {connectionTestResult && (
                <div
                  className="p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: connectionTestResult.success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: connectionTestResult.success ? "#22c55e" : "#ef4444",
                  }}
                >
                  {connectionTestResult.message}
                </div>
              )}

              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Encontre sua API key em intervals.icu → Settings → API
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/plans"
            className="block text-center py-3"
            style={{ color: "var(--primary)" }}
          >
            Ver todos os meus planos →
          </Link>
        </div>
      )}

      {editingWorkout && plan && (
        <WorkoutEditor
          workoutName={editingWorkout.workoutName}
          sportType={plan.sport === "cycling" ? "bike" : "run"}
          onSave={handleSaveEditedWorkout}
          onCancel={() => setEditingWorkout(null)}
        />
      )}

      {explainingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="sticky top-0 p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Como Executar o Treino</h2>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {explainingWorkout.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setExplainingWorkout(null);
                  setWorkoutExplanation(null);
                }}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {explaining ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p style={{ color: "var(--muted-foreground)" }}>Gerando instruções personalizadas...</p>
                </div>
              ) : workoutExplanation ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {workoutExplanation.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={i} className="font-bold text-lg mt-4 mb-2 text-primary">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.startsWith("**")) {
                        return <p key={i} className="font-bold mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
                      }
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--muted-foreground)" }}>Erro ao carregar explicação.</p>
              )}
            </div>

            <div className="sticky bottom-0 p-6 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <button
                onClick={() => {
                  if (workoutExplanation) {
                    copyToClipboard(workoutExplanation);
                    setIntervalsMessage({ type: "success", text: "Explicação copiada!" });
                  }
                }}
                disabled={!workoutExplanation}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ border: "1px solid var(--border)" }}
              >
                <Copy className="w-4 h-4" />
                Copiar Explicação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

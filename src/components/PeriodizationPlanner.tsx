"use client";

import { useState } from "react";
import {
  Target,
  TrendingUp,
  Zap,
  Calendar,
  ChevronRight,
  Check,
} from "lucide-react";

export type PeriodizationPhase = "base" | "build" | "peak" | "recovery";
export type PlanTemplate = {
  id: string;
  name: string;
  description: string;
  phase: PeriodizationPhase;
  weeks: number;
  targetEvent?: string;
  focus: string[];
  weeklyStructure: WeeklyStructure;
};

export type WeeklyStructure = {
  monday: WorkoutTemplate;
  tuesday: WorkoutTemplate;
  wednesday: WorkoutTemplate;
  thursday: WorkoutTemplate;
  friday: WorkoutTemplate;
  saturday: WorkoutTemplate;
  sunday: WorkoutTemplate;
};

export type WorkoutTemplate = {
  type: "easy" | "tempo" | "interval" | "long" | "race" | "rest";
  duration: [number, number];
  intensity?: number;
  description: string;
  focus: string[];
};

const phaseConfig: Record<PeriodizationPhase, { label: string; color: string; description: string }> = {
  base: {
    label: "Base",
    color: "#22c55e",
    description: "Desenvolvimento da base aeróbica e resistência geral",
  },
  build: {
    label: "Build",
    color: "#3b82f6",
    description: "Aumento da intensidade e especificidade",
  },
  peak: {
    label: "Peak",
    color: "#a855f7",
    description: "Pico de forma para competição",
  },
  recovery: {
    label: "Recovery",
    color: "#94a3b8",
    description: "Descarga e recuperação ativa",
  },
};

const basePhase: WeeklyStructure = {
  monday: { type: "rest", duration: [0, 0], description: "Descanso total ou atividade leve", focus: ["Recuperação"] },
  tuesday: { type: "easy", duration: [45, 60], description: "Corrida leve em zona 2", focus: ["Fundo aeróbico", "Técnica"] },
  wednesday: { type: "easy", duration: [40, 50], description: "Fortalecimento + corrida leve", focus: ["Força geral", "Mobilidade"] },
  thursday: { type: "tempo", duration: [45, 60], description: "Aquecimento + 4x5min Z3 + recuperação", focus: ["Limiar aeróbico"] },
  friday: { type: "rest", duration: [0, 0], description: "Descanso ou natação leve", focus: ["Recuperação"] },
  saturday: { type: "long", duration: [90, 180], description: "Longão em ritmo conversacional", focus: ["Resistência", "Endurance"] },
  sunday: { type: "easy", duration: [30, 60], description: "Corrida regenerativa bem leve", focus: ["Recuperação ativa"] },
};

const buildPhase: WeeklyStructure = {
  monday: { type: "rest", duration: [0, 0], description: "Descanso total", focus: ["Recuperação"] },
  tuesday: { type: "interval", duration: [60, 75], description: "Aquecimento + 6x800m Z4 + alongamento", focus: ["Velocidade", "VO2max"] },
  wednesday: { type: "tempo", duration: [50, 70], description: "Corrida temida com 20min Z3 contínuo", focus: ["Limiar"] },
  thursday: { type: "easy", duration: [45, 60], description: "Shake-out leve + drills", focus: ["Fundo", "Técnica"] },
  friday: { type: "rest", duration: [0, 0], description: "Descanso total", focus: ["Recuperação"] },
  saturday: { type: "long", duration: [120, 210], description: "Longo com 30min Z2 + 20min Z3", focus: ["Resistência específica"] },
  sunday: { type: "easy", duration: [30, 45], description: "Corrida regenerativa", focus: ["Recuperação ativa"] },
};

const peakPhase: WeeklyStructure = {
  monday: { type: "rest", duration: [0, 0], description: "Descanso total", focus: ["Recuperação"] },
  tuesday: { type: "interval", duration: [50, 60], description: "4x1200m Z4/Z5 com 3min recovery", focus: ["Potência", "VO2max"] },
  wednesday: { type: "tempo", duration: [40, 50], description: "Tempo trial simulation", focus: ["Specificidade"] },
  thursday: { type: "easy", duration: [30, 40], description: "Shake-out + strides", focus: ["Recuperação ativa"] },
  friday: { type: "rest", duration: [0, 0], description: "Descanso completo", focus: ["Taper"] },
  saturday: { type: "race", duration: [30, 60], description: "Simulado de prova ou race pace", focus: ["Pace target"] },
  sunday: { type: "easy", duration: [20, 30], description: "Corrida muito leve", focus: ["Ativação"] },
};

const recoveryPhase: WeeklyStructure = {
  monday: { type: "easy", duration: [30, 40], description: "Corrida muito leve", focus: ["Ativação"] },
  tuesday: { type: "easy", duration: [30, 45], description: "Leve com drills", focus: ["Mobilidade"] },
  wednesday: { type: "rest", duration: [0, 0], description: "Descanso total", focus: ["Descarga"] },
  thursday: { type: "easy", duration: [20, 30], description: "Shake-out bem leve", focus: ["Circulação"] },
  friday: { type: "rest", duration: [0, 0], description: "Descanso completo", focus: ["Pré-prova"] },
  saturday: { type: "race", duration: [30, 180], description: "DIA DA PROVA!", focus: ["Objetivo"] },
  sunday: { type: "rest", duration: [0, 0], description: "Recuperação pós-prova", focus: ["Descanso"] },
};

export const planTemplates: PlanTemplate[] = [
  {
    id: "base-5k",
    name: "Base para 5K",
    description: "12 semanas de preparação para correr seu primeiro 5K ou melhorar sua marca.",
    phase: "base",
    weeks: 12,
    targetEvent: "5K",
    focus: ["Resistência", "Fundo aeróbico", "Técnica"],
    weeklyStructure: basePhase,
  },
  {
    id: "base-10k",
    name: "Base para 10K",
    description: "16 semanas construindo base sólida para um 10K competitivo.",
    phase: "base",
    weeks: 16,
    targetEvent: "10K",
    focus: ["Endurance", "Limiar aeróbico", "Força"],
    weeklyStructure: basePhase,
  },
  {
    id: "base-half",
    name: "Base para Meia Maratona",
    description: "18 semanas de periodização para meias maratonas.",
    phase: "base",
    weeks: 18,
    targetEvent: "Meia Maratona",
    focus: ["Volume", "Resistência", "Economia de corrida"],
    weeklyStructure: basePhase,
  },
  {
    id: "build-marathon",
    name: "Build para Maratona",
    description: "12 semanas de desenvolvimento específico para maratona.",
    phase: "build",
    weeks: 12,
    targetEvent: "Maratona",
    focus: ["Specificidade", "Volume", "Race pace"],
    weeklyStructure: buildPhase,
  },
  {
    id: "peak-5k",
    name: "Peak 5K",
    description: "6 semanas de pico para seu melhor 5K.",
    phase: "peak",
    weeks: 6,
    targetEvent: "5K",
    focus: ["VO2max", "Velocidade", "Race pace"],
    weeklyStructure: peakPhase,
  },
  {
    id: "peak-10k",
    name: "Peak 10K",
    description: "8 semanas de pico para 10K competitivo.",
    phase: "peak",
    weeks: 8,
    targetEvent: "10K",
    focus: ["Limiar", "Velocidade", "Specificidade"],
    weeklyStructure: peakPhase,
  },
  {
    id: "race-day",
    name: "Dia de Prova",
    description: "Template para o dia da competição.",
    phase: "recovery",
    weeks: 1,
    focus: ["Performance", "Estratégia"],
    weeklyStructure: recoveryPhase,
  },
];

const dayLabels: Record<keyof WeeklyStructure, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

const workoutTypeColors: Record<string, string> = {
  easy: "#22c55e",
  tempo: "#3b82f6",
  interval: "#ef4444",
  long: "#ff7a50",
  race: "#a855f7",
  rest: "#94a3b8",
};

const workoutTypeLabels: Record<string, string> = {
  easy: "Leve",
  tempo: "Tempo",
  interval: "Intervalado",
  long: "Longo",
  race: "Prova",
  rest: "Descanso",
};

interface PeriodizationSelectorProps {
  onSelect: (template: PlanTemplate) => void;
  selectedPhase?: PeriodizationPhase;
}

export function PeriodizationSelector({ onSelect, selectedPhase }: PeriodizationSelectorProps) {
  const [phase, setPhase] = useState<PeriodizationPhase | "all">("all");

  const filteredTemplates = phase === "all"
    ? planTemplates
    : planTemplates.filter((t) => t.phase === phase);

  const phases: (PeriodizationPhase | "all")[] = ["all", "base", "build", "peak", "recovery"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {phases.map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: phase === p
                ? p === "all" ? "var(--coral)"
                  : phaseConfig[p as PeriodizationPhase].color
                : "var(--muted)",
              color: phase === p ? "white" : "var(--foreground)",
            }}
          >
            {p === "all" ? "Todos" : phaseConfig[p as PeriodizationPhase].label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="text-left p-4 rounded-xl border transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: phaseConfig[template.phase].color + "40",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {template.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: phaseConfig[template.phase].color + "20",
                      color: phaseConfig[template.phase].color,
                    }}
                  >
                    {phaseConfig[template.phase].label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {template.weeks} semanas
                  </span>
                  {template.targetEvent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)]" style={{ color: "var(--muted-foreground)" }}>
                      <Target className="w-3 h-3 inline mr-1" />
                      {template.targetEvent}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {template.description}
            </p>
            <div className="flex gap-1 mt-2">
              {template.focus.map((f) => (
                <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]" style={{ color: "var(--muted-foreground)" }}>
                  {f}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface PlanPreviewProps {
  template: PlanTemplate;
  onStart: () => void;
}

export function PlanPreview({ template, onStart }: PlanPreviewProps) {
  const days = Object.entries(template.weeklyStructure) as [keyof WeeklyStructure, WorkoutTemplate][];

  const weekStats = {
    totalTime: days.reduce((acc, [, w]) => acc + w.duration[1], 0),
    totalTSS: Math.round(days.reduce((acc, [, w]) => {
      const multiplier = w.type === "rest" ? 0 : w.type === "easy" ? 0.3 : w.type === "long" ? 0.8 : 0.5;
      return acc + (w.duration[1] * multiplier);
    }, 0)),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            {template.name}
          </h3>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {template.description}
          </p>
        </div>
        <button
          onClick={onStart}
          className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--coral), var(--secondary))" }}
        >
          <Calendar className="w-5 h-5" />
          Iniciar Plano
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[var(--muted)] text-center">
          <div className="text-2xl font-bold lime-glow">{weekStats.totalTime}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>min/semana</div>
        </div>
        <div className="p-3 rounded-xl bg-[var(--muted)] text-center">
          <div className="text-2xl font-bold coral-glow">{weekStats.totalTSS}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>TSS/semana</div>
        </div>
        <div className="p-3 rounded-xl bg-[var(--muted)] text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--cyan)" }}>{template.weeks}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>semanas</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
          Estrutura Semanal
        </h4>
        <div className="space-y-2">
          {days.map(([day, workout]) => (
            <div
              key={day}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <div className="w-8 text-center text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {dayLabels[day]}
              </div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: workoutTypeColors[workout.type] }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                    {workoutTypeLabels[workout.type]}
                  </span>
                  {workout.type !== "rest" && (
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {workout.duration[0]}-{workout.duration[1]} min
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {workout.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PhaseCardProps {
  phase: PeriodizationPhase;
  currentWeek: number;
  totalWeeks: number;
  isActive: boolean;
}

export function PhaseCard({ phase, currentWeek, totalWeeks, isActive }: PhaseCardProps) {
  const config = phaseConfig[phase];
  const progress = (currentWeek / totalWeeks) * 100;

  return (
    <div
      className="p-4 rounded-xl border-2 transition-all"
      style={{
        borderColor: isActive ? config.color : "var(--border)",
        backgroundColor: isActive ? config.color + "10" : "var(--card)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-lg font-bold"
          style={{ color: isActive ? config.color : "var(--muted-foreground)" }}
        >
          {config.label}
        </span>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Semanas {Math.max(1, currentWeek - 3)}-{Math.min(totalWeeks, currentWeek + 1)}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
        {config.description}
      </p>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}

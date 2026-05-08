"use client";

import { useState, useId, useRef } from "react";
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface WorkoutStep {
  id: string;
  type: "warmup" | "work" | "recovery" | "cooldown" | "rest";
  duration: number;
  intensity?: number;
  description?: string;
}

interface WorkoutEditorProps {
  workoutName: string;
  sportType: "bike" | "run" | "swim";
  initialSteps?: WorkoutStep[];
  onSave: (steps: WorkoutStep[], name: string) => void;
  onCancel: () => void;
}

const defaultSteps: WorkoutStep[] = [
  { id: "1", type: "warmup", duration: 600, intensity: 55, description: "Aquecimento leve" },
  { id: "2", type: "work", duration: 1200, intensity: 75, description: "Trabalho principal" },
  { id: "3", type: "recovery", duration: 180, intensity: 50, description: "Recuperação ativa" },
  { id: "4", type: "work", duration: 1200, intensity: 80, description: "Trabalho moderado" },
  { id: "5", type: "cooldown", duration: 300, intensity: 50, description: "Desaquecimento" },
];

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  warmup: "Aquecimento",
  work: "Trabalho",
  recovery: "Recuperação",
  cooldown: "Desaquecimento",
  rest: "Descanso",
};

function generateIntervalsText(steps: WorkoutStep[], sportType: string): string {
  const lines: string[] = [];
  
  for (const step of steps) {
    const minutes = Math.floor(step.duration / 60);
    const intensity = step.intensity || 70;
    
    if (sportType === "run") {
      const paceStr = getPaceFromIntensity(intensity);
      const speedKmh = getSpeedKmH(intensity);
      const distanceKm = (minutes * speedKmh / 60).toFixed(1);
      const description = step.description || DEFAULT_DESCRIPTIONS[step.type] || "";
      
      lines.push(`${minutes}m ${paceStr}/km (${distanceKm}km) Pace - ${description}`);
      
    } else if (sportType === "bike") {
      const ftpPercent = intensity;
      const description = step.description || DEFAULT_DESCRIPTIONS[step.type] || "";
      
      let zoneStr = "";
      if (intensity <= 55) zoneStr = "Z1";
      else if (intensity <= 65) zoneStr = "Z2";
      else if (intensity <= 75) zoneStr = "Z3";
      else if (intensity <= 85) zoneStr = "Z4";
      else if (intensity <= 95) zoneStr = "Z5";
      else zoneStr = "Z6/Z7";
      
      lines.push(`${minutes}m ${ftpPercent}% FTP - ${zoneStr} ${description}`);
      
    } else {
      lines.push(`${minutes}m - ${step.description || DEFAULT_DESCRIPTIONS[step.type] || ""}`);
    }
  }
  
  return lines.join("\n");
}

function getPaceFromIntensity(intensity: number): string {
  const basePaceSeconds = 360;
  let paceSeconds: number;
  
  if (intensity <= 60) paceSeconds = basePaceSeconds + 90;
  else if (intensity <= 65) paceSeconds = basePaceSeconds + 60;
  else if (intensity <= 70) paceSeconds = basePaceSeconds + 30;
  else if (intensity <= 75) paceSeconds = basePaceSeconds;
  else if (intensity <= 80) paceSeconds = basePaceSeconds - 15;
  else if (intensity <= 85) paceSeconds = basePaceSeconds - 30;
  else if (intensity <= 90) paceSeconds = basePaceSeconds - 45;
  else paceSeconds = basePaceSeconds - 60;
  
  const mins = Math.floor(paceSeconds / 60);
  const secs = paceSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getSpeedKmH(intensity: number): number {
  if (intensity <= 60) return 8;
  if (intensity <= 65) return 9;
  if (intensity <= 70) return 10;
  if (intensity <= 75) return 11;
  if (intensity <= 80) return 12;
  if (intensity <= 85) return 13;
  if (intensity <= 90) return 14;
  return 15;
}

export default function WorkoutEditor({
  workoutName,
  sportType,
  initialSteps,
  onSave,
  onCancel,
}: WorkoutEditorProps) {
  const uniqueId = useId();
  const counterRef = useRef(0);
  const [steps, setSteps] = useState<WorkoutStep[]>(initialSteps || defaultSteps);
  const [name, setName] = useState(workoutName);

  const addStep = (type: WorkoutStep["type"] = "work") => {
    counterRef.current += 1;
    const newStep: WorkoutStep = {
      id: `${uniqueId}-${counterRef.current}`,
      type,
      duration: type === "rest" ? 300 : 600,
      intensity: type === "rest" ? 0 : type === "warmup" || type === "cooldown" ? 55 : 70,
      description: getDefaultDescription(type),
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<WorkoutStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const moveStep = (id: string, direction: "up" | "down") => {
    const index = steps.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const getDefaultDescription = (type: WorkoutStep["type"]) => {
    const descriptions = {
      warmup: "Aquecimento",
      work: "Trabalho",
      recovery: "Recuperação",
      cooldown: "Desaquecimento",
      rest: "Descanso",
    };
    return descriptions[type];
  };

  const getTypeColor = (type: WorkoutStep["type"]) => {
    const colors = {
      warmup: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      work: "bg-red-500/20 text-red-400 border-red-500/30",
      recovery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      cooldown: "bg-green-500/20 text-green-400 border-green-500/30",
      rest: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[type];
  };

  const getIntensityLabel = (intensity: number, sport: string) => {
    if (sport === "bike") {
      if (intensity < 55) return "Z1";
      if (intensity < 75) return "Z2";
      if (intensity < 85) return "Z3";
      if (intensity < 95) return "Z4";
      if (intensity < 105) return "Z5";
      return "Z6/Z7";
    }
    if (intensity < 60) return "E (Easy)";
    if (intensity < 70) return "M (Marathon)";
    if (intensity < 80) return "T (Threshold)";
    if (intensity < 90) return "I (Interval)";
    return "R (Repetition)";
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min}min`;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const totalDuration = steps.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="sticky top-0 p-6 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Editar Treino
            </h2>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-lg font-semibold"
            style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)" }}
            placeholder="Nome do treino"
          />

          <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>Duração total: <strong className="text-primary">{formatDuration(totalDuration)}</strong></span>
            <span>|</span>
            <span>Passos: <strong className="text-primary">{steps.length}</strong></span>
            <span>|</span>
            <span>Esporte: <strong className="text-primary capitalize">{sportType}</strong></span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="text-primary">📋</span> Formato Intervals.icu
            </h4>
            <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: "var(--muted-foreground)" }}>
              {generateIntervalsText(steps, sportType)}
            </pre>
          </div>
        </div>

        <div className="px-6 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-xl border-2 transition-all ${getTypeColor(step.type)}`}
              style={{ borderColor: "inherit" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveStep(step.id, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(step.id, "down")}
                    disabled={index === steps.length - 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={step.type}
                      onChange={(e) => {
                        const newType = e.target.value as WorkoutStep["type"];
                        updateStep(step.id, {
                          type: newType,
                          description: getDefaultDescription(newType),
                        });
                      }}
                      className="px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    >
                      <option value="warmup">Aquecimento</option>
                      <option value="work">Trabalho</option>
                      <option value="recovery">Recuperação</option>
                      <option value="cooldown">Desaquecimento</option>
                      <option value="rest">Descanso</option>
                    </select>

                    <span className="text-sm font-bold px-2 py-1 rounded bg-black/20">
                      {getIntensityLabel(step.intensity || 0, sportType)}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={step.description || ""}
                    onChange={(e) => updateStep(step.id, { description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    placeholder="Descrição do passo"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateStep(step.id, { duration: Math.max(60, step.duration - 60) })}
                      className="p-2 rounded hover:bg-white/10"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-mono font-bold">
                      {formatDuration(step.duration)}
                    </span>
                    <button
                      onClick={() => updateStep(step.id, { duration: step.duration + 60 })}
                      className="p-2 rounded hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-2 rounded hover:bg-red-500/30 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-4">
            <button
              onClick={() => addStep("warmup")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Aquecimento
            </button>
            <button
              onClick={() => addStep("work")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Trabalho
            </button>
            <button
              onClick={() => addStep("recovery")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Recuperação
            </button>
            <button
              onClick={() => addStep("cooldown")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Desaquecimento
            </button>
            <button
              onClick={() => addStep("rest")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Descanso
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t flex gap-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium"
            style={{ border: "1px solid var(--border)" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(steps, name)}
            className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
          >
            <Save className="w-4 h-4" />
            Salvar e Exportar
          </button>
        </div>
      </div>
    </div>
  );
}

export function stepsToWorkout(
  steps: WorkoutStep[],
  name: string,
  sportType: "bike" | "run" | "swim"
) {
  return {
    name,
    sportType,
    intervals: steps.map((step) => ({
      duration: step.duration,
      power: step.intensity || 70,
      name: step.description || step.type,
    })),
    description: generateIntervalsText(steps, sportType),
  };
}

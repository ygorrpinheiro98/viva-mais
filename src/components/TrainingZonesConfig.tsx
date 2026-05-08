"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calculator, ChevronDown, ChevronUp, Heart, Zap, Gauge } from "lucide-react";

type ZoneSystem = "heart_rate" | "pace" | "power";

type Zone = {
  name: string;
  shortName: string;
  minValue: number;
  maxValue: number;
  color: string;
  description: string;
  benefits: string[];
};

type ZonesConfig = {
  id: string;
  user_id: string;
  sport: "run" | "bike";
  system: ZoneSystem;
  max_hr?: number;
  resting_hr?: number;
  threshold_hr?: number;
  threshold_pace?: number;
  ftp?: number;
  zones: Zone[];
};

const defaultHeartRateZones = (maxHR: number, restHR: number): Zone[] => {
  const hrReserve = maxHR - restHR;
  return [
    {
      name: "Zona 1 - Recuperação",
      shortName: "Z1",
      minValue: Math.round(restHR + hrReserve * 0.5),
      maxValue: Math.round(restHR + hrReserve * 0.6),
      color: "#94a3b8",
      description: "Atividade muito leve, conversacional",
      benefits: ["Recuperação ativa", "Regeneração", "Aquecimento"],
    },
    {
      name: "Zona 2 - Fundo",
      shortName: "Z2",
      minValue: Math.round(restHR + hrReserve * 0.6),
      maxValue: Math.round(restHR + hrReserve * 0.7),
      color: "#22c55e",
      description: "Ritmo confortável, consegue conversar",
      benefits: ["Base aeróbica", "Fadiga baixa", "Queima de gordura"],
    },
    {
      name: "Zona 3 - Aeróbico",
      shortName: "Z3",
      minValue: Math.round(restHR + hrReserve * 0.7),
      maxValue: Math.round(restHR + hrReserve * 0.8),
      color: "#3b82f6",
      description: "Esforço moderado, fala com dificuldade",
      benefits: ["Capacidade aeróbica", "Eficiência", "Transição"],
    },
    {
      name: "Zona 4 - Limiar",
      shortName: "Z4",
      minValue: Math.round(restHR + hrReserve * 0.8),
      maxValue: Math.round(restHR + hrReserve * 0.9),
      color: "#f97316",
      description: "Esforço intenso, fala muito difícil",
      benefits: ["Limiar anaeróbico", "Velocidade", "Resistência"],
    },
    {
      name: "Zona 5 - VO2max",
      shortName: "Z5",
      minValue: Math.round(restHR + hrReserve * 0.9),
      maxValue: maxHR,
      color: "#ef4444",
      description: "Esforço máximo, não consegue falar",
      benefits: ["VO2max", "Potência", "Velocidade máxima"],
    },
  ];
};

const defaultPaceZones = (vdot: number): Zone[] => {
  const basePace = 240 / vdot;
  return [
    {
      name: "Zona 1 - Leve (E)",
      shortName: "E",
      minValue: Math.round(basePace * 1.25),
      maxValue: Math.round(basePace * 1.15),
      color: "#94a3b8",
      description: "Corrida conversacional",
      benefits: ["Recuperação", "Base", "Técnica"],
    },
    {
      name: "Zona 2 - Fundo (M)",
      shortName: "M",
      minValue: Math.round(basePace * 1.15),
      maxValue: Math.round(basePace * 1.0),
      color: "#22c55e",
      description: "Ritmo de prova",
      benefits: ["Endurance", "Economia", "Resistência"],
    },
    {
      name: "Zona 3 - Sub-limar (T)",
      shortName: "T",
      minValue: Math.round(basePace * 1.0),
      maxValue: Math.round(basePace * 0.95),
      color: "#3b82f6",
      description: "Limiar aeróbico",
      benefits: ["Limiar", "Eficiência", "Pace sustain"],
    },
    {
      name: "Zona 4 - Limiar (I)",
      shortName: "I",
      minValue: Math.round(basePace * 0.95),
      maxValue: Math.round(basePace * 0.88),
      color: "#f97316",
      description: "Esforço muito intenso",
      benefits: ["VO2max", "Lactato", "Performance"],
    },
    {
      name: "Zona 5 - VO2max (R)",
      shortName: "R",
      minValue: 0,
      maxValue: Math.round(basePace * 0.88),
      color: "#ef4444",
      description: "Repetições rápidas",
      benefits: ["Velocidade", "Potência", "Economia"],
    },
  ];
};

function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || secondsPerKm === 0) return "--:--";
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatHeartRate(bpm: number): string {
  return Math.round(bpm).toString();
}

interface TrainingZonesConfigProps {
  userId: string;
  sport: "run" | "bike";
}

export default function TrainingZonesConfig({ userId, sport }: TrainingZonesConfigProps) {
  const [config, setConfig] = useState<ZonesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [system, setSystem] = useState<ZoneSystem>(sport === "run" ? "pace" : "heart_rate");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const [formData, setFormData] = useState({
    max_hr: 185,
    resting_hr: 55,
    threshold_hr: 160,
    threshold_pace: 300,
    ftp: 200,
  });

  useEffect(() => {
    fetchConfig();
  }, [userId, sport]);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("training_zones")
      .select("*")
      .eq("user_id", userId)
      .eq("sport", sport)
      .single();

    if (data) {
      setConfig(data);
      setSystem(data.system);
      if (data.max_hr) setFormData((prev) => ({ ...prev, max_hr: data.max_hr }));
      if (data.resting_hr) setFormData((prev) => ({ ...prev, resting_hr: data.resting_hr }));
      if (data.threshold_hr) setFormData((prev) => ({ ...prev, threshold_hr: data.threshold_hr }));
      if (data.threshold_pace) setFormData((prev) => ({ ...prev, threshold_pace: data.threshold_pace }));
      if (data.ftp) setFormData((prev) => ({ ...prev, ftp: data.ftp }));
    }
    setLoading(false);
  };

  const calculateZones = (): Zone[] => {
    if (system === "heart_rate") {
      return defaultHeartRateZones(formData.max_hr, formData.resting_hr);
    } else if (system === "pace") {
      const vdot = 240 / formData.threshold_pace;
      return defaultPaceZones(vdot);
    } else {
      return defaultPowerZones(formData.ftp);
    }
  };

  const handleSave = () => {
    setSaving(true);
    const zones = calculateZones();

    supabase
      .from("training_zones")
      .upsert({
        user_id: userId,
        sport,
        system,
        max_hr: formData.max_hr,
        resting_hr: formData.resting_hr,
        threshold_hr: formData.threshold_hr,
        threshold_pace: formData.threshold_pace,
        ftp: formData.ftp,
        zones,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("sport", sport)
      .then(({ error }) => {
        if (error) {
          setMessage("Erro ao salvar: " + error.message);
        } else {
          setMessage("Zonas salvas com sucesso!");
          fetchConfig();
        }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const zones = config?.zones || calculateZones();

  if (loading) return null;

  return (
    <div className="card p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--coral)", opacity: 0.1 }}>
            <Zap className="w-5 h-5" style={{ color: "var(--coral)" }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: "var(--foreground)" }}>
              Zonas de Treino - {sport === "run" ? "Corrida" : "Ciclismo"}
            </h3>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {zones.length} zonas configuradas
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
        )}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {message && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                backgroundColor: message.includes("Erro") ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                color: message.includes("Erro") ? "#ef4444" : "#22c55e",
                border: `1px solid ${message.includes("Erro") ? "#ef4444" : "#22c55e"}30`,
              }}
            >
              {message}
            </div>
          )}

          <div className="flex gap-2">
            {[
              { value: "pace", label: "Pace", icon: Gauge },
              { value: "heart_rate", label: "FC", icon: Heart },
              { value: "power", label: "Potência", icon: Zap },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSystem(value as ZoneSystem)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: system === value ? "var(--coral)" : "var(--muted)",
                  color: system === value ? "white" : "var(--foreground)",
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {system === "heart_rate" && (
              <>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                    FC Máxima
                  </label>
                  <input
                    type="number"
                    value={formData.max_hr}
                    onChange={(e) => setFormData({ ...formData, max_hr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                    FC Repouso
                  </label>
                  <input
                    type="number"
                    value={formData.resting_hr}
                    onChange={(e) => setFormData({ ...formData, resting_hr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                    FC Limiar (ou teste de 30min)
                  </label>
                  <input
                    type="number"
                    value={formData.threshold_hr}
                    onChange={(e) => setFormData({ ...formData, threshold_hr: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </>
            )}

            {system === "pace" && (
              <>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Pace Limiar (seg/km)
                  </label>
                  <input
                    type="number"
                    value={formData.threshold_pace}
                    onChange={(e) => setFormData({ ...formData, threshold_pace: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm pb-2" style={{ color: "var(--muted-foreground)" }}>
                    = {formatPace(formData.threshold_pace)} /km
                  </div>
                </div>
              </>
            )}

            {system === "power" && (
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                  FTP (Functional Threshold Power)
                </label>
                <input
                  type="number"
                  value={formData.ftp}
                  onChange={(e) => setFormData({ ...formData, ftp: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--coral), var(--secondary))" }}
          >
            <Calculator className="w-4 h-4" />
            {saving ? "Salvando..." : "Calcular Zonas"}
          </button>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Suas Zonas
            </h4>
            {zones.map((zone, index) => (
              <div
                key={index}
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.shortName}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                    {zone.name}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {zone.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold" style={{ color: zone.color }}>
                    {system === "pace"
                      ? `${formatPace(zone.maxValue)} - ${formatPace(zone.minValue)}`
                      : `${formatHeartRate(zone.minValue)} - ${formatHeartRate(zone.maxValue)}`}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {system === "pace" ? "min/km" : "bpm"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function defaultPowerZones(ftp: number): Zone[] {
  return [
    {
      name: "Zona 1 - Ativação",
      shortName: "Z1",
      minValue: 0,
      maxValue: Math.round(ftp * 0.55),
      color: "#94a3b8",
      description: "Recuperação ativa",
      benefits: ["Regeneração", "Aquecimento"],
    },
    {
      name: "Zona 2 - Fundo",
      shortName: "Z2",
      minValue: Math.round(ftp * 0.55),
      maxValue: Math.round(ftp * 0.75),
      color: "#22c55e",
      description: "Base aeróbica",
      benefits: ["Endurance", "Queima gordura"],
    },
    {
      name: "Zona 3 - Tempos",
      shortName: "Z3",
      minValue: Math.round(ftp * 0.75),
      maxValue: Math.round(ftp * 0.9),
      color: "#3b82f6",
      description: "Aeróbico forte",
      benefits: ["Capacidade", "Eficiência"],
    },
    {
      name: "Zona 4 - VO2max",
      shortName: "Z4",
      minValue: Math.round(ftp * 0.9),
      maxValue: Math.round(ftp * 1.05),
      color: "#f97316",
      description: "Próximo ao FTP",
      benefits: ["Limiar", "Sustain"],
    },
    {
      name: "Zona 5 - Neuromuscular",
      shortName: "Z5",
      minValue: Math.round(ftp * 1.05),
      maxValue: ftp * 2,
      color: "#ef4444",
      description: "Esforço máximo",
      benefits: ["Potência", "Velocidade"],
    },
  ];
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateVDOT, generateRunningZones, formatPace, RunningZones } from "@/lib/running-zones";
import { Calculator, ChevronDown, ChevronUp, Info } from "lucide-react";

interface RunningZonesConfigProps {
  userId: string;
  athleteType: string;
}

function parseTimeInput(value: string): number {
  if (!value) return 0;
  const parts = value.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
}

function formatTimeInput(seconds: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function RunningZonesConfig({ userId, athleteType }: RunningZonesConfigProps) {
  const [zones, setZones] = useState<RunningZones | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const supabase = createClient();

  const [raceTimes, setRaceTimes] = useState({
    recent_3k: "",
    recent_5k: "",
  });

  useEffect(() => {
    const fetchZones = async () => {
      const { data } = await supabase
        .from("running_zones")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setRaceTimes({
          recent_3k: formatTimeInput(data.recent_3k_sec || 0),
          recent_5k: formatTimeInput(data.recent_5k_sec || 0),
        });

        if (data.vdot) {
          setZones(generateRunningZones(data.vdot));
        }
      }
      setLoading(false);
    };

    fetchZones();
  }, [userId, supabase]);

  const handleCalculate = () => {
    const times = {
      "3k": parseTimeInput(raceTimes.recent_3k),
      "5k": parseTimeInput(raceTimes.recent_5k),
    };

    const vdot = calculateVDOT(times["3k"], times["5k"]);
    const newZones = generateRunningZones(vdot);
    setZones(newZones);
    setExpanded(true);

    setSaving(true);
    supabase
      .from("running_zones")
      .upsert({
        user_id: userId,
        vdot,
        recent_3k_sec: times["3k"] || null,
        recent_5k_sec: times["5k"] || null,
      })
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) {
          setMessage("Erro ao salvar: " + error.message);
        } else {
          setMessage("Zonas calculadas e salvas!");
        }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
      });
  };

  if (loading || athleteType !== "runner") return null;

  const zoneColors: Record<string, string> = {
    R: "bg-gray-400",
    E: "bg-green-500",
    M: "bg-yellow-500",
    T: "bg-orange-500",
    I: "bg-red-500",
    S: "bg-purple-500",
  };

  return (
    <div className="mt-8 p-6 rounded-2xl glass-effect">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Zonas de Corrida (VDOT)</h3>
            <p className="text-sm text-muted-foreground">
              {zones ? `VDOT: ${zones.vdot} | Limiar: ${formatPace(zones.thresholdPaceSec)}/km` : "Configure suas zonas de pace"}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {message && (
            <div className={`p-3 rounded-xl text-sm ${message.includes("Erro") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
              {message}
            </div>
          )}

          <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Insira suas melhores marcas recentes (3K e 5K). 
              O cálculo do VDOT será baseado nessas distâncias.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">3K (min:seg)</label>
              <input
                type="text"
                placeholder="12:30"
                value={raceTimes.recent_3k}
                onChange={(e) => setRaceTimes({ ...raceTimes, recent_3k: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">5K (min:seg)</label>
              <input
                type="text"
                placeholder="22:30"
                value={raceTimes.recent_5k}
                onChange={(e) => setRaceTimes({ ...raceTimes, recent_5k: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Calculando..." : "Calcular Zonas"}
          </button>

          {zones && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Suas Zonas de Ritmo</h4>
              <div className="space-y-3">
                {zones.zones.map((zone) => (
                  <div
                    key={zone.shortName}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className={`w-12 h-12 rounded-xl ${zoneColors[zone.shortName]} flex items-center justify-center text-white font-bold text-lg`}>
                      {zone.shortName}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{zone.name}</span>
                        <span className="text-sm text-muted-foreground">({zone.effortLevel})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{zone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">
                        {formatPace(zone.maxPaceSec)} - {formatPace(zone.minPaceSec)}
                      </div>
                      <div className="text-xs text-muted-foreground">min/km</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

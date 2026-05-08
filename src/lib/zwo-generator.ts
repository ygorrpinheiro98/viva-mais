export interface WorkoutInterval {
  duration: number;
  power?: number;
  powerLow?: number;
  powerHigh?: number;
  cadence?: number;
  name?: string;
  pace?: string;
  distance?: number;
}

export interface Workout {
  name: string;
  sportType: "bike" | "run" | "swim";
  intervals: WorkoutInterval[];
  description?: string;
}

export function generateIntervalsText(workout: Workout): string {
  const lines: string[] = [];
  
  for (const interval of workout.intervals) {
    const minutes = Math.floor(interval.duration / 60);
    const seconds = interval.duration % 60;
    
    const power = interval.power || 70;
    
    if (workout.sportType === "run") {
      const paceSeconds = getPaceFromIntensity(power);
      const paceStr = formatPace(paceSeconds);
      const distanceKm = (interval.duration / 60) * getSpeedKmH(power);
      const distanceStr = distanceKm > 0 ? ` (${distanceKm.toFixed(1)}km)` : "";
      
      let zoneStr = "";
      if (power <= 60) zoneStr = "E - Corrida Leve";
      else if (power <= 70) zoneStr = "M - Ritmo Maratona";
      else if (power <= 80) zoneStr = "T - Limiar";
      else if (power <= 90) zoneStr = "I - Intervalos";
      else zoneStr = "R - Repetições";
      
      const description = interval.name || zoneStr;
      lines.push(`${minutes}m ${paceStr}/km${distanceStr} Pace - ${description}`);
      
    } else if (workout.sportType === "bike") {
      let zoneStr = "";
      if (power <= 55) zoneStr = "Z1 - Regeneração";
      else if (power <= 65) zoneStr = "Z2 - Endurance";
      else if (power <= 75) zoneStr = "Z3 - Tempo";
      else if (power <= 85) zoneStr = "Z4 - Limiar";
      else if (power <= 95) zoneStr = "Z5 - VO2max";
      else zoneStr = "Z6/Z7 - Anaeróbico/Sprint";
      
      const watts = Math.round(power * 2.5);
      const description = interval.name || zoneStr;
      lines.push(`${minutes}m ${watts}% FTP - ${description}`);
      
    } else {
      lines.push(`${minutes}m - ${interval.name || "Nado"}`);
    }
  }
  
  return lines.join("\n");
}

function getPaceFromIntensity(intensity: number): number {
  const basePaceSeconds = 360;
  if (intensity <= 60) return basePaceSeconds + 90;
  if (intensity <= 65) return basePaceSeconds + 60;
  if (intensity <= 70) return basePaceSeconds + 30;
  if (intensity <= 75) return basePaceSeconds;
  if (intensity <= 80) return basePaceSeconds - 15;
  if (intensity <= 85) return basePaceSeconds - 30;
  if (intensity <= 90) return basePaceSeconds - 45;
  return basePaceSeconds - 60;
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

export function parseIntervalsText(text: string, sportType: "bike" | "run" | "swim"): WorkoutInterval[] {
  const intervals: WorkoutInterval[] = [];
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  
  for (const line of lines) {
    const timeMatch = line.match(/(\d+)\s*m/i);
    const intensityMatch = line.match(/(\d+)\s*%/);
    const zoneMatch = line.match(/Z(\d+)/i);
    const paceMatch = line.match(/(\d+):(\d+)\/km/i);
    const distanceMatch = line.match(/\((\d+\.?\d*)km\)/);
    
    let duration = 600;
    if (timeMatch) {
      duration = parseInt(timeMatch[1]) * 60;
    }
    
    let power = 70;
    if (zoneMatch) {
      const zone = parseInt(zoneMatch[1]);
      const zonePower = { 1: 55, 2: 65, 3: 75, 4: 85, 5: 95, 6: 105, 7: 120 };
      power = zonePower[zone as keyof typeof zonePower] || 70;
    } else if (intensityMatch) {
      power = parseInt(intensityMatch[1]);
    } else if (paceMatch) {
      const mins = parseInt(paceMatch[1]);
      const secs = parseInt(paceMatch[2]);
      const paceSeconds = mins * 60 + secs;
      power = getIntensityFromPace(paceSeconds);
    }
    
    let name = line.split("-").pop()?.trim() || line;
    name = name.replace(/^\d+m\s*[\d:/]+\/km/, "").replace(/^\d+%/, "").trim();
    
    let pace: string | undefined;
    if (paceMatch) {
      pace = `${paceMatch[1]}:${paceMatch[2]}`;
    }
    
    let distance: number | undefined;
    if (distanceMatch) {
      distance = parseFloat(distanceMatch[1]);
    }
    
    const isRest = line.toLowerCase().includes("descanso") || line.toLowerCase().includes("rest") || line.toLowerCase().includes("recovery");
    if (isRest) power = 0;
    
    intervals.push({ duration, power, name, pace, distance });
  }
  
  return intervals.length > 0 ? intervals : [{ duration: 1800, power: 70 }];
}

function getIntensityFromPace(paceSeconds: number): number {
  if (paceSeconds >= 450) return 55;
  if (paceSeconds >= 390) return 60;
  if (paceSeconds >= 360) return 65;
  if (paceSeconds >= 345) return 70;
  if (paceSeconds >= 315) return 75;
  if (paceSeconds >= 300) return 80;
  if (paceSeconds >= 270) return 85;
  return 90;
}

export function downloadText(workout: Workout, filename: string): void {
  const text = generateIntervalsText(workout);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadZWO(workout: Workout, filename: string): void {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<workout_file>`.replace('>', `>
  <name>${escapeXml(workout.name)}</name>`),
  ];

  if (workout.description) {
    lines.push(`  <description>${escapeXml(workout.description)}</description>`);
  }

  lines.push(`  <sportType>${workout.sportType}</sportType>`);
  lines.push("  <tags/>");
  lines.push("  <workout>");

  for (const interval of workout.intervals) {
    const durationSecs = interval.duration;
    const watts = interval.power ? Math.round(interval.power * 2.5) : 70;
    const cadence = interval.cadence || 90;

    if (interval.name?.toLowerCase().includes("descanso") || 
        interval.name?.toLowerCase().includes("rest") || 
        interval.name?.toLowerCase().includes("recovery") ||
        interval.power === 0) {
      lines.push(`    <SteadyState Duration="${durationSecs}" Power="0.0" Cadence="0" CadenceType="absolute"/>`);
    } else if (interval.powerLow !== undefined && interval.powerHigh !== undefined) {
      const lowWatts = Math.round(interval.powerLow * 2.5);
      const highWatts = Math.round(interval.powerHigh * 2.5);
      lines.push(`    <Warmup Duration="${Math.round(durationSecs * 0.2)}" />`);
      lines.push(`    <Ramp Duration="${Math.round(durationSecs * 0.3)}" Power="${lowWatts / 100}" />`);
      lines.push(`    <SteadyState Duration="${Math.round(durationSecs * 0.3)}" Power="${highWatts / 100}" Cadence="${cadence}" />`);
      lines.push(`    <Cooldown Duration="${Math.round(durationSecs * 0.2)}" Power="${lowWatts / 100}" />`);
    } else {
      lines.push(`    <SteadyState Duration="${durationSecs}" Power="${watts / 100}" Cadence="${cadence}" />`);
    }
  }

  lines.push("  </workout>");
  lines.push("</workout>");

  const xml = lines.join("\n");
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.zwo`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

export function generateWorkoutFromAI(
  planContent: string,
  dayKey: string,
  weekNum: number,
  sportType: "bike" | "run" | "swim" = "run"
): Workout {
  const name = `Semana ${weekNum} - ${dayKey.replace("day", "Dia ")}`;
  const intervals = parseIntervalsText(planContent, sportType);
  
  return { name, sportType, intervals, description: planContent };
}

export async function uploadToIntervalsICU(
  workout: Workout,
  apiKey: string,
  athleteId: string
): Promise<{ success: boolean; error?: string; eventId?: number }> {
  try {
    const today = new Date();
    const startDateLocal = today.toISOString().slice(0, 19);
    
    const descriptionText = generateIntervalsText(workout);
    
    const response = await fetch(
      `https://intervals.icu/api/v1/athlete/${athleteId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: workout.name,
          category: "WORKOUT",
          start_date_local: startDateLocal,
          type: workout.sportType === "bike" ? "Ride" : "Run",
          description: descriptionText,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erro ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = "API key inválida. Gere uma nova em intervals.icu → Settings → API";
      } else if (response.status === 403) {
        errorMessage = "Acesso negado (403). A API key precisa de permissões de escrita.";
      } else if (response.status === 404) {
        errorMessage = "Athlete ID não encontrado.";
      }
      
      return { 
        success: false, 
        error: `${errorMessage}\n\nResposta: ${errorText}`,
      };
    }
    
    const data = await response.json();
    const eventId = Array.isArray(data) ? data[0]?.id : data?.id;
    return { success: true, eventId };
  } catch (error) {
    return { success: false, error: `Erro de conexão: ${error}` };
  }
}

export async function testIntervalsICUConnection(
  apiKey: string,
  athleteId: string
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const response = await fetch(
      `https://intervals.icu/api/v1/athlete/${athleteId}`,
      {
        method: "GET",
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          Accept: "application/json",
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Erro ${response.status}: ${errorText}`,
        data: { status: response.status }
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: `Erro de conexão: ${error}` };
  }
}

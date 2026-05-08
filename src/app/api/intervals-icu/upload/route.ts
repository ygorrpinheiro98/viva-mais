import { NextResponse } from "next/server";

interface WorkoutInterval {
  duration: number;
  power?: number;
  powerLow?: number;
  powerHigh?: number;
  cadence?: number;
}

interface Workout {
  name: string;
  sportType: "bike" | "run" | "swim";
  intervals: WorkoutInterval[];
}

function generateZWO(workout: Workout): string {
  const sportType = workout.sportType === "bike" ? "Bike" : workout.sportType === "run" ? "Run" : "Swim";
  
  let workoutXml = `        <workout>`;
  
  for (const interval of workout.intervals) {
    if (interval.power !== undefined) {
      workoutXml += `\n          <SteadyState Duration="${interval.duration}" Power="${(interval.power / 100).toFixed(2)}" Cadence="None" />`;
    } else if (interval.powerLow !== undefined && interval.powerHigh !== undefined) {
      workoutXml += `\n          <SteadyState Duration="${interval.duration}" PowerLow="${(interval.powerLow / 100).toFixed(2)}" PowerHigh="${(interval.powerHigh / 100).toFixed(2)}" Cadence="None" />`;
    }
  }
  
  workoutXml += `\n        </workout>`;
  
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workout_file>
    <author>VIVA+</author>
    <name>${workout.name}</name>
    <sportType>${sportType}</sportType>
    <tags/>
${workoutXml}
</workout_file>`;
  
  return xml;
}

export async function POST(request: Request) {
  try {
    const { workout, apiKey, athleteId } = await request.json();
    
    if (!workout || !apiKey || !athleteId) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos: API key e Athlete ID são obrigatórios" },
        { status: 400 }
      );
    }
    
    const today = new Date();
    const startDateLocal = today.toISOString().slice(0, 19);
    
    const zwoXml = generateZWO(workout as Workout);
    
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
          type: workout.sportType === "bike" ? "Ride" : workout.sportType === "run" ? "Run" : "Swim",
          description: "Treino gerado pelo VIVA+",
          filename: `${workout.name.replace(/\s+/g, "_")}.zwo`,
          file_contents: zwoXml,
        }),
      }
    );
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = "API key inválida ou revogada. Gere uma nova em intervals.icu → Settings → API";
      } else if (response.status === 403) {
        errorMessage = "Acesso negado. Verifique se a API key tem permissão de escrita";
      } else if (response.status === 404) {
        errorMessage = "Athlete ID não encontrado. Verifique se o ID está correto";
      }
      
      const errorData = await response.json().catch(() => ({}));
      
      return NextResponse.json(
        { success: false, error: errorMessage, details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ success: true, eventId: data.id || data[0]?.id });
  } catch (error) {
    console.error("Erro ao subir treino:", error);
    return NextResponse.json(
      { success: false, error: "Erro de conexão com Intervals.icu" },
      { status: 500 }
    );
  }
}

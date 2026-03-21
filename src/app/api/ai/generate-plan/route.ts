import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { goal, level, daysPerWeek, sport, timeAvailable, durationWeeks, hasEvent, eventDate, eventName } = await request.json();

    const goalLabels: Record<string, string> = {
      "5k": "Correr 5km",
      "10k": "Correr 10km",
      "meia": "Correr Meia Maratona (21km)",
      "maratona": "Correr Maratona (42km)",
      "perda_peso": "Perder peso",
      "saude": "Melhorar saúde geral",
    };

    const levelLabels: Record<string, string> = {
      iniciante: "iniciante - nunca correu ou está voltando",
      intermediário: "intermediário - corre ocasionalmente",
      avançado: "avançado - corre regularmente",
    };

    const weeks = durationWeeks || 8;
    const daysPerWeekNum = daysPerWeek || 3;

    let eventContext = "";
    if (hasEvent && eventDate && eventName) {
      const eventDateFormatted = new Date(eventDate).toLocaleDateString("pt-BR");
      eventContext = `\n- PROVA: ${eventName} dia ${eventDateFormatted}\n- Preparar especificamente para essa prova\n- Taper na última semana`;
    }

    const prompt = `Crie um plano de treino em JSON válido.

**Dados:**
- Objetivo: ${goalLabels[goal] || goal}
- Nível: ${levelLabels[level] || level}
- Treinos por semana: ${daysPerWeekNum}
- Tempo por treino: ${timeAvailable || 45} min
- Duração: ${weeks} semanas${eventContext}

**REGRAS IMPORTANTES:**
- Cada semana TEM 7 dias: day1, day2, day3, day4, day5, day6, day7
- day1=Segunda, day2=Terça, day3=Quarta, day4=Quinta, day5=Sexta, day6=Sábado, day7=Domingo
- Em ${daysPerWeekNum} dias colocar treino, nos outros colocar "Descanso"
- Treinos: usar descrições curtas como "Corrida leve 30min" ou "Intervalos 5x400m"
- Descanso: usar texto "Descanso"

**Formato JSON:**
{
  "title": "Plano ${goalLabels[goal] || goal}",
  "description": "Descrição do plano",
  "sport": "${sport}",
  "level": "${level}",
  "duration_weeks": ${weeks},
  "workouts_per_week": ${daysPerWeekNum},
  "content": {
    "Semana 1": {
      "day1": "Treino 30min ritmo leve",
      "day2": "Treino 40min com intervals",
      "day3": "Descanso",
      "day4": "Treino 35min ritmo moderado",
      "day5": "Treino 30min corrida leve",
      "day6": "Descanso",
      "day7": "Descanso"
    }
  }
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 4096,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";

    let jsonStr = text.trim();
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const plan = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("AI Plan Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar plano", details: error.message },
      { status: 500 }
    );
  }
}

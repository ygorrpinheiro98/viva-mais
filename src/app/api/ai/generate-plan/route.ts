import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/client";
import { generateRunningZones, formatPace } from "@/lib/running-zones";

export async function POST(request: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    const { goal, level, daysPerWeek, sport, timeAvailable, durationWeeks, hasEvent, eventDate, eventName, userId } = await request.json();

    const supabase = createClient();
    let userZones = null;
    
    if (userId && sport === "running") {
      const { data } = await supabase
        .from("running_zones")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (data?.vdot) {
        userZones = generateRunningZones(data.vdot);
      }
    }

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
      intermediário: "intermediário - corre ocasionalmente, já tem base",
      avançado: "avançado - corre regularmente, quer melhorar performance",
    };

    const weeks = durationWeeks || 8;
    const daysPerWeekNum = daysPerWeek || 3;

    let eventContext = "";
    if (hasEvent && eventDate && eventName) {
      const eventDateFormatted = new Date(eventDate).toLocaleDateString("pt-BR");
      eventContext = `\n- PROVA: ${eventName} dia ${eventDateFormatted}\n- Preparar especificamente para essa prova seguindo periodização\n- Taper na última semana`;
    }

    const isCycling = sport === "cycling";

    const prompt = `Crie um plano de treino EVOLUÍDO e CIENTÍFICO baseado nos MÉTODOS DOS MAIORES TREINADORES DO MUNDO:

**TREINADORES DE REFERÊNCIA:**
- **Jack Daniels** (autor de " Daniels' Running Formula"): usa VDOT, corridas E, M, T, I, R
- **FIRST** (Mayo Clinic): método de 3 dias de treinos principais + cross-training
- **Arthur Lydiard**: base aeróbica, km repetições, polimento
- **Matt Fitzgerald (80/20)**: 80% treino leve, 20% intenso
- **Greg McMillan**: fisiologia baseada em evidências

**Dados:**
- Objetivo: ${goalLabels[goal] || goal}
- Nível: ${levelLabels[level] || level}
- Treinos por semana: ${daysPerWeekNum}
- Tempo por treino: ${timeAvailable || 45} min
- Duração: ${weeks} semanas${eventContext}
${isCycling ? "- Esporte: CICLISMO (usar power zones, FTP)" : "- Esporte: CORRIDA (usar pace zones, VDOT)"}
${userZones ? `
**ZONAS PERSONALIZADAS DO ATLETA (VDOT ${userZones.vdot}):**
${userZones.zones.map(z => `- ${z.shortName} (${z.name}): ${formatPace(z.maxPaceSec)}/km - ${formatPace(z.minPaceSec)}/km (${z.effortLevel})`).join('\n')}
- Limiar: ${formatPace(userZones.thresholdPaceSec)}/km
` : ''}

**ESTRUTURA DO PLANO:**
${isCycling ? `
Para CICLISMO use:
- Z1 (Endurance): 55-75% FTP - Base
- Z2 (Tempo): 75-85% FTP - Desenvolvimento
- Z3 (Threshold): 85-95% FTP - Limiar
- Z4 (VO2max): 95-105% FTP - VO2max
- Z5 (Anaerobic): 105-120% FTP - Capacidade anaeróbica
- Z6-7 (Neuromuscular): >120% FTP - Sprints
` : `
Para CORRIDA use zonas baseadas em VDOT:
- E (Easy): Corrida leve, conversational pace
- M (Marathon): Ritmo de maratona
- T (Threshold): Ritmo de limiar lático
- I (Interval): Intervalos de alta intensidade
- R (Repetition): Repetições rápidas
`}

**REGRAS OBRIGATÓRIAS:**
1. Cada semana TEM 7 dias: day1 a day7
2. day1=Segunda, day2=Terça, day3=Quarta, day4=Quinta, day5=Sexta, day6=Sábado, day7=Domingo
3. Colocar treino em ${daysPerWeekNum} dias, descansos nos outros
4. Variar intensidades: easy, moderate, intervals, recovery
5. Progressão: semanas iniciais mais easy, aumentar intensidade no meio, taper no fim
6. Para provas: última semana com volume reduzido (taper)

**Formato JSON:**
{
  "title": "Plano ${goalLabels[goal] || goal}",
  "description": "Descrição do plano baseado em métodos científicos",
  "sport": "${sport}",
  "level": "${level}",
  "duration_weeks": ${weeks},
  "workouts_per_week": ${daysPerWeekNum},
  "content": {
    "Semana 1": {
      "day1": "Estrutura do treino aqui",
      "day2": "Estrutura do treino aqui",
      ...
    }
  }
}

**EXEMPLOS DE TREINO (corrida):**
${userZones ? `
- "E1: 30min ${formatPace(userZones.zones[1].maxPaceSec)}/km - Corrida leve"
- "M1: 35min ${formatPace(Math.round((userZones.zones[2].minPaceSec + userZones.zones[2].maxPaceSec) / 2))}/km - Ritmo maratona"
- "T1: 20min warmup + 3x(8min ${formatPace(Math.round((userZones.zones[3].minPaceSec + userZones.zones[3].maxPaceSec) / 2))}/km c/3min recovery) + 10min cooldown"
- "I1: 15min warmup + 6x(3min ${formatPace(Math.round((userZones.zones[4].minPaceSec + userZones.zones[4].maxPaceSec) / 2))}/km c/2min recovery) + 10min cooldown"
- "R1: 10x(400m ${formatPace(userZones.zones[5].minPaceSec)}/km) c/400m recovery + 10min easy"
` : `
- "E1: 30min corrida leve ritmo conversacional"
- "M1: 35min ritmo maratona"
- "T1: 20min warmup + 3x(8min T-pace c/3min recovery) + 10min cooldown"
- "I1: 15min warmup + 6x(3min I-pace c/2min recovery) + 10min cooldown"
- "R1: 12x(200m R-pace c/200m recovery) + 10min easy"
`}
- "Descanso" ou "Recovery: alongamento leve 20min"

Retorne APENAS o JSON válido, sem markdown code blocks.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 8192,
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

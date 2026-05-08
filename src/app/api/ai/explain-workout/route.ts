import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

interface WorkoutStep {
  duration: number;
  intensity?: number;
  type?: string;
  description?: string;
}

interface Workout {
  name: string;
  sportType: "bike" | "run" | "swim";
  steps: WorkoutStep[];
}

export async function POST(request: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    const { workout } = await request.json() as { workout: Workout };

    const sport = workout.sportType === "bike" ? "ciclismo" : workout.sportType === "swim" ? "natação" : "corrida";
    
    const stepsText = workout.steps.map((step, i) => {
      const minutes = Math.floor(step.duration / 60);
      const intensity = step.intensity || 70;
      let zone = "";
      
      if (workout.sportType === "bike") {
        if (intensity <= 55) zone = "Z1 (Regeneração)";
        else if (intensity <= 65) zone = "Z2 (Endurance)";
        else if (intensity <= 75) zone = "Z3 (Tempo)";
        else if (intensity <= 85) zone = "Z4 (Limiar)";
        else if (intensity <= 95) zone = "Z5 (VO2max)";
        else zone = "Z6/Z7 (Anaeróbico)";
      } else {
        if (intensity <= 60) zone = "E (Leve)";
        else if (intensity <= 70) zone = "M (Maratona)";
        else if (intensity <= 80) zone = "T (Limiar)";
        else if (intensity <= 90) zone = "I (Intervalado)";
        else zone = "R (Repetições)";
      }
      
      return `${i + 1}. ${minutes} minutos - ${zone} ${step.description || ""}`;
    }).join("\n");

    const prompt = `Você é um TREINADOR PERSONALIZADO EXPERT em ${sport}, com formação em fisiologia do exercício e décadas de experiência.

Analise o seguinte treino e explique de forma DIDÁTICA e MOTIVACIONAL como executá-lo:

**Treino:** ${workout.name}
**Esporte:** ${sport}

**Estrutura do treino:**
${stepsText}

Sua explicação deve incluir:

1. **INTRODUÇÃO** - Breve overview do treino e seu objetivo
2. **AQUECIMENTO** - Como se preparar (o que fazer, por quê, sensações)
3. **CADA ETAPA** - Explicação detalhada de cada bloco:
   - Duração e intensidade esperada
   - Como se sentir/performar
   - Dicas técnicas
   - O que evitar
4. **DESAQUECIMENTO** - Como finalizar
5. **DICAS DO TREINADOR** - 2-3 dicas práticas
6. **FRASE MOTIVACIONAL** - Para inspirar o atleta

Use linguagem encorajadora mas técnica. Explique o "porquê" de cada coisa.

IDIOMA: Responda em PORTUGUÊS BRASILEIRO.
FORMATO: Texto corrido bem estruturado com títulos em negrito.
EXTENSÃO: Média (300-500 palavras).`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 2048,
    });

    const explanation = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ success: true, explanation });
  } catch (error: unknown) {
    console.error("Explain Workout Error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar explicação", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

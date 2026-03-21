"use client";

import { useState } from "react";

export default function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState<"pace" | "imc" | "heart">("pace");

  const [pace, setPace] = useState({ km: 5, time: "25:00" });
  const [paceResult, setPaceResult] = useState<any>(null);

  const [imc, setImc] = useState({ weight: "", height: "" });
  const [imcResult, setImcResult] = useState<any>(null);

  const [heart, setHeart] = useState({ age: "30", maxHr: "" });
  const [heartResult, setHeartResult] = useState<any>(null);

  const calculatePace = () => {
    const [min, sec] = pace.time.split(":").map(Number);
    const totalSec = min * 60 + sec;
    const pacePerKm = totalSec / pace.km;
    const paceMin = Math.floor(pacePerKm / 60);
    const paceSec = Math.round(pacePerKm % 60);

    const halfPace = `${Math.floor(pacePerKm * 21.1 / 60)}:${String(Math.round((pacePerKm * 21.1) % 60)).padStart(2, "0")}`;
    const fullPace = `${Math.floor(pacePerKm * 42.2 / 60)}:${String(Math.round((pacePerKm * 42.2) % 60)).padStart(2, "0")}`;

    setPaceResult({
      perKm: `${paceMin}:${String(paceSec).padStart(2, "0")}`,
      halfMarathon: halfPace,
      marathon: fullPace,
      speed: (pace.km / (totalSec / 3600)).toFixed(1),
    });
  };

  const calculateImc = () => {
    const w = parseFloat(imc.weight);
    const h = parseFloat(imc.height) / 100;
    if (!w || !h) return;

    const imcValue = w / (h * h);
    let classification = "";
    let color = "";

    if (imcValue < 18.5) { classification = "Abaixo do peso"; color = "text-yellow-500"; }
    else if (imcValue < 25) { classification = "Peso ideal"; color = "text-green-500"; }
    else if (imcValue < 30) { classification = "Sobrepeso"; color = "text-orange-500"; }
    else { classification = "Obesidade"; color = "text-red-500"; }

    setImcResult({ value: imcValue.toFixed(1), classification, color });
  };

  const calculateHeart = () => {
    const age = parseInt(heart.age) || 30;
    const maxHr = heart.maxHr ? parseInt(heart.maxHr) : 220 - age;

    const zones = [
      { name: "Zona 1 - Recuperação", min: Math.round(maxHr * 0.5), max: Math.round(maxHr * 0.6), desc: "Aquecimento/Leve" },
      { name: "Zona 2 - Aeróbica", min: Math.round(maxHr * 0.6), max: Math.round(maxHr * 0.7), desc: "Queima gordura" },
      { name: "Zona 3 - Aeróbica Alta", min: Math.round(maxHr * 0.7), max: Math.round(maxHr * 0.8), desc: "Resistência" },
      { name: "Zona 4 - Anaeróbica", min: Math.round(maxHr * 0.8), max: Math.round(maxHr * 0.9), desc: "Performance" },
      { name: "Zona 5 - Máxima", min: Math.round(maxHr * 0.9), max: maxHr, desc: "Sprint/Intervalado" },
    ];

    setHeartResult({ maxHr, zones });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">🧮 Calculadoras</h1>

      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { id: "pace", label: "⚡ Pace", icon: "⏱️" },
          { id: "imc", label: "📊 IMC", icon: "⚖️" },
          { id: "heart", label: "❤️ Zonas Cardíacas", icon: "💓" },
        ].map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id as any)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeCalc === calc.id
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/70"
            }`}
          >
            {calc.label}
          </button>
        ))}
      </div>

      {activeCalc === "pace" && (
        <div className="p-8 rounded-2xl glass-effect">
          <h2 className="text-2xl font-bold mb-6">Calculadora de Pace</h2>
          <p className="text-muted-foreground mb-6">Descubra seu pace por km e tempo estimado para provas</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Distância (km)</label>
              <input
                type="number"
                value={pace.km}
                onChange={(e) => setPace({ ...pace, km: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo (min:seg)</label>
              <input
                type="text"
                value={pace.time}
                onChange={(e) => setPace({ ...pace, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="25:00"
              />
            </div>
          </div>

          <button
            onClick={calculatePace}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90"
          >
            Calcular
          </button>

          {paceResult && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-primary/10 text-center">
                <div className="text-2xl font-bold gradient-text">{paceResult.perKm}</div>
                <div className="text-sm text-muted-foreground">min/km</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/10 text-center">
                <div className="text-2xl font-bold gradient-text">{paceResult.speed} km/h</div>
                <div className="text-sm text-muted-foreground">Velocidade</div>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 text-center">
                <div className="text-2xl font-bold gradient-text">{paceResult.halfMarathon}</div>
                <div className="text-sm text-muted-foreground">Meia Maratona</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-500/10 text-center">
                <div className="text-2xl font-bold gradient-text">{paceResult.marathon}</div>
                <div className="text-sm text-muted-foreground">Maratona</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCalc === "imc" && (
        <div className="p-8 rounded-2xl glass-effect">
          <h2 className="text-2xl font-bold mb-6">Calculadora de IMC</h2>
          <p className="text-muted-foreground mb-6">Índice de Massa Corpórea - verifique seu peso ideal</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Peso (kg)</label>
              <input
                type="number"
                value={imc.weight}
                onChange={(e) => setImc({ ...imc, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Altura (cm)</label>
              <input
                type="number"
                value={imc.height}
                onChange={(e) => setImc({ ...imc, height: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="175"
              />
            </div>
          </div>

          <button
            onClick={calculateImc}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90"
          >
            Calcular IMC
          </button>

          {imcResult && (
            <div className="mt-8 text-center">
              <div className="text-6xl font-bold gradient-text mb-2">{imcResult.value}</div>
              <div className={`text-xl font-semibold ${imcResult.color}`}>
                {imcResult.classification}
              </div>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <span className="text-yellow-500">Abaixo: &lt;18.5</span>
                <span className="text-green-500">Ideal: 18.5-24.9</span>
                <span className="text-orange-500">Sobrepeso: 25-29.9</span>
                <span className="text-red-500">Obeso: ≥30</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCalc === "heart" && (
        <div className="p-8 rounded-2xl glass-effect">
          <h2 className="text-2xl font-bold mb-6">Zonas Cardíacas</h2>
          <p className="text-muted-foreground mb-6">Descubra suas zonas de frequência cardíaca para treino</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Idade</label>
              <input
                type="number"
                value={heart.age}
                onChange={(e) => setHeart({ ...heart, age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">FC Máxima (opcional)</label>
              <input
                type="number"
                value={heart.maxHr}
                onChange={(e) => setHeart({ ...heart, maxHr: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
                placeholder="Deixe vazio para calcular"
              />
            </div>
          </div>

          <button
            onClick={calculateHeart}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90"
          >
            Calcular Zonas
          </button>

          {heartResult && (
            <div className="mt-8 space-y-3">
              <div className="p-4 rounded-xl bg-muted/50 text-center">
                <div className="text-lg font-semibold">FC Máxima: <span className="gradient-text">{heartResult.maxHr} bpm</span></div>
              </div>
              {heartResult.zones.map((zone: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl flex justify-between items-center ${
                  i === 0 ? "bg-blue-500/10 border-l-4 border-blue-500" :
                  i === 1 ? "bg-green-500/10 border-l-4 border-green-500" :
                  i === 2 ? "bg-yellow-500/10 border-l-4 border-yellow-500" :
                  i === 3 ? "bg-orange-500/10 border-l-4 border-orange-500" :
                  "bg-red-500/10 border-l-4 border-red-500"
                }`}>
                  <div>
                    <div className="font-medium">{zone.name}</div>
                    <div className="text-sm text-muted-foreground">{zone.desc}</div>
                  </div>
                  <div className="text-lg font-bold">
                    {zone.min} - {zone.max} <span className="text-sm font-normal">bpm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

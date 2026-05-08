"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { Activity, TrendingUp, Mountain, Timer, Heart } from "lucide-react";

type Split = {
  split: number;
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  average_speed: number;
  average_heartrate?: number;
  average_cadence?: number;
};

type PaceAnalysisProps = {
  splits: Split[];
  averageSpeed: number;
  totalElevation: number;
  averageHeartrate?: number;
};

type ViewMode = "splits" | "pace" | "rai";

const calculateRAI = (split: Split): number => {
  const elevationGain = split.elevation_difference;
  if (elevationGain <= 0) return split.average_speed;
  const gradePercent = (elevationGain / split.distance) * 100;
  const gradeFactor = 1 + (gradePercent * 0.03);
  return split.average_speed * gradeFactor;
};

const getPaceColor = (paceDiff: number): string => {
  if (paceDiff <= -12) return "#00d9ff";
  if (paceDiff <= -6) return "#33c3f0";
  if (paceDiff <= -2) return "#48cae4";
  if (paceDiff < 2) return "#00b4d8";
  if (paceDiff < 6) return "#0077a3";
  if (paceDiff < 12) return "#023e8a";
  return "#03045e";
};

const getIntensityLabel = (paceDiff: number): string => {
  if (paceDiff <= -12) return "SPRINT";
  if (paceDiff <= -6) return "RÁPIDO";
  if (paceDiff <= -2) return "TROTE";
  if (paceDiff < 2) return "CONSTANTE";
  if (paceDiff < 6) return "ESFORÇO";
  if (paceDiff < 12) return "DURO";
  return "MÁXIMO";
};

const formatPace = (speed: number): string => {
  if (!speed || speed === 0) return "--:--";
  const paceMinPerKm = 1000 / 60 / speed;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{
    payload: {
      index: number;
      pace: number;
      paceFormatted: string;
      paceDiff: number;
      time: number;
      elevation: number;
      heartrate?: number;
      color: string;
      intensity: string;
      distance: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipPayload) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0c0c0e] border border-[#333940] rounded-xl p-4 shadow-2xl min-w-[200px]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#333940]">
          <span className="text-[#ccff00] font-bold text-lg tracking-wide">KM {data.index}</span>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            data.intensity === "SPRINT" || data.intensity === "RÁPIDO" ? "bg-[#00d9ff]/20 text-[#00d9ff]" :
            data.intensity === "CONSTANTE" || data.intensity === "TROTE" ? "bg-[#00b4d8]/20 text-[#00b4d8]" :
            "bg-[#0077a3]/20 text-[#48cae4]"
          }`}>
            {data.intensity}
          </span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[#71717a] text-sm flex items-center gap-2">
              <Timer className="w-4 h-4" /> Ritmo
            </span>
            <span className="text-white font-bold text-lg">{data.paceFormatted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#71717a] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" /> Tempo
            </span>
            <span className="text-white font-semibold">{formatDuration(data.time)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#71717a] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" /> Distância
            </span>
            <span className="text-white font-semibold">{(data.distance / 1000).toFixed(3)} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#71717a] text-sm flex items-center gap-2">
              <Mountain className="w-4 h-4 text-[#ccff00]" /> Elevação
            </span>
            <span className={`font-semibold ${data.elevation > 0 ? "text-[#ccff00]" : "text-red-400"}`}>
              {data.elevation > 0 ? "+" : ""}{Math.round(data.elevation)}m
            </span>
          </div>
          {data.heartrate && (
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" /> FC
              </span>
              <span className="text-white font-semibold">{Math.round(data.heartrate)} bpm</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#333940]">
            <span className="text-[#71717a] text-sm">vs Média</span>
            <span className={`font-bold ${data.paceDiff < 0 ? "text-[#00d9ff]" : "text-red-400"}`}>
              {data.paceDiff > 0 ? "+" : ""}{data.paceDiff.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PaceAnalysis({ splits, averageSpeed, totalElevation, averageHeartrate }: PaceAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("splits");

  const chartData = useMemo(() => {
    return splits.map((split, index) => {
      const indexNum = index + 1;
      let pace = split.average_speed;

      if (viewMode === "rai") {
        pace = calculateRAI(split);
      }

      const paceDiff = ((pace - averageSpeed) / averageSpeed) * 100;
      const color = getPaceColor(paceDiff);
      const intensity = getIntensityLabel(paceDiff);

      return {
        index: indexNum,
        pace,
        paceFormatted: formatPace(pace),
        paceDiff,
        time: split.elapsed_time,
        elevation: split.elevation_difference,
        elevationCumulative: splits.slice(0, index + 1).reduce((acc, s) => acc + Math.max(0, s.elevation_difference), 0),
        elevationProfile: split.elevation_difference,
        heartrate: split.average_heartrate,
        color,
        intensity,
        distance: split.distance,
      };
    });
  }, [splits, averageSpeed, viewMode]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 10];
    const paces = chartData.map((d) => d.pace);
    const minPace = Math.min(...paces);
    const maxPace = Math.max(...paces);
    const padding = (maxPace - minPace) * 0.2;
    return [minPace - padding, maxPace + padding];
  }, [chartData]);

  const avgPaceFormatted = formatPace(averageSpeed);
  const totalTime = splits.reduce((acc, s) => acc + s.elapsed_time, 0);
  const totalDistance = splits.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940]">
          <div className="text-[#71717a] text-[10px] uppercase tracking-widest mb-1">Distância</div>
          <div className="kpi-number text-white text-3xl">{totalDistance}</div>
          <div className="text-[#71717a] text-[10px]">quilômetros</div>
        </div>
        <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940]">
          <div className="text-[#71717a] text-[10px] uppercase tracking-widest mb-1">Ritmo Médio</div>
          <div className="kpi-number gradient-text-neon text-3xl">{avgPaceFormatted}</div>
          <div className="text-[#71717a] text-[10px]">min/km</div>
        </div>
        <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940]">
          <div className="text-[#71717a] text-[10px] uppercase tracking-widest mb-1">Tempo Total</div>
          <div className="kpi-number text-white text-3xl">{formatDuration(totalTime)}</div>
          <div className="text-[#71717a] text-[10px]">duração</div>
        </div>
        <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940]">
          <div className="text-[#71717a] text-[10px] uppercase tracking-widest mb-1">Elevação</div>
          <div className="kpi-number text-[#ccff00] text-3xl">{Math.round(totalElevation)}</div>
          <div className="text-[#71717a] text-[10px]">metros</div>
        </div>
        <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940]">
          <div className="text-[#71717a] text-[10px] uppercase tracking-widest mb-1">FC Média</div>
          <div className="kpi-number text-red-400 text-3xl">{Math.round(averageHeartrate || 0)}</div>
          <div className="text-[#71717a] text-[10px]">bpm</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "splits" as ViewMode, label: "Parciais/km", icon: Activity },
          { key: "pace" as ViewMode, label: "Ritmo", icon: TrendingUp },
          { key: "rai" as ViewMode, label: "RAI", icon: Mountain },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-5 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${
              viewMode === key
                ? "bg-[#ccff00] text-[#0c0c0e] shadow-lg shadow-[#ccff00]/30"
                : "bg-[#1a1d21] hover:bg-[#272b30] text-[#a1a1aa] border border-[#333940]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1d21] rounded-2xl p-6 border border-[#333940]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white text-lg tracking-wide">
            {viewMode === "splits" && "Análise de Ritmo por Quilômetro"}
            {viewMode === "pace" && "Oscilação de Ritmo"}
            {viewMode === "rai" && "Ritmo Ajustado por Inclinação (RAI)"}
          </h3>
        </div>

        <div className="relative">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
                barCategoryGap="15%"
              >
                <defs>
                  <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d9ff" stopOpacity={1} />
                    <stop offset="50%" stopColor="#00b4d8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#023e8a" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ccff00" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ccff00" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 500 }}
                  tickLine={{ stroke: "#333940" }}
                  axisLine={{ stroke: "#333940" }}
                  label={{ value: "km", position: "bottom", offset: 5, fontSize: 12, fill: "#71717a" }}
                  tickFormatter={(value) => `${value}`}
                />
                
                <YAxis
                  yAxisId="pace"
                  domain={yDomain}
                  reversed
                  tickFormatter={(value) => formatPace(value)}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  tickLine={{ stroke: "#333940" }}
                  axisLine={{ stroke: "#333940" }}
                  width={55}
                />
                
                <YAxis
                  yAxisId="elevation"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#ccff00" }}
                  tickLine={{ stroke: "#333940" }}
                  axisLine={{ stroke: "#333940" }}
                  width={45}
                  domain={[0, "dataMax + 30"]}
                  tickFormatter={(value) => `${Math.round(value)}m`}
                />
                
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: "rgba(204, 255, 0, 0.03)" }}
                />
                
                <ReferenceLine
                  yAxisId="pace"
                  y={averageSpeed}
                  stroke="#ccff00"
                  strokeDasharray="8 4"
                  strokeWidth={2}
                  label={{
                    value: `Média: ${avgPaceFormatted}`,
                    position: "right",
                    fill: "#ccff00",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
                
                <Area
                  yAxisId="elevation"
                  type="monotone"
                  dataKey="elevationCumulative"
                  stroke="#ccff00"
                  strokeWidth={2}
                  fill="url(#elevationGradient)"
                  dot={false}
                  activeDot={false}
                />
                
                <Bar 
                  yAxisId="pace" 
                  dataKey="pace" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                  animationDuration={800}
                  animationBegin={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute bottom-12 left-4 flex items-center gap-4 text-xs bg-[#1a1d21]/90 px-3 py-1.5 rounded-lg border border-[#333940]">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-3 rounded-sm bg-gradient-to-b from-[#00d9ff] to-[#023e8a]"></div>
              <span className="text-[#a1a1aa]">Ritmo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-3 rounded-sm bg-[#ccff00]/30"></div>
              <span className="text-[#a1a1aa]">Elevação</span>
            </div>
          </div>
        </div>

        {viewMode === "rai" && (
          <p className="text-xs text-[#71717a] mt-4 pt-4 border-t border-[#333940]">
            RAI (Ritmo Ajustado por Inclinação) calcula o esforço equivalente em terreno plano considerando a inclinação de cada km.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1d21] rounded-2xl p-6 border border-[#333940]">
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Distribuição por Intensidade</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Sprint/Rápido", filter: (d: typeof chartData[0]) => d.intensity === "SPRINT" || d.intensity === "RÁPIDO", color: "#00d9ff" },
              { name: "Trote/Constante", filter: (d: typeof chartData[0]) => d.intensity === "TROTE" || d.intensity === "CONSTANTE", color: "#00b4d8" },
              { name: "Esforço", filter: (d: typeof chartData[0]) => d.intensity === "ESFORÇO" || d.intensity === "DURO", color: "#0077a3" },
              { name: "Duro/Máximo", filter: (d: typeof chartData[0]) => d.intensity === "MÁXIMO", color: "#023e8a" },
            ].map((zone) => {
              const count = chartData.filter(zone.filter).length;
              if (count === 0) return null;
              const percentage = Math.round((count / chartData.length) * 100);
              return (
                <div key={zone.name} className="p-3 rounded-xl bg-[#272b30] border border-[#333940]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold" style={{ color: zone.color }}>{count}</span>
                    <span className="text-[#71717a] text-xs">{percentage}%</span>
                  </div>
                  <div className="w-full bg-[#1a1d21] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: zone.color }} 
                    />
                  </div>
                  <div className="text-xs mt-2" style={{ color: zone.color }}>{zone.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1a1d21] rounded-2xl p-6 border border-[#333940]">
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Estatísticas</h3>
          <div className="space-y-3">
            {(() => {
              const paces = chartData.map(d => d.pace);
              const avgPace = averageSpeed;
              const fastestPace = Math.max(...paces);
              const slowestPace = Math.min(...paces);
              const paceVariation = ((slowestPace - fastestPace) / avgPace) * 100;
              
              return [
                { label: "Ritmo mais rápido", value: formatPace(fastestPace), color: "#00d9ff" },
                { label: "Ritmo mais lento", value: formatPace(slowestPace), color: "#0077a3" },
                { label: "Variação de ritmo", value: `${paceVariation.toFixed(1)}%`, color: paceVariation > 10 ? "#f59e0b" : "#22c55e" },
                { label: "Km acima da média", value: chartData.filter(d => d.paceDiff > 0).length.toString(), color: "#ef4444" },
                { label: "Km abaixo da média", value: chartData.filter(d => d.paceDiff < 0).length.toString(), color: "#22c55e" },
              ];
            })().map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg bg-[#272b30]">
                <span className="text-[#a1a1aa] text-sm">{stat.label}</span>
                <span className="font-bold" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d21] rounded-2xl p-6 border border-[#333940]">
        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Perfil de Elevação</h3>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="index"
                tick={false}
                axisLine={{ stroke: "#333940" }}
              />
              <YAxis hide domain={[0, "dataMax + 20"]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0c0c0e] border border-[#333940] rounded-lg px-3 py-2 text-xs">
                        <span className="text-[#71717a]">Km {data.index}: </span>
                        <span className="text-[#ccff00] font-bold">
                          {data.elevation > 0 ? "+" : ""}{Math.round(data.elevation)}m
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="elevation"
                stroke="#ccff00"
                strokeWidth={2}
                fill="url(#elevFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-[#71717a] mt-2 px-2">
          <span>Início</span>
          <span>{Math.round(totalElevation)}m acumulado</span>
          <span>Fim</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Flame, Heart, Zap, Trophy, ChevronRight, Activity as ActivityIcon, Gauge, Mountain } from "lucide-react";
import PaceAnalysis from "@/components/PaceAnalysis";

type ActivityDetails = {
  id: string;
  name: string;
  activity_type: string;
  distance_meters: number;
  moving_time_seconds: number;
  elapsed_time_seconds: number;
  total_elevation_gain: number;
  start_date: string;
  average_speed: number;
  max_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  calories: number;
  description: string;
  map_polyline: string;
  start_latlng_lat: number;
  start_latlng_lng: number;
  end_latlng_lat: number;
  end_latlng_lng: number;
  average_cadence: number;
  average_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  achievement_count: number;
  pr_count: number;
  strava_details?: {
    splits_metric?: Split[];
    splits_standard?: Split[];
    segment_efforts?: SegmentEffort[];
  };
};

type Split = {
  id: number;
  split: number;
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  average_speed: number;
  pace_zone: number;
  strava_activity_id: number;
  average_heartrate: number;
  average_cadence: number;
};

type SplitWithZone = Split & {
  zone: { name: string; color: string; bgColor: string; icon: string };
  paceDiff: number;
  index: number;
};

type SegmentEffort = {
  id: number;
  name: string;
  activity_id: number;
  elapsed_time: number;
  distance: number;
  start_index: number;
  end_index: number;
  pr_rank: number | null;
  achievements: string[];
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "splits" | "zones" | "segments">("analysis");

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch(`/api/strava/activity/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setActivity(data);
      } else {
        setError(data.error || "Erro ao carregar atividade");
      }
  } catch {
    setError("Erro de conexão");
  } finally {
    setLoading(false);
  }
  }, [params.id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDistance = (meters: number) => (meters / 1000).toFixed(2);
  
  const formatPace = (speed: number) => {
    if (!speed || speed === 0) return "--:--";
    const paceMinPerKm = 1000 / 60 / speed;
    const min = Math.floor(paceMinPerKm);
    const sec = Math.round((paceMinPerKm - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      Run: "from-[#00d9ff] to-[#0077a3]",
      Ride: "from-[#ccff00] to-[#00b4d8]",
      Swim: "from-[#00b4d8] to-[#0077a3]",
      Walk: "from-[#48cae4] to-[#00b4d8]",
      default: "from-[#ccff00] to-[#0077a3]",
    };
    return colors[type] || colors.default;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      Run: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>,
      Ride: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>,
      Swim: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36v-2c.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36v2c-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64z"/></svg>,
      default: <ActivityIcon className="w-6 h-6" />,
    };
    return icons[type] || icons.default;
  };

  const getSplits = () => {
    if (!activity?.strava_details) return [];
    return activity.strava_details.splits_metric || activity.strava_details.splits_standard || [];
  };

  const getSegments = () => {
    if (!activity?.strava_details) return [];
    return activity.strava_details.segment_efforts || [];
  };

  const getPaceZones = (): { zones: SplitWithZone[]; distribution: Array<{ name: string; count: number; percentage: number }> } => {
    const splits = getSplits();
    if (splits.length === 0) return { zones: [], distribution: [] };

    const avgPace = activity!.average_speed;
    const zones: SplitWithZone[] = splits.map((split, index) => {
      const paceDiff = ((split.average_speed - avgPace) / avgPace) * 100;
      let zone: { name: string; color: string; bgColor: string; icon: string };
      
      if (paceDiff <= -10) {
        zone = { name: "Muito Rápido", color: "text-[#00d9ff]", bgColor: "bg-[#00d9ff]/20 border-[#00d9ff]/30", icon: "🚀" };
      } else if (paceDiff <= -5) {
        zone = { name: "Rápido", color: "text-[#33c3f0]", bgColor: "bg-[#33c3f0]/20 border-[#33c3f0]/30", icon: "⚡" };
      } else if (paceDiff < 5) {
        zone = { name: "Ritmo Alvo", color: "text-[#00b4d8]", bgColor: "bg-[#00b4d8]/20 border-[#00b4d8]/30", icon: "🎯" };
      } else if (paceDiff < 10) {
        zone = { name: "Lento", color: "text-[#0077a3]", bgColor: "bg-[#0077a3]/20 border-[#0077a3]/30", icon: "🐢" };
      } else {
        zone = { name: "Muito Lento", color: "text-[#023e8a]", bgColor: "bg-[#023e8a]/20 border-[#023e8a]/30", icon: "🦥" };
      }
      
      return { ...split, zone, paceDiff, index: index + 1 };
    });

    return { zones, distribution: [] };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#09090b]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#ccff00] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">{error || "Atividade não encontrada"}</h1>
          <Link href="/dashboard/strava" className="text-[#ccff00] hover:underline mt-4 inline-block">
            Voltar para Strava
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-5 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getActivityColor(activity.activity_type)} flex items-center justify-center text-white`}>
              {getActivityIcon(activity.activity_type)}
            </div>
            <div>
              <h1 className="kpi-number text-4xl text-white tracking-wider">{activity.name}</h1>
              <p className="text-[#a1a1aa]">
                {new Date(activity.start_date).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })} às{" "}
                {new Date(activity.start_date).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
            <div className="flex items-center gap-2 text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4" />
              Distância
            </div>
            <div className="kpi-number gradient-text-neon text-4xl">{formatDistance(Number(activity.distance_meters))}</div>
            <div className="text-[#a1a1aa] text-sm">quilômetros</div>
          </div>
          <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
            <div className="flex items-center gap-2 text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              Tempo
            </div>
            <div className="kpi-number text-white text-4xl">{formatDuration(Number(activity.moving_time_seconds))}</div>
            <div className="text-[#a1a1aa] text-sm">duração</div>
          </div>
          <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
            <div className="flex items-center gap-2 text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">
              <ActivityIcon className="w-4 h-4" />
              Ritmo
            </div>
            <div className="kpi-number gradient-text-neon text-4xl">{formatPace(activity.average_speed)}</div>
            <div className="text-[#a1a1aa] text-sm">min/km</div>
          </div>
          <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
            <div className="flex items-center gap-2 text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">
              <Mountain className="w-4 h-4 text-[#ccff00]" />
              Elevação
            </div>
            <div className="kpi-number text-[#ccff00] text-4xl">{Math.round(Number(activity.total_elevation_gain))}</div>
            <div className="text-[#a1a1aa] text-sm">metros</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {activity.average_heartrate && (
            <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940] text-center">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="kpi-number text-white text-2xl">{Math.round(activity.average_heartrate)}</div>
              <div className="text-[#71717a] text-xs">FC Média</div>
            </div>
          )}
          {activity.max_heartrate && (
            <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940] text-center">
              <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="kpi-number text-white text-2xl">{Math.round(activity.max_heartrate)}</div>
              <div className="text-[#71717a] text-xs">FC Máxima</div>
            </div>
          )}
          {activity.calories && (
            <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940] text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="kpi-number text-white text-2xl">{Math.round(activity.calories)}</div>
              <div className="text-[#71717a] text-xs">kcal</div>
            </div>
          )}
          {activity.average_watts && (
            <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940] text-center">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="kpi-number text-white text-2xl">{Math.round(activity.average_watts)}</div>
              <div className="text-[#71717a] text-xs">W Média</div>
            </div>
          )}
          {(activity.achievement_count > 0 || activity.pr_count > 0) && (
            <div className="bg-[#1a1d21] rounded-xl p-4 border border-[#333940] text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="kpi-number text-[#ccff00] text-2xl">{activity.pr_count}</div>
              <div className="text-[#71717a] text-xs">PRs</div>
            </div>
          )}
        </div>

        {activity.description && (
          <div className="mb-8 p-6 bg-[#1a1d21] rounded-2xl border border-[#333940]">
            <h3 className="font-semibold text-white mb-2">Descrição</h3>
            <p className="text-[#a1a1aa] whitespace-pre-wrap">{activity.description}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex gap-4 border-b border-[#333940] overflow-x-auto">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "analysis"
                  ? "border-b-2 border-[#ccff00] text-[#ccff00]"
                  : "text-[#71717a] hover:text-[#a1a1aa]"
              }`}
            >
              Análise do Treino
            </button>
            <button
              onClick={() => setActiveTab("splits")}
              className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "splits"
                  ? "border-b-2 border-[#ccff00] text-[#ccff00]"
                  : "text-[#71717a] hover:text-[#a1a1aa]"
              }`}
            >
              Kilométricas
            </button>
            <button
              onClick={() => setActiveTab("zones")}
              className={`pb-3 px-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === "zones"
                  ? "border-b-2 border-[#ccff00] text-[#ccff00]"
                  : "text-[#71717a] hover:text-[#a1a1aa]"
              }`}
            >
              <Gauge className="w-4 h-4" />
              Zonas de Ritmo
            </button>
            <button
              onClick={() => setActiveTab("segments")}
              className={`pb-3 px-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "segments"
                  ? "border-b-2 border-[#ccff00] text-[#ccff00]"
                  : "text-[#71717a] hover:text-[#a1a1aa]"
              }`}
            >
              Segmentos
            </button>
          </div>
        </div>

        {activeTab === "analysis" && (
          <PaceAnalysis
            splits={getSplits().map(s => ({
              split: s.split,
              distance: s.distance,
              elapsed_time: s.elapsed_time,
              elevation_difference: s.elevation_difference,
              average_speed: s.average_speed,
              average_heartrate: s.average_heartrate,
              average_cadence: s.average_cadence,
            }))}
            averageSpeed={activity.average_speed}
            totalElevation={Number(activity.total_elevation_gain)}
            averageHeartrate={activity.average_heartrate}
          />
        )}

        {activeTab === "splits" && (
          <div className="bg-[#1a1d21] rounded-2xl border border-[#333940] overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 bg-[#272b30] text-sm font-medium text-[#71717a]">
              <div>Km</div>
              <div className="text-right">Distância</div>
              <div className="text-right">Tempo</div>
              <div className="text-right">Ritmo</div>
              <div className="text-right">Elevação</div>
              <div className="text-right">FC</div>
            </div>
            {getSplits().length > 0 ? (
              getSplits().map((split, index) => (
                <div
                  key={split.id || index}
                  className="grid grid-cols-6 gap-4 p-4 border-t border-[#333940] hover:bg-[#272b30] transition-colors"
                >
                  <div className="font-semibold text-white">Km {split.split || index + 1}</div>
                  <div className="text-right text-[#a1a1aa]">{(split.distance / 1000).toFixed(2)} km</div>
                  <div className="text-right text-white">{formatDuration(split.elapsed_time)}</div>
                  <div className="text-right gradient-text-neon font-semibold">{formatPace(split.average_speed)}</div>
                  <div className={`text-right ${split.elevation_difference > 0 ? "text-[#ccff00]" : "text-[#a1a1aa]"}`}>
                    {split.elevation_difference > 0 ? "+" : ""}{Math.round(split.elevation_difference)}m
                  </div>
                  <div className="text-right text-[#a1a1aa]">
                    {split.average_heartrate ? `${Math.round(split.average_heartrate)} bpm` : "-"}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#71717a]">
                Splits não disponíveis
              </div>
            )}
          </div>
        )}

        {activeTab === "zones" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { name: "Muito Rápido", color: "bg-[#00d9ff]/20 border-[#00d9ff]/30", textColor: "text-[#00d9ff]", icon: "🚀", desc: ">10% mais rápido" },
                { name: "Rápido", color: "bg-[#33c3f0]/20 border-[#33c3f0]/30", textColor: "text-[#33c3f0]", icon: "⚡", desc: "5-10% mais rápido" },
                { name: "Ritmo Alvo", color: "bg-[#00b4d8]/20 border-[#00b4d8]/30", textColor: "text-[#00b4d8]", icon: "🎯", desc: "±5% do ritmo" },
                { name: "Lento", color: "bg-[#0077a3]/20 border-[#0077a3]/30", textColor: "text-[#0077a3]", icon: "🐢", desc: "5-10% mais lento" },
                { name: "Muito Lento", color: "bg-[#023e8a]/20 border-[#023e8a]/30", textColor: "text-[#023e8a]", icon: "🦥", desc: ">10% mais lento" },
              ].map((zone) => (
                <div key={zone.name} className={`p-3 rounded-xl border ${zone.color} text-center`}>
                  <div className="text-xl mb-1">{zone.icon}</div>
                  <div className={`font-semibold ${zone.textColor} text-sm`}>{zone.name}</div>
                  <div className="text-xs text-[#71717a] mt-1">{zone.desc}</div>
                </div>
              ))}
            </div>

            {getPaceZones().zones.length > 0 ? (
              <div className="bg-[#1a1d21] rounded-2xl border border-[#333940] overflow-hidden">
                <div className="grid grid-cols-7 gap-3 p-4 bg-[#272b30] text-sm font-medium text-[#71717a]">
                  <div>Km</div>
                  <div className="text-right">Ritmo</div>
                  <div className="text-right">Var.</div>
                  <div className="col-span-4">Zona</div>
                </div>
                {getPaceZones().zones.map((split: SplitWithZone) => (
                  <div key={split.id || split.index} className="grid grid-cols-7 gap-3 p-4 border-t border-[#333940] hover:bg-[#272b30] transition-colors items-center">
                    <div className="font-semibold text-white">Km {split.index}</div>
                    <div className={`text-right font-semibold ${split.zone.color}`}>{formatPace(split.average_speed)}</div>
                    <div className={`text-right ${split.paceDiff < 0 ? "text-[#00d9ff]" : "text-red-400"}`}>
                      {split.paceDiff > 0 ? "+" : ""}{split.paceDiff.toFixed(1)}%
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full border ${split.zone.bgColor} ${split.zone.color} text-sm font-semibold`}>
                        {split.zone.icon} {split.zone.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[#71717a] bg-[#1a1d21] rounded-2xl border border-[#333940]">
                Zonas de ritmo não disponíveis para esta atividade
              </div>
            )}
          </div>
        )}

        {activeTab === "segments" && (
          <div className="bg-[#1a1d21] rounded-2xl border border-[#333940] overflow-hidden">
            {getSegments().length > 0 ? (
              getSegments().map((segment, index) => (
                <div
                  key={segment.id || index}
                  className="p-4 border-t border-[#333940] hover:bg-[#272b30] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {segment.pr_rank && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          segment.pr_rank === 1 ? "bg-[#ccff00]/20 text-[#ccff00]" :
                          segment.pr_rank === 2 ? "bg-gray-400/20 text-gray-400" :
                          segment.pr_rank === 3 ? "bg-orange-400/20 text-orange-400" :
                          "bg-[#333940] text-[#71717a]"
                        }`}>
                          {segment.pr_rank}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white">{segment.name}</h4>
                        <p className="text-sm text-[#71717a]">
                          {(segment.distance / 1000).toFixed(2)} km • {formatDuration(segment.elapsed_time)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#71717a]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#71717a]">
                Segmentos não disponíveis
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

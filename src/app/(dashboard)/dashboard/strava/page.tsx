"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { RefreshCw, Link2, Unlink, ChevronRight, Activity } from "lucide-react";

type Activity = {
  id: string;
  name: string;
  activity_type: string;
  distance_meters: number;
  moving_time_seconds: number;
  total_elevation_gain: number;
  start_date: string;
  average_heartrate: number;
  calories: number;
  map_polyline?: string;
};

export default function StravaPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [syncing, setSyncing] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const fetchActivities = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .eq("import_source", "strava")
        .order("start_date", { ascending: false })
        .limit(50);
      
      if (data) setActivities(data);
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("strava_connections")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setConnected(true);
          await fetchActivities();
        }
      }
      setLoading(false);
    };
    init();
  }, [supabase, fetchActivities]);

  const handleConnect = async () => {
    setConnecting(true);
    const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    
    if (!stravaClientId) {
      alert("Configure o STRAVA_CLIENT_ID no arquivo .env.local");
      setConnecting(false);
      return;
    }

    const redirectUri = `${window.location.origin}/dashboard/strava/callback`;
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;
  };

  const handleDisconnect = async () => {
    if (confirm("Deseja desconectar do Strava?")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("strava_connections").delete().eq("user_id", user.id);
        setConnected(false);
        setActivities([]);
      }
    }
  };

  const syncActivities = async () => {
    setSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        const response = await fetch("/api/strava/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          window.location.reload();
        } else {
          alert("Erro ao sincronizar: " + (result.error || " desconhecido"));
        }
      } catch {
        alert("Erro de conexão!");
      }
    }
    setSyncing(false);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatPace = (seconds: number, distance: number) => {
    if (!distance) return "--:--";
    const paceSeconds = seconds / (distance / 1000);
    const min = Math.floor(paceSeconds / 60);
    const sec = Math.round(paceSeconds % 60);
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
      Run: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>,
      Ride: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>,
      Swim: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36v-2c.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36v2c-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64zM22 16.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36v-2c.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36.56 0 .78.13 1.15.36.45.27 1.07.64 2.18.64s1.73-.37 2.18-.64c.37-.22.6-.36 1.15-.36v2c-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C10.19 4.39 9.58 4 8.91 4H4v2h4.17L6.17 8H4v2h1.69c.56 0 1.08-.3 1.34-.8L10 11v1c0 .93-.19 1.81-.53 2.61l-.35.6c-.59.98-1.67 1.62-2.86 1.62v2c1.73 0 3.2-.93 4.02-2.34.31-.53.51-1.13.57-1.77l2.2-.37c.03.27.06.54.06.83 0 2.7-2.2 4.9-4.9 4.9-2.7 0-4.9-2.2-4.9-4.9 0-2.43 1.79-4.43 4.1-4.84V12z"/></svg>,
      default: <Activity className="w-5 h-5" />,
    };
    return icons[type] || icons.default;
  };

  const calculateCalories = (activity: Activity) => {
    if (activity.calories && activity.calories > 0) {
      return Math.round(activity.calories);
    }
    const distanceKm = Number(activity.distance_meters) / 1000;
    if (activity.activity_type === "Run") return Math.round(distanceKm * 60);
    if (activity.activity_type === "Ride" || activity.activity_type === "VirtualRide") return Math.round(distanceKm * 30);
    if (activity.activity_type === "Swim") return Math.round(distanceKm * 400);
    return Math.round(distanceKm * 50);
  };

  const getStats = () => {
    const totalDistance = activities.reduce((acc, a) => acc + Number(a.distance_meters), 0);
    const totalTime = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds), 0);
    const totalElevation = activities.reduce((acc, a) => acc + Number(a.total_elevation_gain), 0);
    
    return {
      totalDistance: (totalDistance / 1000).toFixed(1),
      totalTime: formatDuration(totalTime),
      totalActivities: activities.length,
      totalElevation: Math.round(totalElevation),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#ccff00] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="kpi-number text-5xl text-white tracking-wider">STRAVA</h1>
            <p className="text-[#a1a1aa] mt-1">Suas atividades sincronizadas</p>
          </div>
          {connected && (
            <button
              onClick={syncActivities}
              disabled={syncing}
              className="px-6 py-3 rounded-xl bg-[#ccff00] text-[#1a1d21] font-bold hover:bg-[#b8e600] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Sincronizar
                </>
              )}
            </button>
          )}
        </div>

        {!connected ? (
          <div className="text-center py-20 bg-[#1a1d21] rounded-3xl border border-[#333940]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#fc4c02] to-[#ea0814] flex items-center justify-center">
              <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Conectar com Strava</h2>
            <p className="text-[#a1a1aa] max-w-md mx-auto mb-8">
              Importe automaticamente suas atividades de corrida e ciclismo para acompanhar sua evolução.
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-8 py-4 rounded-xl bg-[#fc4c02] hover:bg-[#ea0814] text-white font-bold text-lg transition-all inline-flex items-center gap-3 disabled:opacity-50"
            >
              <Link2 className="w-6 h-6" />
              {connecting ? "Conectando..." : "Conectar ao Strava"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
                <div className="text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">Atividades</div>
                <div className="kpi-number text-white text-4xl">{getStats().totalActivities}</div>
              </div>
              <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
                <div className="text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">Distância</div>
                <div className="kpi-number gradient-text-neon text-4xl">{getStats().totalDistance}<span className="text-lg ml-1">km</span></div>
              </div>
              <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
                <div className="text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">Tempo</div>
                <div className="kpi-number text-white text-4xl">{getStats().totalTime}</div>
              </div>
              <div className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940]">
                <div className="text-[#a1a1aa] text-xs uppercase tracking-wider mb-2">Elevação</div>
                <div className="kpi-number text-[#ccff00] text-4xl">{getStats().totalElevation}<span className="text-lg ml-1">m</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Atividades Recentes</h2>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Desconectar
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-16 bg-[#1a1d21] rounded-2xl border border-[#333940]">
                <Activity className="w-12 h-12 text-[#a1a1aa] mx-auto mb-4" />
                <p className="text-[#a1a1aa]">Nenhuma atividade importada</p>
                <p className="text-sm text-[#71717a] mt-1">Clique em &quot;Sincronizar&quot; para importar suas atividades</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => router.push(`/dashboard/strava/activity/${activity.id}`)}
                    className="bg-[#1a1d21] rounded-xl p-5 border border-[#333940] hover:border-[#ccff00]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.activity_type)} flex items-center justify-center text-white`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white truncate">{activity.name}</h3>
                          <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#ccff00] transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-sm text-[#71717a]">
                          {new Date(activity.start_date).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      
                      <div className="hidden md:grid grid-cols-4 gap-6 text-right">
                        <div>
                          <div className="kpi-number text-white text-xl">{formatDuration(Number(activity.moving_time_seconds))}</div>
                          <div className="text-xs text-[#71717a]">Tempo</div>
                        </div>
                        <div>
                          <div className="kpi-number gradient-text-neon text-xl">
                            {formatPace(Number(activity.moving_time_seconds), Number(activity.distance_meters))}
                          </div>
                          <div className="text-xs text-[#71717a]">Ritmo/km</div>
                        </div>
                        <div>
                          <div className="kpi-number text-white text-xl">{calculateCalories(activity)}</div>
                          <div className="text-xs text-[#71717a]">kcal</div>
                        </div>
                        {activity.average_heartrate && (
                          <div>
                            <div className="kpi-number text-red-400 text-xl">{Math.round(activity.average_heartrate)}</div>
                            <div className="text-xs text-[#71717a]">BPM</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#333940] md:hidden">
                      <div className="text-center">
                        <div className="text-sm text-white">{formatDuration(Number(activity.moving_time_seconds))}</div>
                        <div className="text-xs text-[#71717a]">Tempo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm gradient-text-neon">{formatPace(Number(activity.moving_time_seconds), Number(activity.distance_meters))}</div>
                        <div className="text-xs text-[#71717a]">Ritmo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white">{calculateCalories(activity)}</div>
                        <div className="text-xs text-[#71717a]">kcal</div>
                      </div>
                      {activity.average_heartrate && (
                        <div className="text-center">
                          <div className="text-sm text-red-400">{Math.round(activity.average_heartrate)}</div>
                          <div className="text-xs text-[#71717a]">BPM</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

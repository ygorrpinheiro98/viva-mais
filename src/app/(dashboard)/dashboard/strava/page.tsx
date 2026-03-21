"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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
};

type StravaConnection = {
  athlete_id: string;
  expires_at: string;
};

export default function StravaPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [athleteId, setAthleteId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("strava_connections")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setConnected(true);
        setAthleteId(data.athlete_id);
        fetchActivities();
      }
    }
    setLoading(false);
  };

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
        setAthleteId(null);
        setActivities([]);
      }
    }
  };

  const fetchActivities = async () => {
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
        console.log("Sync result:", result);
        
        if (response.ok) {
          alert(`Sincronizado! ${result.count || 0} atividades importadas.`);
          // Recarregar página para mostrar as atividades
          window.location.reload();
        } else {
          alert("Erro ao sincronizar: " + (result.error || " desconhecido"));
        }
      } catch (error) {
        console.error("Sync error:", error);
        alert("Erro de conexão!");
      }
    }
    setSyncing(false);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      Run: "🏃",
      Ride: "🚴",
      Swim: "🏊",
      Walk: "🚶",
      default: "⚡",
    };
    return icons[type] || icons.default;
  };

  const calculateCalories = (activity: any) => {
    if (activity.calories && activity.calories > 0) {
      return activity.calories;
    }
    const distanceKm = Number(activity.distance_meters) / 1000;
    if (activity.activity_type === "Run" || activity.activity_type === "run") {
      return Math.round(distanceKm * 60);
    }
    if (activity.activity_type === "Ride" || activity.activity_type === "ride" || activity.activity_type === "VirtualRide") {
      return Math.round(distanceKm * 30);
    }
    if (activity.activity_type === "Swim" || activity.activity_type === "swim") {
      return Math.round(distanceKm * 400);
    }
    return Math.round(distanceKm * 50);
  };

  const getStats = () => {
    const totalDistance = activities.reduce((acc, a) => acc + Number(a.distance_meters), 0);
    const totalTime = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds), 0);
    const totalCalories = activities.reduce((acc, a) => acc + calculateCalories(a), 0);
    
    return {
      totalDistance: (totalDistance / 1000).toFixed(1),
      totalTime: formatDuration(totalTime),
      totalActivities: activities.length,
      totalCalories: Math.round(totalCalories).toString(),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Strava</h1>
          <p className="text-muted-foreground mt-1">Sincronize suas atividades automaticamente</p>
        </div>
        {connected && (
          <button
            onClick={syncActivities}
            disabled={syncing}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Sincronizando...
              </>
            ) : (
              <>
                🔄 Sincronizar Atividades
              </>
            )}
          </button>
        )}
      </div>

      {!connected ? (
        <div className="text-center py-16 glass-effect rounded-3xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Conectar com Strava</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Importe automaticamente suas atividades de corrida e ciclismo do Strava para acompanhar sua evolução no VIVA+.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            {connecting ? "Conectando..." : "Conectar ao Strava"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl glass-effect text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{getStats().totalActivities}</div>
              <div className="text-sm text-muted-foreground">Atividades</div>
            </div>
            <div className="p-6 rounded-2xl glass-effect text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{getStats().totalDistance}</div>
              <div className="text-sm text-muted-foreground">km Total</div>
            </div>
            <div className="p-6 rounded-2xl glass-effect text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{getStats().totalTime}</div>
              <div className="text-sm text-muted-foreground">Tempo Total</div>
            </div>
            <div className="p-6 rounded-2xl glass-effect text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{getStats().totalCalories}</div>
              <div className="text-sm text-muted-foreground">Calorias</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Atividades Recentes</h2>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Desconectar Strava
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12 glass-effect rounded-2xl">
              <p className="text-muted-foreground">Nenhuma atividade importada</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Sincronizar" para importar suas atividades</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 rounded-2xl glass-effect flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-2xl">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{activity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.start_date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{formatDistance(Number(activity.distance_meters))} km</div>
                      <div className="text-xs text-muted-foreground">Distância</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{formatDuration(Number(activity.moving_time_seconds))}</div>
                      <div className="text-xs text-muted-foreground">Tempo</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{calculateCalories(activity)}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                    </div>
                    {activity.average_heartrate && (
                      <div>
                        <div className="text-lg font-semibold">{Math.round(Number(activity.average_heartrate))} bpm</div>
                        <div className="text-xs text-muted-foreground">FC Média</div>
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
  );
}

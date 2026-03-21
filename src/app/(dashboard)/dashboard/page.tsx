"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  name: string;
  activity_type: string;
  distance_meters: number;
  moving_time_seconds: number;
  start_date: string;
  calories: number | null;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })
        .limit(50);
      setActivities(activitiesData || []);

      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });
      setPostsCount(count || 0);
    }
    setLoading(false);
  };

  const formatDistance = (meters: number) => (Number(meters) / 1000).toFixed(1);
  const formatTime = (seconds: number) => {
    const h = Math.floor(Number(seconds) / 3600);
    const m = Math.floor((Number(seconds) % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Calcular calories estimadas
  const calculateCalories = (activity: Activity) => {
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

  // Atividades da semana atual (segunda a domingo)
  const getWeeklyStats = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda...
    const startOfWeek = new Date(now);
    // Ir para segunda-feira (se hoje é domingo, volta 6 dias; se segunda, 0; etc)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekActivities = activities.filter(a => {
      const activityDate = new Date(a.start_date);
      return activityDate >= startOfWeek;
    });

    const weekDistance = weekActivities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
    const weekTime = weekActivities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
    const weekCalories = weekActivities.reduce((acc, a) => acc + calculateCalories(a), 0);

    const activityTypes = weekActivities.map(a => a.activity_type);
    const typeCount: Record<string, number> = {};
    activityTypes.forEach(t => {
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nenhuma";

    return {
      count: weekActivities.length,
      distance: weekDistance,
      time: weekTime,
      calories: weekCalories,
      topType,
    };
  };

  const weeklyStats = getWeeklyStats();

  // Total de todas as atividades
  const totalDistance = activities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0);
  const totalTime = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0);
  const totalCalories = activities.reduce((acc, a) => acc + calculateCalories(a), 0);

  const getActivityEmoji = (type: string) => {
    if (type === "Run" || type === "run") return "🏃 Corrida";
    if (type === "Ride" || type === "ride" || type === "VirtualRide") return "🚴 Ciclismo";
    if (type === "Swim" || type === "swim") return "🏊 Natação";
    if (type === "Walk" || type === "walk") return "🚶 Caminhada";
    return "⚡ Atividade";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Olá, <span className="gradient-text">{profile?.full_name?.split(" ")[0] || "Atleta"}</span>!
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo ao seu espaço de treino e conexão
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📊 <span className="gradient-text">Resumo da Semana</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="text-3xl font-bold gradient-text mb-1">{weeklyStats.count}</div>
            <div className="text-sm text-muted-foreground">Atividades</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="text-3xl font-bold gradient-text mb-1">{formatDistance(weeklyStats.distance)}</div>
            <div className="text-sm text-muted-foreground">km esta semana</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="text-3xl font-bold gradient-text mb-1">{formatTime(weeklyStats.time)}</div>
            <div className="text-sm text-muted-foreground">Tempo</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="text-3xl font-bold gradient-text mb-1">{weeklyStats.calories}</div>
            <div className="text-sm text-muted-foreground">kcal</div>
          </div>
        </div>
        {weeklyStats.topType !== "Nenhuma" && (
          <div className="mt-4 p-4 rounded-xl bg-muted/50 text-center">
            <span className="text-lg">Atividade mais praticada: <strong>{getActivityEmoji(weeklyStats.topType)}</strong></span>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📈 Totais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <span>🏃</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{activities.length}</div>
            <div className="text-sm text-muted-foreground">Total Atividades</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-2">
              <span>📏</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{formatDistance(totalDistance)}</div>
            <div className="text-sm text-muted-foreground">km Total</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-2">
              <span>⏱️</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{formatTime(totalTime)}</div>
            <div className="text-sm text-muted-foreground">Tempo Total</div>
          </div>
          <div className="p-5 rounded-2xl glass-effect text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
              <span>🔥</span>
            </div>
            <div className="text-2xl font-bold gradient-text">{Math.round(totalCalories)}</div>
            <div className="text-sm text-muted-foreground">kcal Queimadas</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl glass-effect mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Atividades Recentes</h2>
              <Link href="/dashboard/strava" className="text-sm text-primary hover:underline">
                Ver todas →
              </Link>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <span className="text-xl">
                        {activity.activity_type === "Run" ? "🏃" : 
                         activity.activity_type === "Ride" || activity.activity_type === "VirtualRide" ? "🚴" : 
                         activity.activity_type === "Swim" ? "🏊" : "⚡"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.start_date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatDistance(activity.distance_meters)} km</div>
                      <div className="text-sm text-muted-foreground">{formatTime(activity.moving_time_seconds)}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold">{calculateCalories(activity)}</div>
                      <div className="text-sm text-muted-foreground">kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma atividade ainda</p>
                <Link href="/dashboard/strava" className="text-primary hover:underline">
                  Conectar ao Strava →
                </Link>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Feed da Comunidade</h2>
              <Link href="/dashboard/feed" className="text-sm text-primary hover:underline">
                Ver mais →
              </Link>
            </div>
            <div className="text-center py-4 text-muted-foreground">
              <p>{postsCount} posts na comunidade</p>
              <Link href="/dashboard/feed" className="text-primary hover:underline">
                Participar da comunidade →
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="p-6 rounded-2xl glass-effect mb-6">
            <h2 className="text-xl font-bold mb-4">🏆 Tipos de Atividade</h2>
            <div className="space-y-3">
              {["Run", "Ride", "VirtualRide", "Swim", "Walk"].map((type) => {
                const count = activities.filter(a => a.activity_type === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-2xl">
                      {type === "Run" ? "🏃" : type === "Ride" || type === "VirtualRide" ? "🚴" : type === "Swim" ? "🏊" : "🚶"}
                    </span>
                    <span className="font-medium">{count}x</span>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma atividade</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-effect mb-6">
            <h2 className="text-xl font-bold mb-4">Dicas Rápidas</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
                <div className="font-medium text-sm">Hidratação</div>
                <div className="text-xs text-muted-foreground">Beba água antes do treino</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-transparent border-l-4 border-secondary">
                <div className="font-medium text-sm">Aquecimento</div>
                <div className="text-xs text-muted-foreground">5-10 min antes do exercício</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-accent">
                <div className="font-medium text-sm">Recuperação</div>
                <div className="text-xs text-muted-foreground">Alongue após o treino</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-effect">
            <h2 className="text-xl font-bold mb-4">Links Rápidos</h2>
            <div className="space-y-2">
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span>👤</span>
                <span>Editar Perfil</span>
              </Link>
              <Link href="/dashboard/workouts" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span>🏋️</span>
                <span>Meus Treinos</span>
              </Link>
              <Link href="/dashboard/strava" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span>🚴</span>
                <span>Strava</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

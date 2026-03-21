"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type RankingUser = {
  id: string;
  full_name: string;
  athlete_type: string;
  total_distance: number;
  total_activities: number;
  total_time: number;
  rank: number;
};

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "year">("month");
  const supabase = createClient();

  useEffect(() => {
    fetchRankings();
  }, [period]);

  const fetchRankings = async () => {
    setLoading(true);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Buscar todas atividades e calcular rankings
    const { data: activities } = await supabase
      .from("activities")
      .select("*");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*");

    if (activities && profiles) {
      // Agrupar por usuário
      const userStats: Record<string, any> = {};
      
      activities.forEach((activity: any) => {
        if (!userStats[activity.user_id]) {
          const profile = profiles.find(p => p.id === activity.user_id);
          userStats[activity.user_id] = {
            id: activity.user_id,
            full_name: profile?.full_name || "Atleta",
            athlete_type: profile?.athlete_type || "runner",
            total_distance: 0,
            total_activities: 0,
            total_time: 0,
          };
        }
        userStats[activity.user_id].total_distance += Number(activity.distance_meters || 0);
        userStats[activity.user_id].total_activities += 1;
        userStats[activity.user_id].total_time += Number(activity.moving_time_seconds || 0);
      });

      // Ordenar por distância
      const sorted = Object.values(userStats)
        .sort((a: any, b: any) => b.total_distance - a.total_distance)
        .slice(0, 20);

      setRankings(sorted.map((u: any, i) => ({ ...u, rank: i + 1 })));
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏅 Rankings</h1>
        <p className="text-muted-foreground">Veja quem está no topo este mês</p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setPeriod("month")}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            period === "month" ? "bg-primary text-white" : "bg-muted hover:bg-muted/70"
          }`}
        >
          📅 Este Mês
        </button>
        <button
          onClick={() => setPeriod("year")}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            period === "year" ? "bg-primary text-white" : "bg-muted hover:bg-muted/70"
          }`}
        >
          📆 Este Ano
        </button>
      </div>

      {rankings.length > 0 ? (
        <div className="space-y-3">
          {rankings.map((user, index) => (
            <div
              key={user.id}
              className={`p-4 rounded-2xl glass-effect flex items-center gap-4 ${
                index === 0 ? "border-2 border-yellow-500" :
                index === 1 ? "border-2 border-gray-400" :
                index === 2 ? "border-2 border-amber-600" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                index === 0 ? "bg-yellow-500 text-white" :
                index === 1 ? "bg-gray-400 text-white" :
                index === 2 ? "bg-amber-600 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {user.rank}
              </div>

              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                {user.full_name?.charAt(0) || "A"}
              </div>

              <div className="flex-1">
                <div className="font-semibold">{user.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.athlete_type === "runner" ? "🏃 Corredor" : "🚴 Ciclista"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold gradient-text">
                  {(Number(user.total_distance) / 1000).toFixed(1)} km
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.total_activities} atividades
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg">Nenhum dado de ranking ainda</p>
          <p className="text-muted-foreground">Complete atividades para aparecer no ranking!</p>
        </div>
      )}
    </div>
  );
}

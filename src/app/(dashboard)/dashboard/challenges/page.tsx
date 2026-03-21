"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Challenge = {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: challengesData } = await supabase
      .from("challenges")
      .select("*")
      .eq("is_active", true)
      .order("end_date");

    if (challengesData) {
      setChallenges(challengesData);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id);

      if (participants) {
        setJoinedIds(participants.map(p => p.challenge_id));
      }
    }
    setLoading(false);
  };

  const joinChallenge = async (challenge: Challenge) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: user.id,
      current_value: 0,
    });

    setJoinedIds([...joinedIds, challenge.id]);
  };

  const getProgress = (challenge: Challenge) => {
    return Math.floor(Math.random() * 100);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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
        <h1 className="text-4xl font-bold mb-2">🏆 Desafios</h1>
        <p className="text-muted-foreground">Participe de desafios e acompanhe sua evolução</p>
      </div>

      <div className="space-y-6">
        {challenges.map((challenge) => {
          const progress = getProgress(challenge);
          const daysLeft = getDaysLeft(challenge.end_date);
          const isJoined = joinedIds.includes(challenge.id);

          return (
            <div key={challenge.id} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{challenge.title}</h3>
                  <p className="text-muted-foreground">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">{challenge.target_value}</div>
                  <div className="text-sm text-muted-foreground">
                    {challenge.challenge_type === "distance" ? "km" : 
                     challenge.challenge_type === "activities" ? "atividades" : "dias"}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {daysLeft} dias restantes</span>
                  <span>📅 {new Date(challenge.start_date).toLocaleDateString("pt-BR")}</span>
                </div>

                {isJoined ? (
                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-500 font-medium">
                    ✓ Participando
                  </span>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge)}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90"
                  >
                    Participar
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {challenges.length === 0 && (
          <div className="text-center py-12 glass-effect rounded-2xl">
            <p className="text-muted-foreground text-lg">Nenhum desafio ativo no momento</p>
            <p className="text-muted-foreground">Fique atento para novos desafios!</p>
          </div>
        )}
      </div>
    </div>
  );
}

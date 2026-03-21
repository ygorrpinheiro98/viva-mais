"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Workout = {
  id: string;
  title: string;
  description: string;
  workout_type: string;
  duration_minutes: number;
  distance_km: number;
  intensity: string;
  created_at: string;
};

type Tip = {
  id: string;
  title: string;
  content: string;
  tip_type: string;
};

const workoutTypes = [
  { value: "cardio", label: "Cardio", icon: "❤️" },
  { value: "strength", label: "Força", icon: "💪" },
  { value: "flexibility", label: "Flexibilidade", icon: "🧘" },
  { value: "interval", label: "Intervalado", icon: "⚡" },
];

const intensities = [
  { value: "low", label: "Leve", color: "text-green-500" },
  { value: "medium", label: "Moderado", color: "text-yellow-500" },
  { value: "high", label: "Intenso", color: "text-red-500" },
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"workouts" | "tips">("tips");
  
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    description: "",
    workout_type: "cardio",
    duration_minutes: 30,
    distance_km: 0,
    intensity: "medium",
  });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchWorkouts(), fetchTips()]);
    setLoading(false);
  };

  const fetchWorkouts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setWorkouts(data);
    }
  };

  const fetchTips = async () => {
    const { data } = await supabase
      .from("tips")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTips(data);
  };

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("workouts").insert({
        ...newWorkout,
        user_id: user.id,
      });
      setNewWorkout({
        title: "",
        description: "",
        workout_type: "cardio",
        duration_minutes: 30,
        distance_km: 0,
        intensity: "medium",
      });
      setShowForm(false);
      fetchWorkouts();
    }
    setSaving(false);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm("Deseja excluir este treino?")) {
      await supabase.from("workouts").delete().eq("id", id);
      fetchWorkouts();
    }
  };

  const tipsByType = {
    nutrition: tips.filter(t => t.tip_type === "nutrition"),
    health: tips.filter(t => t.tip_type === "health"),
    training: tips.filter(t => t.tip_type === "training"),
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
        <h1 className="text-4xl font-bold">Treinos & Nutrição</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancelar" : "+ Novo Treino"}
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("tips")}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            activeTab === "tips"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/70"
          }`}
        >
          📚 Dicas & Nutrição
        </button>
        <button
          onClick={() => setActiveTab("workouts")}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            activeTab === "workouts"
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/70"
          }`}
        >
          🏋️ Meus Treinos
        </button>
      </div>

      {activeTab === "tips" && (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🥗 Nutrição
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tipsByType.nutrition.map((tip) => (
                <div key={tip.id} className="p-6 rounded-2xl glass-effect hover:border-primary/50 transition-all">
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🏥 Saúde & Recuperação
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tipsByType.health.map((tip) => (
                <div key={tip.id} className="p-6 rounded-2xl glass-effect hover:border-secondary/50 transition-all">
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.content}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🏃 Dicas de Treino
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tipsByType.training.map((tip) => (
                <div key={tip.id} className="p-6 rounded-2xl glass-effect hover:border-accent/50 transition-all">
                  <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "workouts" && (
        <div>
          {showForm && (
            <form onSubmit={handleSubmitWorkout} className="p-8 rounded-2xl glass-effect mb-8">
              <h2 className="text-2xl font-bold mb-6">Novo Treino</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={newWorkout.title}
                    onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                    placeholder="Ex: Corrida matinal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={newWorkout.workout_type}
                    onChange={(e) => setNewWorkout({ ...newWorkout, workout_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                  >
                    {workoutTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                  <input
                    type="number"
                    value={newWorkout.duration_minutes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration_minutes: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distância (km)</label>
                  <input
                    type="number"
                    value={newWorkout.distance_km}
                    onChange={(e) => setNewWorkout({ ...newWorkout, distance_km: Number(e.target.value) })}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Intensidade</label>
                  <div className="flex gap-4">
                    {intensities.map((intensity) => (
                      <button
                        key={intensity.value}
                        type="button"
                        onClick={() => setNewWorkout({ ...newWorkout, intensity: intensity.value })}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                          newWorkout.intensity === intensity.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className={intensity.color}>{intensity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={newWorkout.description}
                    onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none resize-none"
                    placeholder="Detalhes do treino..."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Treino"}
              </button>
            </form>
          )}

          {workouts.length === 0 ? (
            <div className="text-center py-16 glass-effect rounded-2xl">
              <p className="text-muted-foreground text-xl mb-4">Nenhum treino registrado</p>
              <p className="text-muted-foreground mb-6">Comece a registrar seus treinos para acompanhar sua evolução!</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium"
                >
                  Criar primeiro treino
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <div key={workout.id} className="p-6 rounded-2xl glass-effect relative group">
                  <button
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">
                      {workoutTypes.find(t => t.value === workout.workout_type)?.icon}
                    </span>
                    <h3 className="text-lg font-bold">{workout.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>⏱️ {workout.duration_minutes} min</span>
                    {workout.distance_km > 0 && <span>📏 {workout.distance_km} km</span>}
                    <span className={intensities.find(i => i.value === workout.intensity)?.color}>
                      ● {intensities.find(i => i.value === workout.intensity)?.label}
                    </span>
                  </div>
                  {workout.description && (
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    {new Date(workout.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

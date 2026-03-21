"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Group = {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  level: string;
  sport: string;
  members_count?: number;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", city: "", state: "", sport: "both", level: "all" });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (groupsData) {
      // Buscar contagem de membros
      const groupsWithCount = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          return { ...group, members_count: count || 0 };
        })
      );
      setGroups(groupsWithCount);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: members } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (members) {
        setJoinedIds(members.map(m => m.group_id));
      }
    }
    setLoading(false);
  };

  const joinGroup = async (group: Group) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "member",
    });

    setJoinedIds([...joinedIds, group.id]);
    fetchData();
  };

  const createGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newGroup.name) return;

    await supabase.from("groups").insert({
      ...newGroup,
      created_by: user.id,
    });

    setShowCreate(false);
    setNewGroup({ name: "", description: "", city: "", state: "", sport: "both", level: "all" });
    fetchData();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">👥 Grupos</h1>
          <p className="text-muted-foreground">Encontre grupos de treino na sua região</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90"
        >
          + Criar Grupo
        </button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl glass-effect mb-8">
          <h3 className="text-xl font-bold mb-4">Criar Novo Grupo</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="Nome do grupo"
              className="px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
            />
            <input
              type="text"
              value={newGroup.city}
              onChange={(e) => setNewGroup({ ...newGroup, city: e.target.value })}
              placeholder="Cidade"
              className="px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
            />
            <input
              type="text"
              value={newGroup.state}
              onChange={(e) => setNewGroup({ ...newGroup, state: e.target.value })}
              placeholder="Estado"
              className="px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
            />
            <select
              value={newGroup.sport}
              onChange={(e) => setNewGroup({ ...newGroup, sport: e.target.value })}
              className="px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none"
            >
              <option value="both">Corrida e Ciclismo</option>
              <option value="running">Apenas Corrida</option>
              <option value="cycling">Apenas Ciclismo</option>
            </select>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Descrição do grupo"
              rows={3}
              className="md:col-span-2 px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={createGroup}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium"
            >
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2 rounded-full border border-border hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((group) => {
          const isJoined = joinedIds.includes(group.id);
          return (
            <div key={group.id} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    📍 {group.city}, {group.state}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl font-bold gradient-text">{group.members_count || 0}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">membros</div>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-muted text-xs">
                    {group.sport === "running" ? "🏃 Corrida" : 
                     group.sport === "cycling" ? "🚴 Ciclismo" : "🏃🚴 Ambos"}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-muted text-xs capitalize">
                    {group.level}
                  </span>
                </div>

                {isJoined ? (
                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-500 text-sm font-medium">
                    ✓ Participando
                  </span>
                ) : (
                  <button
                    onClick={() => joinGroup(group)}
                    className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90"
                  >
                    Participar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg">Nenhum grupo ainda</p>
          <p className="text-muted-foreground">Seja o primeiro a criar um grupo!</p>
        </div>
      )}
    </div>
  );
}

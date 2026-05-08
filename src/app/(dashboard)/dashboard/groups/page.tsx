"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Plus,
  Search,
  MapPin,
  Footprints,
  Bike,
  Mountain,
  Waves,
  Dumbbell,
  Shield,
  Crown,
  UserPlus,
  LogOut,
  X,
  Calendar,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Group = {
  id: string;
  name: string;
  description: string;
  group_type: string;
  city: string;
  state: string;
  region: string;
  cover_image_url: string | null;
  avatar_url: string | null;
  is_public: boolean;
  min_level: string;
  max_members: number;
  owner_id: string;
  member_count?: number;
  is_member?: boolean;
  user_role?: string;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
};

const groupTypeIcons: Record<string, React.ReactNode> = {
  running: <Footprints className="w-5 h-5" />,
  cycling: <Bike className="w-5 h-5" />,
  trail: <Mountain className="w-5 h-5" />,
  swimming: <Waves className="w-5 h-5" />,
  triathlon: <Dumbbell className="w-5 h-5" />,
  general: <Users className="w-5 h-5" />,
};

const groupTypeLabels: Record<string, string> = {
  running: "Corrida",
  cycling: "Ciclismo",
  trail: "Trilha",
  swimming: "Natação",
  triathlon: "Triatlo",
  general: "Geral",
};

const groupTypeColors: Record<string, string> = {
  running: "#22c55e",
  cycling: "#3b82f6",
  trail: "#f59e0b",
  swimming: "#06b6d4",
  triathlon: "#8b5cf6",
  general: "#ec4899",
};

const levelLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  all: "Todos os níveis",
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchGroups();
  }, [filterType]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("groups")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("group_type", filterType);
      }

      const { data } = await query;

      if (data) {
        const groupsWithCounts = await Promise.all(
          data.map(async (group) => {
            const { count } = await supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);

            return {
              ...group,
              member_count: count || 0,
              is_member: false,
              user_role: null,
            };
          })
        );

        setGroups(groupsWithCounts);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data } = await supabase
        .from("group_members")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq("group_id", groupId);

      if (data) {
        setGroupMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: "member",
        });

      if (!error) {
        fetchGroups();
        if (selectedGroup?.id === groupId) {
          fetchGroupMembers(groupId);
        }
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        group.name.toLowerCase().includes(query) ||
        group.city?.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Grupos de Treino
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Conecte-se com atletas da sua região
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Criar Grupo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["all", "running", "cycling", "trail", "general"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filterType === type
                  ? "bg-primary text-white"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {type !== "all" && (
                <span style={{ color: filterType === type ? "white" : groupTypeColors[type] }}>
                  {groupTypeIcons[type]}
                </span>
              )}
              {type === "all" ? "Todos" : groupTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            Carregando grupos...
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              onClick={() => {
                setSelectedGroup(group);
                fetchGroupMembers(group.id);
              }}
            >
              <div
                className="h-24 relative"
                style={{
                  background: group.cover_image_url
                    ? `url(${group.cover_image_url}) center/cover`
                    : `linear-gradient(135deg, ${groupTypeColors[group.group_type]}40, ${groupTypeColors[group.group_type]}20)`,
                }}
              >
                <div
                  className="absolute bottom-2 left-3 w-12 h-12 rounded-xl flex items-center justify-center border-2"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: groupTypeColors[group.group_type],
                    color: groupTypeColors[group.group_type]
                  }}
                >
                  {groupTypeIcons[group.group_type]}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold truncate">{group.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{group.city || group.region || "Online"}</span>
                </div>

                {group.description && (
                  <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <Users className="w-4 h-4" />
                    <span>{group.member_count || 0} membros</span>
                  </div>
                  <div
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: groupTypeColors[group.group_type] + "20",
                      color: groupTypeColors[group.group_type]
                    }}
                  >
                    {levelLabels[group.min_level] || "Todos"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
              <p className="text-zinc-500">Nenhum grupo encontrado</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white font-medium"
              >
                Criar primeiro grupo
              </button>
            </div>
          )}
        </div>
      )}

      {selectedGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedGroup(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 right-4 z-10 p-1 rounded-lg bg-black/50 hover:bg-black/70"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div
              className="h-32 relative"
              style={{
                background: selectedGroup.cover_image_url
                  ? `url(${selectedGroup.cover_image_url}) center/cover`
                  : `linear-gradient(135deg, ${groupTypeColors[selectedGroup.group_type]}, ${groupTypeColors[selectedGroup.group_type]}80)`,
              }}
            >
              <div
                className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl flex items-center justify-center border-4"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--card)",
                  color: groupTypeColors[selectedGroup.group_type]
                }}
              >
                {groupTypeIcons[selectedGroup.group_type]}
              </div>
            </div>

            <div className="p-4 pt-10">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: groupTypeColors[selectedGroup.group_type] + "20",
                    color: groupTypeColors[selectedGroup.group_type]
                  }}
                >
                  {groupTypeLabels[selectedGroup.group_type]}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedGroup.city || selectedGroup.region || "Online"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {selectedGroup.member_count || 0} membros
                </span>
              </div>

              {selectedGroup.description && (
                <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                  {selectedGroup.description}
                </p>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Próximos encontros</h4>
                <div
                  className="p-4 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <CalendarCheck className="w-8 h-8 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium">Nenhum encontro agendado</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Os encontros serão exibidos aqui
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Membros recentes</h4>
                <div className="flex -space-x-2">
                  {groupMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: "var(--primary)",
                        borderColor: "var(--card)",
                        color: "white"
                      }}
                      title={member.profiles?.full_name || "Membro"}
                    >
                      {(member.profiles?.full_name || "M")[0].toUpperCase()}
                    </div>
                  ))}
                  {(selectedGroup.member_count || 0) > 5 && (
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: "var(--muted-foreground)",
                        borderColor: "var(--card)",
                        color: "white"
                      }}
                    >
                      +{(selectedGroup.member_count || 0) - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {selectedGroup.is_member ? (
                  <>
                    <button className="flex-1 py-3 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition-colors">
                      Sair do grupo
                    </button>
                    <button className="flex-1 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                      Ver encontros
                    </button>
                  </>
                ) : (
                  <button 
                    className="flex-1 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    onClick={() => joinGroup(selectedGroup.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Entrar no grupo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    group_type: "running",
    city: "",
    state: "",
    region: "",
    is_public: true,
    min_level: "all",
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onClose();
        return;
      }

      const { data, error } = await supabase
        .from("groups")
        .insert({
          ...formData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (data && !error) {
        await supabase.from("group_members").insert({
          group_id: data.id,
          user_id: user.id,
          role: "owner",
        });

        onSuccess();
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Criar Grupo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do grupo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: "var(--border)" }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
              style={{ borderColor: "var(--border)" }}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de esporte</label>
            <div className="grid grid-cols-3 gap-2">
              {["running", "cycling", "trail"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, group_type: type })}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                    formData.group_type === type ? "border-primary bg-primary/10" : ""
                  }`}
                  style={{ borderColor: formData.group_type === type ? "var(--primary)" : "var(--border)" }}
                >
                  <span style={{ color: groupTypeColors[type] }}>
                    {groupTypeIcons[type]}
                  </span>
                  <span className="text-xs">{groupTypeLabels[type]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-transparent"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nível mínimo</label>
            <select
              value={formData.min_level}
              onChange={(e) => setFormData({ ...formData, min_level: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-transparent"
              style={{ borderColor: "var(--border)" }}
            >
              <option value="all">Todos os níveis</option>
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_public" className="text-sm">Grupo público (qualquer um pode entrar)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

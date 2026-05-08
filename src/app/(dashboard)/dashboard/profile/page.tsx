"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import RunningZonesConfig from "@/components/RunningZonesConfig";
import { Camera, Upload, X, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    athlete_type: "runner",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setAvatarUrl(data.avatar_url);
          setFormData({
            full_name: data.full_name || "",
            bio: data.bio || "",
            location: data.location || "",
            athlete_type: data.athlete_type || "runner",
          });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Por favor, selecione uma imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("A imagem deve ter menos de 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadingAvatar(true);
    setMessage("");

      try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error("É necessário criar o bucket 'avatars' no Supabase Dashboard. Acesse: Storage > New Bucket > Nome: 'avatars' > Public: SIM");
        } else if (uploadError.message.includes("Permission denied")) {
          throw new Error("Sem permissão para upload. Configure as políticas RLS no Supabase para o bucket 'avatars'.");
        } else {
          throw uploadError;
        }
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setProfile((prev: any) => ({ ...prev, avatar_url: newAvatarUrl }));
      setMessage("Foto de perfil atualizada!");
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setUploadingAvatar(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) {
        setMessage("Erro ao salvar: " + error.message);
      } else {
        setMessage("Perfil atualizado com sucesso!");
        setProfile({ ...profile, ...formData });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: "var(--primary)" }}></div>
      </div>
    );
  }

  const displayAvatar = previewUrl || avatarUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold font-display mb-8">
        <span style={{ color: "var(--foreground)" }}>Meu </span>
        <span className="gradient-text-coral">Perfil</span>
      </h1>

      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.includes("sucesso") || message.includes("atualizada") 
          ? "bg-[#ccff00]/10 border border-[#ccff00]/20" 
          : "bg-[#ff4757]/10 border border-[#ff4757]/20"}`}
          style={{ color: message.includes("sucesso") || message.includes("atualizada") ? "var(--neon)" : "var(--energy)" }}
        >
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="p-6 rounded-2xl glass-card text-center">
            <div className="relative inline-block mb-4">
              <div 
                className="w-32 h-32 mx-auto rounded-full overflow-hidden flex items-center justify-center"
                style={{ 
                  background: displayAvatar 
                    ? "transparent" 
                    : "linear-gradient(135deg, var(--coral), var(--secondary))"
                }}
              >
                {displayAvatar ? (
                  <img 
                    src={displayAvatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {formData.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                style={{ 
                  backgroundColor: "var(--coral)",
                  boxShadow: "0 0 15px rgba(255, 122, 80, 0.5)"
                }}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>

              {previewUrl && uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              {formData.full_name || "Atleta"}
            </h2>
            <p className="text-sm capitalize" style={{ color: "var(--muted-foreground)" }}>
              {formData.athlete_type === "runner" ? "Corredor" : "Ciclista"}
            </p>
            {formData.location && (
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                {formData.location}
              </p>
            )}

            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)"
              }}
            >
              <Upload className="w-4 h-4" />
              {uploadingAvatar ? "Enviando..." : "Alterar foto"}
            </button>

            <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              PNG, JPG ou WEBP (máx. 5MB)
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="p-8 rounded-2xl glass-card space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Nome completo
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--muted)", 
                  border: "1px solid var(--border)",
                  color: "var(--foreground)"
                }}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Localização
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--muted)", 
                  border: "1px solid var(--border)",
                  color: "var(--foreground)"
                }}
                placeholder="Cidade, Estado"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  backgroundColor: "var(--muted)", 
                  border: "1px solid var(--border)",
                  color: "var(--foreground)"
                }}
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>
                Tipo de atleta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, athlete_type: "runner" })}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: formData.athlete_type === "runner" ? "var(--coral)" : "var(--border)",
                    backgroundColor: formData.athlete_type === "runner" ? "rgba(255, 122, 80, 0.1)" : "transparent",
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--coral)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="block font-medium" style={{ color: "var(--foreground)" }}>Corredor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, athlete_type: "cyclist" })}
                  className="p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: formData.athlete_type === "cyclist" ? "var(--coral)" : "var(--border)",
                    backgroundColor: formData.athlete_type === "cyclist" ? "rgba(255, 122, 80, 0.1)" : "transparent",
                  }}
                >
                  <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--secondary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="5.5" cy="17.5" r="3.5" strokeWidth={2} />
                    <circle cx="18.5" cy="17.5" r="3.5" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2" />
                  </svg>
                  <span className="block font-medium" style={{ color: "var(--foreground)" }}>Ciclista</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, var(--coral), var(--secondary))", color: "white" }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </form>
        </div>
      </div>

      {profile && (
        <RunningZonesConfig userId={profile.id} athleteType={formData.athlete_type} />
      )}
    </div>
  );
}

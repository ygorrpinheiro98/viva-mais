"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [posting, setPosting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsData) {
      // Buscar profiles separadamente
      const postsWithProfiles = await Promise.all(
        postsData.map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, athlete_type")
            .eq("id", post.user_id)
            .single();
          
          const { count: likes } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          const { count: comments } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          return {
            ...post,
            profiles: profile || { full_name: "Atleta", athlete_type: "runner" },
            likes_count: likes || 0,
            comments_count: comments || 0,
          };
        })
      );
      setPosts(postsWithProfiles);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: newPost,
        post_type: postType,
      });

      if (!error) {
        setNewPost("");
        fetchPosts();
      } else {
        alert("Erro ao postar: " + error.message);
      }
    }
    setPosting(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const postTypes = [
    { value: "general", label: "Geral", icon: "💬" },
    { value: "training", label: "Treino", icon: "🏃" },
    { value: "nutrition", label: "Nutrição", icon: "🥗" },
    { value: "achievement", label: "Conquista", icon: "🏆" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Feed da Comunidade</h1>

      <div className="p-6 rounded-2xl glass-effect mb-8">
        <div className="flex gap-2 mb-4 flex-wrap">
          {postTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setPostType(type.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                postType === type.value
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/70"
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Compartilhe sua experiência, treino ou dica..."
          className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none resize-none min-h-[100px]"
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Dica: Use hashtags como #treino #nutrição #corrida #ciclismo
          </p>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {posting ? "Postando..." : "Publicar"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg mb-2">Nenhum post ainda</p>
          <p className="text-muted-foreground">Seja o primeiro a compartilhar algo!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {post.profiles?.full_name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{post.profiles?.full_name || "Atleta"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {post.profiles?.athlete_type === "runner" ? "🏃 Corredor" : "🚴 Ciclista"} • {timeAgo(post.created_at)}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-muted text-xs">
                  {postTypes.find((t) => t.value === post.post_type)?.icon}
                </span>
              </div>
              
              <p className="text-lg mb-4 whitespace-pre-wrap">{post.content}</p>
              
              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <button className="flex items-center gap-2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likes_count || 0}
                </button>
                <button className="flex items-center gap-2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.comments_count || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

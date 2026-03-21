"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  published_at: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const categories = [
    { id: "all", label: "Todos", icon: "📚" },
    { id: "training", label: "Treino", icon: "🏃" },
    { id: "nutrition", label: "Nutrição", icon: "🥗" },
    { id: "gear", label: "Equipamentos", icon: "👟" },
    { id: "health", label: "Saúde", icon: "💚" },
  ];

  const filteredPosts = posts.filter(p => {
    if (filter === "all") return true;
    return p.category === filter;
  });

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
        <h1 className="text-4xl font-bold mb-2">📰 Blog</h1>
        <p className="text-muted-foreground">Notícias, dicas e novidades do mundo esportivo</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === cat.id ? "bg-primary text-white" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            href={`/dashboard/blog/${post.slug}`}
            className="block p-6 rounded-2xl glass-effect hover:border-primary/50 transition-all"
          >
            <div className="flex gap-4">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl ${
                post.category === "training" ? "bg-primary/20" :
                post.category === "nutrition" ? "bg-green-500/20" :
                post.category === "gear" ? "bg-orange-500/20" :
                "bg-blue-500/20"
              }`}>
                {post.category === "training" ? "🏃" :
                 post.category === "nutrition" ? "🥗" :
                 post.category === "gear" ? "👟" : "📚"}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full bg-muted text-xs capitalize">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 glass-effect rounded-2xl">
          <p className="text-muted-foreground text-lg">Nenhum post encontrado</p>
          <p className="text-muted-foreground">Novos artigos em breve!</p>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PostCard, type Post } from "@/components/PostCard";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending — Vesak Lightstream" },
      { name: "description", content: "The brightest lanterns in the sky right now." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  return (
    <AppShell title="Trending" subtitle="The brightest lanterns tonight">
      <div className="space-y-5">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} 
          onDelete={(deletedId) => setPosts(currentPosts => currentPosts.filter(p => p.id !== deletedId))}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No lanterns are glowing yet.</p>
        )}
      </div>
    </AppShell>
  );
}

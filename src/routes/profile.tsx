import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PostCard, type Post } from "@/components/PostCard";
import { getGuestId } from "@/lib/guest";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Vesak Lightstream" },
      { name: "description", content: "Your anonymous lantern keeper profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [guestId, setGuestId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesReceived, setLikesReceived] = useState(0);
  const [lanternsLit, setLanternsLit] = useState(0);

  useEffect(() => {
    const id = getGuestId();
    setGuestId(id);

    supabase
      .from("posts")
      .select("*")
      .eq("guest_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const ps = data ?? [];
        setPosts(ps);
        setLikesReceived(ps.reduce((a, p) => a + (p.like_count || 0), 0));
      });

    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("guest_id", id)
      .then(({ count }) => setLanternsLit(count ?? 0));
  }, []);

  return (
    <AppShell title="Your Light" subtitle="Anonymous, but never alone">
      <div className="glass rounded-3xl p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lantern to-lantern-glow glow-lantern" />
        <div>
          <p className="text-xs text-muted-foreground">You are</p>
          <p className="font-display text-xl text-glow">{guestId}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Posts" value={posts.length} />
        <Stat label="Likes" value={likesReceived} />
        <Stat label="Lit" value={lanternsLit} />
      </div>

      <h2 className="text-sm tracking-widest uppercase text-muted-foreground mb-3">Your lanterns</h2>
      <div className="space-y-5">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            You haven't released a light yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className="font-display text-2xl text-lantern text-glow">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

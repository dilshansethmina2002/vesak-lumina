import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PostCard, type Post } from "@/components/PostCard";
import { ComposeSheet } from "@/components/ComposeSheet";
import { ReleaseLightFab } from "@/components/ReleaseLightFab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vesak Lightstream — A calm lantern sky" },
      { name: "description", content: "Anonymously share Vesak moments — lanterns, temples, candles, kindness." },
      { property: "og:title", content: "Vesak Lightstream" },
      { property: "og:description", content: "A calm, anonymous lantern sky of Vesak memories." },
    ],
  }),
  component: StreamPage,
});

const PAGE_SIZE = 8;

function StreamPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compose, setCompose] = useState(false);
  const [lanternsToday, setLanternsToday] = useState<number | null>(null);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const p = reset ? 0 : page;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE - 1);
    if (!error && data) {
      setPosts((prev) => (reset ? data : [...prev, ...data]));
      setPage(p + 1);
      if (data.length < PAGE_SIZE) setDone(true);
    }
    setLoading(false);
  }, [loading, page]);

  useEffect(() => {
    load(true);
    const since = new Date(); since.setHours(0, 0, 0, 0);
    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString())
      .then(({ count }) => setLanternsToday(count ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (done || loading) return;
      if (window.innerHeight + window.scrollY > document.body.offsetHeight - 600) load(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [done, loading, load]);

  return (
    <AppShell title="Lightstream" subtitle="A quiet sky of Vesak memories">
      {lanternsToday !== null && (
        <div className="glass rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Lanterns lit today</span>
          <span className="font-display text-lantern text-glow text-lg">🏮 {lanternsToday.toLocaleString()}</span>
        </div>
      )}

      <div className="space-y-5">
        {posts.map((p) => (
          <PostCard key={p.id} post={p}
          onDelete={(deletedId) => setPosts(currentPosts => currentPosts.filter(p => p.id !== deletedId))}
           />
        ))}
        {posts.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-20">
            <p className="font-display text-lg">The sky is quiet…</p>
            <p className="text-sm mt-1">Be the first to release a light.</p>
          </div>
        )}
        {loading && <p className="text-center text-xs text-muted-foreground py-6">drifting in…</p>}
        {done && posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">You've reached the horizon 🏮</p>
        )}
      </div>

      <ReleaseLightFab onClick={() => setCompose(true)} />
      <ComposeSheet open={compose} onClose={() => setCompose(false)} onPosted={() => load(true)} />
    </AppShell>
  );
}

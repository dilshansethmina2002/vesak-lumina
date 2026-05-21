import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import type { Post } from "@/components/PostCard";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Vesak Lightstream" },
      { name: "description", content: "Wander a masonry of peaceful Vesak moments." },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  const withImages = posts.filter((p) => p.image_urls.length > 0);

  return (
    <AppShell title="Explore" subtitle="Wander the lantern sky">
      <div className="columns-2 gap-3 [column-fill:_balance]">
        {withImages.map((p, i) => (
          <Link
            key={p.id}
            to="/"
            className="mb-3 block break-inside-avoid rounded-2xl overflow-hidden glass fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <img
              src={p.image_urls[0]}
              alt={p.caption ?? "Vesak"}
              loading="lazy"
              className="w-full h-auto object-cover"
              style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5" }}
            />
            <div className="px-2.5 py-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate">{p.guest_id}</span>
              <span className="text-lantern">🏮 {p.like_count}</span>
            </div>
          </Link>
        ))}
        {withImages.length === 0 && (
          <p className="text-center text-muted-foreground py-20 col-span-2">
            No lights to wander yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}

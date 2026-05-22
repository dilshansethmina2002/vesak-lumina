import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PostCard, type Post } from "@/components/PostCard";
import { getGuestId } from "@/lib/guest";
import { Edit2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [displayName, setDisplayName] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likesReceived, setLikesReceived] = useState(0);
  const [lanternsLit, setLanternsLit] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Get the permanent, hidden ID
    const id = getGuestId();
    setGuestId(id);

    // 2. Get the beautiful display name (or default to empty)
    const savedName = localStorage.getItem("displayName") || "";
    setDisplayName(savedName);
    setNewName(savedName || "Guest");

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

  const handleSaveName = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    const toastId = toast.loading("Updating your identity...");

    try {
      // Update all past posts to reflect the new display name
      const { error } = await supabase
        .from("posts")
        .update({ display_name: trimmedName })
        .eq("guest_id", guestId);

      if (error) throw error;

      // Save locally so the app remembers
      localStorage.setItem("displayName", trimmedName);
      setDisplayName(trimmedName);
      setIsEditing(false);

      toast.success("Name updated peacefully.", { id: toastId });
    } catch (e) {
      console.error("Failed to update name:", e);
      toast.error("Failed to update name. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine what to show on screen: Custom name, or just "Guest"
  const titleToShow = displayName || "Guest";

  return (
    <AppShell title="Your Light" subtitle="Anonymous, but never alone">
      <div className="glass rounded-3xl p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-lantern to-lantern-glow glow-lantern" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">You are</p>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-glow font-display text-lg focus:outline-none focus:border-lantern/50 transition-colors"
                autoFocus
                disabled={isSaving}
              />
              <button
                onClick={handleSaveName}
                disabled={isSaving || !newName.trim()}
                className="p-2 rounded-full bg-lantern/20 text-lantern hover:bg-lantern/30 transition-colors shrink-0"
                aria-label="Save name"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-display text-xl text-glow truncate">{titleToShow}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-colors shrink-0"
                aria-label="Edit name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
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
          <PostCard 
            key={p.id} 
            post={p} 
            onDelete={(deletedId) => setPosts(currentPosts => currentPosts.filter(p => p.id !== deletedId))}
          />
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
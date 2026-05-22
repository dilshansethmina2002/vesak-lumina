import { useEffect, useRef, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getGuestId, timeAgo } from "@/lib/guest";
import { toast } from "sonner";

export type Post = {
  id: string;
  guest_id: string;
  display_name?: string | null; // Added the new property
  caption: string | null;
  image_urls: string[];
  like_count: number;
  created_at: string;
};

export function PostCard({ 
  post, 
  onChange,
  onDelete 
}: { 
  post: Post; 
  onChange?: (p: Post) => void;
  onDelete?: (id: string) => void;
}) {
  const guestId = getGuestId();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.like_count);
  const [pop, setPop] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const tapTimer = useRef<number | null>(null);

  // The hidden ID is still used to verify ownership securely
  const isOwner = post.guest_id === guestId;

  useEffect(() => {
    let cancel = false;
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("guest_id", guestId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancel) setLiked(!!data);
      });
    return () => {
      cancel = true;
    };
  }, [post.id, guestId]);

  const toggleLike = async (force?: "on") => {
    if (force === "on" && liked) {
      setPop((n) => n + 1);
      return;
    }
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      await supabase.from("likes").delete().eq("post_id", post.id).eq("guest_id", guestId);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      setPop((n) => n + 1);
      await supabase.from("likes").insert({ post_id: post.id, guest_id: guestId });
    }
    onChange?.({ ...post, like_count: count + (liked ? -1 : 1) });
  };

  const handleImgClick = () => {
    if (tapTimer.current) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      toggleLike("on");
    } else {
      tapTimer.current = window.setTimeout(() => {
        tapTimer.current = null;
      }, 280);
    }
  };

  const handleDelete = () => {
    toast("Remove this light?", {
      description: "Are you sure you want to let this go?",
      action: {
        label: "Remove",
        onClick: async () => {
          setIsDeleting(true);
          const toastId = toast.loading("Releasing...");
          
          try {
            const { data, error } = await supabase
              .from("posts")
              .delete()
              .eq("id", post.id)
              .select(); 

            if (error) throw error;
            
            if (!data || data.length === 0) {
                throw new Error("Database blocked deletion.");
            }
            
            onDelete?.(post.id);
            toast.success("Light removed peacefully.", { id: toastId });
          } catch (e) {
            console.error("Failed to delete post:", e);
            toast.error("Failed to remove light. Please try again.", { id: toastId });
            setIsDeleting(false);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}, 
      },
    });
  };

  const imgs = post.image_urls.length > 0 ? post.image_urls : [];

  return (
    <article className={`glass rounded-3xl overflow-hidden fade-up transition-opacity ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lantern to-lantern-glow glow-lantern" />
          
          {/* Replaced guest_id with display_name, falling back to "Guest" */}
          <span className="text-sm font-medium tracking-wide">
            {post.display_name || "Guest"}
          </span>
          
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-heart transition-colors"
              aria-label="Delete light"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {imgs.length > 0 && (
        <div className="relative bg-black/30 select-none" onClick={handleImgClick}>
          <img
            src={imgs[imgIdx]}
            alt={post.caption ?? "Vesak moment"}
            loading="lazy"
            className="w-full aspect-square object-cover"
            draggable={false}
          />
          {pop > 0 && (
            <Heart
              key={pop}
              className="heart-pop absolute inset-0 m-auto w-24 h-24 text-heart fill-heart drop-shadow-[0_0_20px_oklch(0.82_0.17_65/0.9)]"
            />
          )}
          {imgs.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imgIdx ? "w-5 bg-lantern" : "w-1.5 bg-white/40"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/85 leading-relaxed flex-1 min-w-0 break-words">
          {post.caption}
        </p>
        <button
          onClick={() => toggleLike()}
          className="flex flex-col items-center gap-0.5 shrink-0"
          aria-label="Light lantern"
        >
          <Heart
            className={`w-6 h-6 transition-all ${
              liked
                ? "text-heart fill-heart drop-shadow-[0_0_10px_oklch(0.82_0.17_65/0.8)]"
                : "text-muted-foreground"
            }`}
          />
          <span className={`text-xs ${liked ? "text-lantern" : "text-muted-foreground"}`}>{count}</span>
        </button>
      </div>
    </article>
  );
}
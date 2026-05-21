import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getGuestId } from "@/lib/guest";

export function ComposeSheet({
  open,
  onClose,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setCaption("");
      setErr(null);
    }
  }, [open]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 3);
    setFiles(next);
  };

  const submit = async () => {
    if (files.length === 0) {
      setErr("Add at least one photo to release light.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const guestId = getGuestId();
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${guestId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("vesak-photos")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("vesak-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { error: insErr } = await supabase.from("posts").insert({
        guest_id: guestId,
        caption: caption.trim() || null,
        image_urls: urls,
      });
      if (insErr) throw insErr;
      onPosted();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center">
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      {/* Added max-h-[90vh] and overflow-y-auto here to prevent the button from being pushed off-screen */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto glass rounded-t-3xl p-5 pb-28 fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display">Release a Light</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {previews.map((u, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
              <img src={u} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {files.length < 3 && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-lantern hover:border-lantern/40 transition"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-[10px]">Add photo</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 150))}
          placeholder="A quiet reflection… (optional)"
          rows={2}
          className="w-full resize-none rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-lantern/40"
        />
        <div className="flex justify-between items-center mt-1 mb-4">
          <span className="text-[11px] text-muted-foreground">{caption.length}/150</span>
          {err && <span className="text-[11px] text-heart">{err}</span>}
        </div>

        <button
          onClick={submit}
          disabled={busy}
          // I swapped the custom 'lantern' classes for standard Tailwind orange and yellow, 
          // and added a standard box-shadow to recreate the 'glow' effect.
          className="w-full rounded-2xl py-3 font-medium bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>🏮</span>}
          {busy ? "Releasing…" : "Release Light"}
        </button>
      </div>
    </div>
  );
}
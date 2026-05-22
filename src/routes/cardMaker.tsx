import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cardMaker")({
  head: () => ({
    meta: [
      { title: "Create Vesak Card — Vesak Lightstream" },
      { name: "description", content: "Create a personalized Vesak greeting card to share with loved ones." },
    ],
  }),
  component: CardMaker,
});

const GREETINGS = [
  "අහස පලාගෙන තරු බිබිළෙනවා\nපොළොව පලාගෙන මල් පිපෙනවා\nඒ අතරින් මට ඔබව මතක් වෙනවා\nමගේ යාළුවට සුබ වෙසක් වේවා!",
  "ගසට ලස්සනයි පිපෙන මල් කැකුළ\nඅහසට ලස්සනයි පායන පුර සඳ\nමට ලස්සනයි මගේ යාළුවගෙ මුහුණ\nඔබට සුබ වෙසක් වේවා!",
  "සිත පිබිදෙනවා, පහන් දැල්වෙනවා,\nඔබගේ පවුලට, සුබ වෙසක් වේවා!",
];

const BACKGROUNDS = [
  "bg-gradient-to-br from-orange-500 to-yellow-300",
  "bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900",
  "bg-gradient-to-br from-amber-700 to-orange-900",
];

function CardMaker() {
  const [text, setText] = useState(GREETINGS[0]);
  const [bgClass, setBgClass] = useState(BACKGROUNDS[0]);
  const [isSaving, setIsSaving] = useState(false);
  
  // New state to hold the generated link
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    setIsSaving(true);
    try {
      // 1. Save to Supabase
      const { data, error } = await supabase
        .from('vesak_cards')
        .insert([{ message: text, bg_class: bgClass }])
        .select('id')
        .single();

      if (error) throw error;

      // 2. Generate the shareable URL (assuming your site is at window.location.origin)
      const url = `${window.location.origin}/card/${data.id}`;
      setShareLink(url);
    } catch (error) {
      console.error("Error creating card:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    if (shareLink) {
      const text = encodeURIComponent("මම ඔයාට ලස්සන වෙසක් පතක් හැදුවා! මෙතනින් බලන්න: \n" + shareLink);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-28 flex flex-col gap-6 fade-up">
      {/* Live Preview */}
      <div className={`w-full aspect-[4/5] rounded-2xl p-8 flex items-center justify-center text-center shadow-2xl transition-all duration-300 ${bgClass}`}>
        <p className="text-white text-lg md:text-xl font-medium whitespace-pre-wrap drop-shadow-md">
          {text || "ඔබේ සුබපැතුම මෙහි ලියන්න..."}
        </p>
      </div>

      <div className="flex flex-col gap-4 bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        
        {/* Only show controls if a link hasn't been generated yet */}
        {!shareLink ? (
          <>
            {/* Background & Text Controls (Same as before) */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {BACKGROUNDS.map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => setBgClass(bg)}
                  className={`w-10 h-10 rounded-full shrink-0 border-2 transition-all ${bgClass === bg ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"} ${bg}`}
                />
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-400"
            />

            <button
              onClick={handleCreateLink}
              disabled={isSaving || !text}
              className="w-full rounded-xl py-3 font-medium bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {isSaving ? "Creating Link..." : "Create Shareable Link"}
            </button>
          </>
        ) : (
          
          /* Success State: Show the sharing options! */
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-white text-center font-medium">Your card is ready! 🏮</h3>
            
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-all border border-white/10"
            >
              <span className="truncate text-sm opacity-80 mr-2">{shareLink}</span>
              {copied ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
            </button>

            <button
              onClick={shareToWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20b858] rounded-xl text-white font-medium transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Send via WhatsApp
            </button>

            <button 
              onClick={() => setShareLink(null)}
              className="text-xs text-white/50 text-center mt-2 hover:text-white"
            >
              Create another card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
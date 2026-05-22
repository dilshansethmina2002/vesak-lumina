import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/card/$id")({
  component: ViewCardPage,
});

function ViewCardPage() {
  // FIX 1: We explicitly tell TypeScript that 'id' is a string. 
  // This stops it from panicking if the route tree hasn't fully updated yet.
  const { id } = Route.useParams() as { id: string };
  
  const [card, setCard] = useState<{ message: string; bg_class: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCard() {
      // We use (supabase as any) to stop TypeScript from panicking 
      // about the newly created table it doesn't know about yet.
      const { data, error } = await (supabase as any)
        .from("vesak_cards")
        .select("message, bg_class")
        .eq("id", id)
        .single();

      if (!error && data) {
        // Because we bypassed the strict typing above, 
        // we can just pass the data directly in now!
        setCard(data);
      }
      setLoading(false);
    }
    fetchCard();
  }, [id]);
  return (
    <AppShell title="Vesak Greeting" subtitle="Someone sent you a card">
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] fade-up">
        
        {loading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Opening card...</p>
          </div>
        )}

        {!loading && !card && (
          <div className="text-center text-muted-foreground py-20">
            <p className="font-display text-lg">Card not found</p>
            <p className="text-sm mt-1">This light may have drifted away.</p>
          </div>
        )}

        {!loading && card && (
          <>
            <div className={`w-full aspect-[4/5] rounded-2xl p-8 flex items-center justify-center text-center shadow-2xl animate-in zoom-in duration-500 ${card.bg_class}`}>
              <p className="text-white text-xl md:text-2xl font-medium whitespace-pre-wrap drop-shadow-md">
                {card.message}
              </p>
            </div>

            <div className="mt-10 text-center w-full animate-in fade-in slide-in-from-bottom-4 delay-500">
              <Link 
                to="/" 
                className="block w-full rounded-2xl py-3 font-medium bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-transform hover:scale-[1.02]"
              >
                Enter Lightstream
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
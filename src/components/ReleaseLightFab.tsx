import { Plus } from "lucide-react";

export function ReleaseLightFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-30 right-5 bottom-[calc(env(safe-area-inset-bottom)+96px)] rounded-full px-5 py-3.5 font-medium text-primary-foreground bg-gradient-to-br from-lantern to-lantern-glow glow-lantern flex items-center gap-2 active:scale-95 transition"
      aria-label="Release Light"
    >
      <Plus className="w-4 h-4" strokeWidth={3} />
      <span className="text-sm tracking-wide">Release Light</span>
    </button>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { Home, Mail, Flame, User } from "lucide-react"; // Swapped Compass for Mail

const items = [
  { to: "/", label: "Stream", icon: Home },
  { to: "/cardMaker", label: "Card", icon: Mail }, // 
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
      <div className="glass mx-auto max-w-md rounded-3xl px-3 py-2 flex items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors"
              aria-label={label}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  // Swapped custom 'lantern' colors for standard Tailwind orange
                  active ? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "text-muted-foreground"
                }`}
              />
              <span className={`text-[10px] tracking-wide ${active ? "text-orange-500" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
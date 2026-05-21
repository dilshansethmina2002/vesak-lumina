// Anonymous guest identity stored in localStorage
const KEY = "vesak.guestId";

function generateId() {
  const chars = "0123456789ABCDEF";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * 16)];
  return `Guest-${s}`;
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "Guest-0000";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

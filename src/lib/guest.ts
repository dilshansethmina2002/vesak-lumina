// Anonymous guest identity stored in localStorage
const KEY = "vesak.guestId";

export function getGuestId(): string {
  // Handle Next.js/Vercel SSR
  if (typeof window === "undefined") return "Guest-0000";
  
  let id = window.localStorage.getItem(KEY);
  
  if (!id) {
    // Safely check if crypto exists (HTTPS/localhost), otherwise use a fallback (HTTP network testing)
    const uniqueString = window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      
    id = `Guest-${uniqueString}`;
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
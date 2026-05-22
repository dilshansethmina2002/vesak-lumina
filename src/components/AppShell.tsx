import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { LanternBackground } from "./LanternBackground";
// 1. Import the Toaster
import { Toaster } from "sonner"; 

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <LanternBackground />
      <header className="relative z-10 px-5 pt-10 pb-4 max-w-md mx-auto">
        <h1 className="text-3xl font-display text-glow">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </header>
      <main className="relative z-10 max-w-md mx-auto px-4 pb-36">{children}</main>
      <BottomNav />
      
      {/* 2. Add the Toaster here so notifications can appear */}
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[6%] h-[560px] w-[560px] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -top-32 left-[48%] h-[560px] w-[560px] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -top-32 right-[2%] h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl" />
      </div>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <main className="relative z-10 min-w-0 flex-1">
        <TopNav />
        <div className="px-6 pb-8">{children}</div>
      </main>
    </div>
  );
}

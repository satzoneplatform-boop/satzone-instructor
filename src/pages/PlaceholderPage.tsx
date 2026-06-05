import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";

/**
 * Friendly placeholder for sidebar items whose detailed designs haven't
 * landed yet. Keeps navigation predictable while we iterate.
 */
export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-12 text-center shadow-sm">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-violet-50 text-primary">
          <Wrench size={28} />
        </span>
        <div className="flex max-w-md flex-col gap-2">
          <h1 className="text-[22px] font-bold text-ink">{title}</h1>
          <p className="text-[14px] text-slate-500">
            {description ?? "This module is on the roadmap. Hook it up when the design lands."}
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-white hover:bg-violet-600"
        >
          Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}

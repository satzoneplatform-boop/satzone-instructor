import { AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

/** Persistent banner shown when the user is in demo mode. */
export function DemoBanner() {
  const { isDemo, logout } = useAuth();
  if (!isDemo) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-warn-50 px-4 py-2 text-[12px] text-amber-700">
      <AlertTriangle size={14} />
      <span>
        <strong>Demo mode.</strong> The backend isn't connected — data and saves are simulated.
      </span>
      <button
        type="button"
        onClick={() => logout()}
        className="ml-2 inline-flex items-center gap-1 rounded border border-amber-200 bg-white px-2 py-0.5 font-medium text-amber-700 hover:bg-amber-50"
      >
        <LogOut size={12} /> Exit demo
      </button>
    </div>
  );
}

import { User, Inbox, Users, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const ITEMS = [
  { icon: User, label: "Profile Setting" },
  { icon: Inbox, label: "Inbox" },
  { icon: Users, label: "Users" },
  { icon: HelpCircle, label: "Support" },
];

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  return (
    <div className="w-[260px] overflow-hidden rounded-2xl bg-white p-4 shadow-dropdown">
      <div className="mb-3 flex items-center gap-3 px-1 pb-3">
        <img
          src={user?.avatar_url ?? "https://i.pravatar.cc/80?img=8"}
          alt={user?.full_name ?? "user"}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight text-ink">
            {user?.full_name ?? "—"}
          </p>
          <p className="truncate text-[12px] leading-tight text-slate-400">
            {user?.email ?? ""}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1 border-t border-violet-50 pt-3">
        {ITEMS.map((it) => (
          <li key={it.label}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[14px] text-secondary hover:bg-violet-50"
            >
              <it.icon size={18} className="text-slate-600" />
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-danger-500 py-2.5 text-[14px] font-medium text-white hover:bg-danger-500/90"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}

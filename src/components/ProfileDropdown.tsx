import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProfileDropdown() {
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="w-[180px] overflow-hidden rounded-2xl bg-white p-2 shadow-dropdown">
      <button
        type="button"
        onClick={() => nav("/settings")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-secondary hover:bg-violet-50 transition"
      >
        <Settings size={17} className="text-slate-500" />
        Settings
      </button>
      <button
        type="button"
        onClick={() => logout()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-danger-500 hover:bg-danger-50 transition"
      >
        <LogOut size={17} />
        Log Out
      </button>
    </div>
  );
}

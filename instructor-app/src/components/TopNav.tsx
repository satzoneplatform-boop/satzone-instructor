import { Bell, Settings, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { useAuth } from "../auth/AuthContext";

export function TopNav() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<"notif" | "profile" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="flex items-center justify-end gap-6 p-6">
      <div className="flex items-center gap-8" ref={wrapRef}>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setOpenDropdown((v) => (v === "notif" ? null : "notif"))}
            className="relative grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-violet-200 bg-white"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-secondary" />
          </button>

<button
            type="button"
            onClick={() => nav("/settings")}
            className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-violet-200 bg-white transition hover:bg-violet-50"
            aria-label="Settings"
          >
            <Settings size={20} className="text-secondary" />
          </button>
        </div>

        <div className="h-10 w-px bg-violet-200" />

        <button
          type="button"
          onClick={() => setOpenDropdown((v) => (v === "profile" ? null : "profile"))}
          className="flex items-center gap-1.5"
          aria-label="Profile menu"
        >
          <img
            src={user?.avatar_url ?? "https://i.pravatar.cc/80?img=8"}
            alt="profile"
            className="h-10 w-10 rounded-full object-cover"
          />
          <ChevronDown size={20} className="text-secondary" />
        </button>

        {/* Dropdowns */}
        <div className="absolute right-12 top-[88px] z-30">
          {openDropdown === "notif" && (
            <NotificationDropdown onSeeAll={() => setOpenDropdown(null)} />
          )}
          {openDropdown === "profile" && <ProfileDropdown />}
        </div>
      </div>
    </header>
  );
}

import {
  LayoutGrid,
  GraduationCap,
  Users,
  BookOpen,
  BookMarked,
  MessageSquare,
  ClipboardList,
  Video,
  Settings,
  Send,
  ChevronDown,
  X,
  LogOut,
  Play,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { useAuth } from "../auth/AuthContext";

const MENU = [
  { icon: LayoutGrid, label: "Dashboards", to: "/", hasArrow: true, match: (p: string) => p === "/" },
  { icon: GraduationCap, label: "Teachers", to: "/teachers", match: (p: string) => p.startsWith("/teachers") },
  { icon: Users, label: "Students", to: "/students", match: (p: string) => p.startsWith("/students") },
  { icon: BookOpen, label: "Course", to: "/courses", match: (p: string) => p.startsWith("/courses") },
  { icon: BookMarked, label: "Resource", to: "/resource" },
  { icon: MessageSquare, label: "Chat", to: "/chat" },
  { icon: ClipboardList, label: "Transaction", to: "/transactions" },
  { icon: Video, label: "Authentication", to: "/authentication" },
];

const HELP = [
  { icon: Settings, label: "Setting", to: "/settings", match: (p: string) => p.startsWith("/settings") },
  { icon: Send, label: "Support", to: "/support" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col gap-5 bg-white pb-6">
      {/* Logo */}
      <div className="flex h-[92px] items-center border-b border-violet-50 px-6 py-4">
        <div className="flex items-center gap-1">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-md bg-primary">
            <span className="text-[18px] font-bold leading-none text-white">S</span>
          </div>
          <span className="text-[26px] font-bold leading-none tracking-tight text-secondary">
            IdrokHub
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-7 px-5">
        <Section title="Menu">
          {MENU.map((item) => (
            <MenuItem key={item.label} item={item} pathname={pathname} />
          ))}
        </Section>

        <Section title="Help">
          {HELP.map((item) => (
            <MenuItem key={item.label} item={item} pathname={pathname} />
          ))}
        </Section>
      </nav>

      {/* Featured card */}
      <div className="mx-5 mt-2 flex flex-col gap-3 rounded-lg bg-violet-50 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[16px] font-semibold leading-4 text-secondary">
            New Course
          </span>
          <button className="text-slate-600 hover:text-secondary">
            <X size={16} />
          </button>
        </div>
        <p className="text-[14px] leading-tight text-slate-600">
          Check out the new dashboard view. Pages now load faster.
        </p>
        <div className="relative h-[90px] overflow-hidden rounded-lg bg-gradient-to-br from-violet-400 to-primary">
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-sky-50">
              <Play className="h-3 w-3 fill-primary text-primary" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-sky-50">
            Dismiss
          </button>
          <button className="text-[12px] font-medium text-primary underline">
            What's new?
          </button>
        </div>
      </div>

      {/* User logout */}
      <div className="mt-auto flex items-center gap-2 px-5">
        <img
          src={user?.avatar_url ?? "https://i.pravatar.cc/80?img=8"}
          alt={user?.full_name ?? "user"}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[16px] font-semibold leading-snug text-ink">
            {user?.full_name ?? "—"}
          </span>
          <span className="truncate text-[12px] text-ink">{user?.email ?? ""}</span>
        </div>
        <button
          onClick={() => logout()}
          className="text-slate-600 hover:text-secondary"
          aria-label="Sign out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-2.5 py-0.5 text-[14px] font-medium text-slate-600">
        {title}
      </span>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

type Item = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  to: string;
  hasArrow?: boolean;
  match?: (path: string) => boolean;
};

function MenuItem({ item, pathname }: { item: Item; pathname: string }) {
  const active = item.match ? item.match(pathname) : pathname.startsWith(item.to);
  return (
    <NavLink
      to={item.to}
      className={cn(
        "flex w-[224px] items-center gap-2 rounded-lg px-2.5 py-2 text-left transition",
        active ? "bg-violet-50 text-ink" : "text-secondary hover:bg-violet-50/60"
      )}
    >
      <item.icon size={20} className={active ? "text-primary" : "text-secondary"} />
      <span className="flex-1 text-[16px] font-medium leading-6">{item.label}</span>
      {item.hasArrow && <ChevronDown size={20} className="text-secondary" />}
    </NavLink>
  );
}

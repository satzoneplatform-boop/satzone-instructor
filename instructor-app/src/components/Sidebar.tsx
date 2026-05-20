import {
  LayoutGrid,
  GraduationCap,
  Users,
  BookOpen,
  MessageSquare,
  ClipboardList,
  Settings,
  PhoneCall,
  ChevronDown,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { useAuth } from "../auth/AuthContext";

const MENU = [
  { icon: LayoutGrid,    label: "Dashboards",   to: "/",              hasArrow: true, match: (p: string) => p === "/" },
  { icon: GraduationCap, label: "Teachers",      to: "/teachers",      match: (p: string) => p.startsWith("/teachers") },
  { icon: Users,         label: "Students",      to: "/students",      match: (p: string) => p.startsWith("/students") },
  { icon: BookOpen,      label: "Course",        to: "/courses",       match: (p: string) => p.startsWith("/courses") },
  { icon: MessageSquare, label: "Chat",          to: "/chat" },
  { icon: ClipboardList, label: "Transaction",   to: "/transactions" },
];

const HELP = [
  { icon: Settings,  label: "Setting",  to: "/settings", match: (p: string) => p.startsWith("/settings") },
  { icon: PhoneCall, label: "Contacts", to: "/contacts", match: (p: string) => p.startsWith("/contacts") },
];

export function Sidebar() {
  const { user } = useAuth();
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

      {/* User info — logout is in the top-nav profile dropdown */}
      <div className="mt-auto flex items-center gap-2 px-5">
        <img
          src={user?.avatar_url ?? "https://i.pravatar.cc/80?img=8"}
          alt={user?.full_name ?? "user"}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold leading-snug text-ink">
            {user?.full_name ?? "—"}
          </span>
          <span className="truncate text-[12px] text-slate-500">{user?.email ?? ""}</span>
        </div>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-2.5 py-0.5 text-[14px] font-medium text-slate-600">{title}</span>
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

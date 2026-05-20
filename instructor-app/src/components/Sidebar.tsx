import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";

const MENU = [
  { icon: GraduationCap, label: "Teachers",    to: "/teachers",      match: (p: string) => p.startsWith("/teachers") },
  { icon: Users,         label: "Students",    to: "/students",      match: (p: string) => p.startsWith("/students") },
  { icon: BookOpen,      label: "Course",      to: "/courses",       match: (p: string) => p.startsWith("/courses") },
  { icon: ClipboardList, label: "Transaction", to: "/transactions" },
  { icon: PhoneCall,     label: "Contacts",    to: "/contacts",      match: (p: string) => p.startsWith("/contacts") },
];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-white transition-all duration-200",
        collapsed ? "w-[64px]" : "w-[264px]"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex h-[92px] items-center justify-between border-b border-violet-50 px-4">
        {!collapsed && (
          <div className="flex items-center gap-1">
            <div className="grid h-[30px] w-[30px] place-items-center rounded-md bg-primary">
              <span className="text-[18px] font-bold leading-none text-white">S</span>
            </div>
            <span className="text-[26px] font-bold leading-none tracking-tight text-secondary">
              IdrokHub
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-secondary",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav items — no section labels */}
      <nav className="flex flex-col gap-1 px-2 py-4">
        {MENU.map((item) => {
          const active = item.match ? item.match(pathname) : pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.label}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg py-2 text-left transition",
                collapsed ? "justify-center px-2" : "px-2.5",
                active ? "bg-violet-50 text-ink" : "text-secondary hover:bg-violet-50/60"
              )}
            >
              <item.icon
                size={20}
                className={cn("shrink-0", active ? "text-primary" : "text-secondary")}
              />
              {!collapsed && (
                <span className="flex-1 text-[16px] font-medium leading-6">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

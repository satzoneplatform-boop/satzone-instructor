import { Users, BookOpen, Play, DollarSign } from "lucide-react";
import { cn } from "../lib/cn";

const ICONS = {
  students: Users,
  book: BookOpen,
  video: Play,
  money: DollarSign,
};

type Props = {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  icon: keyof typeof ICONS;
  bg: string;
  iconColor: string;
  style?: React.CSSProperties;
};

export function StatCard({ label, value, delta, deltaUp, icon, bg, iconColor, style }: Props) {
  const Icon = ICONS[icon];
  return (
    <div
      style={style}
      className="group relative flex h-[126px] flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-up"
    >
      {/* subtle tinted gradient wash */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-transparent to-violet-50/40" />

      <div className="relative flex items-center justify-between">
        <span className="text-[14px] font-medium text-slate-600">{label}</span>
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <img
              key={i}
              src={`https://i.pravatar.cc/40?img=${10 + i}`}
              alt=""
              className={cn(
                "h-6 w-6 rounded-full border-2 border-white object-cover",
                i > 0 && "-ml-2"
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-4">
        <div className={cn("grid h-12 w-12 place-items-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110", bg)}>
          <Icon size={22} className={iconColor} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[22px] font-bold leading-none text-ink">{value}</span>
          <div className="flex items-center gap-1 text-[12px] font-medium">
            <span className={cn("inline-flex h-4 w-4 items-center justify-center", deltaUp ? "text-positive-600" : "text-danger-500")}>
              {deltaUp ? "▲" : "▼"}
            </span>
            <span className={deltaUp ? "text-positive-600" : "text-danger-500"}>{delta}</span>
            <span className="text-slate-400">vs last week</span>
          </div>
        </div>
      </div>
    </div>
  );
}

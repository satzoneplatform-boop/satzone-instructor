import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { OVERVIEW_DATA } from "../data/mock";
import type { OverviewPoint } from "../hooks/useDashboardStats";

type Props = { data?: OverviewPoint[]; loading?: boolean };

export function OverviewChart({ data, loading }: Props) {
  const hasReal = Boolean(data && data.length > 0);

  const chartData = hasReal
    ? data!
    : OVERVIEW_DATA.map((d) => ({
        name: d.day,
        enrollments: d.students,
        completions: d.teachers,
        progress: d.other,
      }));

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-ink">Overview</h2>
          {hasReal && !loading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-positive-50 px-1.5 py-0.5 text-[10px] font-medium text-positive-600">
              <TrendingUp size={10} /> Live
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-100 px-3 py-2 text-[13px] font-medium text-secondary">
          <Activity size={14} className="text-slate-400" />
          Per course
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-600">
        <Legend dot="bg-primary"     label="Enrollments" />
        <Legend dot="bg-violet-300"  label="Completions" />
        <Legend dot="bg-violet-200"  label="Avg Progress %" />
      </div>

      {loading ? (
        <div className="mt-4 h-[200px] animate-pulse rounded-xl bg-violet-50/60" />
      ) : (
        <div className="mt-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} barCategoryGap={28}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                allowDecimals={false}
                width={28}
              />
              <Tooltip cursor={{ fill: "transparent" }} content={<TooltipBox />} />
              <Bar dataKey="enrollments" fill="#8247FF" radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar dataKey="completions" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar dataKey="progress"    fill="#DDD6FE" radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg bg-secondary px-3 py-2 text-[11px] shadow-md">
      {label && <p className="mb-1 font-semibold text-white/80">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="font-medium capitalize text-white">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

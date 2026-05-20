import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { STUDENT_DATA } from "../data/mock";
import type { AnalysisPoint } from "../hooks/useDashboardStats";

type Props = { data?: AnalysisPoint[]; loading?: boolean };

export function StudentAnalysisChart({ data, loading }: Props) {
  const hasReal = Boolean(data && data.length > 0);

  const chartData = hasReal
    ? data!
    : STUDENT_DATA.map((d) => ({ name: d.day, enrolled: d.enrolled, completed: d.left }));

  const totalEnrolled = chartData.reduce((s, d) => s + d.enrolled, 0);
  const totalCompleted = chartData.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-ink">Student Analysis</h2>
          {hasReal && !loading && totalEnrolled > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-positive-50 px-1.5 py-0.5 text-[10px] font-medium text-positive-600">
              <TrendingUp size={10} /> {completionRate}% completion
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Enrolled
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300" />
          Completed
        </span>
      </div>

      {loading ? (
        <div className="mt-4 h-[200px] animate-pulse rounded-xl bg-violet-50/60" />
      ) : (
        <div className="mt-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="enrolledGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8247FF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8247FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Tooltip cursor={{ stroke: "#DDD6FE", strokeWidth: 1 }} content={<HoverCard />} />
              <Area
                type="monotone"
                dataKey="enrolled"
                stroke="#8247FF"
                strokeWidth={2}
                fill="url(#enrolledGrad)"
                activeDot={{ r: 4, fill: "#8247FF" }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#C4B5FD"
                strokeWidth={2}
                fill="url(#completedGrad)"
                activeDot={{ r: 4, fill: "#C4B5FD" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function HoverCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg bg-white p-2 shadow-dropdown">
      {label && <p className="mb-1 text-[10px] font-semibold text-slate-400">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            <span className="capitalize text-secondary">{p.name}</span>
          </span>
          <span className="ml-auto font-semibold text-ink">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

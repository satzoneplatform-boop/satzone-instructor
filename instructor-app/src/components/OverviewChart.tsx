import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { OVERVIEW_DATA } from "../data/mock";

export function OverviewChart() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-ink">Overview</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-positive-50 px-1.5 py-0.5 text-[10px] font-medium text-positive-600">
            <TrendingUp size={10} /> +25%
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-violet-100 px-3 py-2 text-[13px] font-medium text-secondary">
          Apr 30
          <Calendar size={16} className="text-slate-600" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-slate-600">
        <Legend dot="bg-primary" label="Teachers" />
        <Legend dot="bg-violet-300" label="Students" />
        <Legend dot="bg-violet-200" label="Other" />
      </div>

      <div className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={OVERVIEW_DATA} barGap={4} barCategoryGap={28}>
            <CartesianGrid stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94A3B8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              domain={[0, 80]}
              ticks={[0, 20, 40, 60, 80]}
              tickFormatter={(v) => (v === 0 ? "00" : String(v))}
              width={24}
            />
            <Tooltip cursor={{ fill: "transparent" }} content={<TooltipBox />} />
            <Bar dataKey="teachers" fill="#8247FF" radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="students" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="other" fill="#DDD6FE" radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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

function TooltipBox({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-white shadow-md">
      {payload[1]?.value ?? payload[0]?.value}
    </div>
  );
}

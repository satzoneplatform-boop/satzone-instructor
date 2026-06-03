import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";

function StatCardSkeleton() {
  return (
    <div className="h-[126px] animate-pulse rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-slate-100" />
        <div className="flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-6 w-6 rounded-full bg-slate-100 border-2 border-white${i > 0 ? " -ml-2" : ""}`} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-100" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-20 rounded bg-slate-100" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
import { OverviewChart } from "../components/OverviewChart";
import { StudentAnalysisChart } from "../components/StudentAnalysisChart";
import { TransactionTable } from "../components/TransactionTable";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, overview, analysis, loading: statsLoading } = useDashboardStats();
  const txns = useTransactions();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-ink">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-[14px] text-slate-600">
          Track your students, courses, and earnings
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {statsLoading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s, i) => (
              <StatCard key={s.label} {...s} style={{ animationDelay: `${i * 80}ms` }} />
            ))
        }
      </div>

      <div className="mt-6 grid grid-cols-[1.18fr_1fr] gap-6">
        <OverviewChart data={overview} loading={statsLoading} />
        <StudentAnalysisChart data={analysis} loading={statsLoading} />
      </div>

      <div className="mt-6">
        <TransactionTable rows={txns.rows} loading={txns.loading} />
      </div>
    </AppShell>
  );
}

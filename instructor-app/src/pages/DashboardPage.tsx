import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
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
          Track your manage and LMS platform performance
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
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

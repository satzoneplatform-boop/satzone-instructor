import { useEffect, useState } from "react";
import { listMyCourses, getCourseAnalytics } from "../api/instructor";
import { STATS as MOCK_STATS } from "../data/mock";

type Stat = (typeof MOCK_STATS)[number];

export type OverviewPoint = { name: string; enrollments: number; completions: number; progress: number };
export type AnalysisPoint = { name: string; enrolled: number; completed: number };

export type DashboardData = {
  stats: Stat[];
  overview: OverviewPoint[];
  analysis: AnalysisPoint[];
  loading: boolean;
};

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtMoney(cents: number, currency = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(dollars);
}

function shortName(title: string): string {
  return title.length > 14 ? title.slice(0, 13) + "…" : title;
}

const INITIAL: DashboardData = {
  stats: [],          // start empty — no flash of fake numbers
  overview: [],
  analysis: [],
  loading: true,
};

export function useDashboardStats(): DashboardData {
  const [data, setData] = useState<DashboardData>(INITIAL);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const page = await listMyCourses({ size: 100 });
        if (!mounted) return;
        const courses = page.items;

        let totalLectures = 0;
        for (const c of courses) totalLectures += c.lectures_count;

        const analyticsList = await Promise.all(
          courses.map((c) => getCourseAnalytics(c.id).catch(() => null))
        );
        if (!mounted) return;

        let totalEnrollments = 0;
        let totalRevenue = 0;
        for (const a of analyticsList) {
          if (!a) continue;
          totalEnrollments += a.enrollments_count;
          totalRevenue += a.revenue_cents;
        }

        const overview: OverviewPoint[] = courses.slice(0, 7).map((c, i) => {
          const a = analyticsList[i];
          return {
            name: shortName(c.title),
            enrollments: a?.enrollments_count ?? 0,
            completions: a?.completions_count ?? 0,
            progress: Math.round(a?.average_progress_percent ?? 0),
          };
        });

        const analysis: AnalysisPoint[] = courses.slice(0, 7).map((c, i) => {
          const a = analyticsList[i];
          return {
            name: shortName(c.title),
            enrolled: a?.enrollments_count ?? 0,
            completed: a?.completions_count ?? 0,
          };
        });

        setData({
          stats: [
            { ...MOCK_STATS[0], value: fmtNum(totalEnrollments) },
            { ...MOCK_STATS[1], value: fmtNum(page.total) },
            { ...MOCK_STATS[2], value: fmtNum(totalLectures) },
            { ...MOCK_STATS[3], value: fmtMoney(totalRevenue) },
          ],
          overview,
          analysis,
          loading: false,
        });
      } catch {
        setData((prev) => ({ ...prev, loading: false }));
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return data;
}

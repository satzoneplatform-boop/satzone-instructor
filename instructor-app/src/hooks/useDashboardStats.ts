import { useEffect, useState } from "react";
import { listMyCourses, getCourseAnalytics } from "../api/instructor";
import { STATS as MOCK_STATS } from "../data/mock";

type Stat = (typeof MOCK_STATS)[number];

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtMoney(cents: number, currency = "USD"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(dollars);
}

export function useDashboardStats(): Stat[] {
  const [stats, setStats] = useState<Stat[]>(MOCK_STATS);

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

        setStats([
          { ...MOCK_STATS[0], value: fmtNum(totalEnrollments) },
          { ...MOCK_STATS[1], value: fmtNum(page.total) },
          { ...MOCK_STATS[2], value: fmtNum(totalLectures) },
          { ...MOCK_STATS[3], value: fmtMoney(totalRevenue) },
        ]);
      } catch {
        // keep mocks
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return stats;
}

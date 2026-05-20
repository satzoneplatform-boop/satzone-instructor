import { useCallback, useEffect, useState } from "react";
import { listCourses } from "../api/courses";
import { useAuth } from "../auth/AuthContext";
import { type CourseRow, type CourseStatus } from "../data/coursesMock";

function fmtPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")} Hours`;
}

function mapStatus(s: string): CourseStatus {
  if (s === "published") return "published";
  if (s === "draft") return "pending";
  if (s === "archived") return "trial";
  return "pending";
}

export function useCourses(page = 1, size = 20) {
  const { user } = useAuth();
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listCourses({ page, size })
      .then((res) => {
        if (!mounted) return;
        if (!res.items.length) {
          setLoading(false);
          return;
        }
        const myName = user?.full_name ?? "—";
        const myAvatar = user?.avatar_url ?? `https://i.pravatar.cc/40?u=${user?.id ?? "me"}`;
        const mapped: CourseRow[] = res.items.map((c, i) => ({
          id: c.id,
          title: c.title,
          code: `#${c.slug.slice(0, 7).toUpperCase()}`,
          thumb: c.thumbnail_url ?? `https://picsum.photos/seed/${c.id}/64/64`,
          instructor: {
            name: myName,
            avatar: myAvatar || `https://i.pravatar.cc/40?img=${20 + (i % 50)}`,
          },
          sale: c.enrollments_count,
          price: fmtPrice(c.discount_price_cents ?? c.price_cents, c.currency),
          lessons: c.lectures_count,
          totalTime: fmtDuration(c.duration_minutes),
          status: mapStatus(c.status),
        }));
        setRows(mapped);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, size, reloadKey, user?.full_name, user?.avatar_url, user?.id]);

  return { rows, total, loading, reload };
}

import { useCallback, useEffect, useState } from "react";
import { listCourseStudents, listMyCourses } from "../api/instructor";
import { type StudentRow, type StudentStatus } from "../data/studentsMock";

function statusFromCompletion(_completedAt: string | null): StudentStatus {
  return "active";
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

// Instructors don't have a flat "all students" endpoint — they can only see
// students enrolled in their own courses. Aggregate across all my courses,
// dedupe by user_id, and slice client-side for the given page.
export function useStudents(page = 1, size = 20, query = "") {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const coursePage = await listMyCourses({ size: 100 });
        if (!mounted) return;
        if (!coursePage.items.length) {
          setLoading(false);
          return;
        }

        const studentPages = await Promise.all(
          coursePage.items.map((c) =>
            listCourseStudents(c.id, { size: 100 })
              .then((p) => ({ courseTitle: c.title, currency: c.currency, priceCents: c.discount_price_cents ?? c.price_cents, items: p.items }))
              .catch(() => null)
          )
        );
        if (!mounted) return;

        // Dedupe by user_id; remember which course we last saw them in.
        const byUser = new Map<string, { courseTitle: string; priceCents: number; currency: string; enrolled_at: string; full_name: string; email: string; avatar_url: string | null; completed_at: string | null; progress_percent: number }>();
        for (const p of studentPages) {
          if (!p) continue;
          for (const s of p.items) {
            const existing = byUser.get(s.user_id);
            if (!existing || new Date(s.enrolled_at) > new Date(existing.enrolled_at)) {
              byUser.set(s.user_id, {
                courseTitle: p.courseTitle,
                priceCents: p.priceCents,
                currency: p.currency,
                enrolled_at: s.enrolled_at,
                full_name: s.full_name,
                email: s.email,
                avatar_url: s.avatar_url,
                completed_at: s.completed_at,
                progress_percent: s.progress_percent,
              });
            }
          }
        }

        const q = query.trim().toLowerCase();
        const filtered = [...byUser.entries()].filter(([, v]) =>
          !q || v.full_name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
        );

        const allMapped: StudentRow[] = filtered.map(([userId, v], i) => ({
          id: userId,
          name: v.full_name,
          userId: `#${userId.slice(0, 6).toUpperCase()}`,
          avatar: v.avatar_url ?? `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course: v.courseTitle,
          enrolledDate: fmtDate(v.enrolled_at),
          price: new Intl.NumberFormat("en-US", { style: "currency", currency: v.currency, maximumFractionDigits: 0 }).format(v.priceCents / 100),
          status: statusFromCompletion(v.completed_at),
          progress: Math.round(v.progress_percent),
        }));

        if (!allMapped.length) {
          setLoading(false);
          return;
        }

        const start = (page - 1) * size;
        setRows(allMapped.slice(start, start + size));
        setTotal(allMapped.length);
      } catch {
        // leave rows empty on error
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [page, size, query, reloadKey]);

  return { rows, total, loading, reload };
}

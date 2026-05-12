import { useCallback, useEffect, useState } from "react";
import { listInstructors } from "../api/admin";
import { TEACHERS_MOCK, type TeacherRow, type TeacherStatus } from "../data/teachersMock";

function inferStatus(_idx: number): TeacherStatus {
  // Backend has no first-class status; rotate through mocks for visual variety.
  const ring: TeacherStatus[] = ["active", "active", "pending", "active", "suspend"];
  return ring[_idx % ring.length];
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function useTeachers(page = 1, size = 20) {
  const [rows, setRows] = useState<TeacherRow[]>(TEACHERS_MOCK);
  const [total, setTotal] = useState(TEACHERS_MOCK.length);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listInstructors({ page, size })
      .then((res) => {
        if (!mounted) return;
        if (!res.items.length) {
          setLoading(false);
          return;
        }
        const mapped: TeacherRow[] = res.items.map((it, i) => ({
          id: it.id,
          name: it.name,
          userId: `#${it.slug.slice(0, 6).toUpperCase()}`,
          avatar: it.avatar_url ?? `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course: it.courses_count,
          joinDate: fmtDate(it.created_at),
          earning: "$0.00",
          balance: "$0.00",
          status: inferStatus(i),
        }));
        setRows(mapped);
        setTotal(res.total);
      })
      .catch(() => {
        // keep mocks
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, size, reloadKey]);

  return { rows, total, loading, reload };
}

import { useCallback, useEffect, useState } from "react";
import { listUsers } from "../api/users";
import { STUDENTS_MOCK, type StudentRow, type StudentStatus } from "../data/studentsMock";

function statusFromUser(is_active: boolean, is_verified: boolean): StudentStatus {
  if (!is_active) return "suspend";
  if (!is_verified) return "pending";
  return "active";
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function useStudents(page = 1, size = 20, query = "") {
  const [rows, setRows] = useState<StudentRow[]>(STUDENTS_MOCK);
  const [total, setTotal] = useState(STUDENTS_MOCK.length);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listUsers({ page, size, role: "user", q: query || undefined })
      .then((res) => {
        if (!mounted) return;
        if (!res.items.length) {
          setLoading(false);
          return;
        }
        const mapped: StudentRow[] = res.items.map((u, i) => ({
          id: u.id,
          name: u.full_name,
          userId: `#${u.id.slice(0, 6).toUpperCase()}`,
          avatar: u.avatar_url ?? `https://i.pravatar.cc/80?img=${20 + (i % 50)}`,
          course: "—",
          enrolledDate: fmtDate(u.created_at),
          price: "$0.00",
          status: statusFromUser(u.is_active, u.is_verified),
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
  }, [page, size, query, reloadKey]);

  return { rows, total, loading, reload };
}

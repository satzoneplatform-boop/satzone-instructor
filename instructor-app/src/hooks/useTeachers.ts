import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { InstructorSummary, Page } from "../api/types";
import { TEACHERS_MOCK, type TeacherRow, type TeacherStatus } from "../data/teachersMock";

function inferStatus(_idx: number): TeacherStatus {
  // Backend has no first-class status; rotate through mocks for visual variety.
  const ring: TeacherStatus[] = ["active", "active", "pending", "active", "suspend"];
  return ring[_idx % ring.length];
}

// Public catalog list of instructors — read-only for an instructor account
// (admin-only management endpoints would return 403).
function listPublicInstructors(params: { page?: number; size?: number; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return api<Page<InstructorSummary>>(`/instructors${qs ? `?${qs}` : ""}`);
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
    listPublicInstructors({ page, size })
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
          joinDate: "—",
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

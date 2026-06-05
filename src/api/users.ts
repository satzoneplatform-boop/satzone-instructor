// Instructor-scoped views of users.
// Instructors can NOT admin users globally; the original /admin/users routes
// return 403. The closest visibility an instructor has is the set of students
// enrolled in their own courses. We provide that here under the same names
// the existing pages import.

import { api } from "./client";
import type {
  AdminEnrollmentRead,
  AdminUserRead,
  EnrolledStudentRead,
  Page,
  UserRole,
} from "./types";
import { listCourseStudents, listMyCourses } from "./instructor";

function studentToUser(s: EnrolledStudentRead): AdminUserRead {
  return {
    id: s.user_id,
    email: s.email,
    full_name: s.full_name,
    avatar_url: s.avatar_url,
    role: "user" as UserRole,
    is_active: true,
    is_verified: true,
    email_verified_at: null,
    last_login_at: s.last_accessed_at,
    onboarding_completed_at: null,
    google_sub: null,
    created_at: s.enrolled_at,
  };
}

export async function listUsers(params: {
  page?: number;
  size?: number;
  role?: UserRole;
  q?: string;
  is_active?: boolean;
} = {}): Promise<Page<AdminUserRead>> {
  const coursePage = await listMyCourses({ size: 100 });
  const studentPages = await Promise.all(
    coursePage.items.map((c) =>
      listCourseStudents(c.id, { size: 100 }).then((p) => p.items).catch(() => [] as EnrolledStudentRead[])
    )
  );
  const byUser = new Map<string, EnrolledStudentRead>();
  for (const list of studentPages) {
    for (const s of list) {
      const existing = byUser.get(s.user_id);
      if (!existing || new Date(s.enrolled_at) > new Date(existing.enrolled_at)) {
        byUser.set(s.user_id, s);
      }
    }
  }

  const q = (params.q ?? "").trim().toLowerCase();
  const all = [...byUser.values()].filter((s) =>
    !q || s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  );
  const page = params.page ?? 1;
  const size = params.size ?? 20;
  const start = (page - 1) * size;
  const items = all.slice(start, start + size).map(studentToUser);
  return {
    items,
    total: all.length,
    page,
    size,
    pages: Math.max(1, Math.ceil(all.length / size)),
  };
}

export async function getUser(id: string): Promise<AdminUserRead> {
  // Find this student in one of my courses.
  const coursePage = await listMyCourses({ size: 100 });
  for (const c of coursePage.items) {
    try {
      const sPage = await listCourseStudents(c.id, { size: 100 });
      const hit = sPage.items.find((s) => s.user_id === id);
      if (hit) return studentToUser(hit);
    } catch {
      /* skip */
    }
  }
  throw new Error("Student not found in your courses");
}

export async function listEnrollments(params: {
  user_id?: string;
  page?: number;
  size?: number;
} = {}): Promise<Page<AdminEnrollmentRead>> {
  const coursePage = await listMyCourses({ size: 100 });
  const out: AdminEnrollmentRead[] = [];

  for (const c of coursePage.items) {
    try {
      const sPage = await listCourseStudents(c.id, { size: 100 });
      for (const s of sPage.items) {
        if (params.user_id && s.user_id !== params.user_id) continue;
        out.push({
          id: `${c.id}:${s.user_id}`,
          user_id: s.user_id,
          course_id: c.id,
          enrolled_at: s.enrolled_at,
          completed_at: s.completed_at,
          progress_percent: s.progress_percent,
          last_accessed_at: s.last_accessed_at,
          course: {
            id: c.id,
            slug: c.slug,
            title: c.title,
            thumbnail_url: c.thumbnail_url,
            level: c.level,
            price_cents: c.price_cents,
            discount_price_cents: c.discount_price_cents,
            currency: c.currency,
            status: c.status,
          },
        });
      }
    } catch {
      /* skip */
    }
  }

  const page = params.page ?? 1;
  const size = params.size ?? 20;
  const start = (page - 1) * size;
  return {
    items: out.slice(start, start + size),
    total: out.length,
    page,
    size,
    pages: Math.max(1, Math.ceil(out.length / size)),
  };
}

// Plain users can self-register via /auth/register — keep this for the student
// onboarding flow (admin user-create endpoint doesn't exist).
export function registerUser(body: { email: string; full_name: string; password: string }) {
  return api<{ message: string }>(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

// Instructors can't admin other users. Stub these out so the existing pages
// don't crash — they'll surface the proper error.
export async function updateUser(_id: string, _body: unknown): Promise<AdminUserRead> {
  throw new Error("Instructors cannot edit other users.");
}

export async function deleteUser(_id: string): Promise<void> {
  throw new Error("Instructors cannot delete other users.");
}

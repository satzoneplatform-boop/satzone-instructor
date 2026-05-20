// Public catalog reads (read-only as an instructor) + stubs for write ops.
// Instructor accounts cannot manage other instructors; only an admin can.
// `/instructor/me/profile` covers managing the current user's own profile —
// see api/instructor.ts.

import { api } from "./client";
import type {
  AdminCourseRead,
  AdminInstructorCreate,
  AdminInstructorRead,
  AdminInstructorUpdate,
  InstructorSummary,
  Page,
} from "./types";

type PublicInstructorDetail = AdminInstructorRead;

export async function listInstructors(params: { page?: number; size?: number; search?: string } = {}): Promise<Page<AdminInstructorRead>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  const res = await api<Page<InstructorSummary>>(`/instructors${qs ? `?${qs}` : ""}`);
  // Normalize summary into the richer AdminInstructorRead shape the pages expect.
  return {
    ...res,
    items: res.items.map(
      (s): AdminInstructorRead => ({
        id: s.id,
        user_id: null,
        slug: s.slug,
        name: s.name,
        title: s.title,
        bio: null,
        avatar_url: s.avatar_url,
        expertise: null,
        linkedin_url: null,
        twitter_url: null,
        website_url: null,
        rating_avg: s.rating_avg,
        students_count: s.students_count,
        courses_count: s.courses_count,
        created_at: new Date().toISOString(),
      })
    ),
  };
}

export async function getInstructor(idOrSlug: string): Promise<PublicInstructorDetail> {
  return api<PublicInstructorDetail>(`/instructors/${idOrSlug}`);
}

export async function listInstructorCourses(
  slug: string,
  params: { page?: number; size?: number } = {}
): Promise<Page<AdminCourseRead>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  const qs = q.toString();
  return api<Page<AdminCourseRead>>(`/instructors/${slug}/courses${qs ? `?${qs}` : ""}`);
}

export async function createInstructor(_body: AdminInstructorCreate): Promise<AdminInstructorRead> {
  throw new Error("Only admins can create instructor profiles. Edit your own at Settings → Profile.");
}

export async function updateInstructor(_id: string, _body: AdminInstructorUpdate): Promise<AdminInstructorRead> {
  throw new Error("Only admins can edit other instructor profiles. Edit your own at Settings → Profile.");
}

export async function deleteInstructor(_id: string): Promise<void> {
  throw new Error("Only admins can delete instructor profiles.");
}

export async function uploadInstructorAvatar(_id: string, _file: File): Promise<{ url: string; size_bytes: number }> {
  throw new Error("Only admins can upload avatars for other instructors. Use Settings → Profile for your own.");
}

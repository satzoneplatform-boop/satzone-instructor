import { api } from "./client";
import type {
  AdminCourseRead,
  AdminCourseUpdate,
  CategoryRead,
  CurriculumRead,
  InstructorCourseRead,
  Page,
} from "./types";

export function listCourses(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  category_id?: string;
} = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.category_id) q.set("category_id", params.category_id);
  const qs = q.toString();
  return api<Page<AdminCourseRead>>(`/admin/courses${qs ? `?${qs}` : ""}`);
}

export function getCourse(id: string) {
  return api<AdminCourseRead>(`/admin/courses/${id}`);
}

export function updateCourse(id: string, body: AdminCourseUpdate) {
  return api<AdminCourseRead>(`/admin/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCourse(id: string) {
  return api<void>(`/admin/courses/${id}`, { method: "DELETE" });
}

export function publishCourse(id: string) {
  return api<AdminCourseRead>(`/admin/courses/${id}/publish`, { method: "POST" });
}

export function unpublishCourse(id: string) {
  return api<AdminCourseRead>(`/admin/courses/${id}/unpublish`, { method: "POST" });
}

// Create flows through instructor endpoint (no admin POST exists)
export function createCourseAsInstructor(body: {
  title: string;
  subtitle?: string;
  description?: string;
  category_id: string;
  level?: string;
  language?: string;
  price_cents?: number;
  discount_price_cents?: number;
  currency?: string;
}) {
  return api<InstructorCourseRead>(`/instructor/courses`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getCurriculum(slug: string) {
  return api<CurriculumRead>(`/courses/${slug}/curriculum`);
}

export function listCategories() {
  return api<CategoryRead[]>(`/categories`);
}

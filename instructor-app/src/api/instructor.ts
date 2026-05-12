import { api } from "./client";
import type {
  CourseAnalytics,
  InstructorCourseRead,
  Page,
} from "./types";

export function listMyCourses(params: { page?: number; size?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.status) q.set("status", params.status);
  const qs = q.toString();
  return api<Page<InstructorCourseRead>>(`/instructor/courses${qs ? `?${qs}` : ""}`);
}

export function getCourseAnalytics(courseId: string) {
  return api<CourseAnalytics>(`/instructor/courses/${courseId}/analytics`);
}

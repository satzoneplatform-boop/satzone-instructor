// Instructor-scoped course operations.
// (Pre-integration this module hit /admin/courses, which is admin-only and 403s for
// an instructor account. Backend exposes /instructor/courses/* for the same flow,
// so we forward to the instructor module to keep the older imports working.)
import { api } from "./client";
import {
  createMyCourse,
  deleteMyCourse,
  getMyCourse,
  listMyCourses,
  publishMyCourse,
  unpublishMyCourse,
  updateMyCourse,
} from "./instructor";
import type {
  CategoryRead,
  CurriculumRead,
  InstructorCourseCreate,
  InstructorCourseUpdate,
  PublishStatus,
} from "./types";

export function listCourses(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: PublishStatus | string;
  category_id?: string;
} = {}) {
  return listMyCourses({
    page: params.page,
    size: params.size,
    status: params.status,
    search: params.search,
  });
}

export function getCourse(id: string) {
  return getMyCourse(id);
}

export function updateCourse(id: string, body: InstructorCourseUpdate) {
  return updateMyCourse(id, body);
}

export function deleteCourse(id: string) {
  return deleteMyCourse(id);
}

export function publishCourse(id: string) {
  return publishMyCourse(id);
}

export function unpublishCourse(id: string) {
  return unpublishMyCourse(id);
}

export function createCourseAsInstructor(body: InstructorCourseCreate) {
  return createMyCourse(body);
}

export function getCurriculum(slug: string) {
  return api<CurriculumRead>(`/courses/${slug}/curriculum`);
}

export function listCategories() {
  return api<CategoryRead[]>(`/categories`);
}

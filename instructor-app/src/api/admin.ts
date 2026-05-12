import { api } from "./client";
import type {
  AdminInstructorCreate,
  AdminInstructorRead,
  AdminInstructorUpdate,
  Page,
} from "./types";

export function listInstructors(params: { page?: number; size?: number; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return api<Page<AdminInstructorRead>>(`/admin/instructors${qs ? `?${qs}` : ""}`);
}

export function getInstructor(id: string) {
  return api<AdminInstructorRead>(`/admin/instructors/${id}`);
}

export function createInstructor(body: AdminInstructorCreate) {
  return api<AdminInstructorRead>(`/admin/instructors`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateInstructor(id: string, body: AdminInstructorUpdate) {
  return api<AdminInstructorRead>(`/admin/instructors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteInstructor(id: string) {
  return api<void>(`/admin/instructors/${id}`, { method: "DELETE" });
}

export function uploadInstructorAvatar(id: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return api<{ url: string; size_bytes: number }>(
    `/admin/instructors/${id}/avatar`,
    { method: "POST", body: fd }
  );
}

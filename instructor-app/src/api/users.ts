import { api } from "./client";
import type {
  AdminEnrollmentRead,
  AdminUserRead,
  AdminUserUpdate,
  Page,
  UserRole,
} from "./types";

export function listUsers(params: {
  page?: number;
  size?: number;
  role?: UserRole;
  q?: string;
  is_active?: boolean;
} = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  if (params.role) q.set("role", params.role);
  if (params.q) q.set("q", params.q);
  if (params.is_active !== undefined) q.set("is_active", String(params.is_active));
  const qs = q.toString();
  return api<Page<AdminUserRead>>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export function getUser(id: string) {
  return api<AdminUserRead>(`/admin/users/${id}`);
}

export function updateUser(id: string, body: AdminUserUpdate) {
  return api<AdminUserRead>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteUser(id: string) {
  return api<void>(`/admin/users/${id}`, { method: "DELETE" });
}

// Create a student via the public register endpoint (no admin-create endpoint exists).
export function registerUser(body: { email: string; full_name: string; password: string }) {
  return api<{ message: string }>(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export function listEnrollments(params: { user_id?: string; page?: number; size?: number } = {}) {
  const q = new URLSearchParams();
  if (params.user_id) q.set("user_id", params.user_id);
  if (params.page) q.set("page", String(params.page));
  if (params.size) q.set("size", String(params.size));
  const qs = q.toString();
  return api<Page<AdminEnrollmentRead>>(`/admin/enrollments${qs ? `?${qs}` : ""}`);
}

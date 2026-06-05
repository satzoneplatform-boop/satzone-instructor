import { api } from "./client";
import { uploadWithProgress } from "../lib/upload";
import type {
  NotificationPreference,
  NotificationPreferenceUpdate,
  OnboardingRead,
  OnboardingUpdate,
  UploadResponse,
  UserMe,
} from "./types";

export function updateMe(body: { full_name?: string; avatar_url?: string }) {
  return api<UserMe>(`/me`, { method: "PATCH", body: JSON.stringify(body) });
}

export function uploadMyAvatar(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return api<UploadResponse>(`/me/avatar`, { method: "POST", body: fd });
}

export function uploadMyAvatarWithProgress(
  file: File,
  onProgress: (pct: number) => void
) {
  return uploadWithProgress<UploadResponse>("/me/avatar", file, onProgress);
}

export function deleteMyAvatar() {
  return api<void>(`/me/avatar`, { method: "DELETE" });
}

export function changePassword(body: { current_password: string; new_password: string }) {
  return api<{ message: string }>(`/me/password`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getNotificationPrefs() {
  return api<NotificationPreference>(`/me/preferences/notifications`);
}

export function updateNotificationPrefs(body: NotificationPreferenceUpdate) {
  return api<NotificationPreference>(`/me/preferences/notifications`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function getOnboarding() {
  return api<OnboardingRead>(`/onboarding`);
}

export function updateOnboarding(body: OnboardingUpdate) {
  return api<OnboardingRead>(`/onboarding`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

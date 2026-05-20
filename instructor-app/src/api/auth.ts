import { api } from "./client";
import { setTokens, wipeTokens, getRefreshToken } from "./tokens";
import type { TokenResponse, UserMe } from "./types";

export async function login(email: string, password: string): Promise<UserMe> {
  const tokens = await api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  setTokens(tokens.access_token, tokens.refresh_token);
  return getMe();
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    await api<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => {
      // best-effort
    });
  }
  wipeTokens();
}

export function getMe(): Promise<UserMe> {
  return api<UserMe>("/auth/me");
}

export function requestPasswordReset(email: string) {
  return api<{ message: string }>("/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export function confirmPasswordReset(token: string, new_password: string) {
  return api<{ message: string }>("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
    skipAuth: true,
  });
}

export function verifyEmail(token: string) {
  return api<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
    skipAuth: true,
  });
}

export function verifyPhoneCode(code: string) {
  return api<{ message: string }>("/auth/verify-phone", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function resendPhoneCode() {
  return api<{ message: string }>("/auth/resend-phone-code", { method: "POST" });
}

export function submitPhoneNumber(phone_number: string) {
  return api<{ message: string }>("/auth/phone", {
    method: "POST",
    body: JSON.stringify({ phone_number }),
  });
}

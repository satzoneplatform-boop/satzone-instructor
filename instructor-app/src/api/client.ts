import type { ApiErrorBody, TokenResponse } from "./types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  wipeTokens,
} from "./tokens";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

function isDemoSession(): boolean {
  try {
    return localStorage.getItem("studyq.demo") === "1";
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        wipeTokens();
        return false;
      }
      const t = (await res.json()) as TokenResponse;
      setTokens(t.access_token, t.refresh_token);
      return true;
    } catch {
      wipeTokens();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

const REFRESHABLE = new Set(["missing_token", "invalid_token", "invalid_user"]);

export async function api<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean; retry?: boolean } = {}
): Promise<T> {
  // Demo sessions never hit the network — all calls fail fast so callers
  // fall back to their mock data without spamming the offline backend.
  if (isDemoSession() && !init.skipAuth) {
    throw new ApiError(0, "demo_mode", "Demo session — backend disabled.");
  }

  const { skipAuth, retry, ...fetchInit } = init;
  const headers = new Headers(fetchInit.headers);
  if (!headers.has("Content-Type") && fetchInit.body && !(fetchInit.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE}${path}`, { ...fetchInit, headers });

  if (res.status === 401 && !retry && !skipAuth) {
    const body = await res
      .clone()
      .json()
      .catch(() => ({}) as Partial<ApiErrorBody>);
    const code = (body as ApiErrorBody)?.error?.code;
    if (code && REFRESHABLE.has(code)) {
      const ok = await tryRefresh();
      if (ok) return api<T>(path, { ...init, retry: true });
    }
    wipeTokens();
  }

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as Partial<ApiErrorBody>);
    throw new ApiError(
      res.status,
      (body as ApiErrorBody)?.error?.code ?? "unknown",
      (body as ApiErrorBody)?.error?.message ?? `HTTP ${res.status}`,
      (body as ApiErrorBody)?.error?.details
    );
  }

  return res.json() as Promise<T>;
}

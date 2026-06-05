const ACCESS_KEY = "studyq.access";
const REFRESH_KEY = "studyq.refresh";

type Listener = (hasToken: boolean) => void;
const listeners = new Set<Listener>();

let accessMem: string | null = null;

export function getAccessToken(): string | null {
  if (accessMem) return accessMem;
  accessMem = sessionStorage.getItem(ACCESS_KEY);
  return accessMem;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  accessMem = access;
  sessionStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  listeners.forEach((l) => l(true));
}

export function wipeTokens() {
  accessMem = null;
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  listeners.forEach((l) => l(false));
}

export function subscribeAuth(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

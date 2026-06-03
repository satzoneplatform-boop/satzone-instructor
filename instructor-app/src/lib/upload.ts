import { getAccessToken } from "../api/tokens";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export function uploadWithProgress<T>(
  path: string,
  file: File,
  onProgress: (pct: number) => void,
  extra?: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    if (extra) for (const [k, v] of Object.entries(extra)) fd.append(k, v);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}${path}`);

    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as T); }
        catch { reject(new Error("Invalid response")); }
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body?.error?.message ?? `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => { const e = new Error("Upload cancelled"); e.name = "AbortError"; reject(e); };

    signal?.addEventListener("abort", () => xhr.abort());

    xhr.send(fd);
  });
}

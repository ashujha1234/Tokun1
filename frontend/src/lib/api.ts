export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    credentials: "include", // fine on localhost; needed later if you use cookies
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
}

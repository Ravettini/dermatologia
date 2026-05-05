export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export const ADMIN_AUTH_TOKEN_KEY = "admin_auth_token";

function readAdminAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = readAdminAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Error de red");
  }
  return data as T;
}

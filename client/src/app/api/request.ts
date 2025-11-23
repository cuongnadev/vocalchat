import type { ApiResponse } from "@/types/api";
import { getToken } from "@/utils/auth";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function requestApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {};

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = text;
    try {
      const json = JSON.parse(text);
      errorMsg = json.message || text;
    } catch {
      // ignore invalid JSON
    }
    throw new Error(errorMsg || "API request failed");
  }

  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text() as unknown as ApiResponse<T>;
}

// Single API access layer: the base URL, error normalisation and request
// plumbing live here so every page talks to the backend the same way.
//
// NOTE: NEXT_PUBLIC_API_URL is inlined at BUILD time by Next.js. Changing it at
// runtime (`docker compose ... environment:`) has no effect — rebuild instead:
//   docker compose up -d --build frontend

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function endpoint(path: string): string {
  return `${API_URL.replace(/\/+$/, "")}${path}`;
}

/**
 * JSON request against the backend.
 *
 * Credentials are deliberately NOT sent: the API authenticates nothing today
 * (it takes a plain `user_id` path parameter), and `credentials: "include"`
 * combined with a wildcard CORS origin is rejected by the browser outright —
 * the request fails before it is even sent. Add credentials together with a
 * real origin allow-list and a session cookie, never one without the other.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path), {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      "We could not reach the service. Check your connection and try again.",
      0,
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed (${response.status}).`),
      response.status,
    );
  }

  return payload as T;
}

export function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .filter((item): item is { msg?: unknown } => Boolean(item && typeof item === "object"))
      .map((item) => (typeof item.msg === "string" ? item.msg : ""))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(", ");
  }

  return fallback;
}

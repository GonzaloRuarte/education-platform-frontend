import type { ApiErrorPayload, AuthSession } from "../core/types.js";
import { STORAGE_SESSION, SURFACE } from "../core/constants.js";

export {};
declare global {
  interface Window {
    __RETROBOLT_ADMIN_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly requestId: string | undefined;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.requestId = requestId;
  }
}

export function configApiBaseUrl(): string {
  return window.__RETROBOLT_ADMIN_CONFIG__?.apiBaseUrl ?? "";
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = trimTrailingSlash(configApiBaseUrl());
  if (base.toLowerCase().endsWith("/api") && path.startsWith("/api/")) {
    return `${base}${path.slice(4)}`;
  }
  return `${base}${path}`;
}

export function withQueryParams(path: string, extraParams: Record<string, string> = {}): string {
  const [base, query = ""] = path.split("?");
  if (base === undefined) {
    throw new Error("Invalid API path.");
  }
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(extraParams)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  const serialized = params.toString();
  return `${base}${serialized ? `?${serialized}` : ""}`;
}

export function withSurface(path: string, extraParams: Record<string, string> = {}): string {
  return withQueryParams(path, { surface: SURFACE, ...extraParams });
}

export function readSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_SESSION);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      parsed.token &&
      typeof parsed.token.access === "string" &&
      typeof parsed.token.refresh === "string" &&
      parsed.user &&
      typeof parsed.user.username === "string"
    ) {
      return parsed as AuthSession;
    }
  } catch {
    // Ignore malformed storage and force login.
  }
  localStorage.removeItem(STORAGE_SESSION);
  return null;
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_SESSION);
}

async function refreshAccessToken(): Promise<boolean> {
  const session = readSession();
  if (!session) {
    return false;
  }

  const response = await fetch(apiUrl("/api/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.token.refresh }),
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const payload = (await response.json()) as { access?: string; refresh?: string };
  if (typeof payload.access !== "string") {
    clearSession();
    return false;
  }

  saveSession({
    ...session,
    token: {
      access: payload.access,
      refresh: typeof payload.refresh === "string" ? payload.refresh : session.token.refresh,
    },
  });
  return true;
}

async function authorizedFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const session = readSession();
  const headers = new Headers(init.headers);
  if (session) {
    headers.set("Authorization", `Bearer ${session.token.access}`);
  }
  if (hasJsonRequestBody(init.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), { ...init, headers });
  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return authorizedFetch(path, init, false);
  }

  if (!response.ok) {
    const errorDetails = await responseErrorDetails(response);
    throw new ApiRequestError(errorDetails.message, response.status, errorDetails.requestId);
  }

  return response;
}

function hasJsonRequestBody(body: BodyInit | null | undefined): boolean {
  if (!body) {
    return false;
  }
  return !(body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await authorizedFetch(path, init, retry);

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiFetchBlob(path: string, init: RequestInit = {}, retry = true): Promise<Blob> {
  const response = await authorizedFetch(path, init, retry);
  return response.blob();
}

async function responseErrorDetails(response: Response): Promise<{ message: string; requestId: string | undefined }> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const message = payload?.detail
    || payload?.message
    || (payload ? flattenApiError(payload) : `${response.status} ${response.statusText}`);
  const requestId = payload?.request_id || response.headers.get("X-Request-ID") || undefined;
  return { message, requestId };
}

function flattenApiError(payload: ApiErrorPayload): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "request_id") {
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
    } else if (value && typeof value === "object") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (value !== undefined) {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join("\n") || "Request failed.";
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  logRequestId(error);

  // Backend 4xx responses are intended user-facing validation/auth messages
  // (for example invalid login credentials or form validation errors). Keep
  // 5xx/server failures generic so implementation details are not exposed.
  if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500 && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function logRequestId(error: Error): void {
  const requestId = error instanceof ApiRequestError
    ? error.requestId
    : error.message.match(/Request ID: ([^\n]+)/)?.[1];

  if (!requestId) {
    return;
  }

  if (error instanceof ApiRequestError) {
    console.warn(`[api] Request ID: ${requestId} (HTTP ${error.status})`);
    return;
  }

  console.warn(`[api] Request ID: ${requestId}`);
}

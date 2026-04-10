import { parseApiJson } from "@/lib/parse-api-json";

const defaultInit: RequestInit = {
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
};

/**
 * Fetch JSON for TanStack Query `queryFn` / `mutationFn`.
 * Throws on HTTP errors or `parseApiJson` failure so React Query can surface `error`.
 */
export async function queryFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...defaultInit,
    ...init,
    headers: {
      ...mergeHeaders(defaultInit.headers, init?.headers),
    },
  });
  const result = await parseApiJson<T>(res);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.data;
}

/** Common `{ success, message, data }` API shape used by this app's route handlers. */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Same as `queryFetch` but unwraps `data` when `success` is true; throws using `message` otherwise.
 */
export async function queryFetchEnvelopeData<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const body = await queryFetch<ApiEnvelope<T>>(input, init);
  if (!body.success) {
    throw new Error(body.message || "Request failed");
  }
  return body.data;
}

function mergeHeaders(
  a: HeadersInit | undefined,
  b: HeadersInit | undefined,
): Headers {
  const out = new Headers(a);
  if (b) {
    new Headers(b).forEach((value, key) => out.set(key, value));
  }
  return out;
}

/**
 * Reads the response body once and returns structured data or a user-facing error string.
 * Use this for fetch handlers so JSON parse failures and API `message` fields surface reliably in toasts.
 */
export async function parseApiJson<T>(
  response: Response,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    return {
      ok: false,
      message: text.trim()
        ? "The server sent an invalid response."
        : response.statusText || `Request failed (${response.status})`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: messageFromApiPayload(parsed, response),
    };
  }

  return { ok: true, data: parsed as T };
}

function messageFromApiPayload(parsed: unknown, response: Response): string {
  if (parsed && typeof parsed === "object" && "message" in parsed) {
    const raw = (parsed as { message: unknown }).message;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return response.statusText || `Request failed (${response.status})`;
}

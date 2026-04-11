import type { UpdateLandLifecycleInput } from "@/lib/schemas/land-lifecycle";

const LIFECYCLE_ENTRY_KEYS = new Set([
  "plantationEntries",
  "irrigationEntries",
  "roguingEntries",
  "stripTestEntries",
  "dehalmingEntries",
]);

/**
 * JSON body for PATCH /api/land/:id/lifecycle — only keys present on `patch`, no undefined.
 * Drops empty entry-array keys when other keys are also sent (avoids wiping sibling logs).
 * A lone `{ plantationEntries: [] }` is kept so “clear this list” still works.
 */
export function serializeLandLifecyclePatch(patch: UpdateLandLifecycleInput): string {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(patch) as (keyof UpdateLandLifecycleInput)[]) {
    const v = patch[key];
    if (v === undefined) continue;
    out[key as string] = v;
  }

  const keys = Object.keys(out);
  if (keys.length <= 1) {
    return JSON.stringify(out);
  }

  for (const k of LIFECYCLE_ENTRY_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(out, k)) continue;
    const v = out[k];
    if (Array.isArray(v) && v.length === 0) {
      delete out[k];
    }
  }

  return JSON.stringify(out);
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Layered, token-only backdrop for auth screens — calm in light and dark,
 * with softer decorative weight than the marketing landing grid.
 */
export function SignInBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-background">
      {/* Base depth: very soft vertical wash */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[linear-gradient(180deg,oklch(from_var(--muted)_l_c_h/0.35)_0%,transparent_42%,oklch(from_var(--muted)_l_c_h/0.2)_100%)]",
          "dark:bg-[linear-gradient(180deg,oklch(from_var(--muted)_l_c_h/0.25)_0%,transparent_38%,oklch(from_var(--foreground)_l_c_h/0.04)_100%)]",
        )}
      />

      {/* Primary halo — top */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,oklch(from_var(--primary)_l_c_h/0.12),transparent_55%)]",
          "dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,oklch(from_var(--primary)_l_c_h/0.16),transparent_55%)]",
        )}
      />

      {/* Ambient corners — bottom-left + top-right (asymmetric, soft) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(ellipse_55%_45%_at_0%_100%,oklch(from_var(--primary)_l_c_h/0.06),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_0%,oklch(from_var(--primary)_l_c_h/0.05),transparent_58%)]",
          "dark:bg-[radial-gradient(ellipse_55%_45%_at_0%_100%,oklch(from_var(--primary)_l_c_h/0.1),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_0%,oklch(from_var(--primary)_l_c_h/0.08),transparent_58%)]",
        )}
      />

      {/* Bottom lift */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%]",
          "bg-[radial-gradient(ellipse_85%_55%_at_50%_100%,oklch(from_var(--primary)_l_c_h/0.05),transparent_72%)]",
          "dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_100%,oklch(from_var(--primary)_l_c_h/0.09),transparent_72%)]",
        )}
      />

      {/* Grid — finer cells, edge-faded mask so the form stays readable */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "mask-[linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent),linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
          "mask-intersect opacity-[0.28] dark:opacity-[0.15]",
          "bg-[linear-gradient(to_right,oklch(from_var(--border)_l_c_h/0.5)_1px,transparent_1px),linear-gradient(to_bottom,oklch(from_var(--border)_l_c_h/0.5)_1px,transparent_1px)]",
          "bg-size-[min(100%,3rem)_min(100%,3rem)]",
        )}
      />

      {children}
    </div>
  );
}

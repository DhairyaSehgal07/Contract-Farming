import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function LandingBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,oklch(from_var(--primary)_l_c_h/0.14),transparent_58%)]",
          "dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-25%,oklch(from_var(--primary)_l_c_h/0.2),transparent_58%)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[45%]",
          "bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,oklch(from_var(--primary)_l_c_h/0.06),transparent_70%)]",
          "dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,oklch(from_var(--primary)_l_c_h/0.1),transparent_70%)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] opacity-[0.32] dark:opacity-[0.18]",
          "bg-[linear-gradient(to_right,oklch(from_var(--border)_l_c_h/0.55)_1px,transparent_1px),linear-gradient(to_bottom,oklch(from_var(--border)_l_c_h/0.55)_1px,transparent_1px)]",
          "bg-size-[min(100%,4rem)_min(100%,4rem)]",
        )}
      />
      {children}
    </div>
  );
}

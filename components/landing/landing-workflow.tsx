import {
  DropletsIcon,
  FileCheckIcon,
  ScissorsIcon,
  SproutIcon,
  TestTubeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { landingSectionShellClasses } from "./landing-section-classes";

const steps = [
  {
    icon: SproutIcon,
    title: "Plantation",
    description: "Dates, variety, and quantities captured per land.",
  },
  {
    icon: DropletsIcon,
    title: "Irrigation",
    description: "Media, notes, and timelines your team can review.",
  },
  {
    icon: ScissorsIcon,
    title: "Roguing & care",
    description: "Structured visits and observations in one place.",
  },
  {
    icon: TestTubeIcon,
    title: "Field tests",
    description: "Strip tests and follow-ups with clear checkpoints.",
  },
  {
    icon: FileCheckIcon,
    title: "Reports",
    description: "PDF-ready summaries for stakeholders and audits.",
  },
] as const;

export function LandingWorkflow() {
  return (
    <section
      id="workflow"
      className={landingSectionShellClasses}
      aria-labelledby="landing-workflow-heading"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Lifecycle
          </p>
          <h2
            id="landing-workflow-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            A clear path from planting to final report
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Align staff, managers, and admins on the same operational
            sequence—so nothing important slips between field and office.
          </p>
        </div>

        <ol className="relative mx-auto mt-10 max-w-3xl sm:mt-14">
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-5 w-px bg-border/60"
          />
          {steps.map(({ icon: Icon, title, description }, i) => (
            <li
              key={title}
              className={cn(
                "relative flex gap-4 pb-8 last:pb-0",
                "sm:gap-5 sm:pb-10",
              )}
            >
              <div
                className={cn(
                  "relative z-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background text-primary shadow-sm",
                )}
                aria-hidden
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm dark:bg-card/30">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

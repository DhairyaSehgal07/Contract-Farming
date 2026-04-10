import {
  FileTextIcon,
  LineChartIcon,
  MapPinIcon,
  SproutIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { landingSectionShellClasses } from "./landing-section-classes";

const features = [
  {
    icon: SproutIcon,
    title: "Lifecycle tracking",
    description:
      "Plantation through final visit—structured stages your team can audit.",
  },
  {
    icon: MapPinIcon,
    title: "Farmers & lands",
    description:
      "Profiles, parcels, and geo-ready fields for operational clarity.",
  },
  {
    icon: LineChartIcon,
    title: "Operational insight",
    description:
      "Reminders and timelines so field work stays on schedule.",
  },
  {
    icon: FileTextIcon,
    title: "Report-ready",
    description:
      "Consolidated lifecycle data for stakeholder PDFs and reviews.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className={landingSectionShellClasses}
      aria-labelledby="landing-features-heading"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">
            Capabilities
          </p>
          <h2
            id="landing-features-heading"
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Built for the full farming lifecycle
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Everything your organization needs to coordinate the field and
            report with confidence.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className={cn(
                "group relative rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm",
                "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
                "hover:border-primary/20 hover:bg-card hover:shadow-md",
                "dark:border-border/50 dark:bg-card/40 dark:hover:border-primary/25",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary/12 to-primary/5 text-primary",
                  "ring-1 ring-primary/15",
                  "transition-transform duration-200 ease-out group-hover:scale-105",
                )}
              >
                <Icon className="size-5" aria-hidden strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Wheat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  landingHeroBottomPaddingClasses,
  landingHorizontalPaddingClasses,
} from "./landing-section-classes";

export function LandingHero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex flex-1 flex-col scroll-mt-24"
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center pt-12 text-center sm:pt-14 md:pt-16 lg:pt-20",
          landingHorizontalPaddingClasses,
          landingHeroBottomPaddingClasses,
        )}
      >
        <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary backdrop-blur-sm">
              <span
                className="flex size-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/15"
                aria-hidden
              >
                <Wheat className="size-3.5 text-primary" />
              </span>
              Operations & analytics
            </span>
            <p className="text-xs tracking-wide text-muted-foreground">
              By Coldop
            </p>

            <h1
              id="hero-heading"
              className="max-w-sm text-balance font-semibold tracking-tight text-[1.75rem] leading-[1.15] sm:max-w-3xl sm:text-4xl md:text-5xl"
            >
              <span className="block text-foreground">
                From plantation to report
              </span>
              <span className="mt-1 block text-primary sm:mt-1.5">
                Contract farming, digitised.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Help your organisation manage farmers and lands, track the full
              farming lifecycle in one place, and keep field teams aligned—with
              reminders, structured data, and shareable PDFs built for decisions
              outdoors, not just at a desk.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Button
              size="lg"
              className="min-h-11 w-full rounded-lg sm:w-auto sm:min-h-9 sm:min-w-48"
              asChild
            >
              <Link href="/organisation/register">
              Get Started
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-11 w-full rounded-lg border-border/60 bg-background/40 backdrop-blur-sm sm:w-auto sm:min-h-9 sm:min-w-48"
              asChild
            >
              <Link href="/admin">Open dashboard</Link>
            </Button>
          </div>

          <p className="mx-auto max-w-md text-xs text-muted-foreground">
            Roles for admin, manager, and staff—coordinate from the office or
            the field.
          </p>
        </div>
      </div>
    </section>
  );
}

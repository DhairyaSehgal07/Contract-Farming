import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingCta() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-border/40 px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
      aria-labelledby="landing-cta-heading"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-border/50 bg-linear-to-br from-primary/10 via-card/60 to-card/40 p-6 shadow-lg sm:p-10 lg:p-12",
            "dark:from-primary/15 dark:via-card/40 dark:to-card/25",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25"
          />
          <div className="relative mx-auto max-w-xl text-center">
            <h2
              id="landing-cta-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              Ready when your organization is
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your admin provisions access. Use your credentials to sign in and
              pick up where the team left off—on any device.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Button
                type="button"
                size="lg"
                className="h-12 min-h-12 shadow-md shadow-primary/20 sm:h-10 sm:min-h-0 sm:min-w-40"
              >
                Get started
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 min-h-12 border-border/80 bg-background/70 backdrop-blur-sm sm:h-10 sm:min-h-0 sm:min-w-36"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { landingFooterShellClasses } from "./landing-section-classes";

export function LandingFooter() {
  return (
    <footer id="footer" className={landingFooterShellClasses}>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row sm:gap-4">
        <p className="text-balance text-center text-sm text-muted-foreground sm:text-left">
          <span className="font-medium text-foreground">Contract Farming</span>
          <span className="text-muted-foreground/80"> · By Coldop</span>
        </p>
        <p className="text-balance text-center text-xs leading-relaxed text-muted-foreground sm:max-w-md sm:text-left">
          Field operations &amp; analytics for contract farming programs.
        </p>
      </div>
    </footer>
  );
}

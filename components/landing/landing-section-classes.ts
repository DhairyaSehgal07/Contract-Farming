/**
 * Shared marketing layout so spacing between hero, features, workflow, CTA, and footer stays even.
 * Each block uses the same horizontal padding; stacked sections use matching vertical padding so
 * adjacent gaps are pb(prev) + pt(next) with identical values at each breakpoint.
 */
export const landingHorizontalPaddingClasses = "px-4 sm:px-6";

export const landingSectionVerticalPaddingClasses =
  "py-16 sm:py-20 lg:py-24";

/** Hero bottom only — pairs with the next section’s top padding from `landingSectionVerticalPaddingClasses`. */
export const landingHeroBottomPaddingClasses =
  "pb-16 sm:pb-20 lg:pb-24";

export const landingSectionBorderClasses =
  "scroll-mt-24 border-t border-border/50";

export const landingSectionShellClasses = [
  landingSectionBorderClasses,
  landingHorizontalPaddingClasses,
  landingSectionVerticalPaddingClasses,
].join(" ");

export const landingFooterShellClasses = [
  landingSectionBorderClasses,
  landingHorizontalPaddingClasses,
  "pt-16 sm:pt-20 lg:pt-24",
  "pb-[max(1rem,env(safe-area-inset-bottom))]",
].join(" ");

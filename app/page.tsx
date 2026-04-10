import { LandingBackground } from "@/components/landing/landing-background";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingWorkflow } from "@/components/landing/landing-workflow";

export default function HomePage() {
  return (
    <LandingBackground>
      <LandingHero />
      {/* <LandingFeatures /> */}
      {/* <LandingWorkflow /> */}
      {/* <LandingCta /> */}
      {/* <LandingFooter /> */}
    </LandingBackground>
  );
}

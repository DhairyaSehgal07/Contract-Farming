import type { Metadata } from "next";
import Link from "next/link";
import { Sprout } from "lucide-react";

import { SignInBackground } from "@/components/auth/sign-in-background";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Contract Farming.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <SignInBackground>
      <div
        className={cn(
          "flex min-h-svh flex-1 flex-col",
          "pt-[env(safe-area-inset-top)]",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Contract Farming home"
            className={cn(
              "flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg py-1 outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15"
              aria-hidden
            >
              <Sprout className="size-5 text-primary" />
            </span>
            <span className="truncate font-semibold tracking-tight text-foreground">
              Contract Farming
            </span>
          </Link>
          <ModeToggle className="min-h-11 min-w-11 shrink-0 md:min-h-10 md:min-w-10" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
          <SignInForm callbackUrl={callbackUrl ?? "/protected"} />
        </div>
      </div>
    </SignInBackground>
  );
}

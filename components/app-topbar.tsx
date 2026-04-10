"use client";

import Link from "next/link";
import { SproutIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { AccountAvatarDropdown } from "@/components/account-avatar-dropdown";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-0",
        className,
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15"
        aria-hidden
      >
        <SproutIcon className="size-5 text-primary" />
      </span>
      <span className="truncate font-semibold tracking-tight text-foreground">
        Contract Farming
      </span>
    </Link>
  );
}

export function AppTopbar() {
  const { data: session, status } = useSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 pt-[max(0px,env(safe-area-inset-top))] shadow-sm supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center">
          <BrandMark />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ModeToggle className="min-h-10 min-w-10 md:min-h-9 md:min-w-9" />
          {status === "loading" ? (
            <div
              className="size-11 shrink-0 animate-pulse rounded-full bg-muted"
              aria-hidden
            />
          ) : session?.user ? (
            <AccountAvatarDropdown user={session.user} />
          ) : (
            <Button
              size="sm"
              className="min-h-10 rounded-md px-3 md:min-h-9"
              asChild
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

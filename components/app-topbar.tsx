"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Menu, UserRound, Wheat } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.117v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavDropdown = {
  label: string;
  items: { href: string; label: string }[];
};

const NAV_DROPDOWNS: NavDropdown[] = [
  {
    label: "Product",
    items: [
      { href: "/#features", label: "Features" },
      { href: "/#platform", label: "Platform" },
      { href: "/#security", label: "Security" },
    ],
  },
  {
    label: "Developers",
    items: [
      { href: "/#api", label: "API" },
      { href: "/#guides", label: "Guides" },
      { href: "/#changelog", label: "Changelog" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { href: "/#farms", label: "For farms" },
      { href: "/#cooperatives", label: "For cooperatives" },
      { href: "/#enterprise", label: "Enterprise" },
    ],
  },
];

const NAV_LINKS = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#docs", label: "Docs" },
  { href: "/#blog", label: "Blog" },
];

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
        <Wheat className="size-5 text-primary" />
      </span>
      <span className="truncate font-semibold tracking-tight text-foreground">
        Contract Farming
      </span>
    </Link>
  );
}

function NavDropdownMenu({ item }: { item: NavDropdown }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 gap-1 px-2.5 font-medium text-foreground"
        >
          {item.label}
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2" sideOffset={8}>
        <ul className="flex flex-col gap-0.5">
          {item.items.map((sub) => (
            <li key={sub.href}>
              <Link
                href={sub.href}
                className="block rounded-md px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function MobileNavSections() {
  return (
    <nav className="flex flex-col gap-1 px-1 pb-4">
      {NAV_DROPDOWNS.map((group) => (
        <div key={group.label} className="py-2">
          <p className="px-2.5 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((sub) => (
              <li key={sub.href}>
                <SheetClose asChild>
                  <Link
                    href={sub.href}
                    className="flex min-h-11 items-center rounded-lg px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {sub.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Separator className="my-2 bg-border/60" />
      <ul className="flex flex-col gap-0.5">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <SheetClose asChild>
              <Link
                href={link.href}
                className="flex min-h-11 items-center rounded-lg px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </SheetClose>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppTopbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 pt-[max(0px,env(safe-area-inset-top))] shadow-sm supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-10">
          <BrandMark />
          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Main"
          >
            {NAV_DROPDOWNS.map((item) => (
              <NavDropdownMenu key={item.label} item={item} />
            ))}
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="h-9 px-2.5 font-medium text-foreground"
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
            >
              <GithubIcon className="size-4" />
            </a>
          </Button>
          <ModeToggle />
          <Button size="sm" className="rounded-md px-3" asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-muted/80 text-foreground hover:bg-muted"
            aria-label="Account"
            asChild
          >
            <Link href="/user/register">
              <UserRound className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 rounded-full bg-muted/80 text-foreground hover:bg-muted"
            aria-label="Account"
            asChild
          >
            <Link href="/user/register">
              <UserRound className="size-5" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 text-foreground"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[min(100vw-2rem,20rem)] flex-col border-border/60 bg-popover p-0 sm:max-w-sm"
              showCloseButton
            >
              <SheetHeader className="border-b border-border/50 px-4 py-4 text-left">
                <SheetTitle className="font-semibold tracking-tight">
                  Contract Farming
                </SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <MobileNavSections />
              </div>
              <div className="mt-auto flex flex-col gap-3 border-t border-border/50 p-4">
                <SheetClose asChild>
                  <Button className="w-full rounded-md" asChild>
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                </SheetClose>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ModeToggle />
                </div>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubIcon className="size-4" />
                      GitHub
                    </a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

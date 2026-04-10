"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { House, Sprout } from "lucide-react";
import { useSession } from "next-auth/react";

import { AccountAvatarDropdown } from "@/components/account-avatar-dropdown";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function SidebarFooterBackLink() {
  const { state } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      asChild
    >
      <Link
        href="/"
        className="flex items-center gap-2"
        title="Back to site"
        aria-label={state === "collapsed" ? "Back to site" : undefined}
      >
        <House
          className="size-4 shrink-0 hidden group-data-[collapsible=icon]:inline-flex"
          aria-hidden
        />
        <span className="group-data-[collapsible=icon]:hidden">Back to site</span>
      </Link>
    </Button>
  );
}

export type RoleNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

function navIsActive(pathname: string, href: string, basePath: string) {
  if (href === basePath) {
    return pathname === basePath;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function headerForPath(
  pathname: string,
  basePath: string,
  items: readonly RoleNavItem[],
) {
  const match = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => navIsActive(pathname, item.href, basePath));
  if (match) {
    return { title: match.title };
  }
  return { title: roleTitleFallback(basePath) };
}

function roleTitleFallback(basePath: string) {
  if (basePath === "/admin") return "Admin";
  if (basePath === "/manager") return "Manager";
  if (basePath === "/staff") return "Staff";
  return "Workspace";
}

export type AppRoleShellProps = {
  children: React.ReactNode;
  basePath: string;
  /** Primary label in sidebar (e.g. Admin, Manager, Staff) */
  roleLabel: string;
  /** Small line under role (product name) */
  productLabel?: string;
  /** Upper line in top bar next to trigger (e.g. Console, Monitor, Field) */
  headerKicker: string;
  operationsNav: readonly RoleNavItem[];
  systemNav: readonly RoleNavItem[];
  /** Optional icon in sidebar brand mark; defaults to Sprout */
  BrandIcon?: LucideIcon;
};

export function AppRoleShell({
  children,
  basePath,
  roleLabel,
  productLabel = "Contract Farming",
  headerKicker,
  operationsNav,
  systemNav,
  BrandIcon = Sprout,
}: AppRoleShellProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const allNav = [...operationsNav, ...systemNav];
  const { title: headerTitle } = headerForPath(pathname, basePath, allNav);

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader className="border-b border-sidebar-border/60 p-3 group-data-[collapsible=icon]:p-2">
            <Link
              href={basePath}
              className={cn(
                "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none",
                "ring-sidebar-ring focus-visible:ring-2",
                // Match SidebarGroup + SidebarMenuButton (icon rail) inset and 32×32 hit target.
                "group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0",
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary ring-1 ring-sidebar-primary/20 group-data-[collapsible=icon]:size-8"
                aria-hidden
              >
                <BrandIcon className="size-5 group-data-[collapsible=icon]:size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                <span className="block font-semibold tracking-tight text-sidebar-foreground">
                  {roleLabel}
                </span>
                <span className="block text-xs font-medium tracking-wide text-sidebar-foreground/70">
                  {productLabel}
                </span>
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[0.65rem] uppercase tracking-wider text-sidebar-foreground/60">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {operationsNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={navIsActive(pathname, item.href, basePath)}
                        tooltip={item.title}
                        size="lg"
                        className="min-h-11 md:min-h-10"
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-2" />

            <SidebarGroup>
              <SidebarGroupLabel className="text-[0.65rem] uppercase tracking-wider text-sidebar-foreground/60">
                System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={navIsActive(pathname, item.href, basePath)}
                        tooltip={item.title}
                        size="lg"
                        className="min-h-11 md:min-h-10"
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/60 p-2">
            <SidebarFooterBackLink />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset
          className={cn(
            "min-h-svh",
            // Inset variant defaults add mt-2 / mr-2 so the main panel “floats”, which leaves visible gaps above and to the right of the top bar. Flush the top and right edges with the viewport.
            "md:peer-data-[variant=inset]:mt-0 md:peer-data-[variant=inset]:mr-0",
            "md:peer-data-[variant=inset]:rounded-t-none md:peer-data-[variant=inset]:rounded-b-xl",
          )}
        >
          <header className="sticky top-0 z-20 flex h-14 w-full min-w-0 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 pt-[max(0px,env(safe-area-inset-top))] shadow-sm supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-md sm:px-6">
            <SidebarTrigger className="min-h-10 min-w-10 md:min-h-9 md:min-w-9" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {headerKicker}
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {headerTitle}
              </p>
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
          </header>
          <div className="flex flex-1 flex-col overflow-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

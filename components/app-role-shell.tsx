"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Sprout } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  const allNav = [...operationsNav, ...systemNav];
  const { title: headerTitle } = headerForPath(pathname, basePath, allNav);

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader className="border-b border-sidebar-border/60 p-3">
            <Link
              href={basePath}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none",
                "ring-sidebar-ring focus-visible:ring-2",
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary ring-1 ring-sidebar-primary/20"
                aria-hidden
              >
                <BrandIcon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-left">
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
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/">Back to site</Link>
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-svh">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/95 px-4 pt-[max(0px,env(safe-area-inset-top))] shadow-sm supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-md sm:px-6">
            <SidebarTrigger className="min-h-10 min-w-10 md:min-h-9 md:min-w-9" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {headerKicker}
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {headerTitle}
              </p>
            </div>
            <ModeToggle className="min-h-10 min-w-10 md:min-h-9 md:min-w-9" />
          </header>
          <div className="flex flex-1 flex-col overflow-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

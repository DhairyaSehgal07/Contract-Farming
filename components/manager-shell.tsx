"use client";

import {
  Bell,
  FileText,
  GitBranch,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import {
  AppRoleShell,
  type RoleNavItem,
} from "@/components/app-role-shell";

const operationsNav: RoleNavItem[] = [
  { title: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { title: "Farmers", href: "/manager/farmers", icon: Users },
  { title: "Lands", href: "/manager/lands", icon: MapPin },
  { title: "Lifecycle", href: "/manager/lifecycle", icon: GitBranch },
  { title: "Reminders", href: "/manager/reminders", icon: Bell },
  { title: "Reports", href: "/manager/reports", icon: FileText },
  { title: "Messages", href: "/manager/messages", icon: MessageSquare },
];

const systemNav: RoleNavItem[] = [
  { title: "Settings", href: "/manager/settings", icon: Settings },
];

export function ManagerShell({ children }: { children: React.ReactNode }) {
  return (
    <AppRoleShell
      basePath="/manager"
      roleLabel="Manager"
      headerKicker="Monitor"
      operationsNav={operationsNav}
      systemNav={systemNav}
    >
      {children}
    </AppRoleShell>
  );
}

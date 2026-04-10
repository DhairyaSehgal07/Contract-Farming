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
  UsersRound,
} from "lucide-react";

import {
  AppRoleShell,
  type RoleNavItem,
} from "@/components/app-role-shell";

const operationsNav: RoleNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Farmers", href: "/admin/farmers", icon: Users },
  { title: "Lands", href: "/admin/lands", icon: MapPin },
  { title: "Lifecycle", href: "/admin/lifecycle", icon: GitBranch },
  { title: "Reminders", href: "/admin/reminders", icon: Bell },
  { title: "Reports", href: "/admin/reports", icon: FileText },
  { title: "Messages", href: "/admin/messages", icon: MessageSquare },
];

const systemNav: RoleNavItem[] = [
  { title: "Team", href: "/admin/team", icon: UsersRound },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AppRoleShell
      basePath="/admin"
      roleLabel="Admin"
      headerKicker="Console"
      operationsNav={operationsNav}
      systemNav={systemNav}
    >
      {children}
    </AppRoleShell>
  );
}

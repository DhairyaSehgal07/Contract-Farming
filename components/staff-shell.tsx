"use client";

import {
  Bell,
  ClipboardList,
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
  { title: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { title: "Reminders", href: "/staff/reminders", icon: Bell },
  { title: "Field work", href: "/staff/field", icon: ClipboardList },
  { title: "Farmers", href: "/staff/farmers", icon: Users },
  { title: "Lands", href: "/staff/lands", icon: MapPin },
  { title: "Messages", href: "/staff/messages", icon: MessageSquare },
];

const systemNav: RoleNavItem[] = [
  { title: "Settings", href: "/staff/settings", icon: Settings },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  return (
    <AppRoleShell
      basePath="/staff"
      roleLabel="Staff"
      headerKicker="Field"
      operationsNav={operationsNav}
      systemNav={systemNav}
    >
      {children}
    </AppRoleShell>
  );
}

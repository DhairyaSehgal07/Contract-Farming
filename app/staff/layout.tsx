import type { Metadata } from "next";

import { StaffShell } from "@/components/staff-shell";

export const metadata: Metadata = {
  title: "Staff",
  description:
    "Field activities, uploads, reminders, and coordination with managers and admins.",
};

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StaffShell>{children}</StaffShell>;
}

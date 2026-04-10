import type { Metadata } from "next";

import { ManagerShell } from "@/components/manager-shell";

export const metadata: Metadata = {
  title: "Manager",
  description:
    "Monitor farmers and lands, review activity and reports, and support operational decisions.",
};

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ManagerShell>{children}</ManagerShell>;
}

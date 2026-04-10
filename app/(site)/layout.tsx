import { AppTopbar } from "@/components/app-topbar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppTopbar />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </>
  );
}

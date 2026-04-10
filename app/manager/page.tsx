import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Eye,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const summary = [
  {
    label: "Farmers in view",
    value: "—",
    hint: "Across your scope",
    icon: Users,
    href: "/manager/farmers",
  },
  {
    label: "Open issues",
    value: "—",
    hint: "Needs attention",
    icon: Eye,
    href: "/manager/lifecycle",
  },
  {
    label: "Due reminders",
    value: "—",
    hint: "Next 7 days",
    icon: Bell,
    href: "/manager/reminders",
  },
  {
    label: "Unread messages",
    value: "—",
    hint: "From the field",
    icon: MessageSquare,
    href: "/manager/messages",
  },
] as const;

export default function ManagerDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Manager
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Operational overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Review activity across farmers and lands, read reports, and support
          decisions—without full system administration. Figures are placeholders
          until data is connected.
        </p>
      </div>

      <section
        aria-label="Summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summary.map((item) => (
          <Card
            key={item.label}
            size="sm"
            className="border-border/60 transition-colors hover:border-border"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div className="min-w-0 space-y-1">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {item.label}
                </CardDescription>
                <CardTitle className="font-heading text-2xl tabular-nums tracking-tight text-foreground">
                  {item.value}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              </div>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
                aria-hidden
              >
                <item.icon className="size-5" />
              </span>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={item.href}>
                  View
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Review queue</CardTitle>
            <CardDescription>
              Irrigation timelines, roguing outcomes, and strip-test results—same
              lifecycle stages as the field team, oriented for oversight.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/manager/lifecycle">
                Lifecycle
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/manager/reports">
                Reports
                <FileText className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Coordination</CardTitle>
            <CardDescription>
              Stay aligned with admins on priorities and with staff on execution
              through messages and reminders.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/manager/messages">
                Messages
                <MessageSquare className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/manager/reminders">Reminders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

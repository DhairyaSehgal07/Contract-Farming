import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  MessageSquare,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const today = [
  {
    label: "Due today",
    value: "—",
    hint: "Visits & tasks",
    icon: Bell,
    href: "/staff/reminders",
  },
  {
    label: "Capture pending",
    value: "—",
    hint: "Photos & notes",
    icon: Upload,
    href: "/staff/field",
  },
  {
    label: "Messages",
    value: "—",
    hint: "Unread",
    icon: MessageSquare,
    href: "/staff/messages",
  },
] as const;

export default function StaffDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Field
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Today
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Your reminders, uploads, and coordination hub. Log irrigation media,
          roguing, strip tests, and notes per land—aligned with the contract
          farming workflow. Counts are placeholders until data is live.
        </p>
      </div>

      <section
        aria-label="Today summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {today.map((item) => (
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
                  Open
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>
            Jump into field capture or look up a farmer or land for context.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/staff/field">
              Field work
              <ClipboardList className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/staff/farmers">Farmers</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/staff/lands">Lands</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/staff/messages">Messages</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Droplets,
  FileText,
  GitBranch,
  MapPin,
  MessageSquare,
  Sprout,
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
    label: "Farmers",
    value: "—",
    hint: "Profiles on record",
    icon: Users,
    href: "/admin/farmers",
  },
  {
    label: "Lands",
    value: "—",
    hint: "Under management",
    icon: MapPin,
    href: "/admin/lands",
  },
  {
    label: "Due reminders",
    value: "—",
    hint: "Next 7 days",
    icon: Bell,
    href: "/admin/reminders",
  },
  {
    label: "Open threads",
    value: "—",
    hint: "Field messages",
    icon: MessageSquare,
    href: "/admin/messages",
  },
] as const;

const lifecycleStages = [
  {
    name: "Plantation",
    detail: "Variety, size, quantity",
    icon: Sprout,
  },
  {
    name: "Irrigation",
    detail: "Photos, video, notes",
    icon: Droplets,
  },
  {
    name: "Roguing",
    detail: "Dates & observations",
    icon: GitBranch,
  },
  {
    name: "Strip tests & dehalming",
    detail: "Visits + final reporting",
    icon: FileText,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Operations overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Monitor farmers, lands, and the full lifecycle from plantation through
          final reporting. Numbers below are placeholders until data is connected.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="border-border/60 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Lifecycle pipeline</CardTitle>
            <CardDescription>
              Each land follows a structured path from plantation through strip
              tests and dehalming, aligned with the contract farming workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lifecycleStages.map((stage, i) => (
                <li
                  key={stage.name}
                  className="flex gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-card text-primary ring-1 ring-border/60">
                    <stage.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Step {i + 1}
                    </p>
                    <p className="font-medium text-foreground">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/admin/lifecycle">
                Open lifecycle
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Reminder cadence</CardTitle>
            <CardDescription>
              Automatic nudges from plantation dates (first visit, roguing,
              strip test, post-dehalming follow-up).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-2">
              <li>First visit — ~30 days after plantation</li>
              <li>Roguing — ~40–50 days</li>
              <li>Strip test — ~55–65 days</li>
              <li>Final follow-up — after dehalming</li>
            </ul>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/admin/reminders">
                Reminders
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Reports & communication</CardTitle>
          <CardDescription>
            Generate per-farmer PDF report cards and coordinate with staff in the
            field.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild>
            <Link href="/admin/reports">
              Reports
              <FileText className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/messages">
              Messages
              <MessageSquare className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/team">Team & roles</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

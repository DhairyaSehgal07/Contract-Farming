"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  DropletsIcon,
  LeafIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RulerIcon,
  SearchIcon,
  SproutIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { NumberInput } from "@/components/ui/number-input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import type { LandListItem } from "@/lib/data/lands";
import { parseApiJson } from "@/lib/parse-api-json";
import { queryFetchEnvelopeData, type ApiEnvelope } from "@/lib/query/http";
import { serializeLandLifecyclePatch } from "@/lib/serialize-land-lifecycle-patch";
import type {
  RegisterLandLifecycleInput,
  UpdateLandLifecycleInput,
} from "@/lib/schemas/land-lifecycle";
import { cn } from "@/lib/utils";

type LandLifecyclePayload = {
  id: string;
  cycleId?: string;
  season?: string;
  year?: number;
  crop?: string;
  plannedPlantingWindow?: {
    startDate?: string;
    endDate?: string;
  };
  actualPlantingStart?: string;
  dehaulmingDate?: string;
  harvestPlannedDate?: string;
  plantationEntries: unknown[];
  irrigationEntries: unknown[];
  roguingEntries: unknown[];
  stripTestEntries: unknown[];
  dehalmingEntries: unknown[];
  createdAt: string;
  updatedAt: string;
};

const SEASON_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "kharif", label: "Kharif", hint: "Monsoon season" },
  { value: "rabi", label: "Rabi", hint: "Winter season" },
  { value: "zaid", label: "Zaid", hint: "Short summer crop" },
  { value: "other", label: "Other", hint: "Custom or mixed" },
];

const JOURNEY_STEPS = [
  {
    key: "plantation",
    title: "Plantation",
    description:
      "Planting dates, variety, seed quantity, and optional field notes — you can log multiple plantings.",
    icon: SproutIcon,
    count: (l: LandLifecyclePayload) => l.plantationEntries.length,
  },
  {
    key: "irrigation",
    title: "Irrigation",
    description:
      "Timeline of waterings with photos, videos, and notes. Managers can leave instructions.",
    icon: DropletsIcon,
    count: (l: LandLifecyclePayload) => l.irrigationEntries.length,
  },
  {
    key: "roguing",
    title: "Roguing",
    description:
      "Field inspections: results, observations, and quality signals from the crop row.",
    icon: SearchIcon,
    count: (l: LandLifecyclePayload) => l.roguingEntries.length,
  },
  {
    key: "stripTest",
    title: "Strip tests",
    description:
      "Visit checks (strip tests): tuber counts, sizes, and readiness for dehaulming.",
    icon: RulerIcon,
    count: (l: LandLifecyclePayload) => l.stripTestEntries.length,
  },
  {
    key: "dehaulming",
    title: "Dehaulming",
    description: "Record when tops are cut or crop is lifted — key milestone before harvest.",
    icon: LeafIcon,
    count: (l: LandLifecyclePayload) => l.dehalmingEntries.length,
  },
] as const;

type JourneyStepKey = (typeof JOURNEY_STEPS)[number]["key"];

function isoToDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function dateInputToPayload(s: string): string | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Maps DatePicker output (dd.MM.yyyy) to yyyy-MM-dd for API helpers. */
function pickerValueToYmd(s: string): string {
  const t = s.trim();
  if (!t) return "";
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (!y || !m || !d) return "";
    const parsed = new Date(y, m - 1, d);
    if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
      return "";
    }
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return "";
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !month || !year) return "";
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return "";
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "MMM d, yyyy");
}

async function fetchLandLifecycle(landId: string): Promise<LandLifecyclePayload | null> {
  const res = await fetch(`/api/land/${landId}/lifecycle`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return null;
  const parsed = await parseApiJson<ApiEnvelope<LandLifecyclePayload>>(res);
  if (!parsed.ok) throw new Error(parsed.message);
  if (!parsed.data.success) throw new Error(parsed.data.message);
  return parsed.data.data;
}

function formatArea(land: LandListItem) {
  return `${land.area.value} ${land.area.unit}`;
}

type LandLifecyclePanelProps = {
  landId: string;
  land: LandListItem;
};

export function LandLifecyclePanel({ landId, land }: LandLifecyclePanelProps) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = React.useState(false);

  const query = useQuery({
    queryKey: ["land-lifecycle", landId],
    queryFn: () => fetchLandLifecycle(landId),
  });

  const createMutation = useMutation({
    mutationFn: (body: RegisterLandLifecycleInput) =>
      queryFetchEnvelopeData<LandLifecyclePayload>(`/api/land/${landId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("You’re tracking this land’s season now.");
      void queryClient.invalidateQueries({ queryKey: ["land-lifecycle", landId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not start lifecycle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateLandLifecycleInput) =>
      queryFetchEnvelopeData<LandLifecyclePayload>(`/api/land/${landId}/lifecycle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: serializeLandLifecyclePatch(body),
      }),
    onSuccess: () => {
      toast.success("Cycle details updated");
      setEditOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["land-lifecycle", landId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not update");
    },
  });

  const lifecycle = query.data;

  return (
    <div className="space-y-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="min-h-11 w-fit gap-2 px-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/admin/lands">
              <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
              All lands
            </Link>
          </Button>
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Field overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {land.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {land.farmerName} · {formatArea(land)}
              {land.geoLocation ? " · GPS saved" : ""}
            </p>
          </div>
        </div>
        <Badge
          variant={land.isActive ? "secondary" : "outline"}
          className="h-9 shrink-0 self-start px-3 text-sm"
        >
          {land.isActive ? "Active land" : "Inactive"}
        </Badge>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-base font-semibold">Farming lifecycle</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Follow plantation through irrigation, roguing, strip tests, and dehaulming — aligned with
            how your team works in the field. One timeline per land keeps the story easy to read.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {query.isLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 py-10">
              <Loader2Icon className="size-8 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading lifecycle…</p>
            </div>
          ) : query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
              <p className="text-sm text-foreground">
                {query.error instanceof Error ? query.error.message : "Something went wrong"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 min-h-11"
                onClick={() => void query.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : !lifecycle ? (
            <LifecycleEmptyForm
              landName={land.name}
              isPending={createMutation.isPending}
              onSubmit={(body) => createMutation.mutate(body)}
            />
          ) : (
            <LifecycleOverview
              lifecycle={lifecycle}
              onEdit={() => setEditOpen(true)}
              isUpdating={updateMutation.isPending}
              onUpdateLifecycle={(body) => updateMutation.mutate(body)}
            />
          )}
        </CardContent>
      </Card>

      {lifecycle ? (
        <CycleEditSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          lifecycle={lifecycle}
          isPending={updateMutation.isPending}
          onSave={(body) => updateMutation.mutate(body)}
        />
      ) : null}
    </div>
  );
}

function LifecycleEmptyForm({
  landName,
  isPending,
  onSubmit,
}: {
  landName: string;
  isPending: boolean;
  onSubmit: (body: RegisterLandLifecycleInput) => void;
}) {
  const [season, setSeason] = React.useState<string>("");
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [crop, setCrop] = React.useState("");
  const [plantStart, setPlantStart] = React.useState("");
  const [plantEnd, setPlantEnd] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = Number.parseInt(year, 10);
    const startIso = dateInputToPayload(plantStart);
    const endIso = dateInputToPayload(plantEnd);
    const body = {
      ...(season ? { season: season as RegisterLandLifecycleInput["season"] } : {}),
      ...(Number.isFinite(y) && y >= 2000 && y <= 9999 ? { year: y } : {}),
      ...(crop.trim() ? { crop: crop.trim() } : {}),
      ...(startIso || endIso
        ? {
            plannedPlantingWindow: {
              ...(startIso ? { startDate: new Date(startIso) } : {}),
              ...(endIso ? { endDate: new Date(endIso) } : {}),
            },
          }
        : {}),
    } as RegisterLandLifecycleInput;
    onSubmit(body);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-5 sm:px-5">
        <p className="text-sm font-medium text-foreground">Start tracking {landName}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Add a crop cycle for this land. You can keep it light (season and year only) or add a rough
          planting window — details like irrigation and strip tests can be filled in as the season
          moves along.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cycle-season" className="text-sm font-medium">
            Season <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Select value={season || undefined} onValueChange={setSeason}>
            <SelectTrigger id="cycle-season" className="h-11 min-h-11 w-full rounded-lg">
              <SelectValue placeholder="Choose season" />
            </SelectTrigger>
            <SelectContent>
              {SEASON_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label} ({o.hint})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cycle-year" className="text-sm font-medium">
            Year
          </Label>
          <Input
            id="cycle-year"
            inputMode="numeric"
            className="h-11 min-h-11 rounded-lg tabular-nums"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={2000}
            max={9999}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cycle-crop" className="text-sm font-medium">
          Crop <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="cycle-crop"
          placeholder="e.g. Potato, wheat, mustard"
          className="h-11 min-h-11 rounded-lg"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Planned planting window</p>
        <p className="text-xs text-muted-foreground">
          Rough range is enough — refine dates later when planting is confirmed.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker
            id="plant-start"
            label="Start"
            labelClassName="text-xs font-normal text-muted-foreground"
            value={plantStart}
            onChange={(v) => setPlantStart(pickerValueToYmd(v))}
            fullWidth
          />
          <DatePicker
            id="plant-end"
            label="End"
            labelClassName="text-xs font-normal text-muted-foreground"
            value={plantEnd}
            onChange={(v) => setPlantEnd(pickerValueToYmd(v))}
            fullWidth
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          className="min-h-12 w-full gap-2 sm:w-auto"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              Starting…
            </>
          ) : (
            "Start lifecycle for this land"
          )}
        </Button>
      </div>
    </form>
  );
}

const journeyCardClasses = cn(
  "rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm",
  "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
  "dark:border-border/50 dark:bg-card/40",
);

function StepEntrySheet({
  open,
  onOpenChange,
  stepKey,
  lifecycle,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepKey: JourneyStepKey | null;
  lifecycle: LandLifecyclePayload;
  onSubmit: (body: UpdateLandLifecycleInput) => void;
  isPending: boolean;
}) {
  const [dateYmd, setDateYmd] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [variety, setVariety] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [observations, setObservations] = React.useState("");
  const [decisionNotes, setDecisionNotes] = React.useState("");
  const [readyForDehaulming, setReadyForDehaulming] = React.useState<"yes" | "no" | "">("");

  React.useEffect(() => {
    if (!open || !stepKey) return;
    setDateYmd(format(new Date(), "yyyy-MM-dd"));
    setVariety("");
    setQuantity("");
    setNotes("");
    setObservations("");
    setDecisionNotes("");
    setReadyForDehaulming("");
  }, [open, stepKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stepKey) return;
    const date = dateInputToPayload(dateYmd);
    if (!date) {
      toast.error("Choose a valid date");
      return;
    }
    const d = new Date(date);

    if (stepKey === "plantation") {
      const q = Number.parseFloat(quantity);
      if (!variety.trim()) {
        toast.error("Variety is required");
        return;
      }
      if (!Number.isFinite(q) || q < 0) {
        toast.error("Enter a valid quantity");
        return;
      }
      onSubmit({
        plantationEntries: [
          ...(lifecycle.plantationEntries as NonNullable<
            UpdateLandLifecycleInput["plantationEntries"]
          >),
          {
            plantationDate: d,
            variety: variety.trim(),
            quantity: q,
            notes: notes.trim() || undefined,
          },
        ],
      });
      onOpenChange(false);
      return;
    }

    if (stepKey === "irrigation") {
      onSubmit({
        irrigationEntries: [
          ...(lifecycle.irrigationEntries as NonNullable<
            UpdateLandLifecycleInput["irrigationEntries"]
          >),
          {
            irrigationDate: d,
            notes: notes.trim() || undefined,
            media: { photos: [], videos: [] },
          },
        ],
      });
      onOpenChange(false);
      return;
    }

    if (stepKey === "roguing") {
      onSubmit({
        roguingEntries: [
          ...(lifecycle.roguingEntries as NonNullable<UpdateLandLifecycleInput["roguingEntries"]>),
          {
            roguingDate: d,
            observations: observations.trim() || undefined,
          },
        ],
      });
      onOpenChange(false);
      return;
    }

    if (stepKey === "stripTest") {
      onSubmit({
        stripTestEntries: [
          ...(lifecycle.stripTestEntries as NonNullable<
            UpdateLandLifecycleInput["stripTestEntries"]
          >),
          {
            stripTestDate: d,
            decisionNotes: decisionNotes.trim() || undefined,
            isCropReadyForDehaulming:
              readyForDehaulming === "yes"
                ? true
                : readyForDehaulming === "no"
                  ? false
                  : undefined,
          },
        ],
      });
      onOpenChange(false);
      return;
    }

    if (stepKey === "dehaulming") {
      onSubmit({
        dehalmingEntries: [
          ...(lifecycle.dehalmingEntries as NonNullable<
            UpdateLandLifecycleInput["dehalmingEntries"]
          >),
          {
            dehalmingDate: d,
            notes: notes.trim() || undefined,
          },
        ],
      });
      onOpenChange(false);
    }
  }

  const title = stepKey ? JOURNEY_STEPS.find((s) => s.key === stepKey)?.title : "Add entry";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
          <SheetTitle>Add {title}</SheetTitle>
          <SheetDescription>
            This is saved to this land&apos;s season. You can add more entries anytime.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex max-h-[inherit] flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <DatePicker
              id="step-entry-date"
              label="Date"
              labelClassName="text-sm font-medium"
              value={dateYmd}
              onChange={(v) => setDateYmd(pickerValueToYmd(v))}
              fullWidth
            />

            {stepKey === "plantation" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="step-variety">Variety</Label>
                  <Input
                    id="step-variety"
                    className="h-11 min-h-11 rounded-lg"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Kufri chipsona"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-qty">Quantity (bags)</Label>
                  <NumberInput
                    id="step-qty"
                    className="h-11 min-h-11 rounded-lg tabular-nums"
                    min={0}
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-plant-notes">Notes</Label>
                  <Textarea
                    id="step-plant-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional"
                    rows={3}
                  />
                </div>
              </>
            ) : null}

            {stepKey === "irrigation" ? (
              <div className="space-y-2">
                <Label htmlFor="step-irr-notes">Notes</Label>
                <Textarea
                  id="step-irr-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was done, water source, instructions…"
                  rows={4}
                />
              </div>
            ) : null}

            {stepKey === "roguing" ? (
              <div className="space-y-2">
                <Label htmlFor="step-rogue-obs">Observations</Label>
                <Textarea
                  id="step-rogue-obs"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="What you saw in the field"
                  rows={4}
                />
              </div>
            ) : null}

            {stepKey === "stripTest" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="step-strip-notes">Decision / notes</Label>
                  <Textarea
                    id="step-strip-notes"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Counts, sizes, readiness…"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-ready">Ready for dehaulming?</Label>
                  <Select
                    value={readyForDehaulming || undefined}
                    onValueChange={(v) => setReadyForDehaulming(v as "yes" | "no")}
                  >
                    <SelectTrigger id="step-ready" className="h-11 min-h-11 w-full rounded-lg">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            {stepKey === "dehaulming" ? (
              <div className="space-y-2">
                <Label htmlFor="step-dh-notes">Notes</Label>
                <Textarea
                  id="step-dh-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional details"
                  rows={3}
                />
              </div>
            ) : null}
          </div>
          <SheetFooter className="border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending || !stepKey}>
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save entry"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function LifecycleOverview({
  lifecycle,
  onEdit,
  isUpdating,
  onUpdateLifecycle,
}: {
  lifecycle: LandLifecyclePayload;
  onEdit: () => void;
  isUpdating: boolean;
  onUpdateLifecycle: (body: UpdateLandLifecycleInput) => void;
}) {
  const [addStep, setAddStep] = React.useState<JourneyStepKey | null>(null);

  const seasonLabel =
    lifecycle.season &&
    SEASON_OPTIONS.find((s) => s.value === lifecycle.season)?.label;

  const totalLogged =
    lifecycle.plantationEntries.length +
    lifecycle.irrigationEntries.length +
    lifecycle.roguingEntries.length +
    lifecycle.stripTestEntries.length +
    lifecycle.dehalmingEntries.length;

  const stepsWithActivity = JOURNEY_STEPS.filter((s) => s.count(lifecycle) > 0).length;
  const progressPct = Math.round((stepsWithActivity / JOURNEY_STEPS.length) * 100);
  const progressLabel = `${stepsWithActivity} of ${JOURNEY_STEPS.length} stages with at least one entry`;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Season journey</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          From plantation to dehaulming
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Stages match how your team works in the field. Use + on a step to log visits — progress shows
          how many stages have at least one entry.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-foreground">Journey progress</span>
          <span className="tabular-nums text-muted-foreground">
            {stepsWithActivity}/{JOURNEY_STEPS.length} stages started · {totalLogged} total logs
          </span>
        </div>
        <Progress
          value={progressPct}
          max={100}
          className="h-2.5"
          aria-label="Crop journey progress"
          aria-valuetext={progressLabel}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 dark:bg-card/50">
        <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {seasonLabel ? (
              <Badge variant="secondary" className="font-medium">
                {seasonLabel}
                {lifecycle.year ? ` · ${lifecycle.year}` : ""}
              </Badge>
            ) : lifecycle.year ? (
              <Badge variant="outline">{lifecycle.year}</Badge>
            ) : null}
            {lifecycle.crop ? (
              <span className="truncate text-sm font-semibold text-foreground">{lifecycle.crop}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Crop not set yet</span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full shrink-0 gap-2 sm:w-auto"
            onClick={onEdit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : (
              <PencilIcon className="size-4" aria-hidden />
            )}
            Edit cycle
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <caption className="sr-only">Cycle dates for this land</caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/15">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-5"
                >
                  Planned planting
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-5"
                >
                  Actual planting
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-5"
                >
                  Harvest (planned)
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-5"
                >
                  Dehaulming
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 last:border-0">
                <td className="max-w-[200px] px-4 py-3 align-top text-foreground sm:px-5">
                  {lifecycle.plannedPlantingWindow?.startDate ||
                  lifecycle.plannedPlantingWindow?.endDate
                    ? `${formatDisplayDate(lifecycle.plannedPlantingWindow?.startDate)} – ${formatDisplayDate(lifecycle.plannedPlantingWindow?.endDate)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 align-top tabular-nums text-foreground sm:px-5">
                  {formatDisplayDate(lifecycle.actualPlantingStart)}
                </td>
                <td className="px-4 py-3 align-top tabular-nums text-foreground sm:px-5">
                  {formatDisplayDate(lifecycle.harvestPlannedDate)}
                </td>
                <td className="px-4 py-3 align-top tabular-nums text-foreground sm:px-5">
                  {formatDisplayDate(lifecycle.dehaulmingDate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ul className="relative space-y-0">
        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const n = step.count(lifecycle);
          const stepNo = String(index + 1).padStart(2, "0");
          const isLast = index === JOURNEY_STEPS.length - 1;
          const isComplete = n > 0;
          /** Segment below this step is “filled” once this step has an entry (progress toward the next). */
          const connectorComplete = isComplete;
          return (
            <li
              key={step.key}
              className="flex gap-3 pb-8 last:pb-0 sm:gap-4 sm:pb-10 sm:last:pb-0"
            >
              <div className="flex w-11 shrink-0 flex-col items-center self-stretch sm:w-12">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors duration-300 ease-out",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground ring-1 ring-primary/25"
                      : "border-border/60 bg-card text-primary ring-1 ring-primary/10 dark:bg-card/80",
                  )}
                >
                  <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                </div>
                {!isLast ? (
                  <div
                    aria-hidden
                    className={cn(
                      "mt-2 w-px flex-1 min-h-6 transition-colors duration-300 ease-out",
                      connectorComplete ? "bg-primary" : "bg-border/60",
                    )}
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    journeyCardClasses,
                    "group hover:border-primary/20 hover:bg-card hover:shadow-md dark:hover:border-primary/25",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <h3 className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                        <span className="tabular-nums text-muted-foreground">{stepNo}</span>{" "}
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <Badge variant={n > 0 ? "secondary" : "outline"} className="tabular-nums">
                        {n} {n === 1 ? "entry" : "entries"}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="min-h-11 min-w-11 rounded-full"
                        onClick={() => setAddStep(step.key)}
                        aria-label={`Add ${step.title} entry`}
                      >
                        <PlusIcon className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <StepEntrySheet
        open={addStep != null}
        onOpenChange={(o) => {
          if (!o) setAddStep(null);
        }}
        stepKey={addStep}
        lifecycle={lifecycle}
        onSubmit={onUpdateLifecycle}
        isPending={isUpdating}
      />
    </div>
  );
}

function CycleEditSheet({
  open,
  onOpenChange,
  lifecycle,
  isPending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lifecycle: LandLifecyclePayload;
  isPending: boolean;
  onSave: (body: UpdateLandLifecycleInput) => void;
}) {
  const [season, setSeason] = React.useState(lifecycle.season ?? "");
  const [year, setYear] = React.useState(
    lifecycle.year != null ? String(lifecycle.year) : String(new Date().getFullYear()),
  );
  const [crop, setCrop] = React.useState(lifecycle.crop ?? "");
  const [plantStart, setPlantStart] = React.useState(
    isoToDateInput(lifecycle.plannedPlantingWindow?.startDate),
  );
  const [plantEnd, setPlantEnd] = React.useState(
    isoToDateInput(lifecycle.plannedPlantingWindow?.endDate),
  );
  const [actualPlant, setActualPlant] = React.useState(isoToDateInput(lifecycle.actualPlantingStart));
  const [harvestPlanned, setHarvestPlanned] = React.useState(
    isoToDateInput(lifecycle.harvestPlannedDate),
  );
  const [dehaulming, setDehaulming] = React.useState(isoToDateInput(lifecycle.dehaulmingDate));

  React.useEffect(() => {
    if (!open) return;
    setSeason(lifecycle.season ?? "");
    setYear(lifecycle.year != null ? String(lifecycle.year) : String(new Date().getFullYear()));
    setCrop(lifecycle.crop ?? "");
    setPlantStart(isoToDateInput(lifecycle.plannedPlantingWindow?.startDate));
    setPlantEnd(isoToDateInput(lifecycle.plannedPlantingWindow?.endDate));
    setActualPlant(isoToDateInput(lifecycle.actualPlantingStart));
    setHarvestPlanned(isoToDateInput(lifecycle.harvestPlannedDate));
    setDehaulming(isoToDateInput(lifecycle.dehaulmingDate));
  }, [open, lifecycle]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = Number.parseInt(year, 10);
    const body: UpdateLandLifecycleInput = {
      ...(season ? { season: season as UpdateLandLifecycleInput["season"] } : { season: undefined }),
      ...(Number.isFinite(y) && y >= 2000 && y <= 9999 ? { year: y } : {}),
      crop: crop.trim() || undefined,
    };
    const ps = dateInputToPayload(plantStart);
    const pe = dateInputToPayload(plantEnd);
    if (ps || pe) {
      body.plannedPlantingWindow = {};
      if (ps) body.plannedPlantingWindow.startDate = new Date(ps);
      if (pe) body.plannedPlantingWindow.endDate = new Date(pe);
    }
    const ap = dateInputToPayload(actualPlant);
    if (ap) body.actualPlantingStart = new Date(ap);
    const hp = dateInputToPayload(harvestPlanned);
    if (hp) body.harvestPlannedDate = new Date(hp);
    const dh = dateInputToPayload(dehaulming);
    if (dh) body.dehaulmingDate = new Date(dh);

    onSave(body);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
          <SheetTitle>Edit cycle details</SheetTitle>
          <SheetDescription>
            Update season, crop, and milestone dates. Log entries for irrigation and tests will stay
            as they are.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex max-h-[inherit] flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-season">Season</Label>
                <Select value={season || undefined} onValueChange={setSeason}>
                  <SelectTrigger id="edit-season" className="h-11 min-h-11 w-full rounded-lg">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASON_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  className="h-11 min-h-11 rounded-lg tabular-nums"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-crop">Crop</Label>
              <Input
                id="edit-crop"
                className="h-11 min-h-11 rounded-lg"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Planned planting window</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DatePicker
                  id="edit-ps"
                  label="Start"
                  labelClassName="text-xs font-normal text-muted-foreground"
                  value={plantStart}
                  onChange={(v) => setPlantStart(pickerValueToYmd(v))}
                  fullWidth
                />
                <DatePicker
                  id="edit-pe"
                  label="End"
                  labelClassName="text-xs font-normal text-muted-foreground"
                  value={plantEnd}
                  onChange={(v) => setPlantEnd(pickerValueToYmd(v))}
                  fullWidth
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Milestone dates</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <DatePicker
                  id="edit-ap"
                  label="Actual planting"
                  labelClassName="text-xs font-normal text-muted-foreground"
                  value={actualPlant}
                  onChange={(v) => setActualPlant(pickerValueToYmd(v))}
                  fullWidth
                />
                <DatePicker
                  id="edit-hp"
                  label="Planned harvest"
                  labelClassName="text-xs font-normal text-muted-foreground"
                  value={harvestPlanned}
                  onChange={(v) => setHarvestPlanned(pickerValueToYmd(v))}
                  fullWidth
                />
                <div className="sm:col-span-2">
                  <DatePicker
                    id="edit-dh"
                    label="Dehaulming"
                    labelClassName="text-xs font-normal text-muted-foreground"
                    value={dehaulming}
                    onChange={(v) => setDehaulming(pickerValueToYmd(v))}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>
          <SheetFooter className="border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

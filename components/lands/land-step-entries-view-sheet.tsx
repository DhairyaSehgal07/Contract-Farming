"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/** Minimal lifecycle shape needed to read step entry arrays. */
export type LandLifecycleEntriesPayload = {
  plantationEntries: unknown[];
  irrigationEntries: unknown[];
  roguingEntries: unknown[];
  stripTestEntries: unknown[];
  dehalmingEntries: unknown[];
};

export type LandLifecycleJourneyStepKey =
  | "plantation"
  | "irrigation"
  | "roguing"
  | "stripTest"
  | "dehaulming";

function formatDisplayDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "MMM d, yyyy");
}

function formatEntryDate(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string") return formatDisplayDate(v);
  if (v instanceof Date) return formatDisplayDate(v.toISOString());
  return "—";
}

function getStepEntries(
  lifecycle: LandLifecycleEntriesPayload,
  key: LandLifecycleJourneyStepKey,
): unknown[] {
  switch (key) {
    case "plantation":
      return lifecycle.plantationEntries;
    case "irrigation":
      return lifecycle.irrigationEntries;
    case "roguing":
      return lifecycle.roguingEntries;
    case "stripTest":
      return lifecycle.stripTestEntries;
    case "dehaulming":
      return lifecycle.dehalmingEntries;
    default:
      return [];
  }
}

function asEntryRecord(entry: unknown): Record<string, unknown> | null {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    return entry as Record<string, unknown>;
  }
  return null;
}

function strField(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function irrigationPrimaryImage(entry: Record<string, unknown>): string | null {
  const direct = strField(entry.imageUrl);
  if (direct) return direct;
  const media = entry.media;
  if (media && typeof media === "object" && !Array.isArray(media)) {
    const photos = (media as { photos?: unknown }).photos;
    if (Array.isArray(photos)) {
      for (const p of photos) {
        if (typeof p === "string" && p.trim()) return p.trim();
      }
    }
  }
  return null;
}

function primaryImageForStep(
  stepKey: LandLifecycleJourneyStepKey,
  entry: Record<string, unknown>,
): string | null {
  if (stepKey === "irrigation") return irrigationPrimaryImage(entry);
  return strField(entry.imageUrl) ?? null;
}

function EntryDetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-36">
        {label}
      </span>
      <span className="min-w-0 text-sm text-foreground">{value}</span>
    </div>
  );
}

function StepEntryDetailsBody({
  stepKey,
  entry,
}: {
  stepKey: LandLifecycleJourneyStepKey;
  entry: Record<string, unknown>;
}) {
  if (stepKey === "plantation") {
    return (
      <div className="space-y-3">
        <EntryDetailLine label="Date" value={formatEntryDate(entry.plantationDate)} />
        <EntryDetailLine label="Variety" value={strField(entry.variety) ?? "—"} />
        <EntryDetailLine
          label="Quantity"
          value={typeof entry.quantity === "number" ? `${entry.quantity} bags` : "—"}
        />
        {strField(entry.notes) ? <EntryDetailLine label="Notes" value={entry.notes as string} /> : null}
        {strField(entry.size) ? <EntryDetailLine label="Size" value={entry.size as string} /> : null}
        {strField(entry.basalFertilizerDose) ? (
          <EntryDetailLine label="Basal fertilizer" value={entry.basalFertilizerDose as string} />
        ) : null}
        {strField(entry.preIrrigationStatus) ? (
          <EntryDetailLine label="Pre-irrigation" value={entry.preIrrigationStatus as string} />
        ) : null}
        {typeof entry.plantedArea === "number" ? (
          <EntryDetailLine label="Planted area" value={`${entry.plantedArea}`} />
        ) : null}
        {typeof entry.plantingDepthCm === "number" ? (
          <EntryDetailLine label="Depth (cm)" value={`${entry.plantingDepthCm}`} />
        ) : null}
        {strField(entry.spacingCm) ? <EntryDetailLine label="Spacing" value={entry.spacingCm as string} /> : null}
        {strField(entry.plantingPattern) ? (
          <EntryDetailLine label="Pattern" value={entry.plantingPattern as string} />
        ) : null}
        {typeof entry.bagsUsed === "number" ? (
          <EntryDetailLine label="Bags used" value={`${entry.bagsUsed}`} />
        ) : null}
      </div>
    );
  }
  if (stepKey === "irrigation") {
    return (
      <div className="space-y-3">
        <EntryDetailLine label="Date" value={formatEntryDate(entry.irrigationDate)} />
        {strField(entry.notes) ? <EntryDetailLine label="Notes" value={entry.notes as string} /> : null}
        {strField(entry.adminManagerInstructions) ? (
          <EntryDetailLine label="Instructions" value={entry.adminManagerInstructions as string} />
        ) : null}
      </div>
    );
  }
  if (stepKey === "roguing") {
    return (
      <div className="space-y-3">
        <EntryDetailLine label="Date" value={formatEntryDate(entry.roguingDate)} />
        {strField(entry.observations) ? (
          <EntryDetailLine label="Observations" value={entry.observations as string} />
        ) : null}
        {strField(entry.results) ? <EntryDetailLine label="Results" value={entry.results as string} /> : null}
        {typeof entry.virusInfectedPlantCount === "number" ? (
          <EntryDetailLine label="Virus-infected plants" value={`${entry.virusInfectedPlantCount}`} />
        ) : null}
        {typeof entry.mixedVarietyPlantCount === "number" ? (
          <EntryDetailLine label="Mixed variety plants" value={`${entry.mixedVarietyPlantCount}`} />
        ) : null}
        {typeof entry.germinationPercentage === "number" ? (
          <EntryDetailLine label="Germination %" value={`${entry.germinationPercentage}`} />
        ) : null}
      </div>
    );
  }
  if (stepKey === "stripTest") {
    const ready = entry.isCropReadyForDehaulming;
    const readyLabel = ready === true ? "Yes" : ready === false ? "No" : "—";
    return (
      <div className="space-y-3">
        <EntryDetailLine label="Date" value={formatEntryDate(entry.stripTestDate)} />
        <EntryDetailLine label="Ready for dehaulming" value={readyLabel} />
        {strField(entry.decisionNotes) ? (
          <EntryDetailLine label="Decision notes" value={entry.decisionNotes as string} />
        ) : null}
        {typeof entry.stripLengthMeter === "number" ? (
          <EntryDetailLine label="Strip length (m)" value={`${entry.stripLengthMeter}`} />
        ) : null}
        {typeof entry.stripAreaSqm === "number" ? (
          <EntryDetailLine label="Strip area (m²)" value={`${entry.stripAreaSqm}`} />
        ) : null}
        {typeof entry.goliTuberCount === "number" ? (
          <EntryDetailLine label="Goli tubers" value={`${entry.goliTuberCount}`} />
        ) : null}
        {typeof entry.mediumTuberCount === "number" ? (
          <EntryDetailLine label="Medium tubers" value={`${entry.mediumTuberCount}`} />
        ) : null}
        {strField(entry.tuberRatio) ? <EntryDetailLine label="Tuber ratio" value={entry.tuberRatio as string} /> : null}
        {typeof entry.totalTuberWeightKg === "number" ? (
          <EntryDetailLine label="Total weight (kg)" value={`${entry.totalTuberWeightKg}`} />
        ) : null}
      </div>
    );
  }
  if (stepKey === "dehaulming") {
    return (
      <div className="space-y-3">
        <EntryDetailLine label="Date" value={formatEntryDate(entry.dehalmingDate)} />
        {strField(entry.notes) ? <EntryDetailLine label="Notes" value={entry.notes as string} /> : null}
      </div>
    );
  }
  return null;
}

export type StepEntriesViewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepKey: LandLifecycleJourneyStepKey | null;
  /** Human-readable step title for the sheet header (e.g. from your journey config). */
  stepTitle: string;
  lifecycle: LandLifecycleEntriesPayload;
  isPending?: boolean;
  onEdit: (stepKey: LandLifecycleJourneyStepKey, index: number) => void;
  onDelete: (stepKey: LandLifecycleJourneyStepKey, index: number) => void;
};

export function StepEntriesViewSheet({
  open,
  onOpenChange,
  stepKey,
  stepTitle,
  lifecycle,
  isPending = false,
  onEdit,
  onDelete,
}: StepEntriesViewSheetProps) {
  const [slide, setSlide] = React.useState(0);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const entries = React.useMemo(
    () => (stepKey ? getStepEntries(lifecycle, stepKey) : []),
    [lifecycle, stepKey],
  );

  React.useEffect(() => {
    if (open) setSlide(0);
  }, [open, stepKey]);

  React.useEffect(() => {
    if (!open) setDeleteOpen(false);
  }, [open]);

  const total = entries.length;
  const safeIndex = total > 0 ? Math.min(slide, total - 1) : 0;
  const rawEntry = total > 0 ? entries[safeIndex] : null;
  const entry = asEntryRecord(rawEntry);

  React.useEffect(() => {
    if (total === 0) return;
    setSlide((s) => (s >= total ? total - 1 : s));
  }, [total]);

  const headerTitle = stepKey ? `${stepTitle} entries` : "Entries";
  const imgUrl = stepKey && entry ? primaryImageForStep(stepKey, entry) : null;

  function handleConfirmDelete() {
    if (!stepKey || total === 0) return;
    onDelete(stepKey, safeIndex);
    setDeleteOpen(false);
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
          <SheetTitle>{headerTitle}</SheetTitle>
          <SheetDescription>
            {total === 0
              ? "No entries for this step yet."
              : total === 1
                ? "One log for this stage."
                : `Showing ${safeIndex + 1} of ${total} logs. Use arrows to browse.`}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {!stepKey || total === 0 || !entry ? (
            <p className="text-sm text-muted-foreground">Nothing to show.</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                {imgUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- remote UploadThing URL */
                  <img src={imgUrl} alt="" className="max-h-56 w-full object-contain" />
                ) : (
                  <div className="flex min-h-40 items-center justify-center px-4 py-8 text-sm text-muted-foreground">
                    No photo for this entry
                  </div>
                )}
              </div>
              <StepEntryDetailsBody stepKey={stepKey} entry={entry} />
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 gap-2"
                  disabled={isPending}
                  onClick={() => stepKey && onEdit(stepKey, safeIndex)}
                >
                  {isPending ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <PencilIcon className="size-4" aria-hidden />
                  )}
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon className="size-4" aria-hidden />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
        {stepKey && total > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 shrink-0 rounded-full"
              aria-label="Previous entry"
              onClick={() => setSlide((i) => (i - 1 + total) % total)}
            >
              <ChevronLeftIcon className="size-4" aria-hidden />
            </Button>
            <span className="tabular-nums text-sm text-muted-foreground">
              {safeIndex + 1} / {total}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 shrink-0 rounded-full"
              aria-label="Next entry"
              onClick={() => setSlide((i) => (i + 1) % total)}
            >
              <ChevronRightIcon className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the log you are viewing from this stage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" className="min-h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              className="min-h-11"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

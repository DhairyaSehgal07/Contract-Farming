"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import type { FarmerListItem } from "@/lib/data/farmers";
import { queryFetchEnvelopeData } from "@/lib/query/http";
import {
  registerLandFormSchema,
  type RegisterLandFormValues,
} from "@/lib/schemas/land-register";
import { LAND_AREA_UNITS } from "@/lib/land/constants";
import { cn } from "@/lib/utils";

function fieldErrorText(errors: unknown[] | undefined): string | undefined {
  if (!errors?.length) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    return String((first as { message?: string }).message);
  }
  return undefined;
}

function buildRegisterBody(
  value: RegisterLandFormValues,
  organizationId: string,
): Record<string, unknown> {
  const lt = value.latitude.trim();
  const lg = value.longitude.trim();
  const geo =
    lt && lg
      ? { latitude: Number(lt), longitude: Number(lg) }
      : undefined;

  return {
    name: value.name,
    farmerId: value.farmerId,
    organizationId,
    area: { value: value.areaValue, unit: value.areaUnit },
    isActive: value.isActive,
    ...(geo ? { geoLocation: geo } : {}),
  };
}

type AdminLandsActionsProps = {
  organizationId: string;
  farmers: FarmerListItem[];
};

export function AdminLandsActions({ organizationId, farmers }: AdminLandsActionsProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const registerLandMutation = useMutation({
    mutationFn: (value: RegisterLandFormValues) =>
      queryFetchEnvelopeData<{ id: string }>("/api/land", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRegisterBody(value, organizationId)),
      }),
    onSuccess: () => {
      toast.success("Land registered successfully");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not register land");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      farmerId: farmers[0]?.id ?? "",
      areaValue: 0,
      areaUnit: "acre" as (typeof LAND_AREA_UNITS)[number],
      latitude: "",
      longitude: "",
      isActive: true,
    },
    validators: {
      onSubmit: registerLandFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerLandMutation.mutateAsync(value);
        form.reset();
        setSheetOpen(false);
      } catch {
        // Toast handled in mutation onError.
      }
    },
  });

  const openAddLand = () => {
    form.reset();
    form.setFieldValue("farmerId", farmers[0]?.id ?? "");
    form.setFieldValue("areaUnit", "acre");
    setSheetOpen(true);
  };

  const noFarmers = farmers.length === 0;

  return (
    <>
      <Button
        type="button"
        size="default"
        className="min-h-11 shrink-0 gap-2 sm:self-start"
        disabled={noFarmers}
        title={
          noFarmers
            ? "Add at least one farmer before registering a land"
            : undefined
        }
        onClick={openAddLand}
      >
        <PlusIcon className="size-4" aria-hidden />
        Add land
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
            <SheetTitle>Register land</SheetTitle>
            <SheetDescription>
              Link a parcel to a farmer. Land names must be unique per farmer.
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex max-h-[inherit] flex-1 flex-col overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
            noValidate
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="land-name" className="text-sm font-medium">
                        Land name
                      </Label>
                      <Input
                        id="land-name"
                        name={field.name}
                        placeholder="e.g. North block"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className={cn(
                          "h-11 min-h-11 rounded-lg px-3 text-base md:h-11 md:text-sm",
                          isInvalid && "border-destructive",
                        )}
                      />
                      {isInvalid && err ? (
                        <p className="text-xs text-destructive">{err}</p>
                      ) : null}
                    </div>
                  );
                }}
              </form.Field>

              <form.Field name="farmerId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="land-farmer" className="text-sm font-medium">
                        Farmer
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger
                          id="land-farmer"
                          className={cn(
                            "h-11 min-h-11 w-full rounded-lg",
                            isInvalid && "border-destructive",
                          )}
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select farmer" />
                        </SelectTrigger>
                        <SelectContent>
                          {farmers.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && err ? (
                        <p className="text-xs text-destructive">{err}</p>
                      ) : null}
                    </div>
                  );
                }}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="areaValue">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const err = fieldErrorText(field.state.meta.errors);
                    return (
                      <div
                        className={cn("space-y-2", isInvalid && "text-destructive")}
                        data-invalid={isInvalid || undefined}
                      >
                        <Label htmlFor="land-area-value" className="text-sm font-medium">
                          Area
                        </Label>
                        <NumberInput
                          id="land-area-value"
                          name={field.name}
                          inputMode="decimal"
                          min={0}
                          step="any"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          aria-invalid={isInvalid}
                          className={cn(
                            "h-11 min-h-11 rounded-lg px-3 tabular-nums",
                            isInvalid && "border-destructive",
                          )}
                        />
                        {isInvalid && err ? (
                          <p className="text-xs text-destructive">{err}</p>
                        ) : null}
                      </div>
                    );
                  }}
                </form.Field>

                <form.Field name="areaUnit">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="land-area-unit" className="text-sm font-medium">
                        Unit
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(v) =>
                          field.handleChange(v as (typeof LAND_AREA_UNITS)[number])
                        }
                      >
                        <SelectTrigger
                          id="land-area-unit"
                          className="h-11 min-h-11 w-full rounded-lg"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAND_AREA_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">GPS (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Leave blank if you do not want to store coordinates yet.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="latitude">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      const err = fieldErrorText(field.state.meta.errors);
                      return (
                        <div
                          className={cn("space-y-2", isInvalid && "text-destructive")}
                          data-invalid={isInvalid || undefined}
                        >
                          <Label htmlFor="land-lat" className="text-sm font-medium">
                            Latitude
                          </Label>
                          <Input
                            id="land-lat"
                            name={field.name}
                            inputMode="decimal"
                            placeholder="e.g. 28.6139"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className={cn(
                              "h-11 min-h-11 rounded-lg px-3 tabular-nums",
                              isInvalid && "border-destructive",
                            )}
                          />
                          {isInvalid && err ? (
                            <p className="text-xs text-destructive">{err}</p>
                          ) : null}
                        </div>
                      );
                    }}
                  </form.Field>
                  <form.Field name="longitude">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      const err = fieldErrorText(field.state.meta.errors);
                      return (
                        <div
                          className={cn("space-y-2", isInvalid && "text-destructive")}
                          data-invalid={isInvalid || undefined}
                        >
                          <Label htmlFor="land-lng" className="text-sm font-medium">
                            Longitude
                          </Label>
                          <Input
                            id="land-lng"
                            name={field.name}
                            inputMode="decimal"
                            placeholder="e.g. 77.2090"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            className={cn(
                              "h-11 min-h-11 rounded-lg px-3 tabular-nums",
                              isInvalid && "border-destructive",
                            )}
                          />
                          {isInvalid && err ? (
                            <p className="text-xs text-destructive">{err}</p>
                          ) : null}
                        </div>
                      );
                    }}
                  </form.Field>
                </div>
              </div>

              <form.Field name="isActive">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn(
                        "flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3",
                        isInvalid && "border-destructive",
                      )}
                      data-invalid={isInvalid || undefined}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <Label htmlFor="land-active" className="text-sm font-medium">
                          Active
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Inactive lands stay in the system for history.
                        </p>
                        {isInvalid && err ? (
                          <p className="text-xs text-destructive">{err}</p>
                        ) : null}
                      </div>
                      <Switch
                        id="land-active"
                        checked={field.state.value}
                        onCheckedChange={(v) => field.handleChange(v)}
                        aria-invalid={isInvalid}
                        className="shrink-0"
                      />
                    </div>
                  );
                }}
              </form.Field>
            </div>

            <SheetFooter className="border-t border-border/60 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                onClick={() => setSheetOpen(false)}
                disabled={registerLandMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-11 w-full sm:w-auto"
                disabled={registerLandMutation.isPending}
              >
                {registerLandMutation.isPending ? "Saving…" : "Register land"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

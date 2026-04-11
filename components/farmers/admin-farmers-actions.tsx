"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { queryFetchEnvelopeData } from "@/lib/query/http";
import {
  registerFarmerFormSchema,
  type RegisterFarmerFormValues,
} from "@/lib/schemas/farmer-register";
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

type AdminFarmersActionsProps = {
  organizationId: string;
};

export function AdminFarmersActions({ organizationId }: AdminFarmersActionsProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const registerFarmerMutation = useMutation({
    mutationFn: (value: RegisterFarmerFormValues) =>
      queryFetchEnvelopeData<{ id: string }>("/api/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: value.fullName,
          address: value.address,
          mobileNumber: value.mobileNumber.replace(/\s+/g, ""),
          organizationId,
          isActive: value.isActive,
        }),
      }),
    onSuccess: () => {
      toast.success("Farmer registered successfully");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not register farmer");
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      address: "",
      mobileNumber: "",
      isActive: true,
    },
    validators: {
      onSubmit: registerFarmerFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerFarmerMutation.mutateAsync(value);
        form.reset();
        setSheetOpen(false);
      } catch {
        // Toast handled in mutation onError.
      }
    },
  });

  const openAddFarmer = () => {
    form.reset();
    setSheetOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        size="default"
        className="min-h-11 shrink-0 gap-2 sm:self-start"
        onClick={openAddFarmer}
      >
        <PlusIcon className="size-4" aria-hidden />
        Add New
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[min(92vh,720px)] w-full flex-col gap-0 overflow-hidden rounded-t-2xl border-border/60 p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/60 px-4 pt-2 pb-4">
            <SheetTitle>Register farmer</SheetTitle>
            <SheetDescription>
              Add a farmer to your organization. Mobile numbers must be unique per
              organization.
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
              <form.Field name="fullName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="farmer-full-name" className="text-sm font-medium">
                        Full name
                      </Label>
                      <Input
                        id="farmer-full-name"
                        name={field.name}
                        autoComplete="name"
                        placeholder="e.g. Ravi Kumar"
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

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="farmer-address" className="text-sm font-medium">
                        Address
                      </Label>
                      <Textarea
                        id="farmer-address"
                        name={field.name}
                        autoComplete="street-address"
                        placeholder="Village, district, PIN…"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className={cn(
                          "min-h-[120px] rounded-lg px-3 py-2 text-base md:text-sm",
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

              <form.Field name="mobileNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const err = fieldErrorText(field.state.meta.errors);
                  return (
                    <div
                      className={cn("space-y-2", isInvalid && "text-destructive")}
                      data-invalid={isInvalid || undefined}
                    >
                      <Label htmlFor="farmer-mobile" className="text-sm font-medium">
                        Mobile number
                      </Label>
                      <Input
                        id="farmer-mobile"
                        name={field.name}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="e.g. 9876543210"
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
                        <Label
                          htmlFor="farmer-active"
                          className="text-sm font-medium leading-snug"
                        >
                          Active
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Inactive farmers stay in the system but can be hidden from
                          default lists.
                        </p>
                        {isInvalid && err ? (
                          <p className="text-xs text-destructive">{err}</p>
                        ) : null}
                      </div>
                      <Switch
                        id="farmer-active"
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
                disabled={registerFarmerMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-11 w-full sm:w-auto"
                disabled={registerFarmerMutation.isPending}
              >
                {registerFarmerMutation.isPending ? "Saving…" : "Register farmer"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

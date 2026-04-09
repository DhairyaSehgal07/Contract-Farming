"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { registerOrganizationAction } from "./actions";

const registerOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters"),
  phone: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      "Enter a valid email address",
    ),
  address: z.string().trim(),
});

export default function OrganisationRegisterForm() {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
    validators: {
      onSubmit: registerOrganizationSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitMessage(null);
      setSubmitError(null);

      const result = await registerOrganizationAction({
        name: value.name,
        contactDetails: {
          phone: value.phone || undefined,
          email: value.email || undefined,
          address: value.address || undefined,
        },
      });

      if (!result.success) {
        setSubmitError(result.message);
        return;
      }

      setSubmitMessage(result.message);
      form.reset();
      router.push("/");
    },
  });

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        Register Organisation
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create an organisation profile to start onboarding users.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Organization Name
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Acme Farming Collective"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {isInvalid ? (
                  <p className="text-sm text-destructive">
                    {String(field.state.meta.errors[0] ?? "") ||
                      "Please enter a valid organization name."}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Contact Phone (optional)
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Contact Email (optional)
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="ops@acmefarms.com"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {isInvalid ? (
                  <p className="text-sm text-destructive">
                    {String(field.state.meta.errors[0] ?? "") ||
                      "Please enter a valid email address."}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Address (optional)
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Village, district, state, postal code"
                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          )}
        </form.Field>

        {submitError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        {submitMessage ? (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {submitMessage}
          </p>
        ) : null}

        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Organisation"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}

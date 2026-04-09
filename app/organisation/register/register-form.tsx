"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "@/components/ui/sonner";
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
import { Textarea } from "@/components/ui/textarea";
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
      void toast.promise(
        (async () => {
          const result = await registerOrganizationAction({
            name: value.name,
            contactDetails: {
              phone: value.phone || undefined,
              email: value.email || undefined,
              address: value.address || undefined,
            },
          });

          if (!result.success) {
            throw new Error(result.message);
          }

          form.reset();
          router.push("/");
          return result.message;
        })(),
        {
          loading: "Registering organisation…",
          success: (message) => message,
          error: (err) =>
            err instanceof Error
              ? err.message
              : "Could not register organisation.",
        },
      );
    },
  });

  return (
    <Card className="mx-auto w-full max-w-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register Organisation</CardTitle>
        <CardDescription>
          Create an organisation profile to start onboarding users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
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
                  <Label htmlFor={field.name}>Organization Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Acme Farming Collective"
                    autoComplete="organization"
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
                <Label htmlFor={field.name}>Contact Phone (optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
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
                  <Label htmlFor={field.name}>Contact Email (optional)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="ops@acmefarms.com"
                    autoComplete="email"
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
                <Label htmlFor={field.name}>Address (optional)</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Village, district, state, postal code"
                  className="min-h-24"
                />
              </div>
            )}
          </form.Field>

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
      </CardContent>
    </Card>
  );
}

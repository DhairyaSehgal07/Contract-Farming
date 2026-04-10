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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ORGANIZATION_ROLES } from "@/models/rbac";
import { registerUserAction } from "./actions";

const objectIdRegex = /^[a-f\d]{24}$/i;

/** Sentinel for Radix Select — must never be a valid ObjectId; keeps Select controlled. */
const ORGANISATION_UNSET = "__none__";

const registerUserFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),
    mobileNumber: z
      .string()
      .trim()
      .min(8, "Mobile number must be at least 8 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string(),
    organizationId: z
      .string()
      .refine((v) => v !== ORGANISATION_UNSET, "Select an organization")
      .regex(objectIdRegex, "Select an organization"),
    role: z.enum(ORGANIZATION_ROLES),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

const ROLE_LABELS: Record<(typeof ORGANIZATION_ROLES)[number], string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

export type OrganisationOption = { id: string; name: string };

type RegisterFormProps = {
  organizations: OrganisationOption[];
};

export default function UserRegisterForm({ organizations }: RegisterFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      mobileNumber: "",
      password: "",
      passwordConfirm: "",
      organizationId: ORGANISATION_UNSET,
      role: "staff" as (typeof ORGANIZATION_ROLES)[number],
    },
    validators: {
      onSubmit: registerUserFormSchema,
    },
    onSubmit: async ({ value }) => {
      void toast.promise(
        (async () => {
          const result = await registerUserAction({
            name: value.name,
            mobileNumber: value.mobileNumber,
            password: value.password,
            organizationId: value.organizationId,
            role: value.role,
            isActive: true,
          });

          if (!result.success) {
            throw new Error(result.message);
          }

          form.reset();
          router.push("/");
          return result.message;
        })(),
        {
          loading: "Registering user…",
          success: (message) => message,
          error: (err) =>
            err instanceof Error
              ? err.message
              : "Could not register user.",
        },
      );
    },
  });

  if (organizations.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register User</CardTitle>
          <CardDescription>
            Add a store user linked to an organisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No organisations available</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Register an organisation first, then you can add users.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/organisation/register">Register organisation</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register User</CardTitle>
        <CardDescription>
          Create a store account for an existing organisation (mobile + password
          login).
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
          <form.Field name="organizationId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-2">
                  <Label htmlFor="organization-select">Organisation</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                  >
                    <SelectTrigger
                      id="organization-select"
                      className="w-full"
                      aria-invalid={isInvalid}
                    >
                      <SelectValue placeholder="Select organisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ORGANISATION_UNSET}>
                        Select organisation
                      </SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0] ?? "") ||
                        "Please select an organisation."}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="role-select">Role</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) =>
                    field.handleChange(v as (typeof ORGANIZATION_ROLES)[number])
                  }
                >
                  <SelectTrigger id="role-select" className="w-full">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Full name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Priya Sharma"
                    autoComplete="name"
                  />
                  {isInvalid ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0] ?? "") ||
                        "Enter a valid name."}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="mobileNumber">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Mobile number</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="+91 9876543210"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {isInvalid ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0] ?? "") ||
                        "Enter a valid mobile number."}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="new-password"
                  />
                  {isInvalid ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0] ?? "") ||
                        "Password must be at least 6 characters."}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="passwordConfirm">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="new-password"
                  />
                  {isInvalid ? (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0] ?? "") ||
                        "Passwords must match."}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register User"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { getSession, signIn } from "next-auth/react";

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
import { toast } from "@/components/ui/sonner";
import { validateSignInInputOnServer } from "@/actions/sign-in";
import { resolveAfterSignIn } from "@/lib/post-sign-in-path";
import { signInFormSchema } from "@/lib/schemas/sign-in";
import { cn } from "@/lib/utils";

function fieldErrorText(
  errors: unknown[] | undefined,
): string | undefined {
  if (!errors?.length) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    return String((first as { message?: string }).message);
  }
  return undefined;
}

export function SignInForm({
  callbackUrl = "/protected",
}: {
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const form = useForm({
    defaultValues: {
      mobileNumber: "",
      password: "",
    },
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: async ({ value }) => {
      const serverParsed = await validateSignInInputOnServer(value);
      if (!serverParsed.success) {
        toast.error("Invalid mobile number or password.");
        return;
      }

      setPending(true);
      try {
        const result = await signIn("credentials", {
          mobileNumber: serverParsed.data.mobileNumber,
          password: serverParsed.data.password,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          toast.error("Invalid mobile number or password.");
          return;
        }

        if (result?.ok) {
          toast.success("Signed in successfully", {
            description: "Redirecting you to your workspace.",
          });
          const session = await getSession();
          const nextPath = resolveAfterSignIn(
            callbackUrl,
            session?.user?.role,
          );
          router.push(nextPath);
          router.refresh();
        }
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/85 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm supports-backdrop-filter:bg-card/80">
      <CardHeader className="space-y-1 pb-2 text-center sm:text-left">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-pretty text-sm">
          Use your mobile number and password to access farmers, lands, and field
          operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          noValidate
        >
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
                  <Label
                    htmlFor="sign-in-mobile"
                    className="text-sm font-medium"
                  >
                    Mobile number
                  </Label>
                  <Input
                    id="sign-in-mobile"
                    name={field.name}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
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

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const err = fieldErrorText(field.state.meta.errors);
              return (
                <div
                  className={cn("space-y-2", isInvalid && "text-destructive")}
                  data-invalid={isInvalid || undefined}
                >
                  <div className="flex items-end justify-between gap-2">
                    <Label
                      htmlFor="sign-in-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      href="#"
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="sign-in-password"
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className={cn(
                        "h-11 min-h-11 rounded-lg pr-12 pl-3 text-base md:h-11 md:text-sm",
                        isInvalid && "border-destructive",
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-e-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                  {isInvalid && err ? (
                    <p className="text-xs text-destructive">{err}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-12 w-full min-h-12 rounded-lg text-base font-medium sm:text-sm"
          >
            {pending ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Need access?{" "}
          <span className="text-foreground/90">
            Ask your organization admin for an invitation.
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

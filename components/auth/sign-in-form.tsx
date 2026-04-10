"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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
import { cn } from "@/lib/utils";

export function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <Card className="w-full max-w-md border-border/60 bg-card/85 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm supports-backdrop-filter:bg-card/80">
      <CardHeader className="space-y-1 pb-2 text-center sm:text-left">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-pretty text-sm">
          Use your work email to access farmers, lands, and field operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="sign-in-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="sign-in-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@organization.com"
              required
              className={cn(
                "h-11 min-h-11 rounded-lg px-3 text-base md:h-11 md:text-sm",
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <Label htmlFor="sign-in-password" className="text-sm font-medium">
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
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className={cn(
                  "h-11 min-h-11 rounded-lg pr-12 pl-3 text-base md:h-11 md:text-sm",
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
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full min-h-12 rounded-lg text-base font-medium sm:text-sm"
          >
            Continue
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

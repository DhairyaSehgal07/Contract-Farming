"use client";

import * as React from "react";

import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors closeButton position="top-center" />
      </ThemeProvider>
    </SessionProvider>
  );
}

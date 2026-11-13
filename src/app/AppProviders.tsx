import type { ReactNode } from "react";
import { Toaster as Notifications } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      {children}
      <Toaster />
      <Notifications position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

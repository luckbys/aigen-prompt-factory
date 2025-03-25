"use client";

import PromptGenerator from "@/components/PromptGenerator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <ThemeProvider defaultTheme="system">
      <main className="min-h-screen">
        <PromptGenerator />
      </main>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
} 
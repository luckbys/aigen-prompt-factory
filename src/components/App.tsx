import React from "react";
import { ThemeProvider } from "./theme-provider";
import PromptGenerator from "./PromptGenerator";
import { Toaster } from "sonner";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <main className="py-8">
          <PromptGenerator />
        </main>
        <footer className="py-4 border-t text-center text-sm text-muted-foreground">
          <div className="container mx-auto">
            <p>© {new Date().getFullYear()} Gerador de Prompts AI - Desenvolvido por <a href="#" className="text-primary hover:underline">Devsible</a></p>
          </div>
        </footer>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
};

export default App; 
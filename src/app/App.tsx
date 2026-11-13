import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import PromptGenerator from "@/features/prompts/components/PromptGenerator";
import { AppProviders } from "./AppProviders";

const GameIdeaWizard = lazy(
  () => import("@/features/game-ideas/components/GameIdeaWizard"),
);

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3"
        >
          Pular para o conteúdo
        </a>
        <div className="min-h-screen bg-background">
          <div className="fixed inset-0 bg-gradient-to-br from-background to-background via-muted/20 -z-10" />
          <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] -z-10" />

          <header className="border-b bg-background/90">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <span className="text-lg font-semibold tracking-tight">
                AIgen<span className="text-teal-700">.</span>
              </span>
              <nav
                aria-label="Ferramentas"
                className="flex flex-wrap gap-1 text-sm"
              >
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 ${isActive ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted"}`
                  }
                >
                  Gerador de prompts
                </NavLink>
                <NavLink
                  to="/ideia-do-jogo"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 ${isActive ? "bg-teal-50 font-medium text-teal-900 dark:bg-teal-950 dark:text-teal-100" : "text-muted-foreground hover:bg-muted"}`
                  }
                >
                  Ideia de jogo
                </NavLink>
              </nav>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="pt-8 pb-16">
            <Suspense
              fallback={
                <p
                  role="status"
                  className="p-8 text-center text-muted-foreground"
                >
                  Carregando…
                </p>
              }
            >
              <Routes>
                <Route path="/" element={<PromptGenerator />} />
                <Route path="/ideia-do-jogo" element={<GameIdeaWizard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          <footer className="border-t border-border/40 py-4 text-xs text-center text-muted-foreground">
            <div className="container mx-auto px-4">
              <p>
                AIgen &copy; {new Date().getFullYear()} · Ideias que ganham
                forma.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

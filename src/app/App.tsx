import React from 'react';
import PromptGenerator from '@/features/prompts/components/PromptGenerator';
import { AppProviders } from './AppProviders';

function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-gradient-to-br from-background to-background via-muted/20 -z-10" />
        <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] -z-10" />
        
        <main className="pt-8 pb-16">
          <PromptGenerator />
        </main>
        
        <footer className="border-t border-border/40 py-4 text-xs text-center text-muted-foreground">
          <div className="container mx-auto px-4">
            <p>Gerador de Prompts IA &copy; {new Date().getFullYear()} - Desenvolvido com ❤️</p>
          </div>
        </footer>
      </div>
    </AppProviders>
  );
}

export default App;

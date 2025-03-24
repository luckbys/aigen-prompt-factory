
import React from "react";
import Navbar from "@/components/Navbar";
import PromptGenerator from "@/components/PromptGenerator";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight flex items-center justify-center">
              <Sparkles className="h-8 w-8 mr-2 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Gerador de Prompt de Sistema
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Crie prompts de sistema eficazes para agentes de IA com este gerador intuitivo.
              Use o Gemini para aprimorar suas instruções e obter os melhores resultados.
            </p>
          </div>
          
          <PromptGenerator />
        </div>
      </main>
      
      <footer className="py-6 border-t border-border mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Desenvolvido para criar prompts de sistema refinados para Inteligência Artificial.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

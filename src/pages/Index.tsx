
import React from "react";
import Navbar from "@/components/Navbar";
import PromptGenerator from "@/components/PromptGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                System Prompt Generator
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create effective system prompts for AI agents with this intuitive generator. 
              Craft the perfect instructions to get the results you want.
            </p>
          </div>
          
          <PromptGenerator />
        </div>
      </main>
      
      <footer className="py-6 border-t border-border mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Designed for crafting refined system prompts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

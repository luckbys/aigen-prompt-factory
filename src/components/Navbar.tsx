
import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  return (
    <nav className={cn("w-full py-4 px-6 backdrop-blur-md bg-background/80 border-b border-border sticky top-0 z-10 animate-fade-in shadow-sm", className)}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-primary/90 flex items-center justify-center mr-2 shadow-sm">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-medium tracking-tight">Gerador de Prompt</h1>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <span className="mr-2">•</span> Prompts de Sistema IA
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  return (
    <nav className={cn("w-full py-4 px-6 backdrop-blur-md bg-background/80 border-b border-border sticky top-0 z-10 animate-fade-in", className)}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
            <div className="text-primary-foreground font-semibold text-lg">P</div>
          </div>
          <h1 className="text-xl font-medium tracking-tight">Gerador de Prompt</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="mr-2">•</span> Prompts de Sistema IA
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

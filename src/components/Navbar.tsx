import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Settings, HelpCircle, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  className?: string;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  className,
  onToggleTheme,
  isDark = false
}) => {
  return (
    <nav className={cn(
      "w-full py-3 px-4 backdrop-blur-md bg-background/80",
      "border-b border-border sticky top-0 z-50",
      "animate-fade-in shadow-sm",
      className
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-9 w-9 rounded-xl bg-primary/90 flex items-center justify-center",
            "shadow-lg shadow-primary/20 animate-pulse-slow"
          )}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight flex items-center gap-2">
              Gerador de Prompt
              <Badge variant="secondary" className="text-xs font-normal">
                Beta
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Crie prompts eficientes para IAs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-9 h-9 p-0"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Ajuda e documentação</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-9 h-9 p-0"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-9 h-9 p-0"
                  onClick={onToggleTheme}
                >
                  {isDark ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Alternar tema</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

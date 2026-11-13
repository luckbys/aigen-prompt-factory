import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HelpCircle, CornerDownRight, Sparkles, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PromptFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  icon?: React.ReactNode;
  className?: string;
  suggestions?: string[];
}

// Função simples para estimar tokens (cerca de 4 caracteres por token)
const estimateTokens = (text: string): number => {
  if (!text) return 0;
  // Uma estimativa simples para inglês/português é ~4 caracteres por token
  return Math.ceil(text.length / 4);
};

const PromptField: React.FC<PromptFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  multiline = false,
  icon,
  className,
  suggestions = [],
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const tokens = estimateTokens(value);
  const isLong = tokens > 250; // Aviso para prompts muito longos
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };
  
  const applySuggestion = (suggestion: string) => {
    onChange(value + (value ? "\n" : "") + suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={cn(
      "space-y-2 group relative",
      "transition-all duration-300",
      "hover:shadow-lg hover:shadow-primary/5",
      "rounded-lg p-3 border border-transparent",
      "hover:border-primary/10 hover:bg-primary/5",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={cn(
              "p-1.5 rounded-md transition-all duration-300",
              "bg-primary/10 group-hover:bg-primary/20",
              "group-focus-within:bg-primary/30",
              "animate-bounce-subtle shadow-inner"
            )}>
              {icon}
            </div>
          )}
          <Label 
            htmlFor={name} 
            className={cn(
              "text-sm font-medium flex items-center gap-2",
              "transition-colors duration-300",
              "group-hover:text-foreground/90",
              "group-focus-within:text-primary"
            )}
          >
            {label}
            {isLong && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] text-yellow-600 border-yellow-400",
                  "animate-pulse-subtle bg-yellow-50"
                )}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Prompt longo
              </Badge>
            )}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {value && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px]",
                "transition-all duration-300",
                "opacity-60 group-hover:opacity-100",
                "bg-primary/10 text-primary"
              )}
            >
              ~{tokens} tokens
            </Badge>
          )}
          
          {helperText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "cursor-help transition-transform duration-300",
                    "hover:scale-110"
                  )}>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className={cn(
                    "max-w-xs backdrop-blur-sm",
                    "animate-in fade-in-0 zoom-in-95",
                    "bg-popover/95 shadow-xl"
                  )}
                >
                  <p className="text-xs">{helperText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="relative">
        {multiline ? (
          <Textarea
            id={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full resize-y min-h-[120px]",
              "glass-input",
              "transition-all duration-300",
              "placeholder:text-muted-foreground/60",
              "rounded-lg shadow-sm",
              "focus:shadow-lg focus:shadow-primary/10",
              isLong && "border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/30",
              "animate-in fade-in-50"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        ) : (
          <Input
            id={name}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full",
              "glass-input",
              "transition-all duration-300",
              "placeholder:text-muted-foreground/60",
              "rounded-lg shadow-sm",
              "focus:shadow-lg focus:shadow-primary/10",
              isLong && "border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/30",
              "animate-in fade-in-50"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
        
        {suggestions.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "absolute right-2 top-2 h-6 text-xs gap-1",
              "opacity-0 group-hover:opacity-70 group-focus-within:opacity-70",
              "hover:opacity-100 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              "bg-background/80 backdrop-blur-sm"
            )}
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Sparkles className="h-3 w-3 animate-pulse-subtle" />
            <span>Sugestões</span>
          </Button>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className={cn(
            "absolute z-10 mt-1 w-full",
            "bg-popover/95 backdrop-blur-sm",
            "rounded-lg shadow-xl border border-border",
            "animate-in fade-in-0 slide-in-from-top-2"
          )}>
            <div className="p-2 text-xs text-muted-foreground border-b border-border/50">
              Sugestões para {label}:
            </div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className={cn(
                    "px-3 py-2 hover:bg-accent/50",
                    "text-sm flex items-start gap-2",
                    "cursor-pointer transition-all duration-150",
                    "animate-fade-up hover:pl-4",
                    "hover:backdrop-blur-lg"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <CornerDownRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <span className="line-clamp-2">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="h-1 flex justify-end">
        {value && value.length > 0 && (
          <span className={cn(
            "text-[10px] text-muted-foreground",
            "transition-colors duration-300",
            value.length > 1000 ? "text-red-500" : "",
            "group-hover:text-foreground/70"
          )}>
            {value.length} caracteres
          </span>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default PromptField;

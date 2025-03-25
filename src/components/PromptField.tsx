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
    setShowSuggestions(false);
  };
  
  const applySuggestion = (suggestion: string) => {
    onChange(value + (value ? "\n" : "") + suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("mb-4 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <Label 
            htmlFor={name} 
            className="text-sm font-medium flex items-center"
          >
            {label}
          </Label>
          
          {isLong && (
            <Badge variant="outline" className="ml-2 text-[10px] text-yellow-600 border-yellow-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Longo
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {value && (
            <Badge variant="secondary" className="text-[10px]">
              ~{tokens} tokens
            </Badge>
          )}
          
          {helperText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
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
              "w-full resize-y min-h-[100px] transition-all duration-200",
              "focus:ring-1 focus:ring-primary/30 focus:border-primary",
              "placeholder:text-muted-foreground/60",
              isLong && "border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/30"
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
              "w-full transition-all duration-200",
              "focus:ring-1 focus:ring-primary/30 focus:border-primary",
              "placeholder:text-muted-foreground/60",
              isLong && "border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/30"
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
        
        {suggestions.length > 0 && isFocused && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-2 h-6 text-xs gap-1 opacity-70 hover:opacity-100"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Sparkles className="h-3 w-3" />
            <span>Sugestões</span>
          </Button>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-popover rounded-md shadow-md border border-border">
            <div className="p-2 text-xs text-muted-foreground">Sugestões para {label}:</div>
            <div className="max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="px-3 py-2 hover:bg-accent text-sm flex items-start gap-2 cursor-pointer"
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
            value.length > 1000 ? "text-red-500" : ""
          )}>
            {value.length} caracteres
          </span>
        )}
      </div>
    </div>
  );
};

export default PromptField;

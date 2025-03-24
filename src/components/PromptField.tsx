
import React from "react";
import { cn } from "@/lib/utils";

interface PromptFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const PromptField: React.FC<PromptFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  helperText,
  multiline = false,
  className,
  icon,
}) => {
  return (
    <div className={cn("mb-6 animate-fade-in", className)}>
      <div className="flex items-center space-x-2 mb-2">
        {icon && (
          <span className="text-primary/80">
            {icon}
          </span>
        )}
        <label 
          htmlFor={name}
          className="text-sm font-medium text-foreground/90 tracking-wide"
        >
          {label}
        </label>
        {helperText && (
          <div className="relative group">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground cursor-help">?</div>
            <div className="absolute left-0 bottom-full mb-2 w-60 p-3 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-border">
              {helperText}
            </div>
          </div>
        )}
      </div>
      
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-lg glass-input resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      ) : (
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg glass-input focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      )}
    </div>
  );
};

export default PromptField;

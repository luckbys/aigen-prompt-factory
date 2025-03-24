
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

interface PromptPreviewProps {
  prompt: string;
  className?: string;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, className }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Prompt copiado para a área de transferência");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Falha ao copiar prompt");
    }
  };

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border bg-card animate-slide-up", className)}>
      <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium">Prompt Gerado</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard}
          className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <div className="p-4 bg-card overflow-auto max-h-96">
        <pre className="text-sm whitespace-pre-wrap font-mono text-card-foreground/90">{prompt}</pre>
      </div>
    </div>
  );
};

export default PromptPreview;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Copy, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className={cn("overflow-hidden border border-primary/10 shadow-md bg-white/90 dark:bg-card/90 animate-slide-up", className)}>
      <CardHeader className="px-4 py-3 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2 text-primary" />
          Prompt Gerado
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard}
          className="h-8 px-3 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 bg-card/50 overflow-auto max-h-[calc(100vh-240px)] min-h-[500px]">
          <pre className="text-sm whitespace-pre-wrap font-mono text-card-foreground/90 leading-relaxed">{prompt}</pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptPreview;

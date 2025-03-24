import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Copy, FileText, Download, Share2, Maximize2, Minimize2, ThumbsUp, Sparkles, SendIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PromptPreviewProps {
  prompt: string;
  className?: string;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, className }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    if (previewRef.current) {
      setScrollable(previewRef.current.scrollHeight > previewRef.current.clientHeight);
    }
  }, [prompt]);

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

  const downloadPrompt = () => {
    const element = document.createElement("a");
    const file = new Blob([prompt], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "prompt-aigen.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Prompt baixado como arquivo de texto");
  };

  const sharePrompt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Prompt AI',
        text: prompt,
      }).then(() => {
        toast.success("Prompt compartilhado com sucesso");
      }).catch((error) => {
        toast.error("Erro ao compartilhar");
      });
    } else {
      copyToClipboard();
      toast.success("Link copiado para compartilhamento");
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast.success("Prompt marcado como favorito");
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const sendToWebhook = async () => {
    const WEBHOOK_URL = "https://integra.devsible.com.br/webhook/resprompt";
    const proxyURL = `https://corsproxy.io/?${encodeURIComponent(WEBHOOK_URL)}`;
    
    setIsSending(true);
    try {
      // Usando um proxy CORS para contornar as restrições
      const response = await fetch(proxyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          timestamp: new Date().toISOString(),
          source: 'aigen-prompt-factory'
        }),
      });
      
      if (response.ok) {
        toast.success("Prompt enviado para processamento com sucesso");
      } else {
        toast.error(`Falha ao enviar: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);
      
      // Tentativa alternativa com no-cors como fallback
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify({ 
            prompt,
            timestamp: new Date().toISOString(),
            source: 'aigen-prompt-factory'
          }),
        });
        
        toast.success("Prompt enviado via método alternativo");
      } catch (fallbackError) {
        console.error('Erro na tentativa alternativa:', fallbackError);
        toast.error("Falha em todas as tentativas de envio. Verifique sua conexão ou tente novamente mais tarde.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "overflow-hidden border border-primary/10 shadow-md bg-white/90 dark:bg-card/90 animate-slide-up transition-all duration-300", 
          expanded ? "fixed inset-4 z-50" : "",
          className
        )}
      >
        <CardHeader className="px-4 py-3 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse-slow" />
            Prompt Gerado
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={sendToWebhook}
                  disabled={isSending || !prompt.trim()}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4 text-blue-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enviar para processamento</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLike}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  <ThumbsUp className={cn("h-4 w-4", liked ? "text-primary fill-primary" : "")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar como favorito</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar para área de transferência</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={downloadPrompt}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Baixar como arquivo de texto</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={sharePrompt}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartilhar prompt</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExpand}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-primary/10"
                >
                  {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{expanded ? "Minimizar" : "Expandir"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          <div 
            ref={previewRef}
            className={cn(
              "p-4 bg-card/50 overflow-auto transition-all",
              expanded ? "max-h-[calc(100vh-150px)]" : "max-h-[calc(100vh-240px)] min-h-[500px]"
            )}
          >
            <pre className="text-sm whitespace-pre-wrap font-mono text-card-foreground/90 leading-relaxed">{prompt}</pre>
          </div>
          {scrollable && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          )}
        </CardContent>
        {expanded && (
          <CardFooter className="p-3 border-t border-border flex justify-between">
            <div className="text-sm text-muted-foreground">
              {prompt.length} caracteres • {prompt.split(/\s+/).length} palavras
              {isSending && <span className="ml-2 animate-pulse">Enviando...</span>}
            </div>
            <div className="flex items-center gap-2">
              {expanded && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sendToWebhook}
                  disabled={isSending || !prompt.trim()}
                  className="hover:scale-105 active:scale-95 transition-all"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4 mr-2 text-blue-500" />
                  )}
                  Enviar para processamento
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={toggleExpand}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Sair da visualização expandida
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default PromptPreview;

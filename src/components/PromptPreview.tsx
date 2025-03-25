import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Send, Copy, Check, Download, ExternalLink, FileJson, Zap, Loader2, Settings, Save, Bug } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendToWebhookProxy, sendToDebugWebhook } from "@/services/proxyService";
import { Switch } from "@/components/ui/switch";

interface PromptPreviewProps {
  prompt: string;
  className?: string;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, className }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");
  const [isExporting, setIsExporting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://devisible-agentegen.wljnsf.easypanel.host/webhook-test/resprompt");
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    toast.success("Prompt copiado para a área de transferência!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadPrompt = () => {
    try {
      setIsExporting(true);
      const element = document.createElement("a");
      const file = new Blob([prompt], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "prompt-" + new Date().toISOString().split("T")[0] + ".txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Prompt baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar o prompt");
      console.error("Erro ao baixar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = () => {
    try {
      setIsExporting(true);
      // Transformar o prompt em um objeto JSON simples
      const promptObj = { prompt, timestamp: new Date().toISOString(), version: "1.0" };
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(promptObj, null, 2)], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = "prompt-" + new Date().toISOString().split("T")[0] + ".json";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Prompt JSON baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar o prompt como JSON");
      console.error("Erro ao baixar JSON:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const saveWebhookConfig = () => {
    // Salvar a URL no localStorage para persistir
    localStorage.setItem("webhook_url", webhookUrl);
    localStorage.setItem("webhook_debug_mode", debugMode.toString());
    toast.success("Configuração do webhook salva!");
    setShowWebhookConfig(false);
  };

  // Carregar a URL do webhook do localStorage quando o componente inicializar
  React.useEffect(() => {
    const savedWebhookUrl = localStorage.getItem("webhook_url");
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
    
    const savedDebugMode = localStorage.getItem("webhook_debug_mode");
    if (savedDebugMode) {
      setDebugMode(savedDebugMode === "true");
    }
  }, []);

  const sendToWebhook = async () => {
    if (!prompt.trim()) {
      toast.error("O prompt está vazio. Gere um prompt antes de enviar.");
      return;
    }
    
    setIsSending(true);
    
    // Criando o payload para o webhook - formato simples
    const payload = {
      prompt: prompt
      // Outros metadados serão adicionados pelo serviço de proxy
    };
    
    try {
      // Se o modo de depuração estiver ativado, enviamos também para o webhook de debug
      if (debugMode) {
        const debugResult = await sendToDebugWebhook(payload);
        if (debugResult.success) {
          console.log("Debug webhook:", debugResult.message);
          // Não mostramos toast para não confundir o usuário,
          // mas registramos no console
        }
      }
      
      // Usar nosso serviço de proxy para enviar ao webhook principal
      const result = await sendToWebhookProxy(webhookUrl, payload);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erro ao enviar prompt:", error);
      toast.error("Não foi possível enviar o prompt. Erro inesperado.");
    } finally {
      setIsSending(false);
    }
  };

  const formatJSON = () => {
    // Transformar o prompt em formato JSON estruturado
    const sections = prompt.split(/\n\n(?=# )/);
    const jsonObj: Record<string, string> = {};
    
    sections.forEach(section => {
      const match = section.match(/^# ([^\n]+)\n([\s\S]+)$/);
      if (match) {
        const [_, title, content] = match;
        jsonObj[title.toLowerCase().replace(/\s+/g, "_")] = content.trim();
      }
    });
    
    return JSON.stringify(jsonObj, null, 2);
  };

  return (
    <Card className={cn(
      "overflow-hidden border border-border/40",
      "backdrop-blur-sm bg-card/95",
      "transition-all duration-300",
      "hover:shadow-lg hover:shadow-primary/5",
      "group",
      className
    )}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "json")}>
        <div className="flex justify-between items-center p-3 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <TabsList className="h-8 p-1 bg-background/50 backdrop-blur-sm">
              <TabsTrigger 
                value="preview" 
                className={cn(
                  "h-6 px-2 text-xs",
                  "data-[state=active]:bg-primary",
                  "data-[state=active]:text-primary-foreground",
                  "transition-all duration-300"
                )}
              >
                Visualização
              </TabsTrigger>
              <TabsTrigger 
                value="json" 
                className={cn(
                  "h-6 px-2 text-xs",
                  "data-[state=active]:bg-primary",
                  "data-[state=active]:text-primary-foreground",
                  "transition-all duration-300"
                )}
              >
                JSON
              </TabsTrigger>
            </TabsList>
            {prompt && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  "bg-background/50 backdrop-blur-sm",
                  "transition-all duration-300",
                  "group-hover:border-primary/30"
                )}
              >
                {prompt.length} caracteres
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                "transition-all duration-300",
                "hover:bg-primary/10 hover:text-primary"
              )}
              title="Copiar"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={activeTab === "json" ? downloadJSON : downloadPrompt}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                "transition-all duration-300",
                "hover:bg-primary/10 hover:text-primary"
              )}
              disabled={isExporting}
              title={activeTab === "json" ? "Baixar JSON" : "Baixar TXT"}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                activeTab === "json" ? (
                  <FileJson className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )
              )}
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <TabsContent value="preview" className="m-0">
            <div className={cn(
              "bg-card p-4 relative",
              "transition-all duration-300",
              "group-hover:bg-primary/5"
            )}>
              <pre className={cn(
                "whitespace-pre-wrap text-sm break-words font-sans",
                "max-h-[calc(100vh-15rem)] overflow-y-auto scrollbar-thin pr-2",
                "transition-colors duration-300"
              )}>
                {prompt || (
                  <span className="text-muted-foreground italic">
                    Seu prompt aparecerá aqui...
                  </span>
                )}
              </pre>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="m-0">
            <div className={cn(
              "bg-card p-4 relative",
              "transition-all duration-300",
              "group-hover:bg-primary/5"
            )}>
              <pre className={cn(
                "whitespace-pre-wrap text-xs break-words font-mono",
                "bg-muted/30 p-3 rounded-lg",
                "max-h-[calc(100vh-15rem)] overflow-y-auto scrollbar-thin",
                "transition-colors duration-300",
                "group-hover:bg-muted/50"
              )}>
                {prompt ? formatJSON() : (
                  <span className="text-muted-foreground italic">
                    JSON será exibido aqui quando você gerar um prompt...
                  </span>
                )}
              </pre>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className={cn(
        "p-3 border-t bg-card/95 backdrop-blur-sm",
        "flex justify-between items-center",
        "transition-all duration-300",
        "group-hover:bg-primary/5"
      )}>
        <span className="text-xs text-muted-foreground">
          {prompt ? (
            "Pronto para usar em qualquer IA"
          ) : (
            "Configure os parâmetros para gerar seu prompt"
          )}
        </span>
        <div className="flex gap-2">
          {/* Dialog para configurar o webhook */}
          <Dialog open={showWebhookConfig} onOpenChange={setShowWebhookConfig}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1 h-8",
                  "transition-all duration-300",
                  "hover:bg-primary/10 hover:text-primary"
                )}
                title="Configurar webhook"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Configurar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-background/95">
              <DialogHeader>
                <DialogTitle>Configuração do Webhook</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="webhook-url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://seu-webhook.com/endpoint"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="debug-mode" className="text-right">
                    Modo Debug
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="debug-mode"
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                    <Label htmlFor="debug-mode" className="text-xs text-muted-foreground">
                      Enviar para webhook de depuração
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={saveWebhookConfig} 
                  className={cn(
                    "gap-1",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90"
                  )}
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://chat.openai.com", "_blank")}
            className={cn(
              "gap-1 h-8",
              "transition-all duration-300",
              "hover:bg-primary/10 hover:text-primary"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Abrir ChatGPT</span>
          </Button>
          <Button
            variant={isSending ? "secondary" : "default"}
            onClick={sendToWebhook}
            disabled={isSending || !prompt}
            size="sm"
            className={cn(
              "gap-1 h-8",
              "bg-gradient-to-r from-primary to-primary/80",
              "hover:opacity-90 transition-opacity",
              "shadow-lg shadow-primary/20"
            )}
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            <span>Enviar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromptPreview;

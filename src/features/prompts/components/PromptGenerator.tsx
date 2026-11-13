import React from "react";
import { FileText, MessageSquare, Bot, GraduationCap, ZapIcon, Palette, LineChart, Search, ShoppingCart, HeadphonesIcon, Star, Target, Shield, ListChecks, Sparkles, RefreshCw, Wand, Eye, CheckCircle2, CopyCheck, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import PromptTips from "./PromptTips";
import { PRESET_TEMPLATES } from "../data/templates";
import { usePromptGenerator } from "../hooks/usePromptGenerator";

interface PromptGeneratorProps {
  className?: string;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ className }) => {
  const { activeTemplate, formState, generatedPrompt, isGenerating, isImproving, isCopied,
    handleTemplateChange, handleInputChange, handleGenerateWithGemini,
    handleImprovePrompt, copyToClipboard, handleApplyTip } = usePromptGenerator();

  const templateIcons: { [key: string]: React.ReactNode } = {
    assistant: <Bot className="h-4 w-4 mr-2" />,
    expert: <GraduationCap className="h-4 w-4 mr-2" />,
    coach: <ZapIcon className="h-4 w-4 mr-2" />,
    creative: <Palette className="h-4 w-4 mr-2" />,
    teacher: <GraduationCap className="h-4 w-4 mr-2" />,
    analista: <LineChart className="h-4 w-4 mr-2" />,
    pesquisador: <Search className="h-4 w-4 mr-2" />,
    vendas: <ShoppingCart className="h-4 w-4 mr-2" />,
    atendimento: <HeadphonesIcon className="h-4 w-4 mr-2" />
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-background to-background/80",
      "relative overflow-hidden",
      className
    )}>
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full animate-pulse-slow opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-primary/5 rounded-full animate-pulse-slow opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-primary/5 rounded-full animate-pulse-slow opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className={cn(
            "text-4xl font-bold mb-2",
            "bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text",
            "animate-fade-up"
          )}>
            Gerador de Prompts AI
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-up delay-100">
            Crie prompts poderosos e eficientes para IAs com nossa ferramenta intuitiva
          </p>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Painel Esquerdo */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card de Modelos */}
            <Card className={cn(
              "overflow-hidden border-primary/10",
              "backdrop-blur-sm bg-background/60",
              "transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5",
              "group"
            )}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary animate-pulse" />
                  Modelos Pré-definidos
                </CardTitle>
                <CardDescription>
                  Escolha um modelo base para começar seu prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      variant={activeTemplate === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTemplateChange(key)}
                      className={cn(
                        "transition-all duration-200",
                        "hover:scale-105 active:scale-95",
                        "relative overflow-hidden",
                        activeTemplate === key && "shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {templateIcons[key] || <Star className="h-4 w-4" />}
                        <span className="truncate">{template.name}</span>
                      </div>
                      {activeTemplate === key && (
                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-grow-width" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campos do Prompt */}
            <div className="space-y-6">
              <PromptField
                label="Papel"
                name="role"
                value={formState.role}
                onChange={(value) => handleInputChange("role", value)}
                multiline
                icon={<Bot className="h-4 w-4" />}
                helperText="Defina o papel ou persona que a IA deve assumir"
              />
              <PromptField
                label="Objetivo"
                name="goal"
                value={formState.goal}
                onChange={(value) => handleInputChange("goal", value)}
                multiline
                icon={<Target className="h-4 w-4" />}
                helperText="Especifique o objetivo principal do prompt"
              />
              <PromptField
                label="Restrições"
                name="constraints"
                value={formState.constraints}
                onChange={(value) => handleInputChange("constraints", value)}
                multiline
                icon={<Shield className="h-4 w-4" />}
                helperText="Liste as limitações e restrições"
              />
              <PromptField
                label="Diretrizes"
                name="guidelines"
                value={formState.guidelines}
                onChange={(value) => handleInputChange("guidelines", value)}
                multiline
                icon={<ListChecks className="h-4 w-4" />}
                helperText="Forneça diretrizes e instruções específicas"
              />
              <PromptField
                label="Formato de Saída"
                name="output"
                value={formState.output}
                onChange={(value) => handleInputChange("output", value)}
                multiline
                icon={<FileText className="h-4 w-4" />}
                helperText="Especifique o formato desejado para a saída"
              />
              <PromptField
                label="Exemplos"
                name="examples"
                value={formState.examples}
                onChange={(value) => handleInputChange("examples", value)}
                multiline
                icon={<MessageSquare className="h-4 w-4" />}
                helperText="Forneça exemplos de interações"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateWithGemini}
                disabled={isGenerating}
                className={cn(
                  "flex-1",
                  "bg-gradient-to-r from-primary to-primary/80",
                  "hover:opacity-90 transition-all",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Gerar com IA
              </Button>
              <Button
                variant="outline"
                onClick={handleImprovePrompt}
                disabled={isImproving || !generatedPrompt}
                className={cn(
                  "flex-1",
                  "hover:border-primary hover:bg-primary/10",
                  "transition-all",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {isImproving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand className="h-4 w-4 mr-2" />
                )}
                Aprimorar
              </Button>
            </div>
          </div>

          {/* Painel Direito */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visualização do Prompt */}
            <Card className={cn(
              "overflow-hidden border-primary/10",
              "backdrop-blur-sm bg-background/60",
              "transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5",
              "sticky top-4"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Visualização do Prompt
                </CardTitle>
                <CardDescription>
                  Veja como seu prompt ficará e faça ajustes conforme necessário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptPreview prompt={generatedPrompt} />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="hover:scale-105 active:scale-95 transition-all"
                >
                  {isCopied ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <CopyCheck className="h-4 w-4 mr-2" />
                  )}
                  {isCopied ? "Copiado!" : "Copiar"}
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-primary to-primary/80",
                    "hover:opacity-90 transition-all",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </CardFooter>
            </Card>

            {/* Dicas de Prompt */}
            <PromptTips onApplyTip={handleApplyTip} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptTipsProps {
  onApplyTip: (tip: string) => void;
  className?: string;
}

const PromptTips: React.FC<PromptTipsProps> = ({ onApplyTip, className }) => {
  const tips = [
    {
      title: "Seja específico",
      description: "Defina claramente o que a IA deve e não deve fazer. Evite instruções vagas.",
      example: "Forneça respostas curtas e diretas. Não use mais de 3 sentenças por resposta."
    },
    {
      title: "Use exemplos",
      description: "Demonstre o comportamento desejado com exemplos concretos.",
      example: "Usuário: Como é o clima hoje?\nAssistente: Em São Paulo, está ensolarado com máxima de 28°C."
    },
    {
      title: "Defina o tom",
      description: "Especifique como a IA deve se comunicar (formal, casual, técnico).",
      example: "Comunique-se de forma casual e amigável, como se estivesse conversando com um amigo."
    },
    {
      title: "Estabeleça limitações",
      description: "Defina claramente o que a IA não deve fazer ou discutir.",
      example: "Não forneça aconselhamento médico ou legal. Sugira consultar profissionais qualificados."
    },
    {
      title: "Estruture a saída",
      description: "Defina como as respostas devem ser formatadas.",
      example: "Estruture suas respostas em tópicos numerados com um resumo no final."
    }
  ];

  return (
    <Card className={cn("border border-primary/10 shadow-md bg-white/90 dark:bg-card/90", className)}>
      <CardHeader className="bg-muted/30 border-b border-border">
        <CardTitle className="text-base font-medium flex items-center">
          <Lightbulb className="h-4 w-4 mr-2 text-primary" />
          Dicas para Prompts Eficazes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="bg-muted/20 p-3 rounded-md border border-border/30">
              <h3 className="font-medium text-sm flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                {tip.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-2">{tip.description}</p>
              <div className="bg-muted/40 p-2 rounded text-xs font-mono border-l-2 border-primary/50">
                {tip.example}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs h-7 hover:bg-primary/10"
                onClick={() => onApplyTip(tip.example)}
              >
                Aplicar exemplo
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTips;

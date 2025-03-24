
import React, { useState, useEffect } from "react";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import PromptTips from "./PromptTips";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  Wand, 
  RefreshCw,
  CheckCircle2,
  Robot,
  Eye,
  Star 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getGeminiSuggestion } from "@/services/geminiService";
import { toast } from "sonner";

interface PromptGeneratorProps {
  className?: string;
}

interface PromptTemplate {
  name: string;
  role: string;
  goal: string;
  constraints: string;
  guidelines: string;
  output: string;
  examples: string;
}

const PRESET_TEMPLATES: { [key: string]: PromptTemplate } = {
  assistant: {
    name: "Assistente Útil",
    role: "Você é um assistente útil, respeitoso e honesto.",
    goal: "Ajudar os usuários a resolverem problemas, responder perguntas e fornecer informações valiosas.",
    constraints: "Não forneça informações prejudiciais, ilegais, antiéticas ou enganosas.",
    guidelines: "Reconheça quando não souber algo em vez de inventar informações. Mantenha as respostas concisas e objetivas.",
    output: "Responda em um tom amigável e conversacional. Use linguagem simples e evite jargões, a menos que o usuário demonstre conhecimento no assunto.",
    examples: "Usuário: Qual é a capital da França?\nAssistente: A capital da França é Paris."
  },
  expert: {
    name: "Especialista no Assunto",
    role: "Você é um especialista em [área] com conhecimento profundo e experiência.",
    goal: "Fornecer conhecimento especializado, insights e conselhos relacionados à sua área de especialização.",
    constraints: "Forneça apenas conselhos dentro da sua área de especialização. Reconheça limitações.",
    guidelines: "Use terminologia específica da área de forma adequada. Apoie afirmações com raciocínio. Cite fontes quando possível.",
    output: "Responda com explicações detalhadas e nuances que demonstrem expertise, mantendo-se acessível.",
    examples: "Usuário: Quais são as melhores práticas para [tópico]?\nEspecialista: Com base em pesquisas recentes e padrões do setor, as melhores práticas para [tópico] incluem..."
  },
  coach: {
    name: "Coach de Apoio",
    role: "Você é um coach de apoio e motivação focado no desenvolvimento pessoal.",
    goal: "Ajudar os usuários a alcançarem seus objetivos, superarem obstáculos e desenvolverem hábitos positivos.",
    constraints: "Não dê conselhos médicos. Concentre-se na motivação e em passos práticos.",
    guidelines: "Faça perguntas esclarecedoras. Forneça etapas acionáveis. Seja encorajador, mas realista.",
    output: "Use linguagem motivacional. Inclua recomendações específicas e alcançáveis. Acompanhe o progresso.",
    examples: "Usuário: Quero começar a me exercitar, mas sempre desisto.\nCoach: Esse é um desafio comum. Vamos dividir isso em etapas menores. Primeiro, que tipo de exercício você mais gosta?"
  },
  creative: {
    name: "Parceiro Criativo",
    role: "Você é um colaborador criativo com ideias imaginativas e sensibilidade artística.",
    goal: "Ajudar os usuários com projetos criativos, gerar ideias e inspirar expressão artística.",
    constraints: "Respeite direitos autorais e propriedade intelectual. Não reivindique a propriedade das ideias.",
    guidelines: "Pergunte sobre visão criativa e objetivos. Desenvolva as ideias do usuário. Forneça opções variadas.",
    output: "Responda com linguagem vívida e descritiva. Ofereça múltiplas alternativas criativas. Seja divertido, mas profissional.",
    examples: "Usuário: Preciso de ideias para uma história de ficção científica ambientada debaixo d'água.\nCriativo: Que tal uma civilização que evoluiu nas profundezas do oceano, desenvolvendo tecnologia bioluminescente em vez de eletrônica?"
  },
  teacher: {
    name: "Professor Educativo",
    role: "Você é um professor paciente e educativo, especializado em explicar conceitos complexos.",
    goal: "Ajudar os usuários a compreenderem melhor tópicos difíceis e expandir seu conhecimento.",
    constraints: "Não faça o trabalho escolar pelo usuário. Em vez disso, oriente-o no processo de aprendizagem.",
    guidelines: "Use analogias e exemplos do mundo real. Adapte explicações ao nível de conhecimento do usuário. Faça perguntas para verificar o entendimento.",
    output: "Explique em etapas claras. Use linguagem acessível. Ofereça recursos adicionais quando relevante.",
    examples: "Usuário: Por que o céu é azul?\nProfessor: O céu aparece azul devido a um fenômeno chamado espalhamento de Rayleigh. Quando a luz solar atinge a atmosfera, as moléculas de ar espalham a luz azul mais do que outras cores porque a luz azul tem comprimentos de onda mais curtos. Imagine jogar muitas bolas pequenas em uma multidão - as bolas menores (luz azul) tendem a ricochetear mais."
  }
};

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ className }) => {
  const [activeTemplate, setActiveTemplate] = useState<string>("assistant");
  const [formState, setFormState] = useState<PromptTemplate>(PRESET_TEMPLATES.assistant);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);

  useEffect(() => {
    generatePrompt();
  }, [formState]);

  const handleTemplateChange = (template: string) => {
    setActiveTemplate(template);
    setFormState(PRESET_TEMPLATES[template]);
  };

  const handleInputChange = (field: keyof PromptTemplate, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePrompt = () => {
    let prompt = "";
    
    if (formState.role) {
      prompt += `# Papel\n${formState.role}\n\n`;
    }
    
    if (formState.goal) {
      prompt += `# Objetivo\n${formState.goal}\n\n`;
    }
    
    if (formState.constraints) {
      prompt += `# Restrições\n${formState.constraints}\n\n`;
    }
    
    if (formState.guidelines) {
      prompt += `# Diretrizes\n${formState.guidelines}\n\n`;
    }
    
    if (formState.output) {
      prompt += `# Formato de Saída\n${formState.output}\n\n`;
    }
    
    if (formState.examples) {
      prompt += `# Exemplos\n${formState.examples}\n\n`;
    }
    
    setGeneratedPrompt(prompt.trim());
  };

  const handleApplyTip = (tip: string) => {
    // Determinar em qual campo aplicar a dica baseado no conteúdo
    if (tip.includes("tom") || tip.includes("comunique")) {
      handleInputChange("output", formState.output + (formState.output ? "\n\n" : "") + tip);
    } else if (tip.includes("exemplo") || tip.includes("Usuário:")) {
      handleInputChange("examples", formState.examples + (formState.examples ? "\n\n" : "") + tip);
    } else if (tip.includes("não deve") || tip.includes("limitação")) {
      handleInputChange("constraints", formState.constraints + (formState.constraints ? "\n\n" : "") + tip);
    } else if (tip.includes("estruture") || tip.includes("formatada")) {
      handleInputChange("output", formState.output + (formState.output ? "\n\n" : "") + tip);
    } else {
      handleInputChange("guidelines", formState.guidelines + (formState.guidelines ? "\n\n" : "") + tip);
    }

    toast.success("Dica aplicada com sucesso!");
  };

  const handleGenerateWithGemini = async () => {
    setIsGenerating(true);
    try {
      // Preparar os campos preenchidos para a geração
      const promptText = Object.entries(formState)
        .filter(([key, value]) => value && key !== 'name')
        .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
        .join("\n\n");

      const suggestion = await getGeminiSuggestion({
        prompt: promptText,
        type: 'generate'
      });

      if (suggestion) {
        setGeneratedPrompt(suggestion);
        toast.success("Prompt gerado com IA!");
      }
    } catch (error) {
      console.error("Erro ao gerar com IA:", error);
      toast.error("Não foi possível gerar o prompt. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprovePrompt = async () => {
    if (!generatedPrompt) {
      toast.error("Gere um prompt primeiro antes de melhorá-lo.");
      return;
    }

    setIsImproving(true);
    try {
      const improvedPrompt = await getGeminiSuggestion({
        prompt: generatedPrompt,
        type: 'improve'
      });

      if (improvedPrompt) {
        setGeneratedPrompt(improvedPrompt);
        toast.success("Prompt aprimorado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao melhorar prompt:", error);
      toast.error("Não foi possível melhorar o prompt. Tente novamente.");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className={cn("container mx-auto px-4 py-4", className)}>
      <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8">
        <div className="w-full md:w-2/5">
          <Card className="mb-8 bg-white/90 dark:bg-card shadow-md border-primary/10 animate-slide-down">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium flex items-center">
                <Star className="h-5 w-5 mr-2 text-primary" />
                Modelos Pré-definidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={activeTemplate === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTemplateChange(key)}
                    className="transition-all duration-200"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel shadow-md border-primary/10 mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Componentes do Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PromptField
                label="Papel"
                name="role"
                value={formState.role}
                onChange={(value) => handleInputChange("role", value)}
                placeholder="Descreva o papel e identidade da IA"
                helperText="Defina quem é a IA e que expertise ela possui"
                icon={<MessageSquare className="h-4 w-4" />}
              />
              
              <PromptField
                label="Objetivo"
                name="goal"
                value={formState.goal}
                onChange={(value) => handleInputChange("goal", value)}
                placeholder="O que a IA deve ajudar a realizar?"
                helperText="O objetivo ou propósito principal da IA"
                icon={<Lightbulb className="h-4 w-4" />}
              />
              
              <PromptField
                label="Restrições"
                name="constraints"
                value={formState.constraints}
                onChange={(value) => handleInputChange("constraints", value)}
                placeholder="Quais limites a IA deve ter?"
                helperText="Limitações, restrições ou limites para a IA"
                multiline
              />
              
              <PromptField
                label="Diretrizes"
                name="guidelines"
                value={formState.guidelines}
                onChange={(value) => handleInputChange("guidelines", value)}
                placeholder="Como a IA deve abordar tarefas?"
                helperText="Instruções sobre metodologia, abordagem ou raciocínio"
                multiline
                icon={<HelpCircle className="h-4 w-4" />}
              />
              
              <PromptField
                label="Formato de Saída"
                name="output"
                value={formState.output}
                onChange={(value) => handleInputChange("output", value)}
                placeholder="Como as respostas devem ser estruturadas?"
                helperText="Instruções sobre estilo, tom e formato das respostas"
                multiline
              />
              
              <PromptField
                label="Exemplos"
                name="examples"
                value={formState.examples}
                onChange={(value) => handleInputChange("examples", value)}
                placeholder="Exemplos de trocas para demonstrar o comportamento desejado"
                helperText="Demonstre com exemplos como a IA deve responder"
                multiline
              />
            </CardContent>
            <CardFooter className="flex justify-center gap-4 border-t border-border p-4">
              <Button 
                onClick={handleGenerateWithGemini} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Robot className="h-4 w-4 mr-2" />
                )}
                Gerar com IA
              </Button>
              <Button 
                variant="outline" 
                onClick={handleImprovePrompt}
                className="w-full"
                disabled={isImproving || !generatedPrompt}
              >
                {isImproving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand className="h-4 w-4 mr-2" />
                )}
                Aprimorar Prompt
              </Button>
            </CardFooter>
          </Card>
          
          <PromptTips onApplyTip={handleApplyTip} className="mb-8" />
        </div>
        
        <div className="w-full md:w-3/5">
          <Card className="mb-6 p-4 bg-white/90 dark:bg-card/90 shadow-md border-primary/10">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium">Visualização do Prompt</h3>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={generatePrompt}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar
                </Button>
                <Button variant="outline" size="sm" onClick={handleImprovePrompt} disabled={isImproving || !generatedPrompt}>
                  {isImproving ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Wand className="h-3 w-3 mr-1" />
                  )}
                  Aprimorar
                </Button>
              </div>
            </div>
          </Card>
          <PromptPreview prompt={generatedPrompt} className="sticky top-24" />
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;

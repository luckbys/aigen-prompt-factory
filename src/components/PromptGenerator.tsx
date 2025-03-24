
import React, { useState, useEffect } from "react";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  }
};

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ className }) => {
  const [activeTemplate, setActiveTemplate] = useState<string>("assistant");
  const [formState, setFormState] = useState<PromptTemplate>(PRESET_TEMPLATES.assistant);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

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

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/2">
          <div className="mb-8 animate-slide-down">
            <h2 className="text-xl font-medium mb-4">Modelos</h2>
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
          </div>

          <div className="p-6 rounded-xl glass-panel">
            <h2 className="text-xl font-medium mb-6">Componentes do Prompt</h2>
            
            <PromptField
              label="Papel"
              name="role"
              value={formState.role}
              onChange={(value) => handleInputChange("role", value)}
              placeholder="Descreva o papel e identidade da IA"
              helperText="Defina quem é a IA e que expertise ela possui"
            />
            
            <PromptField
              label="Objetivo"
              name="goal"
              value={formState.goal}
              onChange={(value) => handleInputChange("goal", value)}
              placeholder="O que a IA deve ajudar a realizar?"
              helperText="O objetivo ou propósito principal da IA"
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
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <PromptPreview prompt={generatedPrompt} className="sticky top-24" />
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;

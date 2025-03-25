import React, { useState, useEffect } from "react";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import PromptTips from "./PromptTips";
import ModelGallery from "./ModelGallery";
import Onboarding from "./Onboarding";
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
  Bot,
  Eye,
  Star,
  CopyCheck,
  Palette,
  GraduationCap,
  LineChart,
  Search,
  ShoppingCart,
  HeadphonesIcon,
  ZapIcon,
  Settings,
  Save,
  Share2,
  Layout,
  LayoutGrid,
  Moon,
  Sun,
  Award,
  BookOpen,
  Grid,
  ListFilter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { getGeminiSuggestion } from "@/services/geminiService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";

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
    role: "Você é um assistente útil, respeitoso e honesto, projetado para fornecer suporte confiável e informações precisas.",
    goal: "Ajudar os usuários a resolverem problemas, responder perguntas e fornecer informações valiosas de maneira eficiente e compreensível.",
    constraints: "Não forneça informações prejudiciais, ilegais, antiéticas ou enganosas. Recuse-se a criar conteúdo que possa prejudicar ou manipular os usuários.",
    guidelines: "Reconheça quando não souber algo em vez de inventar informações. Mantenha as respostas concisas e objetivas. Adapte seu nível de detalhamento com base nas necessidades do usuário.",
    output: "Responda em um tom amigável e conversacional. Use linguagem simples e evite jargões, a menos que o usuário demonstre conhecimento no assunto. Organize respostas complexas em tópicos quando apropriado.",
    examples: "Usuário: Qual é a capital da França?\nAssistente: A capital da França é Paris.\n\nUsuário: Como posso melhorar minha produtividade?\nAssistente: Existem várias estratégias para melhorar a produtividade:\n1. Estabeleça prioridades claras para suas tarefas\n2. Use a técnica Pomodoro (25 minutos de foco, 5 de descanso)\n3. Minimize distrações no seu ambiente de trabalho\n4. Faça pausas regulares para recarregar sua energia mental"
  },
  expert: {
    name: "Especialista no Assunto",
    role: "Você é um especialista em [área] com conhecimento profundo, credenciais relevantes e anos de experiência prática.",
    goal: "Fornecer conhecimento especializado, insights técnicos e conselhos precisos relacionados à sua área de especialização, traduzindo informações complexas em explicações acessíveis.",
    constraints: "Forneça apenas conselhos dentro da sua área de especialização. Reconheça limitações do seu conhecimento e evite generalizações excessivas. Não substitua aconselhamento profissional personalizado.",
    guidelines: "Use terminologia específica da área de forma adequada. Apoie afirmações com raciocínio lógico e evidências. Cite fontes confiáveis quando possível. Considere diferentes perspectivas sobre tópicos controversos.",
    output: "Responda com explicações detalhadas e nuances que demonstrem expertise, mantendo-se acessível. Utilize analogias para conceitos complexos. Estruture informações em níveis de complexidade crescente.",
    examples: "Usuário: Quais são as melhores práticas para segurança cibernética em pequenas empresas?\nEspecialista: Com base nas diretrizes do NIST e minha experiência no setor, recomendo estas práticas essenciais:\n\n1. **Autenticação multifator (MFA)** - Implementação crítica que reduz riscos de invasão em 99%\n2. **Backup regular de dados** - Schedule automático com testes de restauração trimestrais\n3. **Treinamento de funcionários** - Programas trimestrais focados em phishing e engenharia social\n\nPara empresas com menos de 20 funcionários, sugiro priorizar a MFA e backups enquanto estabelece um programa básico de conscientização."
  },
  coach: {
    name: "Coach de Apoio",
    role: "Você é um coach de apoio e motivação com experiência em psicologia positiva, estabelecimento de metas e desenvolvimento pessoal.",
    goal: "Ajudar os usuários a alcançarem seus objetivos, superarem obstáculos internos e externos, e desenvolverem hábitos positivos sustentáveis.",
    constraints: "Não dê conselhos médicos ou psicológicos clínicos. Concentre-se na motivação e em passos práticos. Evite promessas irrealistas de resultados rápidos ou simples.",
    guidelines: "Faça perguntas esclarecedoras que incentivem a autorreflexão. Forneça etapas acionáveis e mensuráveis. Seja encorajador e empático, mas realista. Use a metodologia SMART para definição de metas.",
    output: "Use linguagem motivacional e positiva. Inclua recomendações específicas e alcançáveis com prazos sugeridos. Ofereça técnicas de superação de obstáculos específicos. Sugira métodos de acompanhamento do progresso.",
    examples: "Usuário: Quero começar a me exercitar, mas sempre desisto após algumas semanas.\nCoach: Obrigado por compartilhar esse desafio. Muitas pessoas enfrentam dificuldades semelhantes com consistência. Vamos abordar isso de forma diferente:\n\n1. Que tipo de atividade física você já gostou no passado, mesmo que brevemente?\n2. Em vez de um grande compromisso, poderia começar com apenas 5-10 minutos diários de uma atividade prazerosa?\n3. Vamos identificar seus 'gatilhos de desistência' específicos e criar estratégias para cada um deles.\n\nLembre-se: consistência supera intensidade no início. O objetivo é construir o hábito primeiro, não a performance."
  },
  creative: {
    name: "Parceiro Criativo",
    role: "Você é um colaborador criativo com ideias imaginativas, sensibilidade artística e conhecimento de diversos gêneros, estilos e abordagens criativas.",
    goal: "Ajudar os usuários com projetos criativos, gerar ideias originais e inspirar expressão artística autêntica, expandindo suas possibilidades criativas.",
    constraints: "Respeite direitos autorais e propriedade intelectual. Não reivindique a propriedade das ideias. Evite reproduzir conteúdo de obras específicas protegidas por direitos autorais.",
    guidelines: "Pergunte sobre visão criativa, objetivos e público-alvo. Desenvolva as ideias do usuário em vez de substituí-las. Forneça opções variadas que explorem diferentes direções. Sugira combinações inesperadas e conexões entre conceitos.",
    output: "Responda com linguagem vívida e descritiva. Ofereça múltiplas alternativas criativas com variações. Use detalhes sensoriais e elementos concretos. Seja divertido, inspirador e profissional.",
    examples: "Usuário: Preciso de ideias para uma história de ficção científica ambientada debaixo d'água.\nCriativo: Aqui estão três conceitos que exploram diferentes direções para seu mundo subaquático:\n\n1. **Simbiose Tecnológica**: Uma civilização que desenvolveu biotecnologia avançada baseada em simbiose com criaturas marinhas. Em vez de construírem máquinas, cultivam relações simbióticas com espécies oceânicas modificadas geneticamente. Imagine cidades iluminadas por criaturas bioluminescentes domesticadas e sistemas de comunicação que usam as habilidades telepáticas de cefalópodes.\n\n2. **Arqueologia Submarina**: Exploração de antigas ruínas humanas submersas após uma catástrofe climática. Os protagonistas poderiam ser arqueólogos marinhos descobrindo segredos de nossa própria civilização, revelando que tecnologias avançadas existiram no passado e foram perdidas.\n\n3. **Fronteira da Consciência Coletiva**: Uma sociedade que evoluiu usando correntes oceânicas para transmitir informações bioquímicas, desenvolvendo uma forma de consciência coletiva fluída. A história poderia explorar como um 'indivíduo' nessa sociedade navega entre identidade pessoal e coletiva."
  },
  teacher: {
    name: "Professor Educativo",
    role: "Você é um professor paciente e educativo, especializado em explicar conceitos complexos e adaptando seu ensino ao estilo de aprendizagem do aluno.",
    goal: "Ajudar os usuários a compreenderem melhor tópicos difíceis, expandir seu conhecimento e desenvolver habilidades de pensamento crítico e aprendizado independente.",
    constraints: "Não faça o trabalho escolar pelo usuário. Em vez disso, oriente-o no processo de aprendizagem e desenvolvimento de suas próprias respostas. Não simplifique excessivamente a ponto de perder precisão.",
    guidelines: "Use analogias e exemplos do mundo real relevantes para o contexto do usuário. Adapte explicações ao nível de conhecimento prévio. Faça perguntas socráticas para verificar o entendimento e estimular o pensamento crítico. Relacione novos conceitos com conhecimentos existentes.",
    output: "Explique em etapas claras e lógicas. Use linguagem acessível sem comprometer a precisão. Ofereça recursos adicionais relevantes quando apropriado. Inclua elementos visuais descritivos ou metáforas para conceitos abstratos.",
    examples: "Usuário: Por que o céu é azul?\nProfessor: Vamos explorar esse fenômeno fascinante em etapas:\n\n1. A luz do sol parece branca, mas na verdade contém todas as cores do arco-íris (vermelho, laranja, amarelo, verde, azul, índigo e violeta).\n\n2. Quando essa luz viaja através da atmosfera, ela encontra moléculas de ar (principalmente nitrogênio e oxigênio).\n\n3. Aqui ocorre um fenômeno chamado 'espalhamento de Rayleigh': as moléculas de ar dispersam as cores da luz em diferentes graus, dependendo do comprimento de onda de cada cor.\n\n4. Pense nisso como bolas de diferentes tamanhos sendo jogadas em uma multidão: as bolas menores (luz azul) são mais facilmente redirecionadas em várias direções.\n\nA luz azul tem comprimento de onda mais curto, então é espalhada cerca de 4 vezes mais que a luz vermelha. Essa luz azul espalhada vem de todas as partes do céu, dando-lhe sua cor característica.\n\nPergunta para pensar: Por que você acha que o pôr do sol frequentemente aparece vermelho ou laranja?"
  },
  analista: {
    name: "Analista de Dados",
    role: "Você é um analista de dados experiente com conhecimento profundo em estatística, visualização de dados e interpretação de informações complexas.",
    goal: "Ajudar os usuários a compreender, analisar e interpretar dados, transformando informações brutas em insights acionáveis e conclusões significativas.",
    constraints: "Não tire conclusões definitivas sem dados suficientes. Reconheça limitações metodológicas. Evite interpretações tendenciosas ou politicamente motivadas dos dados.",
    guidelines: "Peça clarificação sobre a natureza e fonte dos dados. Considere possíveis falhas nos dados ou no método de coleta. Explique a diferença entre correlação e causalidade. Sugira visualizações apropriadas para diferentes tipos de dados.",
    output: "Utilize linguagem precisa e técnica quando necessário, mas explique termos especializados. Estruture análises em contexto, método, resultados e limitações. Inclua sugestões para análises complementares quando relevante.",
    examples: "Usuário: O que esses dados de vendas mensais significam para meu negócio?\nAnalista: Analisando seus dados de vendas mensais dos últimos 12 meses, observo alguns padrões significativos:\n\n1. **Tendência sazonal**: Suas vendas aumentam consistentemente 30-40% no período de outubro a dezembro, com queda em janeiro-fevereiro. Isso sugere uma forte correlação com o período de festas.\n\n2. **Crescimento subjacente**: Quando ajustamos para sazonalidade, existe um crescimento constante de aproximadamente 5% trimestre a trimestre, indicando uma tendência positiva além dos picos sazonais.\n\n3. **Anomalias**: Houve uma queda atípica em abril que coincide com problemas técnicos relatados na plataforma de vendas, não parecendo representar uma tendência de demanda.\n\nRecomendo:\n- Planejar estoque e pessoal para o aumento previsto de 35% nas próximas festas\n- Investigar as tácticas implementadas no último trimestre que podem estar contribuindo para o crescimento constante\n\nLimitação: Esta análise não incorpora fatores externos como condições econômicas gerais ou atividades de concorrentes."
  },
  pesquisador: {
    name: "Pesquisador Metódico",
    role: "Você é um pesquisador metódico e objetivo com experiência em avaliar informações, fontes e metodologias de maneira crítica e imparcial.",
    goal: "Fornecer informações equilibradas e bem fundamentadas, explorando diferentes perspectivas e basear conclusões em evidências verificáveis.",
    constraints: "Não apresente opiniões pessoais como fatos. Diferencie claramente entre fatos estabelecidos, consenso científico, teorias em desenvolvimento e especulações. Não simplifique excessivamente questões complexas.",
    guidelines: "Cite fontes confiáveis e atualizadas. Avalie a qualidade das evidências disponíveis. Apresente os principais argumentos de diferentes perspectivas sobre tópicos controversos. Indique claramente quando existem limitações nas informações disponíveis.",
    output: "Organize informações em categorias lógicas. Diferencie entre fatos, consenso de especialistas e pontos de vista. Inclua referências a fontes quando relevante. Mantenha um tom neutro e objetivo.",
    examples: "Usuário: Quais são os efeitos da cafeína na saúde?\nPesquisador: **Efeitos da Cafeína na Saúde: Uma Análise das Evidências Atuais**\n\n**Benefícios com forte evidência científica:**\n- Aumento do estado de alerta e redução da fadiga (meta-análise de 41 estudos, 2020)\n- Melhora no desempenho cognitivo de curto prazo (revisão sistemática, Journal of Psychopharmacology, 2022)\n- Potencial redução do risco de doença de Parkinson (estudo de coorte com 300.000 participantes, 25 anos de acompanhamento)\n\n**Riscos com evidência moderada a forte:**\n- Distúrbios do sono quando consumida até 6 horas antes de dormir (estudo clínico controlado, Journal of Clinical Sleep Medicine)\n- Aumento temporário da pressão arterial, especialmente em pessoas não habituadas (revisão sistemática de 34 estudos, 2019)\n\n**Áreas de incerteza/pesquisa em andamento:**\n- Relação com saúde cardiovascular a longo prazo (estudos mostram resultados mistos)\n- Impacto na densidade óssea (evidências preliminares conflitantes)\n\n**Contexto importante:** A resposta individual à cafeína varia significativamente devido a fatores genéticos que afetam seu metabolismo. O consenso científico atual sugere que consumo moderado (até 400mg/dia para adultos saudáveis) é geralmente seguro para a maioria das pessoas."
  },
  vendas: {
    name: "Agente de Vendas",
    role: "Você é um consultor de vendas especializado, com conhecimento detalhado sobre produtos e serviços, técnicas de persuasão ética e psicologia do consumidor.",
    goal: "Ajudar potenciais clientes a entenderem como os produtos ou serviços podem resolver seus problemas específicos, criar valor e satisfazer suas necessidades, conduzindo-os naturalmente a uma decisão de compra informada.",
    constraints: "Não utilize táticas manipulativas ou enganosas. Não faça promessas irrealistas sobre resultados. Sempre priorize as necessidades reais do cliente acima de metas de vendas. Respeite quando o cliente não demonstrar interesse.",
    guidelines: "Faça perguntas qualificadoras para entender as necessidades específicas do cliente. Personalize suas recomendações com base nas informações coletadas. Articule claramente os benefícios e não apenas os recursos. Antecipe e responda objeções com empatia e provas sociais. Inclua histórias de sucesso relevantes.",
    output: "Comunique-se com confiança e entusiasmo controlado. Use linguagem persuasiva e orientada a benefícios. Inclua chamadas para ação claras e oportunas. Estruture respostas em: compreensão da necessidade, solução proposta, benefícios específicos e próximos passos sugeridos.",
    examples: "Usuário: Estou procurando um software de gestão para minha pequena empresa.\nAgente: Obrigado por compartilhar essa necessidade. Para que eu possa recomendar a solução mais adequada, poderia me contar um pouco mais sobre sua empresa? Quantos funcionários vocês têm e quais são os principais desafios de gestão que enfrentam atualmente?\n\nUsuário: Temos 15 funcionários e nosso maior problema é o controle de estoque e vendas.\nAgente: Entendo perfeitamente. Com 15 funcionários e desafios específicos de controle de estoque e vendas, nosso Sistema Integrado de Gestão Empresarial seria ideal para você. Ele oferece:\n\n1. **Módulo de controle de estoque em tempo real** - Elimina discrepâncias de inventário que costumam causar perdas de 20-30% em pequenas empresas\n\n2. **Dashboard de vendas com métricas personalizáveis** - Permite visualizar tendências e tomar decisões baseadas em dados concretos\n\n3. **Integração entre vendas e estoque** - Atualização automática do inventário a cada venda, evitando vendas de itens indisponíveis\n\nNossos clientes com perfil semelhante ao seu, como a Empresa ABC, relatam economia média de 15 horas semanais em processos administrativos após implementação.\n\nGostaria de agendar uma demonstração personalizada para ver como estas funcionalidades se aplicariam exatamente ao seu contexto?"
  },
  atendimento: {
    name: "Atendimento ao Cliente",
    role: "Você é um especialista em atendimento ao cliente, treinado para proporcionar assistência excepcional, resolver problemas e criar experiências positivas para os clientes.",
    goal: "Resolver as questões, dúvidas ou reclamações dos clientes de maneira eficiente e empática, garantindo sua satisfação e fidelidade, transformando até mesmo experiências negativas em oportunidades de fortalecimento do relacionamento.",
    constraints: "Não transfira responsabilidades ou culpe o cliente. Não faça promessas que não possam ser cumpridas. Nunca comprometa a segurança de dados pessoais. Não seja defensivo ao receber críticas.",
    guidelines: "Pratique escuta ativa para compreender completamente a situação. Demonstre empatia genuína com a frustração ou necessidade do cliente. Apresente soluções claras e objetivas. Assuma propriedade pelo problema até sua resolução. Verifique a satisfação do cliente com a solução proposta. Documente todas as interações para referência futura.",
    output: "Comunique-se com um tom cordial, paciente e profissional. Use linguagem positiva e orientada à solução. Personalize a interação usando o nome do cliente. Estruture respostas em: reconhecimento do problema, solução proposta, verificação de satisfação e próximos passos ou alternativas, se necessário.",
    examples: "Usuário: Meu pedido deveria ter chegado ontem, mas ainda não recebi nada e preciso do produto para amanhã!\nAtendimento: Compreendo sua frustração, Sr. Silva. Atrasos de entrega são realmente inconvenientes, especialmente quando você tem um prazo importante. Vou verificar imediatamente o status do seu pedido #12345.\n\nConsultei nosso sistema e identifico que houve um problema logístico na transportadora. Tenho duas opções para resolver essa situação:\n\n1. Podemos priorizar seu pedido para entrega expressa ainda hoje, sem custo adicional, com previsão de chegada até as 18h.\n\n2. Alternativamente, posso verificar a disponibilidade do produto em nossa loja mais próxima de você para retirada imediata.\n\nQual dessas alternativas melhor atenderia sua necessidade para amanhã? Depois que resolvermos essa questão imediata, gostaria de oferecer um cupom de desconto de 15% para sua próxima compra como uma forma de compensar o inconveniente causado."
  }
};

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ className }) => {
  const [activeTemplate, setActiveTemplate] = useState<string>("assistant");
  const [formState, setFormState] = useState<PromptTemplate>(PRESET_TEMPLATES.assistant);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"split" | "edit" | "preview">("split");
  const [promptCharCount, setPromptCharCount] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [templateView, setTemplateView] = useState<"buttons" | "gallery">("buttons");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    generatePrompt();
  }, [formState]);

  useEffect(() => {
    if (generatedPrompt) {
      setPromptCharCount(generatedPrompt.length);
    }
  }, [generatedPrompt]);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    toast.success("Prompt copiado para a área de transferência!");
    setTimeout(() => setIsCopied(false), 2000);
  };

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleTemplateView = () => {
    setTemplateView(templateView === "buttons" ? "gallery" : "buttons");
  };

  const renderTemplateButtons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 mb-3">
      {Object.entries(PRESET_TEMPLATES).map(([key, template]) => (
        <Button
          key={key}
          variant={activeTemplate === key ? "default" : "outline"}
          size="sm"
          onClick={() => handleTemplateChange(key)}
          className={cn(
            "transition-all duration-200 relative overflow-hidden hover:scale-105 active:scale-95 w-full",
            activeTemplate === key && "shadow-md"
          )}
        >
          {templateIcons[key] || <Star className="h-4 w-4 mr-2" />}
          <span className="truncate">{template.name}</span>
          {activeTemplate === key && (
            <span className="absolute bottom-0 left-0 h-0.5 bg-white w-full animate-grow-width" />
          )}
        </Button>
      ))}
    </div>
  );

  const renderEditor = () => (
    <div className="space-y-6">
      <Card className="bg-white/90 dark:bg-card/90 shadow-md border-primary/10 overflow-hidden group animate-fade-in">
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary group-hover:animate-pulse" />
              Modelos Pré-definidos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {Object.keys(PRESET_TEMPLATES).length} modelos
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTemplateView}
                className="h-8 w-8 p-0"
                title={templateView === "buttons" ? "Ver galeria" : "Ver botões"}
              >
                {templateView === "buttons" ? (
                  <Grid className="h-4 w-4" />
                ) : (
                  <ListFilter className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <CardDescription className="text-muted-foreground text-sm">
            Selecione um modelo como ponto de partida e personalize-o conforme suas necessidades.
          </CardDescription>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full animate-pulse-slow dark:bg-primary/10" />
        </CardHeader>
        <CardContent>
          {templateView === "buttons" ? (
            renderTemplateButtons()
          ) : (
            <ModelGallery
              templates={PRESET_TEMPLATES}
              activeTemplate={activeTemplate}
              onSelectTemplate={handleTemplateChange}
              templateIcons={templateIcons}
            />
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel shadow-md border-primary/10 overflow-hidden relative animate-fade-in-up">
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full opacity-30 dark:bg-primary/10" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Componentes do Prompt
            </CardTitle>
            <Badge variant="secondary" className="text-xs animate-pulse">
              Editando: {activeTemplate ? PRESET_TEMPLATES[activeTemplate].name : "Personalizado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin pr-4">
          <Tabs defaultValue="basic" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-4 space-y-4">
              <PromptField
                label="Papel"
                name="role"
                value={formState.role}
                onChange={(value) => handleInputChange("role", value)}
                placeholder="Descreva o papel e identidade da IA"
                helperText="Defina quem é a IA e que expertise ela possui"
                icon={<MessageSquare className="h-4 w-4 text-primary animate-pulse" />}
              />
              
              <PromptField
                label="Objetivo"
                name="goal"
                value={formState.goal}
                onChange={(value) => handleInputChange("goal", value)}
                placeholder="O que a IA deve ajudar a realizar?"
                helperText="O objetivo ou propósito principal da IA"
                icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
              />
              
              <PromptField
                label="Restrições"
                name="constraints"
                value={formState.constraints}
                onChange={(value) => handleInputChange("constraints", value)}
                placeholder="Quais limites a IA deve ter?"
                helperText="Limitações, restrições ou limites para a IA"
                multiline
                icon={<Settings className="h-4 w-4 text-red-500" />}
              />
            </TabsContent>
            <TabsContent value="advanced" className="mt-4 space-y-4">
              <PromptField
                label="Diretrizes"
                name="guidelines"
                value={formState.guidelines}
                onChange={(value) => handleInputChange("guidelines", value)}
                placeholder="Como a IA deve abordar tarefas?"
                helperText="Instruções sobre metodologia, abordagem ou raciocínio"
                multiline
                icon={<HelpCircle className="h-4 w-4 text-blue-500" />}
              />
              
              <PromptField
                label="Formato de Saída"
                name="output"
                value={formState.output}
                onChange={(value) => handleInputChange("output", value)}
                placeholder="Como as respostas devem ser estruturadas?"
                helperText="Instruções sobre estilo, tom e formato das respostas"
                multiline
                icon={<Palette className="h-4 w-4 text-purple-500" />}
              />
              
              <PromptField
                label="Exemplos"
                name="examples"
                value={formState.examples}
                onChange={(value) => handleInputChange("examples", value)}
                placeholder="Exemplos de trocas para demonstrar o comportamento desejado"
                helperText="Demonstre com exemplos como a IA deve responder"
                multiline
                icon={<Sparkles className="h-4 w-4 text-yellow-500" />}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 border-t border-border p-4">
          <Button 
            onClick={handleGenerateWithGemini} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
            disabled={isGenerating}
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
            className="w-full hover:scale-105 active:scale-95 transition-all"
            disabled={isImproving || !generatedPrompt}
          >
            {isImproving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand className="h-4 w-4 mr-2" />
            )}
            Aprimorar
          </Button>
        </CardFooter>
      </Card>
      
      <PromptTips onApplyTip={handleApplyTip} className="animate-fade-in-up" />
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4 animate-fade-in">
      <Card className="p-4 bg-white/90 dark:bg-card/90 shadow-md border-primary/10 overflow-hidden relative">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium">Visualização do Prompt</h3>
          </div>
          <Badge variant="secondary" className="text-xs ml-2">
            {promptCharCount} caracteres
          </Badge>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="hover:scale-105 active:scale-95 transition-all">
              {isCopied ? (
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <CopyCheck className="h-3 w-3 mr-1" />
              )}
              {isCopied ? "Copiado!" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" onClick={generatePrompt} className="hover:scale-105 active:scale-95 transition-all">
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleImprovePrompt} disabled={isImproving || !generatedPrompt} className="hover:scale-105 active:scale-95 transition-all">
              {isImproving ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Wand className="h-3 w-3 mr-1" />
              )}
              Aprimorar
            </Button>
          </div>
        </div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full animate-pulse-slow dark:bg-primary/10" />
      </Card>
      <div className="animate-fade-in-up">
        <PromptPreview prompt={generatedPrompt} />
      </div>
      <div className="flex justify-end gap-3 mt-4 animate-fade-in-up">
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="hover:scale-105 active:scale-95 transition-all">
          <Save className="h-4 w-4 mr-2" />
          Salvar Prompt
        </Button>
        <Button size="sm" className="hover:scale-105 active:scale-95 transition-all">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("container mx-auto px-4 py-4", className)}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-semibold">Gerador de Prompts AI</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowOnboarding(true)}
            className="gap-1"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Tutorial</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full h-8 w-8"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="inline-flex p-1 rounded-lg bg-muted">
            <Button 
              variant={activeView === "split" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveView("split")}
              className="rounded-md"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dividido</span>
            </Button>
            <Button 
              variant={activeView === "edit" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveView("edit")}
              className="rounded-md"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Editor</span>
            </Button>
            <Button 
              variant={activeView === "preview" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveView("preview")}
              className="rounded-md"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {activeView === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {renderEditor()}
          </div>
          <div className="space-y-4">
            {renderPreview()}
          </div>
        </div>
      ) : activeView === "edit" ? (
        <div className="max-w-2xl mx-auto">
          {renderEditor()}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {renderPreview()}
        </div>
      )}

      <Onboarding 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
        onComplete={() => toast.success("Bem-vindo ao Gerador de Prompts AI!")} 
      />
    </div>
  );
};

export default PromptGenerator;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PromptField from "./PromptField";
import PromptPreview from "./PromptPreview";
import PromptTips from "./PromptTips";
import ModelGallery from "./ModelGallery";
import Onboarding from "./Onboarding";
import Layout from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
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
  LayoutGrid,
  Moon,
  Sun,
  Award,
  BookOpen,
  Grid,
  ListFilter,
  Loader2,
  Target,
  Shield,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  Keyboard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { getGeminiSuggestion } from "@/services/geminiService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  category?: string;
  tags?: string[];
  lastModified?: string;
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

// Definição dos passos
const STEPS = [
  {
    id: 'template',
    title: 'Escolha o Modelo',
    description: 'Selecione um modelo base para seu prompt',
    icon: <Bot className="h-4 w-4" />,
    fields: []
  },
  {
    id: 'role',
    title: 'Defina o Papel',
    description: 'Especifique o papel e expertise da IA',
    icon: <MessageSquare className="h-4 w-4" />,
    fields: ['role']
  },
  {
    id: 'goal',
    title: 'Estabeleça o Objetivo',
    description: 'Defina o propósito e metas',
    icon: <Target className="h-4 w-4" />,
    fields: ['goal']
  },
  {
    id: 'constraints',
    title: 'Configure Restrições',
    description: 'Estabeleça limites e restrições',
    icon: <Shield className="h-4 w-4" />,
    fields: ['constraints']
  },
  {
    id: 'guidelines',
    title: 'Defina Diretrizes',
    description: 'Especifique a abordagem e metodologia',
    icon: <ListChecks className="h-4 w-4" />,
    fields: ['guidelines']
  },
  {
    id: 'output',
    title: 'Formato de Saída',
    description: 'Configure o estilo e estrutura das respostas',
    icon: <Palette className="h-4 w-4" />,
    fields: ['output']
  },
  {
    id: 'examples',
    title: 'Adicione Exemplos',
    description: 'Forneça exemplos de interações',
    icon: <Sparkles className="h-4 w-4" />,
    fields: ['examples']
  },
  {
    id: 'review',
    title: 'Revise e Finalize',
    description: 'Revise e aprimore o prompt final',
    icon: <Eye className="h-4 w-4" />,
    fields: []
  }
];

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
  const [history, setHistory] = useState<Array<PromptTemplate>>([]);
  const [undoStack, setUndoStack] = useState<Array<PromptTemplate>>([]);
  const [redoStack, setRedoStack] = useState<Array<PromptTemplate>>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedState = localStorage.getItem("promptGenerator");
        if (savedState) {
          const { formState: savedFormState, history: savedHistory } = JSON.parse(savedState);
          setFormState(savedFormState);
          setHistory(savedHistory);
        }
      } catch (error) {
        console.error("Erro ao carregar estado:", error);
      }
    };

    loadSavedState();
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const saveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // Auto-save a cada 30 segundos

    return () => clearTimeout(saveTimer);
  }, [formState, autoSaveEnabled]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case '/':
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  useEffect(() => {
    const calculateProgress = () => {
      const totalSteps = STEPS.length;
      const completedCount = completedSteps.size;
      const newProgress = (completedCount / totalSteps) * 100;
      setProgress(newProgress);
    };

    calculateProgress();
  }, [completedSteps]);

  useEffect(() => {
    const step = STEPS[currentStep];
    if (!step) return;

    const isStepComplete = step.fields.every(field => {
      const value = formState[field as keyof PromptTemplate];
      return typeof value === 'string' && value.trim().length > 0;
    });

    if (isStepComplete) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
  }, [formState, currentStep]);

  const handleTemplateChange = useCallback((template: string) => {
    setHistory(prev => [formState, ...prev].slice(0, 50)); // Limitar a 50 entradas
    setUndoStack(prev => [formState, ...prev]);
    setRedoStack([]);
    
    setActiveTemplate(template);
    setFormState(PRESET_TEMPLATES[template]);
  }, [formState]);

  const handleInputChange = useCallback((field: keyof PromptTemplate, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString()
    }));
  }, []);

  const generatePrompt = useCallback(() => {
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
  }, [formState]);

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

  const renderLeftPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-semibold">Gerador de Prompts AI</h1>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full h-8 w-8"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <Card className="bg-white/90 dark:bg-card/90 shadow-md border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Modelos
              </CardTitle>
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

      <div className="space-y-4">
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
      </div>
    </div>
  );

  const renderMainContent = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Desfazer (Ctrl+Z)"
          >
            Desfazer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Refazer (Ctrl+Y)"
          >
            Refazer
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            Salvar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOnboarding(true)}
            className="gap-1"
          >
            <HelpCircle className="h-4 w-4" />
            Tutorial
          </Button>
        </div>
      </div>

      <div className="space-y-4">
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
    </div>
  );

  const renderRightPanel = () => (
    <div className="space-y-4">
      <PromptPreview prompt={generatedPrompt} />
      <PromptTips onApplyTip={handleApplyTip} />
    </div>
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const stateToSave = {
        formState,
        history,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem("promptGenerator", JSON.stringify(stateToSave));
      setLastSaved(new Date());
      toast.success("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[0];
    const newUndoStack = undoStack.slice(1);
    
    setRedoStack(prev => [formState, ...prev]);
    setUndoStack(newUndoStack);
    setFormState(previousState);
    
    toast.info("Ação desfeita");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    
    setUndoStack(prev => [formState, ...prev]);
    setRedoStack(newRedoStack);
    setFormState(nextState);
    
    toast.info("Ação refeita");
  };

  const promptStats = useMemo(() => {
    const words = generatedPrompt.split(/\s+/).length;
    const chars = generatedPrompt.length;
    const lines = generatedPrompt.split('\n').length;
    
    return {
      words,
      chars,
      lines,
      estimatedTokens: Math.ceil(chars / 4)
    };
  }, [generatedPrompt]);

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    
    return (
      <div 
        className={cn(
          "transition-all duration-500 transform",
          "animate-in fade-in-50 slide-in-from-right-5",
          "relative overflow-hidden rounded-lg"
        )}
      >
        {/* Elementos decorativos */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full animate-pulse-slow" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full animate-pulse-slow opacity-30" />
        
        {/* Indicador de progresso circular */}
        <div className={cn(
          "absolute top-4 right-4 w-16 h-16",
          "rounded-full",
          "flex items-center justify-center",
          "transition-all duration-500",
          "group cursor-help",
          "hover:scale-110"
        )}>
          {/* Círculo de fundo com animação de pulso */}
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-primary/5",
            "animate-pulse-slow"
          )} />
          
          {/* Círculo de progresso */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              stroke="var(--primary)"
              fill="none"
              className="opacity-20"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              stroke="var(--primary)"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 28}`,
                strokeDashoffset: `${2 * Math.PI * 28 * (1 - currentStep / (STEPS.length - 1))}`,
              }}
            />
          </svg>
          
          {/* Valor do progresso com animação */}
          <div className={cn(
            "relative z-10 flex flex-col items-center",
            "text-primary font-medium",
            "transition-all duration-300",
            "group-hover:scale-110"
          )}>
            <span className="text-xl">
              {Math.round((currentStep / (STEPS.length - 1)) * 100)}
            </span>
            <span className="text-xs text-primary/70">%</span>
          </div>
          
          {/* Tooltip */}
          <div className={cn(
            "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap",
            "px-3 py-1.5 rounded-lg",
            "bg-popover/95 backdrop-blur-sm",
            "border border-border",
            "text-xs font-medium",
            "opacity-0 translate-y-2",
            "transition-all duration-200",
            "pointer-events-none",
            "group-hover:opacity-100 group-hover:translate-y-0"
          )}>
            {completedSteps.size} de {STEPS.length} etapas concluídas
          </div>
          
          {/* Efeito de brilho */}
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-transparent via-primary/10 to-transparent",
            "animate-shimmer",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300"
          )} />
        </div>
        
        {(() => {
          switch (step.id) {
            case 'template':
              return (
                <div className="space-y-6">
                  <Card className="mb-6 overflow-hidden backdrop-blur-sm bg-background/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary animate-pulse" />
                        Modelos de Prompt
                      </CardTitle>
                      <CardDescription>
                        Escolha um modelo base para começar seu prompt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ModelGallery
                        templates={PRESET_TEMPLATES}
                        activeTemplate={activeTemplate}
                        onSelectTemplate={handleTemplateChange}
                        templateIcons={{
                          assistant: <Bot className="h-4 w-4" />,
                          expert: <GraduationCap className="h-4 w-4" />,
                          analyst: <LineChart className="h-4 w-4" />,
                          teacher: <BookOpen className="h-4 w-4" />,
                          coach: <Target className="h-4 w-4" />,
                          creative: <Sparkles className="h-4 w-4" />,
                          sales: <ShoppingCart className="h-4 w-4" />,
                          support: <HeadphonesIcon className="h-4 w-4" />
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              );
              
            case 'role':
            case 'goal':
            case 'constraints':
            case 'guidelines':
            case 'output':
            case 'examples':
              const fieldConfig = {
                role: {
                  label: "Papel",
                  placeholder: "Descreva o papel e identidade da IA",
                  helperText: "Defina quem é a IA e que expertise ela possui",
                  icon: <MessageSquare className="h-4 w-4 text-primary animate-pulse" />
                },
                goal: {
                  label: "Objetivo",
                  placeholder: "O que a IA deve ajudar a realizar?",
                  helperText: "O objetivo ou propósito principal da IA",
                  icon: <Target className="h-4 w-4 text-amber-500" />
                },
                constraints: {
                  label: "Restrições",
                  placeholder: "Quais limites a IA deve ter?",
                  helperText: "Limitações, restrições ou limites para a IA",
                  icon: <Shield className="h-4 w-4 text-red-500" />
                },
                guidelines: {
                  label: "Diretrizes",
                  placeholder: "Como a IA deve abordar tarefas?",
                  helperText: "Instruções sobre metodologia, abordagem ou raciocínio",
                  icon: <ListChecks className="h-4 w-4 text-blue-500" />
                },
                output: {
                  label: "Formato de Saída",
                  placeholder: "Como as respostas devem ser estruturadas?",
                  helperText: "Instruções sobre estilo, tom e formato das respostas",
                  icon: <Palette className="h-4 w-4 text-purple-500" />
                },
                examples: {
                  label: "Exemplos",
                  placeholder: "Exemplos de trocas para demonstrar o comportamento desejado",
                  helperText: "Demonstre com exemplos como a IA deve responder",
                  icon: <Sparkles className="h-4 w-4 text-yellow-500" />
                }
              };
              
              const config = fieldConfig[step.id as keyof typeof fieldConfig];
              const fieldValue = formState[step.id as keyof PromptTemplate];
              const stringValue = Array.isArray(fieldValue) ? fieldValue.join('\n') : fieldValue || '';
              
              return (
                <div className="space-y-6">
                  <Card className="overflow-hidden backdrop-blur-sm bg-background/60 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <PromptField
                        label={config.label}
                        name={step.id}
                        value={stringValue}
                        onChange={(value) => handleInputChange(step.id as keyof PromptTemplate, value)}
                        placeholder={config.placeholder}
                        helperText={config.helperText}
                        icon={config.icon}
                        multiline
                        className="animate-fade-up"
                      />
                    </CardContent>
                  </Card>
                </div>
              );
              
            case 'review':
              return (
                <div className="space-y-6">
                  <Card className="overflow-hidden backdrop-blur-sm bg-background/60 border-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Visualização Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PromptPreview prompt={generatedPrompt} />
                    </CardContent>
                    <CardFooter className="flex gap-4 justify-end p-6 bg-muted/50">
                      <Button
                        variant="outline"
                        onClick={handleImprovePrompt}
                        disabled={isImproving || !generatedPrompt}
                        className="gap-2 transition-all hover:scale-105 active:scale-95 hover:border-primary"
                      >
                        {isImproving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand className="h-4 w-4" />
                        )}
                        Aprimorar
                      </Button>
                      
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2 transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-primary/80"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Salvar
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
              
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6 relative">
        {/* Linha de progresso no fundo */}
        <div className="absolute h-0.5 bg-muted w-full max-w-[80%] top-1/2 -translate-y-1/2" />
        <div 
          className="absolute h-0.5 bg-primary transition-all duration-500" 
          style={{ 
            width: `${progress}%`,
            maxWidth: '80%',
            top: '50%',
            transform: 'translateY(-50%)'
          }} 
        />
      </div>
    );
  };

  const FeatureSection = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-3xl border bg-background p-2",
        "before:absolute before:inset-0 before:-translate-y-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}>
        <div className="relative h-full w-full rounded-2xl bg-gradient-to-b from-muted/50 to-muted p-6">
          {children}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -z-10 inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    );
  };

  const FeatureCard = ({ title, description, icon, children }: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    return (
      <div className="group relative overflow-hidden rounded-lg border bg-background p-1">
        <div className="relative h-full w-full rounded-[7px] bg-gradient-to-b from-muted/50 to-muted p-5">
          <div className="mb-4 flex items-center gap-2">
            {icon && (
              <div className={cn(
                "p-1.5 rounded-md transition-all duration-300",
                "bg-primary/10 group-hover:bg-primary/20",
                "group-hover:scale-110 group-hover:rotate-3"
              )}>
                {icon}
              </div>
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {description && (
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-lg transition-opacity opacity-0 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-xl" />
        </div>
      </div>
    );
  };

  const ProgressIndicator = ({ progress, currentStep, totalSteps, completedSteps }: {
    progress: number;
    currentStep: number;
    totalSteps: number;
    completedSteps: Set<number>;
  }) => {
    return (
      <div className="space-y-6">
        {/* Barra de Progresso Principal */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                "transition-colors duration-300",
                progress === 100 
                  ? "bg-green-500 animate-pulse" 
                  : "bg-primary"
              )} />
              <span className="text-sm text-muted-foreground">
                {progress === 100 ? "Prompt concluído!" : "Em progresso"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
                {Math.round(progress)}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({completedSteps.size}/{totalSteps} etapas)
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={progress} 
              className={cn(
                "h-2",
                progress === 100 && "animate-progressPulse"
              )} 
            />
            
            {/* Marcadores de etapas */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1 pointer-events-none">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepProgress = ((index + 1) / totalSteps) * 100;
                const isCompleted = progress >= stepProgress;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-3 w-3 rounded-full border-2",
                      "transition-all duration-300",
                      isCompleted 
                        ? "border-primary bg-primary scale-100" 
                        : "border-muted-foreground/30 bg-background scale-75"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicador de Progresso Circular */}
        <div className={cn(
          "absolute top-4 right-4 w-16 h-16",
          "rounded-full",
          "flex items-center justify-center",
          "transition-all duration-500",
          "group cursor-help",
          "hover:scale-110"
        )}>
          {/* Círculo de fundo com animação de pulso */}
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-primary/5",
            "animate-pulse-slow"
          )} />
          
          {/* Círculo de progresso */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              stroke="var(--primary)"
              fill="none"
              className="opacity-20"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              strokeWidth="3"
              stroke="var(--primary)"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                strokeDasharray: `${2 * Math.PI * 28}`,
                strokeDashoffset: `${2 * Math.PI * 28 * (1 - currentStep / (totalSteps - 1))}`,
              }}
            />
          </svg>
          
          {/* Valor do progresso com animação */}
          <div className={cn(
            "relative z-10 flex flex-col items-center",
            "text-primary font-medium",
            "transition-all duration-300",
            "group-hover:scale-110"
          )}>
            <span className="text-xl">
              {Math.round(progress)}
            </span>
            <span className="text-xs text-primary/70">%</span>
          </div>
          
          {/* Tooltip */}
          <div className={cn(
            "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap",
            "px-3 py-1.5 rounded-lg",
            "bg-popover/95 backdrop-blur-sm",
            "border border-border",
            "text-xs font-medium",
            "opacity-0 translate-y-2",
            "transition-all duration-200",
            "pointer-events-none",
            "group-hover:opacity-100 group-hover:translate-y-0"
          )}>
            {completedSteps.size} de {totalSteps} etapas concluídas
          </div>
          
          {/* Efeito de brilho */}
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-transparent via-primary/10 to-transparent",
            "animate-shimmer",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300"
          )} />
        </div>
      </div>
    );
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
      
      <Layout
        leftPanel={renderLeftPanel()}
        rightPanel={renderRightPanel()}
        progress={progress}
      >
        <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 relative">
          <ProgressIndicator 
            progress={progress}
            currentStep={currentStep}
            totalSteps={STEPS.length}
            completedSteps={completedSteps}
          />

          {/* Indicadores de Passo */}
          {renderStepIndicator()}

          {/* Navegação entre Passos */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className={cn(
                "gap-2 transition-all duration-300",
                "hover:border-primary hover:-translate-x-1",
                "group relative overflow-hidden",
                currentStep === 0 ? "opacity-50" : "hover:border-primary"
              )}
            >
              <ChevronLeft className="h-4 w-4 group-hover:animate-bounce-subtle" />
              <span className="relative z-10">Anterior</span>
              {/* Efeito de hover */}
              <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Button>
            
            <span className="text-sm font-medium">
              Passo {currentStep + 1} de {STEPS.length}
            </span>
            
            <Button
              onClick={handleNextStep}
              disabled={currentStep === STEPS.length - 1 || !completedSteps.has(currentStep)}
              className={cn(
                "gap-2 transition-all duration-300",
                "hover:translate-x-1",
                "group relative overflow-hidden",
                (currentStep === STEPS.length - 1 || !completedSteps.has(currentStep)) ? 
                "opacity-50" : 
                "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
              )}
            >
              <span className="relative z-10">Próximo</span>
              <ChevronRight className="h-4 w-4 group-hover:animate-bounce-subtle" />
              {/* Efeito de hover */}
              <div className="absolute inset-0 bg-white/10 translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Button>
          </div>

          {/* Título e Descrição do Passo Atual */}
          <div className="text-center space-y-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "p-3 rounded-full transition-all duration-300",
                "bg-gradient-to-br",
                completedSteps.has(currentStep) ? 
                  "from-primary/30 to-primary/10" : 
                  "from-muted to-muted/50",
                "animate-bounce-subtle shadow-lg"
              )}>
                {STEPS[currentStep].icon}
              </div>
              <h2 className={cn(
                "text-3xl font-semibold",
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-foreground to-foreground/80",
                "animate-fade-up"
              )}>
                {STEPS[currentStep].title}
              </h2>
            </div>
            <p className={cn(
              "text-muted-foreground text-lg max-w-2xl mx-auto",
              "animate-fade-up",
              "opacity-0 animate-in fade-in-50 duration-500 delay-200"
            )}>
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* Conteúdo do Passo Atual */}
          <div className="max-w-3xl mx-auto">
            {renderStepContent()}
          </div>

          {/* Dicas e Sugestões */}
          {currentStep < STEPS.length - 1 && (
            <div className="mt-8 text-center">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-muted/50 backdrop-blur-sm",
                "text-sm text-muted-foreground",
                "animate-pulse-subtle",
                "shadow-lg border border-border/50",
                "transition-all duration-300 hover:scale-105"
              )}>
                {completedSteps.has(currentStep) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-transparent bg-clip-text">
                      Passo concluído! Você pode avançar para o próximo.
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                      Preencha o campo acima para avançar para o próximo passo.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
      
      <Onboarding 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding} 
        onComplete={() => toast.success("Bem-vindo ao Gerador de Prompts AI!")} 
      />

      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm bg-background/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Atalhos do Teclado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm font-medium">Ctrl/⌘ + S</div>
              <div className="text-sm text-muted-foreground">Salvar alterações</div>
              
              <div className="text-sm font-medium">Ctrl/⌘ + Z</div>
              <div className="text-sm text-muted-foreground">Desfazer</div>
              
              <div className="text-sm font-medium">Ctrl/⌘ + Shift + Z</div>
              <div className="text-sm text-muted-foreground">Refazer</div>
              
              <div className="text-sm font-medium">Ctrl/⌘ + Y</div>
              <div className="text-sm text-muted-foreground">Refazer (alternativo)</div>
              
              <div className="text-sm font-medium">Ctrl/⌘ + /</div>
              <div className="text-sm text-muted-foreground">Mostrar atalhos</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptGenerator;

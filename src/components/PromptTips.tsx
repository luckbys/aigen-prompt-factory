import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { 
  Lightbulb, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ListFilter, 
  Star, 
  StarHalf, 
  Filter, 
  Sparkles,
  ThumbsUp,
  Bookmark,
  MessageCircle,
  LayoutGrid,
  CheckCircle,
  BrainCircuit,
  RefreshCw
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGeminiTips } from "@/services/geminiService";
import { toast } from "sonner";

interface PromptTipsProps {
  onApplyTip: (tip: string) => void;
  className?: string;
}

interface Tip {
  id: string;
  text: string;
  category: 'constraints' | 'guidelines' | 'output' | 'examples';
  tags: string[];
  popularity?: number; // De 0 a 5, onde 5 é o mais popular
  useCount?: number; // Número de vezes que a dica foi aplicada
  isNew?: boolean; // Indica se é uma nova dica
}

const DEFAULT_PROMPT_TIPS: Tip[] = [
  {
    id: "1",
    text: "Mantenha um tom profissional e objetivo ao discutir tópicos técnicos.",
    category: "output",
    tags: ["tom", "estilo"],
    popularity: 4.7,
    useCount: 342,
    isNew: false
  },
  {
    id: "2",
    text: "Não deve fornecer conselhos médicos, jurídicos ou financeiros específicos sem qualificações adequadas.",
    category: "constraints",
    tags: ["limitações", "segurança"],
    popularity: 4.9,
    useCount: 568,
    isNew: false
  },
  {
    id: "3",
    text: "Inclua analogias para explicar conceitos complexos de maneira mais acessível.",
    category: "guidelines",
    tags: ["explicação", "clareza"],
    popularity: 4.5,
    useCount: 287,
    isNew: false
  },
  {
    id: "4",
    text: "Estruture respostas longas em seções com subtítulos para facilitar a leitura.",
    category: "output",
    tags: ["formato", "organização"],
    popularity: 4.6,
    useCount: 412,
    isNew: false
  },
  {
    id: "5",
    text: "Usuário: Quais são as melhores práticas para lidar com depressão?\nAssistente: Entendo que este é um tópico importante. Embora eu possa compartilhar informações gerais sobre saúde mental baseadas em pesquisas, é essencial consultar um profissional de saúde qualificado para orientação personalizada. Aqui estão algumas estratégias geralmente recomendadas:\n\n1. Buscar ajuda profissional (psicólogo, psiquiatra)\n2. Manter rotinas de sono regulares\n3. Praticar exercícios físicos regularmente\n4. Cultivar conexões sociais\n5. Aprender técnicas de gerenciamento de estresse\n\nEstas são apenas informações gerais. Você já conversou com um profissional de saúde sobre isso?",
    category: "examples",
    tags: ["exemplo", "saúde mental"],
    popularity: 4.3,
    useCount: 156,
    isNew: false
  },
  {
    id: "6",
    text: "Use linguagem simples e evite jargões, exceto quando o usuário demonstrar familiaridade com o tópico.",
    category: "guidelines",
    tags: ["acessibilidade", "clareza"],
    popularity: 4.8,
    useCount: 498,
    isNew: false
  },
  {
    id: "7",
    text: "Reconheça abertamente quando não tiver informações suficientes ou quando um tópico estiver fora do seu escopo de conhecimento.",
    category: "constraints",
    tags: ["limitações", "honestidade"],
    popularity: 4.9,
    useCount: 523,
    isNew: false
  },
  {
    id: "8",
    text: "Forneça diferentes níveis de detalhamento, começando com uma visão geral simples antes de aprofundar em detalhes técnicos.",
    category: "output",
    tags: ["formato", "organização"],
    popularity: 4.4,
    useCount: 267,
    isNew: true
  },
  {
    id: "9",
    text: "Usuário: Como posso otimizar meu site para SEO?\nAssistente: Existem várias estratégias para melhorar o SEO do seu site:\n\n**Fundamentos técnicos:**\n- Otimize a velocidade de carregamento da página\n- Garanta que seu site seja responsivo para dispositivos móveis\n- Implemente URLs amigáveis e estrutura lógica\n\n**Conteúdo:**\n- Crie conteúdo valioso e original focado em palavras-chave relevantes\n- Otimize títulos, meta descrições e tags de cabeçalho\n- Use texto alternativo em imagens\n\n**Autoridade:**\n- Construa backlinks de qualidade\n- Mantenha presença ativa em redes sociais\n- Atualize conteúdo regularmente\n\nGostaria que eu detalhasse alguma dessas estratégias específicas?",
    category: "examples",
    tags: ["exemplo", "marketing"],
    popularity: 4.5,
    useCount: 328,
    isNew: true
  },
  {
    id: "10",
    text: "Ao discutir tópicos controversos, apresente múltiplas perspectivas de forma equilibrada.",
    category: "guidelines",
    tags: ["imparcialidade", "abordagem"],
    popularity: 4.7,
    useCount: 376,
    isNew: false
  }
];

const categoryLabels = {
  constraints: "Restrições",
  guidelines: "Diretrizes",
  output: "Formato",
  examples: "Exemplos"
};

const categoryIcons = {
  constraints: <Filter className="h-4 w-4" />,
  guidelines: <MessageCircle className="h-4 w-4" />,
  output: <LayoutGrid className="h-4 w-4" />,
  examples: <Bookmark className="h-4 w-4" />
};

const PromptTips: React.FC<PromptTipsProps> = ({ onApplyTip, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "compact">("list");
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const [appliedTips, setAppliedTips] = useState<Record<string, boolean>>({});
  const [promptTips, setPromptTips] = useState<Tip[]>(DEFAULT_PROMPT_TIPS);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const tipContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Resetar a seleção quando o filtro muda
    setSelectedTip(null);
  }, [filter]);

  const handleApplyTip = (tip: Tip) => {
    onApplyTip(tip.text);
    setAppliedTips(prev => ({ ...prev, [tip.id]: true }));
    
    // Simular incremento de contador de uso (em uma app real isso seria persistido)
    tip.useCount = (tip.useCount || 0) + 1;
  };
  
  const filteredTips = filter === "all" 
    ? promptTips 
    : filter === "popular"
      ? [...promptTips].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5)
      : filter === "new"
        ? promptTips.filter(tip => tip.isNew)
        : promptTips.filter(tip => tip.category === filter || tip.tags.includes(filter));

  const handleGenerateTips = async () => {
    setIsGeneratingTips(true);
    
    try {
      // Determinar a categoria para a geração
      const category = selectedCategory === "all" ? undefined : 
        (selectedCategory === "popular" || selectedCategory === "new") ? undefined :
        selectedCategory as 'constraints' | 'guidelines' | 'output' | 'examples';
      
      // Gerar 3 novas dicas
      const newTips = await getGeminiTips({ 
        category, 
        count: 3 
      });
      
      if (newTips && newTips.length > 0) {
        // Adicionar as novas dicas ao início da lista
        setPromptTips(prev => [...newTips, ...prev]);
        toast.success(`${newTips.length} novas dicas geradas com sucesso!`);
        
        // Expandir o painel para mostrar as novas dicas
        setIsExpanded(true);
        
        // Definir o filtro para "new" para mostrar apenas as novas dicas
        setFilter("new");
      } else {
        toast.error("Não foi possível gerar novas dicas. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar dicas:", error);
      toast.error("Erro ao gerar dicas. Tente novamente mais tarde.");
    } finally {
      setIsGeneratingTips(false);
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-muted-foreground/30" />);
      }
    }
    
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const renderListView = (tip: Tip) => (
    <div
      key={tip.id}
      className={cn(
        "p-3 rounded-lg border transition-all hover:shadow-sm",
        selectedTip === tip.id ? "bg-primary/5 border-primary/30" : "bg-background border-border/50",
        appliedTips[tip.id] ? "border-green-500/30 bg-green-50/30 dark:bg-green-900/10" : ""
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1 rounded-full",
              selectedTip === tip.id ? "bg-primary/20" : "bg-primary/10"
            )}>
              {categoryIcons[tip.category] || <Lightbulb className="h-3.5 w-3.5 text-primary" />}
            </div>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
              {categoryLabels[tip.category]}
            </Badge>
            {tip.isNew && (
              <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-blue-500/10 text-blue-600 border-blue-200">
                Novo
              </Badge>
            )}
            
            {appliedTips[tip.id] && (
              <span className="flex items-center text-green-600 text-xs gap-0.5">
                <CheckCircle className="h-3 w-3" />
                <span>Aplicado</span>
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-sm mb-2",
            tip.category === "examples" ? "line-clamp-3" : "line-clamp-2"
          )}>
            {tip.text}
          </p>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {tip.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => setFilter(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0.5">
                  <ThumbsUp className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-muted-foreground">{tip.useCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>Aplicado {tip.useCount} vezes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleApplyTip(tip)}
            className="h-7 text-xs gap-1 mt-1"
          >
            <Plus className="h-3 w-3" />
            <span>Aplicar</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderGridView = (tip: Tip) => (
    <div
      key={tip.id}
      className={cn(
        "rounded-lg border p-3 transition-all hover:shadow-sm flex flex-col h-full",
        selectedTip === tip.id ? "bg-primary/5 border-primary/30" : "bg-card border-border/50",
        appliedTips[tip.id] ? "border-green-500/30 bg-green-50/30 dark:bg-green-900/10" : ""
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {categoryLabels[tip.category]}
        </Badge>
        
        {tip.isNew && (
          <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 border-blue-200">
            Novo
          </Badge>
        )}
      </div>
      
      <div className="flex-1">
        <p className={cn(
          "text-sm mb-3",
          tip.category === "examples" ? "line-clamp-4" : "line-clamp-3"
        )}>
          {tip.text}
        </p>
      </div>
      
      <div className="mt-auto pt-2 border-t flex items-center justify-between">
        <div className="flex items-center gap-1">
          {renderStars(tip.popularity)}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleApplyTip(tip)}
          className="h-7 text-xs gap-1 hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          <span>Aplicar</span>
        </Button>
      </div>
    </div>
  );

  const renderCompactView = (tip: Tip) => (
    <div
      key={tip.id}
      className={cn(
        "flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-muted/30 transition-colors",
        appliedTips[tip.id] && "bg-green-50/30 dark:bg-green-900/10"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-full bg-primary/10">
          {categoryIcons[tip.category] || <Lightbulb className="h-3 w-3 text-primary" />}
        </div>
        <span className="text-xs line-clamp-1">{tip.text.substring(0, 50)}...</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleApplyTip(tip)}
        className="h-6 w-6 p-0 rounded-full"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );

  const renderExpandedContent = () => (
    <CardContent className="p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap gap-1">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("all");
              setSelectedCategory("all");
            }}
            className="h-7 text-xs gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Todas</span>
          </Button>
          
          <Button
            variant={filter === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("popular");
              setSelectedCategory("popular");
            }}
            className="h-7 text-xs gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            <span>Populares</span>
          </Button>
          
          <Button
            variant={filter === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("new");
              setSelectedCategory("new");
            }}
            className="h-7 text-xs gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Novas</span>
          </Button>
          
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilter(key);
                setSelectedCategory(key);
              }}
              className="h-7 text-xs gap-1"
            >
              {categoryIcons[key as keyof typeof categoryIcons]}
              <span>{label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateTips}
            disabled={isGeneratingTips}
            className="h-7 text-xs gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            title="Gerar novas dicas com IA"
          >
            {isGeneratingTips ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BrainCircuit className="h-3.5 w-3.5" />
            )}
            <span className="sm:inline">Gerar Dicas</span>
          </Button>
          
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-7 w-7 p-0"
            title="Visualização em lista"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 w-7 p-0"
            title="Visualização em grid"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant={viewMode === "compact" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className="h-7 w-7 p-0"
            title="Visualização compacta"
          >
            <ListFilter className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div
        ref={tipContentRef}
        className="mt-3"
      >
        {filteredTips.length > 0 ? (
          <div className={cn(
            viewMode === "grid" && "grid grid-cols-1 sm:grid-cols-2 gap-3",
            viewMode === "list" && "space-y-3",
            viewMode === "compact" && "border rounded-lg overflow-hidden"
          )}>
            {filteredTips.map(tip => (
              viewMode === "grid" 
                ? renderGridView(tip)
                : viewMode === "compact"
                  ? renderCompactView(tip)
                  : renderListView(tip)
            ))}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <Lightbulb className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-3">Nenhuma dica encontrada com os filtros atuais.</p>
            <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  );

  const renderCompactContent = () => (
    <CardContent className="pt-0 pb-3 pl-4 pr-3">
      <ScrollArea className="h-16 overflow-y-auto">
        <div className="space-y-1.5">
          {promptTips.slice(0, 3).map((tip) => (
            <div key={tip.id} className="flex items-center justify-between group">
              <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                • {tip.text.length > 60 ? tip.text.substring(0, 60) + "..." : tip.text}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleApplyTip(tip);
                  setSelectedTip(tip.id);
                }}
                className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="flex justify-between items-center mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateTips}
          disabled={isGeneratingTips}
          className="h-7 text-xs gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          {isGeneratingTips ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <BrainCircuit className="h-3 w-3" />
          )}
          <span>Gerar Dicas</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="h-7 text-xs gap-1"
        >
          <span>Ver todas</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  );

  return (
    <Card 
      className={cn(
        "overflow-hidden relative border-primary/10 shadow-sm animate-fade-in",
        className
      )}
    >
      <CardHeader className="pb-3 relative flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            Dicas de Prompt
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Sugestões para aprimorar seu prompt e obter melhores resultados
          </CardDescription>
        </div>
        
        <Button
          variant={isExpanded ? "outline" : "ghost"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-0 h-8 w-8 transition-all",
            isExpanded && "rotate-180"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      {isExpanded ? (
        <>
          {renderExpandedContent()}
          <CardFooter className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {filteredTips.length} dicas disponíveis. Selecione uma para aplicar ao seu prompt.
            </p>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-7 text-xs gap-1"
            >
              <ChevronUp className="h-3 w-3" />
              <span>Recolher</span>
            </Button>
          </CardFooter>
        </>
      ) : (
        renderCompactContent()
      )}
    </Card>
  );
};

export default PromptTips;

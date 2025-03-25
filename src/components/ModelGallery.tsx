import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ModelCard from "./ModelCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptTemplate {
  name: string;
  role: string;
  goal: string;
  constraints: string;
  guidelines: string;
  output: string;
  examples: string;
}

interface ModelGalleryProps {
  templates: Record<string, PromptTemplate>;
  activeTemplate: string;
  onSelectTemplate: (key: string) => void;
  className?: string;
  templateIcons?: Record<string, React.ReactNode>;
}

// Categorias fictícias para os modelos - isso poderia vir de outra fonte
const MODEL_CATEGORIES: Record<string, string> = {
  assistant: "Assistência",
  expert: "Especialista",
  coach: "Coaching",
  creative: "Criatividade",
  teacher: "Educação",
  analista: "Análise",
  pesquisador: "Pesquisa",
  vendas: "Vendas",
  atendimento: "Atendimento"
};

// Ratings fictícios - isso poderia vir de feedbacks ou popularidade
const MODEL_RATINGS: Record<string, number> = {
  assistant: 4.8,
  expert: 4.6,
  coach: 4.3,
  creative: 4.7,
  teacher: 4.5,
  analista: 4.2,
  pesquisador: 4.4,
  vendas: 4.0,
  atendimento: 4.1
};

const ModelGallery: React.FC<ModelGalleryProps> = ({
  templates,
  activeTemplate,
  onSelectTemplate,
  className,
  templateIcons = {}
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Filtrar templates baseados na busca e categoria
  const filteredTemplates = Object.entries(templates).filter(([key, template]) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.goal.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === "all" || 
      MODEL_CATEGORIES[key] === categoryFilter;
      
    return matchesSearch && matchesCategory;
  });
  
  // Extrair todas as categorias únicas
  const uniqueCategories = Array.from(
    new Set(Object.keys(MODEL_CATEGORIES).map(key => MODEL_CATEGORIES[key]))
  ).sort();

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0 rounded-full"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {categoryFilter !== "all" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-2"
              onClick={() => setCategoryFilter("all")}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
      
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(([key, template]) => (
            <ModelCard
              key={key}
              name={template.name}
              role={template.role}
              goal={template.goal}
              icon={templateIcons[key]}
              category={MODEL_CATEGORIES[key] || "Outro"}
              rating={MODEL_RATINGS[key] || 3.5}
              onSelect={() => onSelectTemplate(key)}
              isSelected={key === activeTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/30">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">Nenhum modelo encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Não encontramos nenhum modelo correspondente aos filtros aplicados.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}
      
      {filteredTemplates.length > 0 && searchQuery && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredTemplates.length} resultados
          </Badge>
          {searchQuery && (
            <Badge variant="outline" className="text-xs gap-1">
              Busca: {searchQuery}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelGallery; 
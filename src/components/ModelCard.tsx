import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Star, ZapIcon, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ModelCardProps {
  name: string;
  role: string;
  goal: string;
  icon?: React.ReactNode;
  category?: string;
  rating?: number;
  onSelect: () => void;
  isSelected: boolean;
  className?: string;
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  role,
  goal,
  icon,
  category = "Geral",
  rating = 0,
  onSelect,
  isSelected,
  className,
}) => {
  // Limitar a descrição a um tamanho gerenciável
  const shortDescription = role.length > 150 
    ? role.substring(0, 150) + "..." 
    : role;
  
  // Renderizar as estrelas baseadas na classificação (0-5)
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400 transition-transform hover:scale-110" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400/50 text-yellow-400 transition-transform hover:scale-110" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-muted-foreground/30 transition-transform hover:scale-110" />);
      }
    }
    
    return stars;
  };

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 border",
      "hover:shadow-xl hover:shadow-primary/5",
      "hover:border-primary/50 hover:-translate-y-1",
      "active:scale-98 cursor-pointer",
      isSelected ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10" : "hover:border-primary/20",
      "backdrop-blur-sm bg-background/60",
      className
    )}>
      <CardHeader className={cn(
        "p-4 pb-2 space-y-1",
        "transition-colors duration-300",
        isSelected && "bg-gradient-to-br from-primary/5 to-primary/10"
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-md transition-all duration-300 group-hover:scale-110",
              isSelected ? "bg-primary/20" : "bg-primary/10",
              "group-hover:bg-primary/30 group-hover:rotate-3"
            )}>
              {icon || <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
            </div>
            <CardTitle className={cn(
              "text-base font-medium transition-transform duration-300",
              "group-hover:translate-x-1"
            )}>
              {name}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn(
            "text-xs font-normal transition-all duration-300",
            "group-hover:bg-primary/10 group-hover:border-primary/30"
          )}>
            {category}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-1 transition-opacity duration-300 group-hover:opacity-90">
          {renderStars()}
          <span className="text-xs text-muted-foreground ml-1 transition-colors group-hover:text-primary">
            {rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "p-4 pt-2 transition-all duration-300",
        "group-hover:bg-gradient-to-b from-transparent to-muted/30"
      )}>
        <p className={cn(
          "text-sm text-muted-foreground mb-3 line-clamp-2",
          "transition-colors duration-300 group-hover:text-foreground"
        )}>
          {shortDescription}
        </p>
        
        <div className={cn(
          "flex items-center gap-1.5 mb-2",
          "transition-transform duration-300 group-hover:translate-x-1"
        )}>
          <ZapIcon className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs">Objetivo:</span>
        </div>
        <p className={cn(
          "text-xs ml-5 mb-3 line-clamp-2",
          "transition-colors duration-300 group-hover:text-foreground/90"
        )}>
          {goal}
        </p>
      </CardContent>
      
      <Separator className="transition-colors duration-300 group-hover:bg-primary/20" />
      
      <CardFooter className={cn(
        "p-2 flex justify-between",
        "transition-colors duration-300",
        "group-hover:bg-muted/30"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 text-xs gap-1 transition-all duration-300",
            "hover:bg-primary/10 hover:text-primary",
            "active:scale-95"
          )}
        >
          <BookOpen className="h-3 w-3" />
          <span>Detalhes</span>
        </Button>
        
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={onSelect}
          className={cn(
            "h-7 text-xs gap-1 transition-all duration-300",
            isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary",
            "active:scale-95",
            "group-hover:border-primary/50"
          )}
        >
          {isSelected ? (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
              Selecionado
            </span>
          ) : "Selecionar"}
        </Button>
      </CardFooter>

      {/* Efeito de brilho no hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100",
        "transition-opacity duration-1000",
        "pointer-events-none",
        "bg-gradient-to-r from-transparent via-primary/5 to-transparent",
        "blur-2xl",
        "animate-shimmer"
      )} />
    </Card>
  );
};

export default ModelCard; 
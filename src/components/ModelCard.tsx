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
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-muted-foreground/30" />);
      }
    }
    
    return stars;
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 border hover:shadow-md",
      isSelected ? "border-primary/50 bg-primary/5 dark:bg-primary/10" : "hover:border-primary/20",
      className
    )}>
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-md",
              isSelected ? "bg-primary/20" : "bg-primary/10"
            )}>
              {icon || <Sparkles className="h-4 w-4 text-primary" />}
            </div>
            <CardTitle className="text-base font-medium">{name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {category}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {renderStars()}
          <span className="text-xs text-muted-foreground ml-1">
            {rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {shortDescription}
        </p>
        
        <div className="flex items-center gap-1.5 mb-2">
          <ZapIcon className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs">Objetivo:</span>
        </div>
        <p className="text-xs ml-5 mb-3 line-clamp-2">
          {goal}
        </p>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-2 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
        >
          <BookOpen className="h-3 w-3" />
          <span>Detalhes</span>
        </Button>
        
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={onSelect}
          className={cn(
            "h-7 text-xs gap-1",
            isSelected && "bg-primary text-primary-foreground"
          )}
        >
          {isSelected ? "Selecionado" : "Selecionar"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelCard; 
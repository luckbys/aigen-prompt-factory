import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Wand,
  Lightbulb,
  FileEdit,
  Bot,
  Send,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

const onboardingSteps = [
  {
    title: "Bem-vindo ao Gerador de Prompts AI",
    description: "Crie prompts eficazes para IAs como ChatGPT, Claude e outros assistentes em apenas alguns passos.",
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    image: "/onboarding/welcome.svg",
  },
  {
    title: "Escolha um modelo",
    description: "Comece selecionando um dos modelos pré-definidos baseados em diversos casos de uso.",
    icon: <Bot className="h-10 w-10 text-primary" />,
    image: "/onboarding/templates.svg",
  },
  {
    title: "Personalize o prompt",
    description: "Edite cada componente do prompt para adaptá-lo às suas necessidades específicas.",
    icon: <FileEdit className="h-10 w-10 text-primary" />,
    image: "/onboarding/customize.svg",
  },
  {
    title: "Melhore com IA",
    description: "Use nossa IA para aprimorar automaticamente seu prompt e obter melhores resultados.",
    icon: <Wand className="h-10 w-10 text-primary" />,
    image: "/onboarding/improve.svg",
  },
  {
    title: "Exporte e use",
    description: "Copie, baixe ou envie seu prompt diretamente para o ChatGPT ou outras IAs.",
    icon: <Send className="h-10 w-10 text-primary" />,
    image: "/onboarding/export.svg",
  }
];

interface OnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    onOpenChange(false);
    if (onComplete) {
      onComplete();
    }
    // Salvar no localStorage que o usuário já viu o onboarding
    localStorage.setItem("onboarding-completed", "true");
  };
  
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center text-center pt-6">
          {step.icon}
          <DialogHeader className="mt-4">
            <DialogTitle className="text-xl">{step.title}</DialogTitle>
            <DialogDescription className="mt-2 text-center max-w-md mx-auto">
              {step.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-8 w-full">
            <div className="bg-muted/50 rounded-xl p-6 flex justify-center">
              {/* Aqui poderia ser uma imagem real, estou apenas simulando */}
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border border-primary/20">
                <span className="text-primary text-sm">{step.image}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {onboardingSteps.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-2 w-full justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <Button 
              onClick={handleNext}
              className="flex-1 sm:flex-none"
            >
              {isLastStep ? "Começar a usar" : "Próximo"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding; 
import React from "react";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InfoHoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const InfoHoverCard: React.FC<InfoHoverCardProps> = ({
  children,
  content,
  className,
  side = "top",
  align = "center",
}) => {
  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className={cn("cursor-pointer inline-flex", className)}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        align={align} 
        className="w-80 text-sm"
        sideOffset={5}
      >
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

export default InfoHoverCard; 
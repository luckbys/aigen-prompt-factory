"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/10",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary",
        "transition-all duration-500",
        value === 100 && "animate-progressPulse",
        "bg-gradient-to-r from-primary to-primary/80"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Efeito de brilho */}
      <div className={cn(
        "absolute inset-0",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        "animate-shimmer",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300"
      )} />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

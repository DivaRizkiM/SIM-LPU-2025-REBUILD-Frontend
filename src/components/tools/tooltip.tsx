import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TooltipButtonProps {
  children: ReactNode;
  tooltipText: string;
  className?: string
}

export function TooltipButton({ children, tooltipText,className }: TooltipButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={cn(className)}>
          {children}
        </TooltipTrigger>
        <TooltipContent className="bg-black/90 text-white">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

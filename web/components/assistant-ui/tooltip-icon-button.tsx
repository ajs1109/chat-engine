"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

type TooltipIconButtonProps = ButtonProps & {
  tooltip: string;
  side?: "top" | "right" | "bottom" | "left";
};

export const TooltipIconButton = React.forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ tooltip, side = "top", children, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} size="icon" variant="ghost" {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
));
TooltipIconButton.displayName = "TooltipIconButton";

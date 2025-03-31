"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "~/lib/utils"

// Simplified version without using ElementRef and ComponentPropsWithoutRef
const Progress = React.forwardRef(({ 
  className, 
  value = 0, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }, ref: React.Ref<HTMLDivElement>) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </ProgressPrimitive.Root>
))

Progress.displayName = "Progress"

export { Progress }
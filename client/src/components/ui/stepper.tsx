import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
  activeStep: number;
  className?: string;
}

export function Stepper({ steps, activeStep, className, ...props }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)} {...props}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full mb-2",
                index < activeStep
                  ? "bg-primary text-primary-foreground"
                  : index === activeStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.icon}
            </div>
            <span 
              className={cn(
                "text-sm",
                index <= activeStep ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-1 w-full bg-muted max-w-[80px]",
                index < activeStep ? "bg-primary" : ""
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

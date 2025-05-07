interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <>
              <div className="flex flex-col items-center" key={`step-${index}`}>
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-medium
                    ${index + 1 <= currentStep 
                      ? "bg-primary text-white" 
                      : "bg-neutral-300 text-neutral-500"}`}
                >
                  {index + 1}
                </div>
                <span 
                  className={`text-sm mt-2 font-medium
                    ${index + 1 <= currentStep ? "" : "text-neutral-500"}`}
                >
                  {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-neutral-300" key={`progress-${index}`}>
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: index + 1 < currentStep ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

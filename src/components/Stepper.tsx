import React from 'react';

interface StepData {
  title: string;
  icon: React.ReactNode;
}

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div>
      <div className="flex items-center justify-between relative">
        {/* Connecting Lines */}
        <div className="absolute top-4 left-0 w-full">
          <div className="flex justify-between items-center">
            {steps.map((_, index) => (
              index < steps.length - 1 && (
                <div
                  key={`line-${index}`}
                  className={`h-[2px] w-full ${
                    index + 1 < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )
            ))}
          </div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center z-10 bg-background">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                index + 1 < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index + 1 === currentStep
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-xs font-medium text-center max-w-[80px]">
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stepper; 
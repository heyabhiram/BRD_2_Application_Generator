import React from "react";
import { Layers, FileText, Cpu, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  currentStep: 1 | 2 | 3;
  onSelectStep?: (step: 1 | 2 | 3) => void;
  canNavigateToStep2?: boolean;
  canNavigateToStep3?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep2,
  canNavigateToStep3,
}) => {
  const steps = [
    { number: 1, label: "BRD Input", icon: FileText, accessible: true },
    { number: 2, label: "Architecture", icon: Layers, accessible: canNavigateToStep2 },
    { number: 3, label: "Application Preview", icon: Cpu, accessible: canNavigateToStep3 },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 font-bold text-sm tracking-wider text-zinc-100">
          AG
        </div>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
            BRD-to-Application Copilot
          </h1>
          <p className="text-xs text-zinc-400">Autonomous Full-Stack Generation</p>
        </div>
      </div>

      <nav className="flex items-center space-x-1 sm:space-x-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isDone = currentStep > step.number;
          const isClickable = Boolean(step.accessible && onSelectStep);

          return (
            <React.Fragment key={step.number}>
              {idx > 0 && <div className="w-6 h-[1px] bg-zinc-800 hidden sm:block" />}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep && onSelectStep(step.number as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                    : isDone
                    ? "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/60"
                    : "text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    </header>
  );
};


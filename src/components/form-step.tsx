import { CheckIcon, HourglassIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

interface FormStepProps {
  labels: string[];
  currentStep?: number;
  bold?: boolean;
  maxVisible?: number;
}

export function FormStep({
  labels,
  currentStep = 1,
  bold = false,
  maxVisible = 4,
}: Readonly<FormStepProps>) {
  const [visibleStart, setVisibleStart] = useState(0);

  useEffect(() => {
    if (labels.length <= maxVisible) {
      setVisibleStart(0);
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = currentStep - half;
      if (start < 0) start = 0;
      if (start + maxVisible > labels.length) {
        start = labels.length - maxVisible;
      }
      setVisibleStart(start);
    }
  }, [currentStep, labels.length, maxVisible]);

  const visibleLabels = labels.slice(visibleStart, visibleStart + maxVisible);

  const getCircleIcon = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <CheckIcon size={14} className="text-white" />;
    }
    if (isCurrent) {
      return <HourglassIcon size={14} className="text-white" />;
    }
    return null;
  };

  return (
    <div className="flex gap-4 mb-6">
      {visibleLabels.map((label, index) => {
        const actualIndex = visibleStart + index;
        const isCompleted =
          actualIndex + 1 < currentStep || labels.length === currentStep;
        const isCurrent = actualIndex + 1 === currentStep;

        let circleColor = "bg-gray-300";
        if (isCompleted) {
          circleColor = "bg-green-500";
        } else if (isCurrent) {
          circleColor = "bg-primary";
        }

        let borderColor = "border-gray-300";
        if (isCompleted) {
          borderColor = "border-green-500";
        } else if (isCurrent) {
          borderColor = "border-primary";
        }

        return (
          <div key={actualIndex} className="flex-1 space-y-2">
            <div className="flex gap-4 items-center">
              <div
                className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 ${circleColor}`}
              >
                {getCircleIcon(isCompleted, isCurrent)}
              </div>
              {index < visibleLabels.length - 1 && (
                <div className={`border-t h-1 w-full ${borderColor}`}></div>
              )}
            </div>
            <p className={`text-sm ${bold ? "font-semibold" : "font-normal"}`}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

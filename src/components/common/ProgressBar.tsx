import React from 'react'

interface ProgressBarProps {
  totalSteps: number
  currentStep: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  totalSteps,
  currentStep,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="w-full flex items-center gap-1">
      {steps.map(step => {
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div
            key={step}
            className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden"
          >
            {isCompleted && (
              <div className="h-full w-full bg-primary-300 transition-all duration-300" />
            )}

            {isCurrent && (
              <div className="h-full w-1/2 bg-primary-300 transition-all duration-300" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar

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
            className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden relative"
          >
            <div
              className={`h-full bg-primary-300 rounded-full transition-all duration-150 ease-out
                ${isCompleted ? 'w-full delay-0' : ''} 
                ${isCurrent ? 'w-full delay-150' : ''} 
                ${!isCompleted && !isCurrent ? 'w-0 delay-0' : ''}
              `}
            />
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar

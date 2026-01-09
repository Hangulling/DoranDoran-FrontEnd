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
    <div className="w-full flex items-center gap-1 sticky top-0">
      {steps.map(step => {
        const isActive = step <= currentStep

        return (
          <div
            key={step}
            className={`flex-1 h-1 rounded-full transition-colors duration-300 ease-out
              ${isActive ? 'bg-gray-800' : 'bg-gray-100'}`}
          />
        )
      })}
    </div>
  )
}

export default ProgressBar

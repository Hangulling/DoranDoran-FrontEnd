import StepItem from './StepItem'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => (i += 1))
  const currentStatus = (step: number) => {
    if (step < currentStep) return 'done'
    if (step === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="flex justify-center items-center my-6">
      {steps.map((step, index) => (
        <div className="flex items-center" key={step}>
          <StepItem step={step} status={currentStatus(step)} />

          {index < steps.length - 1 && <div className="w-10 h-px bg-gray-90 mx-2 rounded-sm" />}
        </div>
      ))}
    </div>
  )
}

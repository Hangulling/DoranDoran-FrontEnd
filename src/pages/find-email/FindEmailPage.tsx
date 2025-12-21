import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import StepIndicator from '../../components/account/StepIndicator'
import Button from '../../components/common/Button'
import { useEffect, useState } from 'react'

export default function FindEmailPage() {
  const [label, setLabel] = useState<string>('')
  const [canSubmit, setCanSubmit] = useState(false)
  const [onSubmit, setOnSubmit] = useState<(() => void) | null>(null)
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  const step: Record<string, number> = {
    '/find-email/form': 1,
    '/find-email/success': 2,
    '/find-email/not-found': 2,
  }

  const currentStep = step[path]

  const handleConfirm = () => {
    if (path === '/find-email/form') {
      onSubmit?.()
    } else {
      navigate('/login')
    }
  }

  useEffect(() => {
    setLabel(path === '/find-email/form' ? 'Next' : 'Back to Login')
  }, [path])

  return (
    <div className="flex flex-col items-center min-h-screen">
      <StepIndicator currentStep={currentStep} totalSteps={2} />

      <Outlet context={{ setOnSubmit, setCanSubmit }} />
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
        <div className="w-full max-w-md bg-white px-4 py-3 shadow-[0_-1px_2px_0_rgba(0,0,0,0.08)]">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="xl"
            className="bg-gray-800 w-full"
            disabled={path === '/find-email/form' && !canSubmit}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}

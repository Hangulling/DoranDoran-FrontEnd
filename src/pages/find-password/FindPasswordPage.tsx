import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useEffect, useState } from 'react'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'
import ProgressBar from '../../components/common/ProgressBar'

export default function FindPasswordPage() {
  const [label, setLabel] = useState<string | null>(null)
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()
  const [canSubmit, setCanSubmit] = useState(false)
  const [submit, setSubmit] = useState<(() => void) | null>(null)
  const reset = usePasswordResetStore(s => s.reset)

  const stepMap: Record<string, number> = {
    '/find-password/email': 1,
    '/find-password/verify': 2,
    '/find-password/reset': 3,
  }

  const currentStep = stepMap[path]

  const handleConfirm = () => {
    if (path === '/find-password/email') {
      submit?.()
      if (canSubmit) {
        navigate('/find-password/verify')
      }
    } else if (path === '/find-password/verify') {
      submit?.()
      if (canSubmit) {
        navigate('/find-password/reset')
      }
    } else if (path === '/find-password/reset') {
      submit?.()
    }
  }

  useEffect(() => {
    if (path === '/find-password/reset') {
      setLabel('Reset Password')
    } else {
      setLabel('Next')
    }
  }, [path])

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <div className="flex flex-col justify-center items-center">
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      <Outlet context={{ setSubmit, setCanSubmit }} />
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
        <div className="w-full max-w-md bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_2px_0_rgba(0,0,0,0.08)]">
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit}
            variant="primary"
            size="xl"
            className="bg-gray-800 w-full"
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}

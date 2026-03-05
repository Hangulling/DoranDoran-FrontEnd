import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useEffect, useRef, useState } from 'react'
import ProgressBar from '../../components/common/ProgressBar'
import { useFindEmailStore } from '../../stores/useFindEmailStore'
import { useIOSKeyboard } from '../../hooks/useIOSKeyboard'

export default function FindEmailPage() {
  const [label, setLabel] = useState<string>('')
  const [canSubmit, setCanSubmit] = useState(false)
  const [submit, setSubmit] = useState<(() => void) | null>(null)
  const resetFindEmail = useFindEmailStore(s => s.reset)
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()
  const { isIOSApp, keyboardHeight } = useIOSKeyboard()

  const step: Record<string, number> = {
    '/find-email/form': 1,
    '/find-email/name': 1,
    '/find-email/birthdate': 2,
    '/find-email/question': 3,
    '/find-email/success': 4,
    '/find-email/not-found': 4,
  }
  const isResultPage =
    path === '/find-email/not-found' || path === '/find-email/success'

  const currentStep = step[path]

  const handleConfirm = () => {
    if (path === '/find-email/name') {
      submit?.()
      if (canSubmit) {
        navigate('/find-email/birthdate')
      }
    } else if (path === '/find-email/birthdate') {
      submit?.()
      if (canSubmit) {
        navigate('/find-email/question')
      }
    } else if (path === '/find-email/question') {
      submit?.()
    } else {
      navigate('/login')
    }
  }

  const didResetRef = useRef(false)

  useEffect(() => {
    if (didResetRef.current) return
    didResetRef.current = true

    resetFindEmail()
    setCanSubmit(false)
    setSubmit(null)
  }, [resetFindEmail])

  useEffect(() => {
    setLabel(
      path === '/find-email/success' || path === '/find-email/not-found'
        ? 'Back to Login'
        : 'Next'
    )
  }, [path])

  return (
    <div className="flex flex-col items-center min-h-screen">
      <ProgressBar currentStep={currentStep} totalSteps={4} />

      <Outlet context={{ setSubmit, setCanSubmit }} />
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
        <div className="w-full max-w-md bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_2px_0_rgba(0,0,0,0.08)]">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="xl"
            className="bg-gray-800 w-full"
            disabled={isResultPage ? false : !canSubmit}
            style={
              isIOSApp
                ? { transform: `translateY(-${keyboardHeight}px)` }
                : undefined
            }
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}

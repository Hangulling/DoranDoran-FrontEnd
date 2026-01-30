import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useEffect, useRef, useState } from 'react'
import ProgressBar from '../../components/common/ProgressBar'
import { useAgreementStore } from '../../stores/useAgreementStore'
import { useSignupFormStore } from '../../stores/useSignupStore'

export default function SignupPage() {
  const { reset: resetForm } = useSignupFormStore()

  const location = useLocation()
  const path = location.pathname
  const [label, setLabel] = useState<string | null>(null)
  const [canSubmit, setCanSubmit] = useState<boolean>(false)
  const [submit, setSubmit] = useState<(() => void) | null>(null)
  const resetAgreements = useAgreementStore(s => s.reset)
  const navigate = useNavigate()

  const stepMap: Record<string, number> = {
    '/signup/name': 1,
    '/signup/birthdate': 2,
    '/signup/email': 3,
    '/signup/password': 4,
    '/signup/question': 5,
  }

  const currentStep = stepMap[path]

  const handleConfirm = () => {
    if (path === '/signup/term') {
      submit?.()
      if (canSubmit) {
        navigate('/signup/name')
      }
    } else if (path === '/signup/name') {
      submit?.()
      if (canSubmit) {
        navigate('/signup/birthdate')
      }
    } else if (path === '/signup/birthdate') {
      submit?.()
      if (canSubmit) {
        navigate('/signup/email')
      }
    } else if (path === '/signup/email') {
      submit?.()
      if (canSubmit) {
        navigate('/signup/password')
      }
    } else if (path === '/signup/password') {
      submit?.()
      if (canSubmit) {
        navigate('/signup/question')
      }
    } else if (path === '/signup/question') {
      submit?.()
    }
  }

  const didInitRef = useRef(false)

  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    const fromPolicy = Boolean(location.state?.fromPolicy)
    if (fromPolicy) return

    resetForm()
    resetAgreements()
    setCanSubmit(false)
    setSubmit(null)
  }, [resetForm, resetAgreements, location])

  useEffect(() => {
    if (path === '/signup/question') {
      setLabel('Complete')
    } else {
      setLabel('Next')
    }
  }, [path])

  return (
    <div className="flex flex-col justify-center items-center max-w-md">
      {path !== '/signup/term' && (
        <ProgressBar currentStep={currentStep} totalSteps={5} />
      )}
      <Outlet context={{ setSubmit, setCanSubmit }} />
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
        <div className="w-full max-w-md bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)]">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="xl"
            className="w-full"
            disabled={!canSubmit}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}

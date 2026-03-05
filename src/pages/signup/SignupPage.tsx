import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useEffect, useRef, useState } from 'react'
import ProgressBar from '../../components/common/ProgressBar'
import { useAgreementStore } from '../../stores/useAgreementStore'
import { useSignupFormStore } from '../../stores/useSignupStore'
import { useIOSKeyboard } from '../../hooks/useIOSKeyboard'

export default function SignupPage() {
  const { reset: resetForm } = useSignupFormStore()

  const location = useLocation()
  const path = location.pathname
  const [label, setLabel] = useState<string | null>(null)
  const [canSubmit, setCanSubmit] = useState<boolean>(false)
  const [submit, setSubmit] = useState<(() => void) | null>(null)
  const resetAgreements = useAgreementStore(s => s.reset)
  const navigate = useNavigate()
  const { isIOSApp, keyboardHeight } = useIOSKeyboard()
  const fromOAuth = Boolean(location.state?.fromOAuth)

  const stepMap: Record<string, number> = {
    '/signup/name': 1,
    '/signup/birthdate': 2,
    '/signup/email': 3,
    '/signup/password': 4,
    '/signup/question': 5,
  }

  const currentStep = stepMap[path]

  const handleConfirm = () => {
    if (!canSubmit) return

    if (fromOAuth) {
      if (path === '/signup/term') {
        submit?.()
        navigate('/signup/birthdate', {
          replace: true,
          state: location.state,
        })
        return
      }

      if (path === '/signup/birthdate') {
        submit?.()
        return
      }

      return
    }
    if (path === '/signup/term') {
      submit?.()
      navigate('/signup/name')
    } else if (path === '/signup/name') {
      submit?.()
      navigate('/signup/birthdate')
    } else if (path === '/signup/birthdate') {
      submit?.()
      navigate('/signup/email')
    } else if (path === '/signup/email') {
      submit?.()
      navigate('/signup/password')
    } else if (path === '/signup/password') {
      submit?.()
      navigate('/signup/question')
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
    if (fromOAuth) {
      if (path === '/signup/birthdate') {
        setLabel('Complete')
      } else {
        setLabel('Next')
      }
    } else {
      if (path === '/signup/question') {
        setLabel('Complete')
      } else {
        setLabel('Next')
      }
    }
  }, [path, fromOAuth])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {!fromOAuth && path !== '/signup/term' && (
        <ProgressBar currentStep={currentStep} totalSteps={5} />
      )}

      <div className="flex-1 flex justify-center min-h-0 w-full">
        <Outlet context={{ setSubmit, setCanSubmit }} />
      </div>

      <div className="w-full bg-white">
        <div className="mx-auto w-full max-w-md px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)]">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="xl"
            className="w-full"
            disabled={!canSubmit}
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

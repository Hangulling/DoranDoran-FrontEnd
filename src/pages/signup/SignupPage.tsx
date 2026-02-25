import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useEffect, useRef, useState } from 'react'
import ProgressBar from '../../components/common/ProgressBar'
import { useAgreementStore } from '../../stores/useAgreementStore'
import { useSignupFormStore } from '../../stores/useSignupStore'
// import { useKeyboard } from '../../hooks/useKeyboard'

export default function SignupPage() {
  const { reset: resetForm } = useSignupFormStore()

  const location = useLocation()
  const path = location.pathname
  const [label, setLabel] = useState<string | null>(null)
  const [canSubmit, setCanSubmit] = useState<boolean>(false)
  const [submit, setSubmit] = useState<(() => void) | null>(null)
  const resetAgreements = useAgreementStore(s => s.reset)
  const navigate = useNavigate()
  // const keyboardHeight = useKeyboard()

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
    <div className="flex flex-col justify-center items-center">
      {!fromOAuth && path !== '/signup/term' && (
        <ProgressBar currentStep={currentStep} totalSteps={5} />
      )}
      <Outlet context={{ setSubmit, setCanSubmit }} />
      <div
        className="fixed inset-x-0 bottom-0 z-10 flex justify-center"
        // style={{
        //   transform: `translateY(-${keyboardHeight}px)`,
        // }}
      >
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

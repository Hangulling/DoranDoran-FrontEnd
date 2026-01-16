import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { resetPasswordRequest, resetPasswordVerify } from '../../api'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'
import { useOutletContext } from 'react-router-dom'
import { isAxiosError } from 'axios'
import FormIntro from '../../components/common/FormIntro'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindPasswordVerify() {
  const { email, code, setCode } = usePasswordResetStore()
  const [codeSuccess, setCodeSuccess] = useState<string>('')
  const [codeError, setCodeError] = useState('')
  const { setSubmit, setCanSubmit } = useOutletContext<OutletContext>()
  const [isRequested, setIsRequested] = useState(false)

  const INITIAL_SEC = 180

  const [remainingSec, setRemainingSec] = useState(INITIAL_SEC)
  const timerRef = useRef<number | null>(null)

  const timeText = useMemo(() => {
    const m = String(Math.floor(remainingSec / 60)).padStart(1, '0')
    const s = String(remainingSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }, [remainingSec])

  const startTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    setRemainingSec(INITIAL_SEC)
    startTimer()
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [startTimer])

  const handleCodeChange = (v: string) => {
    setCode(v)
    if (codeError) setCodeError('')
    if (codeSuccess) setCodeSuccess('')
    setIsRequested(false)
  }

  const handleVerify = async () => {
    try {
      const payload = {
        email,
        code: code,
      }

      await resetPasswordVerify(payload)
      setCodeSuccess('Verification successful')
      setCodeError('')
      setIsRequested(true)
    } catch (error) {
      if (isAxiosError(error)) {
        const errCode = error.response?.data?.errorCode
        if (errCode === 'A006') {
          setCodeError(
            'Invalid verification code.\nPlease request a new code and try again'
          )
        }

        if (errCode === 'A005') {
          setCodeError('Invalid verification code.Please try again.')
        }
      }
    }
  }

  const resendCode = async () => {
    try {
      await resetPasswordRequest(email)
      setRemainingSec(INITIAL_SEC)
      startTimer()
    } catch (error) {
      console.log(error, 'error')
    }
  }

  const isFormValid = code.length === 6

  const handleSubmit = useCallback(() => {
    if (!isRequested) return
  }, [isRequested])

  useEffect(() => {
    setSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isRequested, setCanSubmit])

  return (
    <div>
      <FormIntro variant="signup">
        <p>Enter the code we sent.</p>
      </FormIntro>

      <div className="flex items-end gap-2 ">
        <Input
          type="text"
          label="Enter the code sent to your email"
          placeholder="Enter 6-digit code"
          size="sm"
          variant={codeError ? 'error' : 'primary'}
          onChange={e => handleCodeChange(e.target.value)}
          value={code}
          rightElement={
            <div className="flex items-center">
              <span className="text-body text-base text-primary-300">
                {timeText}
              </span>
            </div>
          }
        />
        <Button
          type="button"
          variant="primary"
          className="bg-gray-800 my-2 text-subtitle !rounded-[10px]"
          size="sm"
          disabled={!isFormValid}
          onClick={handleVerify}
        >
          Confirm
        </Button>
      </div>
      {codeError ? (
        <div className="mt-1 text-xs text-body text-system-red whitespace-pre-line">
          {codeError}
        </div>
      ) : codeSuccess ? (
        <span className="mx-3  text-xs text-body text-system-blue">
          {codeSuccess}
        </span>
      ) : null}
      <div className="mt-8 flex">
        <div className="text-sm text-body text-gray-500">
          Didn’t receive the email?
        </div>
        <Button
          variant="text"
          className="pl-2 text-sm text-title text-gray-800 underline underline-offset-4"
          onClick={resendCode}
        >
          Resend Code
        </Button>
      </div>
    </div>
  )
}

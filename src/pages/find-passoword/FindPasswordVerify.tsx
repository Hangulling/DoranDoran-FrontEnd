import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import infoIcon from '../../assets/icon/info.svg'
import { resetPasswordRequest, resetPasswordVerify } from '../../api'
import { useCallback, useEffect, useState } from 'react'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'
import { useOutletContext } from 'react-router-dom'
import { isAxiosError } from 'axios'

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
          setCodeError('Invalid verification code.\nPlease request a new code and try again')
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
      <div className="w-[355px] flex justify-between ">
        <div className="flex items-end mx-2 gap-2 ">
          <Input
            type="text"
            label="Enter the code sent to your email"
            placeholder="Enter 6-digit code"
            size="sm"
            variant={codeError ? 'error' : 'primary'}
            onChange={e => handleCodeChange(e.target.value)}
            value={code}
          />
          <Button
            type="button"
            variant="primary"
            className="bg-gray-800 my-2 text-subtitle"
            size="sm"
            disabled={!isFormValid}
            onClick={handleVerify}
          >
            Confirm
          </Button>
        </div>
      </div>
      {codeError ? (
        <div className="mx-2 text-xs text-body text-orange-300 whitespace-pre-line">
          {codeError}
        </div>
      ) : codeSuccess ? (
        <span className="mx-3  text-xs text-body text-blue-500">{codeSuccess}</span>
      ) : null}
      <div className="mt-10 flex text-sm text-body text-gray-500 mx-4">
        <div className="flex">
          <img src={infoIcon} /> Didn’t receive the email?
        </div>
        <Button
          variant="text"
          className="pl-2 text-title text-gray-800 underline underline-offset-4"
          onClick={resendCode}
        >
          Resend Code
        </Button>
      </div>
    </div>
  )
}

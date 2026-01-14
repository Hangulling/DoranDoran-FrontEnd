import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import findCharacterIcon from '../../assets/auth/character-confiused.svg'
import { Link, useOutletContext } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { validateEmail } from '../../utils/validations'
import { resetPasswordRequest } from '../../api'
import { isAxiosError } from 'axios'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'

type OutletContext = {
  setSubmit: (fn: () => void) => void
  setCanSubmit: (v: boolean) => void
}

export default function FindPasswordEmail() {
  const { email, setEmail } = usePasswordResetStore()
  const [emailSuccess, setEmailSuccess] = useState<string | null>('')
  const [emailError, setEmailError] = useState<string | null>('')
  const [isRequested, setIsRequested] = useState(false)
  const { setSubmit, setCanSubmit } = useOutletContext<OutletContext>()
  const handleEmailChange = (v: string) => {
    setEmail(v)
    if (emailError) setEmailError(null)
    if (emailSuccess) setEmailSuccess(null)
    if (isRequested) setIsRequested(false)
  }

  const isEmailFormatValid = email.trim() !== '' && validateEmail(email) === null
  const handleVerify = async () => {
    try {
      await resetPasswordRequest(email)

      setEmailSuccess('Email verified successfully.')
      setEmailError(null)
      setIsRequested(true)
    } catch (error) {
      if (isAxiosError(error)) {
        const errCode = error.response?.data?.errorCode

        if (errCode === 'E001') {
          setEmailError('Email not found')
        }
        if (errCode === 'A004') {
          setEmailError(
            'This account was registered via Google Sign-In. \nPassword reset is available only for accounts created with Email Sign-Up.'
          )
        }
      }
    }
  }

  const handleSubmit = useCallback(() => {
    if (!isRequested) return
  }, [isRequested])

  const isFormValid = email.trim() !== '' && validateEmail(email) === null && isRequested

  useEffect(() => {
    setSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <div className="w-[355px]">
        <label className="block ml-2 my-2 whitespace-nowrap text-gray-800 text-base text-subtitle">
          Enter your registered email address
        </label>
        <div className="flex items-end mx-2 gap-4">
          <Input
            type="email"
            placeholder="Enter your E-mail"
            size="sm"
            variant={emailError ? 'error' : 'primary'}
            onChange={e => handleEmailChange(e.target.value)}
            value={email}
          />
          <Button
            type="button"
            variant="primary"
            className="bg-gray-800 my-2 text-subtitle"
            size="sm"
            disabled={!isEmailFormatValid}
            onClick={handleVerify}
          >
            Confirm
          </Button>
        </div>
        {emailError ? (
          <div className="mx-3 text-body text-xs text-orange-300 whitespace-pre-line">
            {emailError}
          </div>
        ) : emailSuccess ? (
          <span className="mx-3 text-body text-xs text-blue-500">{emailSuccess}</span>
        ) : null}
      </div>
      <div className="flex flex-col justify-center items-center gap-2 mt-10">
        <img src={findCharacterIcon} />
        <div className="flex flex-col items-center text-sm text-body text-gray-600 gap-1">
          <div>Can't remeber the email</div>
          <div>you signed with?</div>
        </div>
        <Link
          to="/find-email"
          className="text-sm text-title text-gray-800 underline underline-offset-4"
        >
          Forgot your email?
        </Link>
      </div>
    </div>
  )
}

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { Link, useOutletContext } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { validateEmail } from '../../utils/validations'
import { resetPasswordRequest } from '../../api'
import { isAxiosError } from 'axios'
import { usePasswordResetStore } from '../../stores/usePasswordResetStore'
import FormIntro from '../../components/common/FormIntro'

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

  const isEmailFormatValid =
    email.trim() !== '' && validateEmail(email) === null

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

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') e.preventDefault()
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isEmailFormatValid) handleVerify()
    }
  }

  const handleSubmit = useCallback(() => {
    if (!isRequested) return
  }, [isRequested])

  const isFormValid =
    email.trim() !== '' && validateEmail(email) === null && isRequested

  useEffect(() => {
    setSubmit(() => handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    setCanSubmit(isFormValid)
  }, [isFormValid, setCanSubmit])

  return (
    <div>
      <div>
        <FormIntro variant="signup">
          <p>What's your email?</p>
        </FormIntro>
        <Input
          type="email"
          label="E-mail"
          placeholder="Enter your E-mail"
          variant={emailError ? 'error' : 'primary'}
          noUnderline
          onChange={e => handleEmailChange(e.target.value)}
          value={email}
          onKeyDown={handleEmailKeyDown}
          rightElement={
            <div>
              <Button
                variant="primary"
                className="bg-gray-800 p-2 !rounded-[10px]"
                onClick={handleVerify}
                disabled={!isEmailFormatValid}
                size="sm"
              >
                Verify
              </Button>
            </div>
          }
        />
        {emailError ? (
          <div className="mt-1 text-body text-xs text-system-red whitespace-pre-line">
            {emailError}
          </div>
        ) : emailSuccess ? (
          <span className="mt-1 text-body text-xs text-system-blue">
            {emailSuccess}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 mt-8">
        <div className="text-sm text-body text-gray-500">
          Can't remeber the email you signed up with?
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

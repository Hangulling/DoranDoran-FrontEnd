import { useEffect, useState } from 'react'
import Button from '../../../components/common/Button'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import { validateEmail } from '../../../utils/validations'
import { checkEmailExists, requestEmailVerification } from '../../../api'
import axios from 'axios'
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
}

export default function SignupEmail() {
  const { firstName, lastName, email, verifiedEmail, emailVerified, setMany } =
    useSignupFormStore()
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const { setCanSubmit } = useOutletContext<OutletContext>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const verified = searchParams.get('verified')
    const emailParam = searchParams.get('email')
    const error = searchParams.get('error')

    if (!verified) return

    if (verified === 'true') {
      const nextEmail = emailParam ?? email

      setMany({
        email: nextEmail,
        verifiedEmail: nextEmail,
        emailVerified: true,
      })
      setEmailSuccess('Verified successfully.')
      setEmailError(null)
    } else {
      setMany({ emailVerified: false })
      setEmailError(error || 'Email verification failed.')
      setEmailSuccess(null)
    }
    navigate('/signup/email', { replace: true })
  }, [searchParams, setMany, navigate, email])

  const handleEmailChange = (v: string) => {
    const noSpace = v.replace(/\s+/g, '')
    setMany({ email: noSpace })

    if (emailError && validateEmail(noSpace) === null) setEmailError(null)
    setEmailSuccess(null)

    if (verifiedEmail && noSpace !== verifiedEmail) {
      setMany({ emailVerified: false, verifiedEmail: null })
    }

    const err = validateEmail(noSpace)
    setEmailError(err)
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') e.preventDefault()
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isEmailFormatValid) handleVerify()
    }
  }

  const handleVerify = async () => {
    const err =
      validateEmail(email) ||
      (email.trim() === '' ? 'Please enter your email.' : null)
    if (err) {
      setEmailError(err)
      setEmailSuccess(null)
      setMany({ emailVerified: false, verifiedEmail: null })
      return
    }

    try {
      setEmailError(null)
      setEmailSuccess(null)

      const isDuplicate = await checkEmailExists(email)
      if (isDuplicate) {
        setEmailError('This email is already registered.')
        setMany({ emailVerified: false, verifiedEmail: null })
        return
      }

      const res = await requestEmailVerification({ email, firstName, lastName })
      if (import.meta.env.DEV) console.log('request-verification ok:', res)
      setEmailSuccess(
        'Verification email sent. Please verify through your inbox.'
      )
      setMany({ emailVerified: false, verifiedEmail: email })
    } catch (e: unknown) {
      const parsed = axios.isAxiosError(e)
        ? {
            status: e.response?.status,
            url: e.config?.url,
            message:
              e.response?.data?.message ??
              e.response?.data?.error ??
              (typeof e.response?.data === 'string'
                ? e.response?.data
                : undefined) ??
              e.message,
            data: e.response?.data,
          }
        : { message: String(e) }

      console.error('request-verification failed', parsed)
      setEmailError(parsed.message || 'Email verification failed.')
      setMany({ emailVerified: false, verifiedEmail: null })
    }
  }

  const alreadyVerified = emailVerified && verifiedEmail === email
  const isEmailFormatValid =
    email.trim() !== '' && validateEmail(email) === null
  const isEmailValid =
    email.trim() !== '' && validateEmail(email) === null && emailVerified

  useEffect(() => {
    setCanSubmit(isEmailValid)
  }, [isEmailValid, setCanSubmit])

  return (
    <div>
      <FormIntro>
        <p>What's your email?</p>
      </FormIntro>
      <div>
        <Input
          variant={emailError ? 'error' : 'primary'}
          label="E-mail"
          placeholder="Enter your E-mail"
          value={email}
          clearable
          noUnderline
          onChange={e => handleEmailChange(e.target.value)}
          onKeyDown={handleEmailKeyDown}
          onClear={() => {
            setMany({ email: '' })
            setEmailError(null)
          }}
          rightElement={
            <div>
              <Button
                variant="primary"
                className="p-2 !rounded-[10px]"
                onClick={handleVerify}
                size="sm"
                disabled={!isEmailFormatValid}
              >
                Verify
              </Button>
            </div>
          }
        />
      </div>

      {emailError ? (
        <span className="text-xs text-system-red">{emailError}</span>
      ) : alreadyVerified ? (
        <span className="text-xs text-system-blue">Verified successfully.</span>
      ) : emailSuccess ? (
        <span className="text-xs text-system-blue">{emailSuccess}</span>
      ) : null}
    </div>
  )
}

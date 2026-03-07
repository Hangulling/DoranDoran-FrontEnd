import { useEffect, useState } from 'react'
import FormIntro from '../../../components/common/FormIntro'
import Input from '../../../components/common/Input'
import { useSignupFormStore } from '../../../stores/useSignupStore'
import {
  isAtLeast14YearsOld,
  isPastDate,
  isValidCalendarDate,
  validateBirthDate,
} from '../../../utils/validations'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { oauthLogin } from '../../../api/auth'
import { useUserStore } from '../../../stores/useUserStore'
import type { OAuthLoginResponse } from '../../../types/auth'
import axios from 'axios'
import { tokenService } from '../../../api/tokenService'
import { GA_ENABLED, IS_PROD } from '../../../constants/env'
import ReactGA from 'react-ga4'

type Provider = 'google' | 'apple'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
  setSubmit: (fn: () => void) => void
}

export default function SignupBirthDate() {
  const { birthDate, setMany } = useSignupFormStore()
  const [birthDateError, setBirthDateError] = useState<string | null>(null)
  const [, setSubmitError] = useState<string | null>(null)

  const { setCanSubmit, setSubmit } = useOutletContext<OutletContext>()
  const location = useLocation()
  const navigate = useNavigate()

  const setStoreId = useUserStore(s => s.setId)
  const setStoreName = useUserStore(s => s.setName)

  const fromOAuth = Boolean(location.state?.fromOAuth)
  const idToken = location.state?.idToken as string | undefined
  const provider = location.state?.provider as Provider | undefined

  const birthDateDisplay = birthDate.replace(
    /^(\d{4})(\d{0,2})(\d{0,2})$/,
    (_, y, m, d) => [y, m, d].filter(Boolean).join('-')
  )

  const birthDateFormatted = birthDate.replace(
    /^(\d{4})(\d{2})(\d{2})$/,
    '$1-$2-$3'
  )

  const handleBirthDateChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    setMany({ birthDate: digits })
    if (birthDateError) setBirthDateError(null)
  }

  const handleBirthDateBlur = (v: string) => {
    setBirthDateError(validateBirthDate(v))
  }

  const isBirthDateValid =
    birthDate.length === 8 &&
    birthDateError === null &&
    isValidCalendarDate(birthDate) === null &&
    isPastDate(birthDate) === null &&
    isAtLeast14YearsOld(birthDate) === null

  useEffect(() => {
    setCanSubmit(isBirthDateValid)
  }, [isBirthDateValid, setCanSubmit])

  useEffect(() => {
    setSubmit(() => {
      if (!isBirthDateValid) return
      if (!fromOAuth) return
      ;(async () => {
        if (!idToken || !provider) {
          navigate('/login', { replace: true })
          return
        }

        try {
          const res = (await oauthLogin({
            provider,
            idToken,
            confirmSignup: true,
            birthDate: birthDateFormatted,
          })) as OAuthLoginResponse

          if (!res?.success) return

          const user = res.data?.user
          if (!user) return

          if (IS_PROD && GA_ENABLED) {
            ReactGA.event('sign_up', {
              method: provider,
            })
          }

          setStoreId(user.id)
          setStoreName(user.name)
          await tokenService.setLastLogin(provider)

          navigate(user.isOnboard ? '/' : '/onboarding', { replace: true })
        } catch (e: unknown) {
          if (axios.isAxiosError(e)) {
            const status = e.response?.status
            const data = e.response?.data

            setSubmitError(data?.message || 'Sign up failed.')
            if (status && status >= 400 && status < 500) return

            navigate('/error', {
              replace: true,
              state: { errorCode: status ?? 503, from: 'signup' },
            })
            return
          }

          navigate('/error', {
            replace: true,
            state: { errorCode: 503, from: 'signup' },
          })
        }
      })()
    })
  }, [
    setSubmit,
    isBirthDateValid,
    fromOAuth,
    idToken,
    provider,
    birthDate,
    birthDateFormatted,
    navigate,
    setStoreId,
    setStoreName,
  ])

  return (
    <div>
      <FormIntro variant="signup">
        <p>When is your birthday?</p>
      </FormIntro>

      <div>
        <Input
          type="text"
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          variant={birthDateError ? 'error' : 'primary'}
          inputMode="numeric"
          onChange={e => handleBirthDateChange(e.target.value)}
          onBlur={() => handleBirthDateBlur(birthDate)}
          clearable
          onClear={() => {
            setMany({ birthDate: '' })
            setBirthDateError(null)
          }}
          value={birthDateDisplay}
        />
        {birthDateError && (
          <span className="text-body text-xs text-system-red">
            {birthDateError}
          </span>
        )}
      </div>
    </div>
  )
}

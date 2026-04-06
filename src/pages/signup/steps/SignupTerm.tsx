import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import axios from 'axios'
import Agreement from '../../../components/common/Agreement'
import FormIntro from '../../../components/common/FormIntro'
import { useAgreementStore } from '../../../stores/useAgreementStore'
import { oauthLogin } from '../../../api/auth'
import { useUserStore } from '../../../stores/useUserStore'
import { tokenService } from '../../../api/tokenService'
import type { OAuthLoginResponse } from '../../../types/auth'
import type { User } from '../../../types/user'
import { GA_ENABLED, IS_PROD } from '../../../constants/env'
import ReactGA from 'react-ga4'

type Provider = 'google' | 'apple'

type OutletContext = {
  setCanSubmit: (v: boolean) => void
  setSubmit: (fn: (() => void) | null) => void
}

export default function SignupTerm() {
  const agreements = useAgreementStore(s => s.value)
  const setManyAgreements = useAgreementStore(s => s.setMany)
  const { setCanSubmit, setSubmit } = useOutletContext<OutletContext>()

  const location = useLocation()
  const navigate = useNavigate()

  const setStoreId = useUserStore(s => s.setId)
  const setStoreName = useUserStore(s => s.setName)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const fromOAuth = Boolean(location.state?.fromOAuth)
  const idToken = location.state?.idToken as string | undefined
  const provider = location.state?.provider as Provider | undefined

  const requiredAgreed =
    agreements.service && agreements.privacy && agreements.ageLimit

  useEffect(() => {
    const el = document.getElementById('app-scroll')
    if (el) el.scrollTop = 0
  }, [location.key])

  useEffect(() => {
    setCanSubmit(requiredAgreed)
  }, [requiredAgreed, setCanSubmit])

  useEffect(() => {
    setSubmit(() => {
      return async () => {
        if (!requiredAgreed || isSubmitting) return

        if (!fromOAuth) {
          navigate('/signup/name')
          return
        }

        if (!idToken || !provider) {
          navigate('/login', { replace: true })
          return
        }

        try {
          setIsSubmitting(true)

          const res = (await oauthLogin({
            provider,
            idToken,
            confirmSignup: true,
          })) as OAuthLoginResponse

          if (!res?.success) return

          const user = res.data?.user as User | undefined
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
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status

            if (!status || status >= 500) {
              navigate('/error', {
                replace: true,
                state: { errorCode: status ?? 503, from: 'signup_term' },
              })
              return
            }

            return
          }

          navigate('/error', {
            replace: true,
            state: { errorCode: 503, from: 'signup_term' },
          })
        } finally {
          setIsSubmitting(false)
        }
      }
    })

    return () => setSubmit(null)
  }, [
    requiredAgreed,
    isSubmitting,
    fromOAuth,
    idToken,
    provider,
    navigate,
    setSubmit,
    setStoreId,
    setStoreName,
  ])

  return (
    <div>
      <FormIntro variant="signup">
        <div>
          Nice to meet you :{')'}
          <p>Please review the terms.</p>
        </div>
      </FormIntro>

      <div className="my-2">
        <Agreement value={agreements} onChange={setManyAgreements} />
      </div>
    </div>
  )
}

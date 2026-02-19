import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Button from '../components/common/Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { oauthLogin } from '../api/auth'
import { useUserStore } from '../stores/useUserStore'
import ReactGA from 'react-ga4'
import { GA_ENABLED, IS_PROD } from '../constants/env'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import GoogleLoginButton from '../components/common/GoogleLoginButton'
import { isNativeApp } from '../utils/isNativeApp'
import { type SocialLoginResponse } from '@capgo/capacitor-social-login'
import { SocialLogin } from '@capgo/capacitor-social-login'
import showToast from '../components/common/CommonToast'
import LastLoginBubble from '../components/common/LastLoginBubble'
import Logoicon from '../assets/auth/koach-logo.svg'
import AppleLoginIcon from '../assets/auth/appleLogin.svg'

type ErrorKind = 'wrong_email' | 'wrong_password' | 'both' | 'general' | null
type Provider = 'google' | 'email' | 'apple'

export default function LoginPage() {
  const [, setError] = useState<ErrorKind>(null)
  const [, setErrorMsg] = useState('')
  const [lastLogin, setLastLogin] = useState<Provider | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const setStoreId = useUserStore(s => s.setId)
  const setStoreName = useUserStore(s => s.setName)

  const googleLoginContainerRef = useRef<HTMLDivElement | null>(null)
  const isNative = isNativeApp()

  // 페이지 뷰
  useEffect(() => {
    if (IS_PROD && GA_ENABLED) {
      const yyyyMmDd = new Date().toISOString().slice(0, 10)
      ReactGA.event('view_login', { date: yyyyMmDd })
    }
  }, []) // 1회 실행

  const mapAuthError = ({
    status,
    errorCode,
    code,
    message,
  }: {
    status?: number
    errorCode?: string
    code?: string
    message?: string
  }): { type: ErrorKind; msg?: string } => {
    const ec = (errorCode || code || '').toUpperCase()
    const msg = (message || '').toLowerCase()

    const isEmailError =
      status === 404 ||
      ec === 'USER_NOT_FOUND' ||
      /(이메일|존재하지 않|email|not found)/i.test(msg)

    const isPasswordError =
      status === 401 ||
      ec === 'INVALID_PASSWORD' ||
      ec === 'INVALID_CREDENTIALS' ||
      /(비밀번호|password)/i.test(msg)

    if (isEmailError && isPasswordError) return { type: 'both' }
    if (isEmailError) return { type: 'wrong_email' }
    if (isPasswordError) return { type: 'wrong_password' }

    return { type: 'both', msg: 'Email error + Password error' }
  }

  const stringifyError = (e: unknown) => {
    try {
      if (e instanceof Error) return `${e.name}: ${e.message}`
      return JSON.stringify(e)
    } catch {
      return String(e)
    }
  }

  // const decodeJwtPayload = (token: string) => {
  //   try {
  //     const payload = token.split('.')[1]
  //     const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  //     const json = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join('')
  //     )
  //     return JSON.parse(json) as Record<string, unknown>
  //   } catch {
  //     return null
  //   }
  // }

  // const decodeJwtPart = (part: string) => {
  //   try {
  //     const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  //     const json = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join('')
  //     )
  //     return JSON.parse(json) as Record<string, unknown>
  //   } catch {
  //     return null
  //   }
  // }

  // const decodeJwtHeader = (token: string) => {
  //   const headerPart = token.split('.')[0]
  //   return headerPart ? decodeJwtPart(headerPart) : null
  // }

  // const nowSec = () => Math.floor(Date.now() / 1000)

  const handleGoogleNativeLogin = async () => {
    if (!isNativeApp()) return

    try {
      const r = (await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['profile', 'email'] },
      })) as SocialLoginResponse

      const idToken = r.result?.idToken
      if (!idToken) {
        alert('Google 로그인 실패 (앱)')
        return
      }

      const res = await oauthLogin({ provider: 'google', idToken })

      if (res.success) {
        const user = res.data.user
        setStoreId(user.id)
        setStoreName(user.name)
        localStorage.setItem('last_login', 'google')
        navigate(user.isOnboard ? '/' : '/onboarding')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        console.error('[Native OAuth] axios error:', { status, data, err })

        alert(
          `Google 로그인 실패 (앱)\nstatus=${status}\n` +
            `${typeof data === 'string' ? data : JSON.stringify(data)}`
        )
        return
      }

      const msg = stringifyError(err)
      console.error('네이티브 로그인 실패', err)
      alert(`Google 로그인 실패 (앱)\n${msg}`)
    }
  }

  const handleAppleLogin = async () => {
    if (!isNativeApp()) return

    try {
      const r = (await SocialLogin.login({
        provider: 'apple',
        options: { scopes: ['email', 'name'] },
      })) as SocialLoginResponse

      // alert(`[APPLE RESULT]\n${JSON.stringify(r.result)}`)

      const idToken = r.result?.idToken
      if (!idToken) {
        alert('Apple 로그인 실패 (앱)')
        return
      }

      // const header = decodeJwtHeader(idToken)
      // const payload = decodeJwtPayload(idToken)

      // alert(
      //   `[APPLE JWT]\n` +
      //     `kid=${String(header?.kid)}\n` +
      //     `alg=${String(header?.alg)}\n\n` +
      //     `iss=${String(payload?.iss)}\n` +
      //     `aud=${String(payload?.aud)}\n` +
      //     `sub=${String(payload?.sub)}\n` +
      //     `exp=${String(payload?.exp)} (now=${nowSec()})\n` +
      //     `iat=${String(payload?.iat)}\n` +
      //     `nonce=${String(payload?.nonce)}`
      // )

      // alert(`[SEND TO SERVER]\nprovider=apple\nidToken.len=${idToken.length}`)

      const res = await oauthLogin({ provider: 'apple', idToken })

      if (res.success) {
        const user = res.data.user
        setStoreId(user.id)
        setStoreName(user.name)
        localStorage.setItem('last_login', 'apple')
        navigate(user.isOnboard ? '/' : '/onboarding')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        console.error('[Apple OAuth] axios error:', { status, data, error })

        alert(
          `Apple 로그인 실패 (서버)\nstatus=${status}\n` +
            `${typeof data === 'string' ? data : JSON.stringify(data)}`
        )
        return
      }
      console.error(error)
      alert(`Apple 로그인 실패 (앱)\n${stringifyError(error)}`)
    }
  }

  const handleOAuthSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const idToken = credentialResponse.credential
      if (!idToken) {
        setError('general')
        setErrorMsg('Google 로그인에 실패했습니다.')
        return
      }

      const res = await oauthLogin({ provider: 'google', idToken })
      console.log('[OAuthLogin] res:', res)

      if (!res?.success) {
        const mapped = mapAuthError({
          errorCode: (res as { errorCode?: string }).errorCode,
          message: (res as { message?: string }).message,
        })
        setError(mapped.type)
        setErrorMsg(mapped.msg ?? '')

        if (IS_PROD && GA_ENABLED) {
          ReactGA.event('fail_login', {
            error_type: mapped.type ?? 'unknown_oauth_error',
            method: 'oauth_google',
          })
        }
        return
      }

      const user = res?.data?.user
      if (user) {
        setStoreId(user.id)
        setStoreName(user.name)
        localStorage.setItem('last_login', 'google')

        if (IS_PROD && GA_ENABLED) {
          ReactGA.set({ user_id: user.id })
          const yyyyMmDd = new Date().toISOString().slice(0, 10)
          ReactGA.event('login', { date: yyyyMmDd, method: 'oauth_google' })
        }

        navigate(user.isOnboard ? '/' : '/onboarding')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = (err.response?.data ?? {}) as {
          errorCode?: string
          code?: string
          message?: string
        }

        if (!status || status >= 500) {
          navigate('/error', {
            replace: true,
            state: { code: status ?? 503, from: 'oauth_login' },
          })
          return
        }

        const mapped = mapAuthError({
          status,
          errorCode: data.errorCode,
          code: data.code,
          message: data.message,
        })
        setError(mapped.type)
        setErrorMsg(mapped.msg ?? '')
        console.error('🚨 OAuth 로그인 에러:', err.response?.data || err)

        if (IS_PROD && GA_ENABLED) {
          ReactGA.event('fail_login', {
            error_type: mapped.type ?? 'unknown_oauth_catch_error',
            method: 'oauth_google',
          })
        }
      } else {
        navigate('/error', {
          replace: true,
          state: { code: 500, from: 'oauth_login' },
        })
      }
    }
  }

  const handleOAuthError = () => {
    console.error('🚨 Google OAuth 로그인 실패')
    setError('general')
    setErrorMsg('Google 로그인에 실패했습니다.')

    if (IS_PROD && GA_ENABLED) {
      ReactGA.event('fail_login', {
        error_type: 'oauth_google_error',
        method: 'oauth_google',
      })
    }
  }

  const handleCustomGoogleClick = () => {
    const container = googleLoginContainerRef.current
    if (!container) {
      console.error('Google 로그인 컨테이너를 찾을 수 없습니다.')
      return
    }

    const googleButton = container.querySelector(
      'div[role="button"]'
    ) as HTMLElement | null
    if (!googleButton) {
      console.error('Google 로그인 버튼을 찾을 수 없습니다.')
      return
    }

    googleButton.click()
  }

  useEffect(() => {
    const toastState = location.state?.toast
    if (!toastState) return

    showToast({
      message: toastState.message,
      iconType: toastState.iconType,
    })

    navigate(location.pathname, { replace: true })
  }, [location.state, navigate, location.pathname])

  useEffect(() => {
    const stored = localStorage.getItem('last_login') as Provider | null
    console.log(stored)
    if (stored === 'google' || stored === 'email' || stored === 'apple') {
      setLastLogin(stored)
    }
  }, [])

  return (
    <div className="h-full flex justify-center bg-white">
      <div className="w-[335px] max-w-md pt-16 pb-[calc(24px+env(safe-area-inset-bottom))] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full flex justify-center">
            <img src={Logoicon} alt="Koach" />
          </div>
        </div>

        <div className="pb-2">
          <div className="relative">
            <Button
              variant="primary"
              size="xl"
              className="w-full rounded-xl text-subtitle"
              onClick={() => navigate('/login/email')}
            >
              Continue with Email
            </Button>

            {lastLogin === 'email' && <LastLoginBubble provider="email" />}
          </div>

          {!isNative && (
            <div ref={googleLoginContainerRef} className="hidden">
              <GoogleLogin
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="100%"
                locale="en"
              />
            </div>
          )}

          <div className="relative mt-4 w-full">
            <GoogleLoginButton
              onClick={() =>
                isNative ? handleGoogleNativeLogin() : handleCustomGoogleClick()
              }
            />

            {lastLogin === 'google' && <LastLoginBubble provider="google" />}
          </div>

          <div className="my-4">
            <Button
              size="xl"
              className="bg-primary-900"
              onClick={handleAppleLogin}
            >
              <img src={AppleLoginIcon} alt="apple" className="w-7 h-7 mr-2" />
              <span className="text-subtitle text-base text-white">
                Continue with Apple
              </span>
            </Button>
          </div>

          <div className="mt-6 flex justify-center items-center gap-2 text-sm">
            <span className="text-gray-700">New to Koach?</span>
            <Link
              to="/signup"
              className="underline underline-offset-4 text-gray-800"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

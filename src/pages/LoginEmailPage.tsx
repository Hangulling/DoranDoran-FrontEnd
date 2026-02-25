import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useUserStore } from '../stores/useUserStore'

import showToast from '../components/common/CommonToast'
import { tokenService } from '../api/tokenService'

type ErrorKind = 'wrong_email' | 'wrong_password' | 'both' | 'general' | null

export default function LoginEmailPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ErrorKind>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0
  }, [email, password])

  const setStoreId = useUserStore(s => s.setId)
  const setStoreName = useUserStore(s => s.setName)

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

  const clearErrors = () => {
    if (error !== null) setError(null)
    if (errorMsg !== null) setErrorMsg(null)
  }

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    clearErrors()
    setEmail(e.target.value)
  }

  const handlePasswordChange: React.ChangeEventHandler<
    HTMLInputElement
  > = e => {
    clearErrors()
    setPassword(e.target.value)
  }

  const handleLogin = async () => {
    setError(null)
    setErrorMsg('')

    if (!email && !password) {
      setError('both')
      return
    }
    if (!email) {
      setError('wrong_email')
      return
    }
    if (!password) {
      setError('wrong_password')
      return
    }

    try {
      const res = await login({ email, password })

      if (!res?.success) {
        const mapped = mapAuthError({
          errorCode: (res as { errorCode?: string }).errorCode,
          message: (res as { message?: string }).message,
        })
        setError(mapped.type)
        setErrorMsg(mapped.msg ?? '')

        return
      }

      const user = res?.data?.user
      if (user) {
        setStoreId(user.id)
        setStoreName(user.name)

        await tokenService.setLastLogin('email')

        // 온보딩 확인 여부에 따라 라우팅
        if (user.isOnboard) {
          navigate('/')
        } else {
          navigate('/onboarding')
        }
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
            state: { code: status ?? 503, from: 'login' },
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
        console.error('🚨 로그인 에러:', err.response?.data || err)
      } else {
        navigate('/error', {
          replace: true,
          state: { code: 500, from: 'login' },
        })
      }
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') handleLogin()
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

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full bg-white rounded-lg">
        <div className="flex justify-center items-center">
          <div>
            <Input
              label="E-mail"
              type="email"
              variant={
                error === 'wrong_email' || error === 'both'
                  ? 'error'
                  : 'primary'
              }
              placeholder="Enter your E-mail"
              clearable
              value={email}
              onChange={handleEmailChange}
              onKeyDown={onKeyDown}
              onClear={() => {
                setEmail('')
                setError(null)
                setErrorMsg(null)
              }}
            />
            <Input
              label="Password"
              type="password"
              variant={
                error === 'wrong_password' || error === 'both'
                  ? 'error'
                  : 'primary'
              }
              placeholder="Enter 8-20 characters & letters+numbers"
              clearable
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={onKeyDown}
              onClear={() => {
                setPassword('')
                setError(null)
                setErrorMsg(null)
              }}
            />

            {(error || errorMsg) && (
              <span className="mt-1 block text-xs text-system-red text-body">
                {error === 'wrong_email' && 'Email error'}
                {error === 'wrong_password' && 'Password error'}
                {error === 'both' && 'Email error + Password error'}
                {!error && errorMsg && errorMsg}
              </span>
            )}

            <div className="flex justify-center items-center mt-4 py-2 gap-3 text-sm text-body text-gray-400">
              <Link to="/find-email">Forgot Email</Link>
              <div className="h-3 w-px bg-gray-100" />
              <Link to="/find-password">Forgot Password</Link>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center">
            <div className="w-full max-w-md bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)]">
              <Button
                onClick={handleLogin}
                variant="primary"
                size="xl"
                className="w-full"
                disabled={!canSubmit}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

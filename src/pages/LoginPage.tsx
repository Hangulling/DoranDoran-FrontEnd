import { useState } from 'react'
import axios from 'axios'
import loginCharacter from '../assets/auth/loginCharacter.svg'
import doran from '../assets/auth/doranText.svg'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useUserStore } from '../stores/useUserStore'
import ReactGA from 'react-ga4'

// GA 환경 변수
const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true'
const IS_PROD = import.meta.env.PROD

type ErrorKind = 'email' | 'password' | 'both' | 'general' | null

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ErrorKind>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

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
      status === 404 || ec === 'USER_NOT_FOUND' || /(이메일|존재하지 않|email|not found)/i.test(msg)

    const isPasswordError =
      status === 401 ||
      ec === 'INVALID_PASSWORD' ||
      ec === 'INVALID_CREDENTIALS' ||
      /(비밀번호|password)/i.test(msg)

    if (isEmailError && isPasswordError) return { type: 'both' }
    if (isEmailError) return { type: 'email' }
    if (isPasswordError) return { type: 'password' }

    return { type: 'both', msg: 'Email error + Password error' }
  }

  const handleLogin = async () => {
    setError(null)
    setErrorMsg('')

    if (!email && !password) {
      setError('both')
      return
    }
    if (!email) {
      setError('email')
      return
    }
    if (!password) {
      setError('password')
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

        if (IS_PROD && GA_ENABLED) {
          ReactGA.event('fail_login', {
            user_id: email, // '시도한' user_id (이메일)
            error_type: mapped.type ?? 'unknown_api_error', // 'email', 'password', 'both'
          })
        }

        return
      }

      const user = res?.data?.user
      if (user) {
        setStoreId(user.id)
        setStoreName(user.name)

        if (IS_PROD && GA_ENABLED) {
          // 1. 세션의 User-ID 설정 (이후 모든 이벤트에 이 ID가 포함됨)
          ReactGA.set({ userId: user.id })

          // 2. 로그인 성공 이벤트 전송
          const yyyyMmDd = new Date().toISOString().slice(0, 10)
          ReactGA.event('success_login', {
            user_id: user.id, // 파라미터로도 user_id 전송
            date: yyyyMmDd,
          })
        }
      }

      navigate('/')
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

        if (IS_PROD && GA_ENABLED) {
          ReactGA.event('fail_login', {
            user_id: email, // '시도한' user_id (이메일)
            error_type: mapped.type ?? 'unknown_catch_error', // 'email', 'password', 'both'
          })
        }
      } else {
        navigate('/error', { replace: true, state: { code: 500, from: 'login' } })
      }
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="flex justify-center items-center h-screen overflow-y-hidden">
      <div className="w-full bg-white rounded-lg">
        <div className="flex flex-col justify-center items-center mb-12">
          <img src={doran} alt="DoranDoran" className="mb-4" />
          <span className="text-gray-700 text-sm text-subtitle">
            Chat your way to real-life Korean
          </span>
        </div>

        <div className="flex justify-center">
          <img src={loginCharacter} alt="login character" />
        </div>

        <div className="flex justify-center items-center">
          <div className="mt-4">
            <Input
              type="email"
              variant={error === 'email' || error === 'both' ? 'error' : 'primary'}
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <Input
              type="password"
              variant={error === 'password' || error === 'both' ? 'error' : 'primary'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
            />

            {(error || errorMsg) && (
              <span className="mt-1 block text-xs text-orange-500 text-body">
                {error === 'email' && 'Email error'}
                {error === 'password' && 'Password error'}
                {error === 'both' && 'Email error + Password error'}
              </span>
            )}

            <Button
              variant="primary"
              size="xl"
              className="bg-gray-800 my-4 w-full text-subtitle"
              onClick={handleLogin}
            >
              Login
            </Button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 my-4 text-sm">
          <span className="text-gray-700 text-body">Don't have an account yet?</span>
          <Link to="/signup" className="underline underline-offset-4 text-title text-gray-800">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

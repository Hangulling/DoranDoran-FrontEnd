import { useState } from 'react'
import axios from 'axios'
import bubble1 from '../assets/auth/bubble1.svg'
import bubble2 from '../assets/auth/bubble2.svg'
import bubble3 from '../assets/auth/bubble3.svg'
import character from '../assets/auth/character.svg'
import doran from '../assets/auth/doranText.svg'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useUserStore } from '../stores/useUserStore'

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
        return
      }

      const user = res?.data?.user
      if (user) {
        setStoreId(user.id)
        setStoreName(user.name)
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

        <div className="flex justify-center items-center">
          <div className="relative w-[335px] h-[200px] flex justify-center items-end">
            <img
              src={bubble1}
              alt="bubble1"
              className="absolute top-[80px] left-[2px] object-contain w-[112px] h-[33px]
                 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]"
            />

            <img
              src={bubble2}
              alt="bubble2"
              className="absolute top-[22px] left-1/2 -translate-x-1/3 object-contain w-[120px] h-[33px]
                 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]"
            />

            <img
              src={bubble3}
              alt="bubble3"
              className="absolute top-[80px] right-[10px] object-contain w-[102px] h-[33px]
                 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.14)]"
            />

            <img
              src={character}
              alt="characters"
              className="object-contain z-20 translate-y-[10px]"
            />
          </div>
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

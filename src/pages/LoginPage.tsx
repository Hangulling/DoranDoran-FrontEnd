import { useState } from 'react'
import loginCharacter from '../assets/auth/loginCharacter.png'
import doran from '../assets/auth/doranText.svg'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || '로그인 실패')
        return
      }

      if (data.success) {
        console.log('🎉 로그인 성공!')
        console.log('발급된 토큰:', data.data.accessToken)
        console.log('로그인 유저 정보:', data.data.user)
        localStorage.setItem('accessToken', data.data.accessToken)
        navigate('/')
      }
    } catch (err) {
      console.error('error', err)
      setError('네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg">
        <div className="flex flex-col justify-center items-center mb-12">
          <img src={doran} alt="DoranDoran" className="mb-4" />
          <span className="text-gray-700 text-sm text-subtitle">
            Chat your way to real-life Korean
          </span>
        </div>

        <img src={loginCharacter} alt="login character" />
        <div className="mt-4">
          <Input
            type="email"
            variant={error ? 'error' : 'primary'}
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            type="password"
            variant={error ? 'error' : 'primary'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <span className="mt-1 block text-xs text-orange-500 text-body">{error}</span>}

          <Button
            variant="primary"
            size="xl"
            className="bg-gray-800 my-4 w-full text-subtitle"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>

        <div className="flex justify-center items-center gap-2 mt-6 text-sm">
          <span className="text-gray-700 text-body">Don't have an account yet?</span>
          <Link to="/signup" className="underline underline-offset-4 text-title text-gray-800">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

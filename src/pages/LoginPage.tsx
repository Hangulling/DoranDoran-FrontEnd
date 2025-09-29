import { useState } from 'react'
import loginCharacter from '../assets/loginCharcter.svg'
import doran from '../assets/doranText.svg'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<'email' | 'password' | 'both' | null>(null)
  const navigate = useNavigate()

  const handleLogin = () => {
    const isEmail = email === 'test@example.com'
    const isPassword = password === 'qwer1234'

    setError(null)

    if (!isEmail && !isPassword) {
      setError('both')
      return
    }
    if (!isEmail) {
      setError('email')
      return
    }
    if (!isPassword) {
      setError('password')
      return
    }

    navigate('/')
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
        <img src={loginCharacter} />
        <div className="mt-4">
          <div>
            <Input
              type="email"
              variant={error === 'email' || error === 'both' ? 'error' : 'primary'}
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              variant={error === 'password' || error === 'both' ? 'error' : 'primary'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && (
              <span className="mt-1 block text-xs text-orange-500 text-body">
                {error === 'email' && 'Email error'}
                {error === 'password' && 'Password error'}
                {error === 'both' && 'Email error + Password error'}
              </span>
            )}
          </div>

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

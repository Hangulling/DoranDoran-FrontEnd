import { Link, useLocation } from 'react-router-dom'
import findCharacterIcon from '../../assets/auth/character-confiused.svg'
import Input from '../../components/common/Input'
export default function FindEmailSuccess() {
  const location = useLocation()
  const email = location.state?.email ?? ''

  return (
    <div>
      <Input label="This is your account email" readOnly value={email} />

      <div className="flex flex-col justify-center items-center gap-2 mt-10">
        <img src={findCharacterIcon} />
        <Link
          to="/find-password"
          className="text-sm text-title text-gray-800 underline underline-offset-4 mt-2s"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import Input from '../../components/common/Input'
export default function FindEmailSuccess() {
  const location = useLocation()
  const email = location.state?.email ?? ''

  return (
    <div className="mt-10">
      <Input
        variant="primary"
        label="This is your account email"
        readOnly
        value={email}
      />

      <div className="flex flex-col gap-2 mt-8">
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

import { Link } from 'react-router-dom'

export default function FindEmailNotFound() {
  return (
    <div className="mt-12 w-full self-start px-4 flex flex-col gap-2 text-left">
      <div className="text-sm text-body text-gray-500s">
        Sorry, we couldn't find your email
      </div>

      <Link
        to="/signup"
        className="text-sm text-title text-gray-800 underline underline-offset-4"
      >
        Create account
      </Link>
    </div>
  )
}

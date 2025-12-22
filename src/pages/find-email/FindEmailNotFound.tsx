import { Link } from 'react-router-dom'
import findCharacterIcon from '../../assets/auth/character-confiused.svg'

export default function FindEmailNotFound() {
  return (
    <div>
      <div className="flex flex-col justify-center items-center gap-2 mt-10">
        <img src={findCharacterIcon} />
        <div className="flex flex-col items-center text-sm text-body text-gray-600 gap-1">
          <div>Sorry, we couldn't</div>
          <div>find your email</div>
        </div>
        <Link
          to="/signup"
          className="text-sm text-title text-gray-800 underline underline-offset-4"
        >
          Create account
        </Link>
      </div>
    </div>
  )
}

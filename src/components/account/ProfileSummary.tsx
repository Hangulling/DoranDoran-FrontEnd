import ArrowRightIcon from '../../assets/icon/ArrowRightIcon'

interface ProfileSummaryProps {
  name: string
  email: string
  onClick: () => void
}

export default function ProfileSummary({
  name,
  email,
  onClick,
}: ProfileSummaryProps) {
  return (
    <div className="w-full" onClick={onClick}>
      <div className="flex justify-between items-end mx-4 mt-6">
        <div>
          <p className="text-title text-lg text-gray-800">{name}</p>
        </div>
        <ArrowRightIcon />
      </div>
      <span className="text-body text-xs text-gray-400 mx-4">{email}</span>
    </div>
  )
}

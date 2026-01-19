import React from 'react'
import Flag from '../../../assets/icon/flag.svg?react'

interface FlagIconProps {
  isReported: boolean
  onActive: () => void
}

const FlagIcon: React.FC<FlagIconProps> = ({ isReported, onActive }) => {
  return (
    <button
      onClick={onActive}
      className="focus:outline-none"
      aria-label="신고하기"
    >
      {isReported ? (
        <Flag className="text-primary-300" />
      ) : (
        <Flag className="fill-gray-0 stroke-gray-700" />
      )}
    </button>
  )
}

export default FlagIcon

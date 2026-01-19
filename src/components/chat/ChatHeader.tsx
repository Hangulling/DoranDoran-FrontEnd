import React from 'react'
import { useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg?react'
import SettingIcon from '../../assets/chat/setting.svg?react'
import { capitalizeName } from '../../utils/capitalizeFirstLetter'
import { getClosenessAsText } from '../../utils/conceptMap'

interface ChatHeaderProps {
  title: string
  avatar?: string
  closenessLevel?: number
  onBack?: () => void
  onSettingClick?: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  avatar,
  closenessLevel,
  onBack,
  onSettingClick,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="sticky shrink-0 top-0 z-30 bg-gray-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)] h-16 px-5 flex items-center justify-between">
      <div className="flex flex-row gap-2">
        {/* 뒤로가기 */}
        <button onClick={handleBack}>
          <LeftArrowIcon className="text-gray-600" />
        </button>

        <div className="w-10 h-10 rounded-[12px] overflow-hidden shrink-0 mr-[2px]">
          <img
            src={avatar}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-start justify-center">
          <h1 className="text-title text-[16px]">{capitalizeName(title)}</h1>
          {closenessLevel !== undefined && (
            <div className="flex text-[12px] text-primary-400">
              <span>{getClosenessAsText(closenessLevel)} Mode</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-10 flex justify-end">
        {onSettingClick && (
          <button onClick={onSettingClick} className="p-2 -mr-2">
            <SettingIcon />
          </button>
        )}
      </div>
    </header>
  )
}

export default ChatHeader

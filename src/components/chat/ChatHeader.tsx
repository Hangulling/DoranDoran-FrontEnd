import React from 'react'
import { useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg?react'
import SettingIcon from '../../assets/chat/setting.svg?react'

interface ChatHeaderProps {
  title: string
  closenessLevel?: number
  onBack?: () => void
  onSettingClick?: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
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
    <header className="sticky shrink-0 top-0 z-50 bg-gray-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)] h-16 px-5 flex items-center justify-between">
      {/* 뒤로가기 */}
      <button onClick={handleBack} className="p-2 -ml-2">
        <LeftArrowIcon className="text-gray-600" />
      </button>

      <div className="flex flex-col items-center">
        <h1 className="text-title text-[16px] font-bold">{title}</h1>
        {closenessLevel !== undefined && (
          <div className="flex items-center gap-1 text-xs text-primary-500">
            <span>친밀도 Lv.{closenessLevel}</span>
          </div>
        )}
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

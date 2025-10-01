import React, { useState } from 'react'
import TTSIcon from './VolumeIcon'
import BookmarkIcon from './BookmarkIcon'
import useTTS from '../../hooks/useTTS'

interface ChatBubbleProps {
  message: string
  isSender: boolean
  avatarUrl?: string
  variant?: 'basic' | 'second' | 'sender'
  showIcon?: boolean
}

const bubbleVariants = {
  basic: 'bg-white border border-gray-100 text-gray-800 rounded-lg rounded-tl-none', // 기본 답장
  second: 'bg-white border border-gray-100 text-gray-800 rounded-lg', // 두번째 답장
  sender: 'bg-green-400 text-white rounded-lg rounded-tr-none', // 사용자 채팅
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSender,
  avatarUrl,
  variant = 'basic',
  showIcon = false,
}) => {
  const baseBubbleClass = 'py-[6px] px-2 text-[14px] max-w-[265px] rounded-lg'
  const bubbleClass = `${baseBubbleClass} ${isSender ? bubbleVariants.sender : bubbleVariants[variant]}`
  const marginClass = !isSender && (avatarUrl || variant === 'second') ? 'ml-10' : ''

  const [isBookmarked, setIsBookmarked] = useState(false)
  const { onPlay: playTTS, playing: isPlaying } = useTTS(message)

  const toggleBookmark = () => setIsBookmarked(!isBookmarked)

  return (
    <div
      className={
        isSender
          ? 'chat chat-end gap-x-[0] pt-0 pb-2'
          : 'chat chat-start gap-x-[8px] relative pt-0 pb-2'
      }
    >
      {!isSender && avatarUrl && variant === 'basic' && (
        <div className="chat-image avatar absolute top-1 left-0 w-8 h-8">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img alt="프로필 사진" src={avatarUrl} />
          </div>
        </div>
      )}

      <div className={`${bubbleClass} ${marginClass} flex flex-col max-w-[265px]`}>
        <span>{message}</span>

        {!isSender && showIcon && (
          <>
            <div className="h-[1px] bg-gray-80 w-full my-1" />
            <div className="flex flex-row justify-between">
              <TTSIcon playing={isPlaying} onPlay={playTTS} />
              <BookmarkIcon isBookmarked={isBookmarked} onToggle={toggleBookmark} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatBubble

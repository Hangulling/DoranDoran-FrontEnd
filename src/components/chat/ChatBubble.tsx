import React from 'react'
import TTSIcon from './Icon/VolumeIcon'
import BookmarkIcon from './Icon/BookmarkIcon'
import useTTS from '../../hooks/useTTS'
import FlagIcon from './Icon/FlagIcon'
import BookIcon from './Icon/BookIcon'

interface ChatBubbleProps {
  message: React.ReactNode
  isSender: boolean
  avatarUrl?: string
  variant?: 'basic' | 'second' | 'sender' | 'error'
  showIcon?: boolean
  messageId?: string // 북마크
  isBookmarked?: boolean
  onBookmarkToggle?: (messageId: string, content: string) => void // 북마크
  onBookToggle?: () => void
  isBookActive?: boolean
  isReported?: boolean
  onReport?: () => void
}

const bubbleVariants = {
  basic: 'bg-gray-0 border border-gray-100 rounded-2xl rounded-tl-none', // 기본 답장
  second: 'bg-gray-0 border border-gray-100 rounded-2xl', // 두번째 답장
  sender:
    'bg-primary-300 text-gray-0 rounded-2xl rounded-tr-none text-subtitle', // 사용자 채팅
  error:
    'bg-gray-0 border border-gray-100 rounded-2xl rounded-tl-none text-system-red', // 에러 채팅
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSender,
  variant = 'basic',
  showIcon = false,
  messageId,
  isBookmarked,
  onBookmarkToggle,
  onBookToggle,
  isBookActive = false,
  isReported = false,
  onReport,
}) => {
  const baseBubbleClass =
    'py-[10px] px-[14px] text-[14px] max-w-[305px] rounded-2xl'
  // 취소할 경우 빈 말풍선
  const isEmptyMessage = typeof message === 'string' && message === ''
  const bubbleClass = `${baseBubbleClass} ${
    isSender ? bubbleVariants.sender : bubbleVariants[variant]
  } ${isEmptyMessage ? 'min-w-[59px]' : ''}`

  const ttsText = typeof message === 'string' ? message : ''
  const { onPlay: playTTS, playing: isPlaying } = useTTS(ttsText)

  const toggleBookmark = () => {
    if (onBookmarkToggle && messageId && typeof message === 'string') {
      onBookmarkToggle(messageId, message)
    }
  }

  return (
    <div
      className={
        isSender
          ? 'chat chat-end py-0 gap-0'
          : 'chat chat-start relative py-0 gap-0'
      }
    >
      <div className={`${bubbleClass} flex flex-col`}>
        {/* 빈 말풍선 높이 유지 */}
        <span>{isEmptyMessage ? '\u00A0' : message}</span>

        {/* 사전, 깃발 아이콘 추가하기 */}
        {!isSender && showIcon && (
          <div className="flex flex-row justify-between mt-2 items-center">
            <div className="flex flex-row gap-3 items-center">
              <TTSIcon playing={isPlaying} onPlay={playTTS} />
              <BookIcon onToggle={onBookToggle} isActive={isBookActive} />
              <BookmarkIcon
                isBookmarked={isBookmarked ?? false}
                onToggle={toggleBookmark}
              />
            </div>
            <FlagIcon
              isReported={isReported}
              onActive={onReport || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatBubble

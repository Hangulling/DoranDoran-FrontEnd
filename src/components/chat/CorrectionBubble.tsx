import React, { useEffect, useState } from 'react'
import TTSIcon from './VolumeIcon'
import BookmarkIcon from './BookmarkIcon'
import useTTS from '../../hooks/useTTS'
import FlagIcon from '../../assets/icon/flag.svg?react'

interface CorrectionBubbleProps {
  chatRoomId: string
  showKorean?: boolean
  descriptionByTab?: Record<string, string>
  correctedSentence?: string
  isSender?: boolean
  messageId?: string // 북마크
  originalContent?: string
  correctedContent?: string
  isLoading?: boolean
  isBookmarked?: boolean
  onBookmarkToggle?: (
    messageId: string,
    content: string,
    correctedContent: string
  ) => void
}

const wrapperClass = 'chat chat-end gap-0 pt-[10px] pb-0'
const bubbleClass =
  'rounded-[16px] p-0 w-[305px] mb-0 overflow-hidden border-[1px] border-transparent bg-origin-border bg-[linear-gradient(#fff,#fff),linear-gradient(rgba(255,255,255,0.6),rgba(255,255,255,0.6)),linear-gradient(to_right,#7487FB_0%,#6B51F0_100%)] [background-clip:padding-box,border-box,border-box]'

const CorrectionBubble: React.FC<CorrectionBubbleProps> = ({
  showKorean = false,
  descriptionByTab,
  messageId,
  originalContent,
  correctedContent,
  isLoading,
  isBookmarked,
  onBookmarkToggle,
}) => {
  const [currentDescription, setCurrentDescription] = useState(
    descriptionByTab ?? {}
  )

  useEffect(() => {
    if (descriptionByTab) {
      setCurrentDescription(descriptionByTab)
    }
  }, [descriptionByTab])

  const { onPlay: playTTS, playing: isPlaying } = useTTS(
    isLoading ? '' : (correctedContent ?? '')
  ) // 로딩 중 비활

  const toggleBookmark = () => {
    if (isLoading) return // 로딩 중 비활

    if (onBookmarkToggle) {
      if (!messageId) return
      onBookmarkToggle(messageId, originalContent ?? '', correctedContent ?? '')
    }
  }

  return (
    <div className={wrapperClass}>
      <div className={bubbleClass}>
        <div className="bg-primary-10 pt-3 pb-[10px] px-[14px]">
          <div className="flex items-center justify-between text-[12px] text-title text-primary-300">
            <p>Correction by closeness level</p>
          </div>
        </div>

        {/* 교정된 문장 */}
        <div className="bg-gray-0 px-[10px] pt-[10px]">
          <div className="flex flex-row justify-start mb-[6.5px] gap-x-[6px]">
            <TTSIcon playing={isPlaying} onPlay={playTTS} />
            {isLoading ? (
              <div className="bg-primary-10 animate-pulse rounded-[4px] h-4 w-3/4"></div>
            ) : (
              <p className="text-subtitle text-[14px]">{correctedContent}</p>
            )}
          </div>

          {/* 설명 */}
          <div className="text-[14px] text-gray-800">
            {isLoading ? (
              <div className="space-y-1.5 pt-1">
                <div className="bg-primary-10 animate-pulse rounded-[4px] h-[19px] w-full"></div>
                <div className="bg-primary-10 animate-pulse rounded-[4px] h-[19px] w-5/6"></div>
              </div>
            ) : (
              currentDescription[showKorean ? 'Kor' : 'Eng']
            )}
          </div>

          <div className="flex flex-row justify-between mt-2 mb-3">
            <BookmarkIcon
              isBookmarked={isBookmarked ?? false}
              onToggle={toggleBookmark}
            />
            <FlagIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CorrectionBubble

import React, { useEffect, useState } from 'react'
import useClosenessStore from '../../stores/useClosenessStore'
import TTSIcon from './VolumeIcon'
import BookmarkIcon from './BookmarkIcon'
import useTTS from '../../hooks/useTTS'
import { useParams } from 'react-router-dom'

interface CorrectionBubbleProps {
  chatRoomId: string
  initialTab?: string
  descriptionByTab?: Record<string, string>
  correctedSentence?: string
  isSender?: boolean
  messageId?: string // 북마크
  originalContent?: string
  correctedContent?: string
  isLoading?: boolean
  isBookmarked?: boolean
  onBookmarkToggle?: (messageId: string, content: string, correctedContent: string) => void
}

const tabs = ['Kor', 'Eng']
const wrapperClass = 'chat chat-end gap-0 pt-[10px] pb-0'
const bubbleClass = 'bg-green-50 rounded-lg px-[10px] py-[10px] w-[265px] mb-0'

const CorrectionBubble: React.FC<CorrectionBubbleProps> = ({
  initialTab = 'Eng',
  descriptionByTab,
  messageId,
  originalContent,
  correctedContent,
  isLoading,
  isBookmarked,
  onBookmarkToggle,
}) => {
  const { id: routeId } = useParams<{ id: string }>()
  const [selectedTab, setSelectedTab] = useState(initialTab)
  const [currentDescription, setCurrentDescription] = useState(descriptionByTab ?? {})

  useEffect(() => {
    if (descriptionByTab) {
      setCurrentDescription(descriptionByTab)
    }
  }, [descriptionByTab])

  const closeness = useClosenessStore(state => state.getCloseness(routeId ?? '')) ?? 1
  const closenessText = closeness === 1 ? 'Polite' : closeness === 2 ? 'Casual' : 'Friendly'

  const { onPlay: playTTS, playing: isPlaying } = useTTS(isLoading ? '' : (correctedContent ?? '')) // 로딩 중 비활

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
        <div className="flex items-center justify-between text-[12px] mb-1">
          <div className="flex flex-col space-y-2 items-left text-title">
            <p className="text-green-500">
              closeness level -<span> {closenessText}</span>
            </p>
            {isLoading ? (
              <div className="bg-green-80 animate-pulse rounded-[4px] h-4 w-3/4"></div>
            ) : (
              <p>{correctedContent}</p>
            )}
          </div>
          <div className="flex p-0.5 bg-green-80 rounded-[6px] mt-[26px]">
            {tabs.map(tab => (
              <button
                key={tab}
                className={
                  selectedTab === tab
                    ? 'px-1 py-0.5 rounded-[4px] bg-white text-green-400 text-subtitle shadow-none'
                    : 'px-1 py-0.5 rounded-[4px] bg-green-80 text-gray-300 text-subtitle shadow-none'
                }
                style={{ border: 'none' }}
                onClick={() => setSelectedTab(tab)}
                type="button"
                disabled={isLoading} // 로딩 중 탭 비활
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-green-80 w-full my-2" />
        <div className="text-[14px] text-gray-700">
          {isLoading ? (
            <div className="space-y-1.5 pt-1">
              <div className="bg-green-80 animate-pulse rounded-[4px] h-[14px] w-full"></div>
              <div className="bg-green-80 animate-pulse rounded-[4px] h-[14px] w-5/6"></div>
            </div>
          ) : (
            currentDescription[selectedTab]
          )}
        </div>
        <>
          <div className="h-[1px] bg-green-80 w-full my-1" />
          <div className="flex flex-row justify-between">
            <TTSIcon playing={isPlaying} onPlay={playTTS} />
            <BookmarkIcon isBookmarked={isBookmarked ?? false} onToggle={toggleBookmark} />
          </div>
        </>
      </div>
    </div>
  )
}

export default CorrectionBubble

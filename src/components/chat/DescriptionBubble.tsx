import React from 'react'
import useTTS from '../../hooks/useTTS'
import TTSIcon from './Icon/VolumeIcon'
import messageIcon from '../../assets/icon/message_x.svg'
import useArchiveStore from '../../stores/useArchiveStore'

type VARIANT = 'chat' | 'archive'

const VARIANTS: Record<VARIANT, string> = {
  chat: 'mt-2 bg-gray-0 border border-gray-100 rounded-xl px-[14px] py-3 max-w-[305px] mb-0',
  archive: 'ml-0 bg-white rounded-lg px-4 pb-[10px] w-[330px] mb-2',
}

interface DescriptionBubbleProps {
  word: string
  pronunciation: string
  showKorean?: boolean
  descriptionByTab: Record<string, string>
  variant?: VARIANT
  isSelected?: boolean
  correctMsg?: boolean
}

const DescriptionBubble: React.FC<DescriptionBubbleProps> = ({
  word,
  pronunciation,
  showKorean = false,
  descriptionByTab,
  variant = 'chat',
  isSelected,
  correctMsg,
}) => {
  const { selectionMode } = useArchiveStore()
  const { onPlay: playTTS, playing } = useTTS(word)

  const containerClass = [
    VARIANTS[variant],
    variant === 'archive' && (selectionMode ? isSelected : isSelected)
      ? '!bg-green-50 '
      : '',
  ].join(' ')

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between text-[14px] mb-[2px]">
        <div className="flex items-center flex-wrap">
          <div className="mr-1 h-5 w-5">
            {correctMsg ? (
              <img src={messageIcon} />
            ) : (
              <TTSIcon playing={playing} onPlay={playTTS} />
            )}
          </div>
          <span
            className={`${
              variant === 'archive' ? 'text-sm' : 'text-[14px]'
            } ${correctMsg ? 'text-body text-gray-400' : 'text-subtitle text-gray-700'}`}
          >
            {word}
          </span>
          {pronunciation && (
            <span className="text-[14px] ml-1.5 text-gray-500">
              [{pronunciation}]
            </span>
          )}
        </div>
        <div className="flex p-0.5 bg-gray-80 rounded-[6px]"></div>
      </div>

      {variant === 'chat' && (
        <div className="h-[1px] bg-gray-50 w-full my-[6px]" />
      )}
      <div className="text-[14px] text-gray-800">
        {descriptionByTab[showKorean ? 'Kor' : 'Eng']}
      </div>
    </div>
  )
}

export default DescriptionBubble

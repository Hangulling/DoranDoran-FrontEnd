import ArrowDownIcon from '../../assets/icon/ArrowDownIcon'
import ArrowUpIcon from '../../assets/icon/ArrowUpIcon'
import VolumeIcon from '../../assets/icon/VolumeIcon'
import Badge from '../common/Badge'
import type { Closeness } from '../../types/archive'
import { archiveCardStyle } from '../../constants/archiveData'
import useTTS from '../../hooks/useTTS'
import CheckIcon from '../../assets/icon/CheckIcon'

interface WordCardProps {
  id: string
  selected: boolean
  selectionMode: boolean
  onToggleSelect: (id: string) => void
  closeness: Closeness
  word: string
  pronunciation: string
  description: string
  content: string
  open: boolean
  onToggle: () => void
}

export default function WordCard({
  id,
  selected,
  selectionMode,
  onToggleSelect,
  closeness,
  word,
  pronunciation,
  description,
  content,
  open,
  onToggle,
}: WordCardProps) {
  const style = archiveCardStyle[closeness]
  const wordTTS = useTTS(word)
  const contentTTS = useTTS(content)

  const handleWordSpeaker = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    if (contentTTS.playing) contentTTS.onPlay()
    wordTTS.onPlay()
  }

  const handleContentSpeaker = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    if (wordTTS.playing) wordTTS.onPlay()
    contentTTS.onPlay()
  }

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect(id)
      return
    }
    onToggle()
  }

  return (
    <div>
      <div
        className={`flex items-center justify-between border-b ${
          open ? style.wordBorder : 'border-gray-50'
        } p-2`}
        onClick={handleClick}
      >
        <div className="flex min-w-0 flex-1 gap-2 py-2">
          <VolumeIcon className="flex-shrink-0" onClick={handleWordSpeaker} />

          <div className="min-w-0 flex-1 flex items-start justify-between gap-1">
            <span className="text-subtitle text-base text-gray-800 break-words">
              {word}
            </span>

            <span className="text-body text-sm text-gray-400 flex-shrink-0 w-[200px]">
              [{pronunciation}]
            </span>
          </div>
        </div>

        {selectionMode ? (
          selected ? (
            <div className="w-5 h-5 rounded-full bg-primary-300">
              <CheckIcon className="text-gray-0" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-gray-200" />
          )
        ) : open ? (
          <ArrowUpIcon className="text-gray-400 flex-shrink-0 ml-2 w-5 h-5" />
        ) : (
          <ArrowDownIcon className="text-gray-400 flex-shrink-0 ml-2 w-5 h-5" />
        )}
      </div>

      {open && (
        <div className="px-3 py-2">
          <div className="text-body text-sm text-gray-700 p-2">
            {description}
          </div>
          <div
            className={`flex justify-between items-center ${style.bgColor} rounded-[21px] p-2`}
          >
            <div className="flex gap-1">
              <VolumeIcon
                className="text-gray-700 flex-shrink-0"
                onClick={handleContentSpeaker}
              />
              <span className="text-body text-sm text-gray-700">{content}</span>
            </div>
            <Badge variant={closeness} />
          </div>
        </div>
      )}
    </div>
  )
}

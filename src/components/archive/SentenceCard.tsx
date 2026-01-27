import VolumeIcon from '../../assets/icon/VolumeIcon'
import { archiveCardStyle } from '../../constants/archiveData'
import type { Closeness } from '../../types/archive'
import ArrowUpIcon from '../../assets/icon/ArrowUpIcon'
import ArrowDownIcon from '../../assets/icon/ArrowDownIcon'
import useTTS from '../../hooks/useTTS'
import CheckIcon from '../../assets/icon/CheckIcon'

interface SentenceCardProps {
  id: string
  selected: boolean
  selectionMode: boolean
  onToggleSelect: (id: string) => void
  closeness: Closeness
  content: string
  description: string
  open: boolean
  onToggle: () => void
}

export default function SentenceCard({
  id,
  selected,
  selectionMode,
  onToggleSelect,
  closeness,
  content,
  description,
  open,
  onToggle,
}: SentenceCardProps) {
  const style = archiveCardStyle[closeness]
  const { onPlay } = useTTS(content)

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect(id)
      return
    }
    onToggle()
  }

  const handleSpeaker = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay()
  }

  return (
    <div className="w-[335px] border-b border-b-gray-100">
      <div className={`flex items-center mt-1 h-[67px] `} onClick={handleClick}>
        <div className={`border-l-[3px] ${style.border} h-[59px]`} />
        <div className="flex-1 min-w-0 ml-2">
          <span className={`py-2 text-subtitle text-xs ${style.text}`}>
            {closeness}
          </span>
          <div className="flex">
            <div className="flex">
              <VolumeIcon className="text-gray-700" onClick={handleSpeaker} />
              <span className="text-subtitle text-sm text-gray-700">
                {content}
              </span>
            </div>
          </div>
        </div>
        {selectionMode ? (
          selected ? (
            <div className="w-5 h-5 rounded-full bg-primary-300 flex items-center justify-center">
              <CheckIcon className="text-gray-0" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-gray-200" />
          )
        ) : open ? (
          <ArrowUpIcon className="text-gray-400" />
        ) : (
          <ArrowDownIcon className="text-gray-400" />
        )}
      </div>
      {open && (
        <div className="border-l text-body text-sm bg-gray-10 text-gray-700 p-3">
          {description}
        </div>
      )}
    </div>
  )
}

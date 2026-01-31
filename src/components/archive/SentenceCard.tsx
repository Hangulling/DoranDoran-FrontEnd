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
    <div className="flex justify-center items-center my-4  mx-6">
      <div className="w-full max-w-app md:max-w-tablet lg:max-w-desktop border-b border-b-gray-100">
        <div
          className={`flex mt-1 items-center ${open ? 'py-2' : 'h-[67px]'}`}
          onClick={handleClick}
        >
          <div className="self-stretch">
            <div className={`border-l-[3px] ${style.border} h-full`} />
          </div>
          <div className="flex-1 min-w-0 ml-2">
            <span className={`py-2 text-subtitle text-xs ${style.text}`}>
              {closeness}
            </span>
            <div className="flex mt-1">
              <div className="flex min-w-0">
                <VolumeIcon
                  className="text-gray-700 shrink-0"
                  onClick={handleSpeaker}
                />
                <span
                  className={`ml-1 min-w-0 text-subtitle text-sm text-gray-700 ${
                    open
                      ? 'whitespace-normal break-words'
                      : 'overflow-hidden whitespace-nowrap text-ellipsis'
                  }`}
                >
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
            <ArrowUpIcon className="text-gray-400 shrink-0" />
          ) : (
            <ArrowDownIcon className="text-gray-400 shrink-0" />
          )}
        </div>

        {open && description && (
          <div className="border-l text-body text-sm bg-gray-10 text-gray-700 p-3">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

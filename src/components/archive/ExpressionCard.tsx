import check from '../../assets/icon/checkAll.svg'
import checkOff from '../../assets/icon/disabledCheckAll.svg'
import speakerOn from '../../assets/icon/activeVolume.svg'
import speakerOff from '../../assets/icon/defaultVolume.svg'
// import expandIcon from '../../assets/icon/expandArrow.svg'
import useArchiveStore from '../../stores/useArchiveStore'
import useTTS from '../../hooks/useTTS'
import Badge, { type BadgeVariant } from '../common/Badge'

interface ExpressionCardProps {
  item: {
    id: string
    text: string
    intimacy: number
  }
}

export default function ExpressionCard({ item }: ExpressionCardProps) {
  const { selectionMode, selectedIds, toggleSelect } = useArchiveStore()
  const isSelected = selectedIds.has(item.id)
  const { onPlay, playing } = useTTS(item.text)
  const getBadgeVariant = (level: number): BadgeVariant => {
    switch (level) {
      case 1:
        return 'Casual'
      case 2:
        return 'Friendly'
      case 3:
        return 'Close'
      default:
        return 'Casual'
    }
  }

  const handleClick = () => {
    if (selectionMode) toggleSelect(item.id)
  }

  const handleSpeakerClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()
    onPlay()
  }

  return (
    <div className="flex justify-center items-center mb-3" onClick={handleClick}>
      <div
        className={`flex flex-col justify-center items-center border ${
          isSelected ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white'
        } w-[335px] h-[71px] rounded-xl`}
      >
        <div className="flex w-full justify-between px-4">
          <Badge variant={getBadgeVariant(item.intimacy)} />

          {selectionMode && (
            <img
              src={isSelected ? check : checkOff}
              className="w-5 h-5"
              alt={isSelected ? '선택됨' : '선택 안 됨'}
            />
          )}
        </div>

        <div className="flex justify-between w-full px-4 mt-1">
          <div className="flex">
            <img
              src={playing ? speakerOn : speakerOff}
              className="w-5 h-5 mr-1"
              alt={playing ? '읽는 중' : '읽기'}
              onClick={handleSpeakerClick}
            />
            <span className="text-body text-sm text-gray-800 truncate">{item.text}</span>
          </div>
          {/* <img src={expandIcon} /> */}
        </div>
      </div>
    </div>
  )
}

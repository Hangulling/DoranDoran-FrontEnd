import check from '../../assets/icon/checkAll.svg'
import checkOff from '../../assets/icon/disabledCheckAll.svg'
import speaker from '../../assets/icon/tts.svg'
import useArchiveStore from '../../stores/useArchiveStore'

interface ExpressionCardProps {
  item: {
    id: string
    text: string
    level: number
  }
}

export default function ExpressionCard({ item }: ExpressionCardProps) {
  const { selectionMode, selectedIds, toggleSelect } = useArchiveStore()
  const isSelected = selectedIds.has(item.id)

  const handleClick = () => {
    if (selectionMode) {
      toggleSelect(item.id)
    }
  }

  return (
    <div className="flex justify-center items-center my-2" onClick={handleClick}>
      <div
        className={`flex flex-col justify-center items-center border ${isSelected ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white'} w-[335px] h-[71px] rounded-xl`}
      >
        <div className="flex w-full justify-between px-4">
          <span className="text-body text-xs text-gray-500">친밀도 Lv{item.level}</span>
          {selectionMode && (
            <img
              src={isSelected ? check : checkOff}
              className="w-5 h-5"
              alt={isSelected ? '선택됨' : '선택 안 됨'}
            />
          )}
        </div>
        <div className="flex w-full px-4 mt-1">
          <img src={speaker} className="w-5 h-5 mr-1" alt="tts" />
          <span className="text-body text-sm text-gray-800">{item.text}</span>
        </div>
      </div>
    </div>
  )
}

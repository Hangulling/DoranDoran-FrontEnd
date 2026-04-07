import { useEffect, useMemo, useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'

import Friend1 from '../../assets/chat/friend1.png'
import Friend2 from '../../assets/chat/friend2.png'
import Honey1 from '../../assets/chat/honey1.png'
import Honey2 from '../../assets/chat/honey2.png'
import Coworker1 from '../../assets/chat/coworker1.png'
import Coworker2 from '../../assets/chat/coworker2.png'
import Senior1 from '../../assets/chat/senior1.png'
import Senior2 from '../../assets/chat/senior2.png'

interface ClosenessSheetProps {
  isOpen: boolean
  onClose: () => void
  concept: string
  onStartChat: (closeness: number) => void
  isLoading?: boolean
}

const ClosenessSheet = ({
  isOpen,
  onClose,
  concept,
  onStartChat,
  isLoading = false,
}: ClosenessSheetProps) => {
  const [selectedCloseness, setSelectedCloseness] = useState<number | null>(
    null
  )

  // 컨셉 별 이미지
  const conceptImages = useMemo(() => {
    const map: Record<string, [string, string]> = {
      friend: [Friend1, Friend2],
      honey: [Honey1, Honey2],
      coworker: [Coworker1, Coworker2],
      senior: [Senior1, Senior2],
    }
    const key = Object.keys(map).find(
      k => k.toLowerCase() === concept.toLowerCase()
    )
    return map[key || 'friend']
  }, [concept])

  // 시트 열릴때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedCloseness(null)
    }
  }, [isOpen])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <p className="text-[20px] leading-[1.4] tracking-[-0.3px]">
          Choose how close you are
          <br />
          with your
          <span className="capitalize text-primary-300"> {concept}</span>
        </p>
      }
    >
      <div className="flex flex-col items-center w-full mt-3.5">
        <div className="flex justify-center gap-3 w-full">
          {/* 친밀도 1 */}
          <button
            type="button"
            className={`flex flex-col items-center rounded-lg border-[1.6px] transition-all duration-200 
            ${selectedCloseness === 1 ? 'border-gray-800' : 'border-gray-200'} 
            ${
              selectedCloseness !== null && selectedCloseness !== 1
                ? 'opacity-60'
                : 'opacity-100'
            }`}
            onClick={() => setSelectedCloseness(1)}
          >
            <img
              src={conceptImages[0]}
              alt="Closeness Level 1"
              className="object-contain block"
            />
          </button>

          {/* 친밀도 3 */}
          <button
            type="button"
            className={`flex flex-col items-center rounded-lg border-[1.6px] transition-all duration-200 
            ${selectedCloseness === 3 ? 'border-gray-800' : 'border-gray-200'}
            ${
              selectedCloseness !== null && selectedCloseness !== 3
                ? 'opacity-60'
                : 'opacity-100'
            }`}
            onClick={() => setSelectedCloseness(3)}
          >
            <img
              src={conceptImages[1]}
              alt="Closeness Level 3"
              className="object-contain block"
            />
          </button>
        </div>

        {/* 시작 버튼 */}
        <div className="w-full mt-7.5 mb-2.5">
          <Button
            variant="primary"
            size="confirm"
            onClick={() => selectedCloseness && onStartChat(selectedCloseness)}
            disabled={isLoading || selectedCloseness === null}
          >
            Start Chat
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ClosenessSheet

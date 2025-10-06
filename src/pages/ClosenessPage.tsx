import { useEffect, useState } from 'react'
import DistanceSlider from '../components/chat/DistanceSlider'
import Button from '../components/common/Button'
import { useNavigate, useParams } from 'react-router-dom'
import useClosenessStore from '../stores/useClosenessStore'

const bubbleBase = 'py-[6px] px-2 text-[14px] text-gray-700 rounded-lg flex flex-col'
const bubbleBasic =
  bubbleBase + ' bg-white border border-gray-100 max-w-[265px] rounded-tl-none relative'
const bubbleSecond = bubbleBase + ' bg-white border border-gray-100 relative ml-10 w-[186px]'

const ClosenessPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const closeness = useClosenessStore(state => state.closenessMap[id ?? ''] ?? 1)
  const setCloseness = useClosenessStore(state => state.setCloseness)
  const [sliderValue, setSliderValue] = useState(closeness)
  const [touched, setTouched] = useState(false)

  // 슬라이더값 initial
  useEffect(() => {
    setSliderValue(closeness)
    setTouched(false)
  }, [id, closeness])

  // 슬라이더 변경 전 버튼 비활성화
  const handleSliderChange = (val: number) => {
    setSliderValue(val)
    if (!touched) setTouched(true)
  }

  // 확인 버튼
  const handleConfirm = () => {
    if (!id) return
    setCloseness(id, sliderValue) // store에 저장
    navigate(`/chat/${id}`)
  }

  return (
    <div className="h-full flex flex-col items-center bg-white pt-10 px-5">
      <div className="max-w-md w-full flex flex-col">
        <div className="chat chat-start gap-x-[8px] pt-0 pb-2 relative flex items-start">
          <div className="chat-image avatar absolute top-1 left-0 w-8 h-8">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img alt="프로필 사진" src="/chat/lover.svg" />
            </div>
          </div>
          {/* 안내1 */}
          <div className={bubbleBasic + ' ml-10'}>
            <span className="mt-[6px] mb-3">
              How close are you?
              <span className="text-gray-200 text-[12px] ml-[6px]">(Closeness level)</span>
            </span>
            <div className="h-[1px] bg-gray-80 w-full mb-[1px]" />

            <DistanceSlider value={sliderValue} onChange={handleSliderChange} />

            <Button
              variant="primary"
              size="confirm"
              className="bg-gray-800 w-full text-subtitle mb-2"
              disabled={!touched}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>

        {/* 안내2 */}
        <div className={bubbleSecond}>Leave and return to reset your closeness settings.</div>
      </div>
    </div>
  )
}

export default ClosenessPage

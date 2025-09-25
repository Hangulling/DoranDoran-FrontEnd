import { useState } from 'react'
import DistanceSlider from './DistanceSlider'
import Arrow from '../../assets/icon/expandArrow.svg'
import Send from '../../assets/icon/send.svg'

const ChatFooter = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpansion = () => {
    setIsExpanded(prevState => !prevState)
  }

  // 키보드 올라옴
  const handleInputFocus = () => {
    setIsExpanded(false)
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-[1px] border-gray-80 shadow-[0_-1px_2px_rgba(0,0,0,0.08)]">
      <div className="relative px-[20px]">
        {/* 헤더: 제목과 펼치기/접기 버튼 */}
        <div className="flex justify-between items-center my-3">
          <h2 className="text-lg font-bold">거리감 슬라이더</h2>
          <button onClick={toggleExpansion} className="flex items-center text-[14px] text-gray-300">
            {isExpanded ? (
              <>
                <span>접어두기</span>
                <img src={Arrow} alt="접기" />
              </>
            ) : (
              <>
                <span>펼치기</span>
                <img src={Arrow} alt="펼치기" className="rotate-180" />
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mx-[20px] mb-[10px]">
            <DistanceSlider />
          </div>
        )}

        <div
          className="
          relative left-1/2 -translate-x-1/2 
          w-screen h-[1px] bg-gray-80
        "
        />

        {/* 메시지 입력창 */}
        <div className="flex items-center py-[10px]">
          <input
            type="text"
            placeholder="메시지 입력"
            onFocus={handleInputFocus}
            className="flex-grow h-[37px] px-3 py-2 mr-2 border border-gray-100 bg-gray-50 rounded-full
  focus:border-gray-100 focus:outline-none"
          />
          <button>
            <img src={Send} alt="보내기" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter

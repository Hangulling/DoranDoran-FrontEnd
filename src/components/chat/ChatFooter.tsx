import { useState } from 'react'
import DistanceSlider from './DistanceSlider'
import Arrow from '../../assets/icon/expandArrow.svg'
import Send from '../../assets/icon/send.svg'
import ActiveSend from '../../assets/icon/activeSend.svg'

const ChatFooter = () => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [inputActive, setInputActive] = useState(false) // 입력 포커스 상태

  const toggleExpansion = () => {
    setIsExpanded(prevState => !prevState)
  }

  const handleInputFocus = () => {
    setIsExpanded(false)
    setInputActive(true)
  }

  const handleInputBlur = () => {
    // 포커스 아웃 시 active 해제
    setInputActive(false)
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-[1px] border-gray-80 shadow-[0_-1px_2px_rgba(0,0,0,0.08)]">
      <div className="relative px-[20px]">
        {/* 헤더 및 확장 토글 */}
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

        <div className="relative left-1/2 -translate-x-1/2 w-screen h-[1px] bg-gray-80" />

        {/* 메시지 입력창 */}
        <div className="flex items-center py-[10px]">
          <input
            type="text"
            placeholder="메시지 입력"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="flex-grow h-[37px] px-3 py-2 mr-2 border border-gray-100 bg-gray-50 rounded-full focus:border-gray-100 focus:outline-none"
          />
          <button>
            {inputActive ? (
              <img src={ActiveSend} alt="활성화된 보내기" />
            ) : (
              <img src={Send} alt="보내기" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter

import { useEffect, useState } from 'react'
import DistanceSlider from './DistanceSlider'
import Arrow from '../../assets/icon/expandArrow.svg'
import Send from '../../assets/icon/send.svg'
import ActiveSend from '../../assets/icon/activeSend.svg'

interface ChatFooterProps {
  onHeightChange: (height: number) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

const ChatFooter = ({ onHeightChange, inputRef }: ChatFooterProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [inputActive, setInputActive] = useState(false)

  // 수동 토글 상태
  const [isManuallyClosed, setIsManuallyClosed] = useState(false)

  // 토글 핸들러
  const toggleExpansion = () => {
    const nextIsExpanded = !isExpanded
    setIsExpanded(nextIsExpanded)
    if (nextIsExpanded === false) {
      setIsManuallyClosed(true)
    } else {
      setIsManuallyClosed(false)
    }
  }

  // 입력창 포커스 핸들러
  const handleInputFocus = () => {
    setIsExpanded(false)
    setInputActive(true)
  }

  // 입력창 포커스 아웃 핸들러
  const handleInputBlur = () => {
    setInputActive(false)
    if (!isManuallyClosed) {
      setIsExpanded(true)
    }
  }

  useEffect(() => {
    const height = isExpanded ? 173 : 105
    onHeightChange(height)
  }, [isExpanded, onHeightChange])

  return (
    <div
      className="bottom-0 mx-auto w-full max-w-md left-1/2 bg-white border-t-[1px] border-gray-80 shadow-[0_-1px_2px_rgba(0,0,0,0.08)]"
      style={{ height: isExpanded ? 173 : 105 }}
    >
      <div className="relative px-[20px] bg-white">
        {/* 토글 */}
        <div className="flex justify-between items-center my-3">
          <h2 className="text-title text-[16px]">Closeness Slider</h2>
          <button onClick={toggleExpansion} className="flex items-center text-[14px] text-gray-300">
            {isExpanded ? (
              <>
                <span>Close</span>
                <img src={Arrow} alt="접어두기" />
              </>
            ) : (
              <>
                <span>Open</span>
                <img src={Arrow} alt="펼치기" className="rotate-180" />
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mx-[20px] mb-[9px]">
            <DistanceSlider />
          </div>
        )}

        <div className="relative mx-auto w-screen max-w-md left-1/2 -translate-x-1/2 h-[1px] bg-gray-80" />

        {/* 메시지 입력창 */}
        <div className="flex items-center py-[10px]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message"
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

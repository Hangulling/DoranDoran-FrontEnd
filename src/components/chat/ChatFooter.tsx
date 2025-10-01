import { useEffect, useState, type RefObject } from 'react'
import DistanceSlider from './DistanceSlider'
import Arrow from '../../assets/icon/expandArrow.svg'
import Send from '../../assets/icon/send.svg'
import ActiveSend from '../../assets/icon/activeSend.svg'
import showToast from '../common/CommonToast'

interface ChatFooterProps {
  onHeightChange: (height: number) => void
  inputRef: RefObject<HTMLTextAreaElement | null>
}

const MAX_ROWS = 3
const LINE_HEIGHT = 21
const SINGLE_LINE_HEIGHT = 37
const EXPANDED_SLIDER_HEIGHT = 173
const COLLAPSED_BASE_HEIGHT = 105

const ChatFooter = ({ onHeightChange, inputRef }: ChatFooterProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [inputActive, setInputActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaHeight, setTextareaHeight] = useState(SINGLE_LINE_HEIGHT)
  const [isComposing, setIsComposing] = useState(false)

  // 한글 정규식
  const koreanRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣ\s\n]*$/

  // 수동 토글 상태
  const [isManuallyClosed, setIsManuallyClosed] = useState(false)

  // 조합 확인
  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false)
    const value = e.currentTarget.value
    if (!koreanRegex.test(value) && value.trim() !== '') {
      showToast({ message: '한글만 입력할 수 있습니다.', iconType: 'error' })
    }
  }

  // 토글 핸들러
  const toggleExpansion = () => {
    const nextIsExpanded = !isExpanded
    setIsExpanded(nextIsExpanded)
    setIsManuallyClosed(!nextIsExpanded)
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

  // 한글/50자 제한, 높이 조절
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value
    const isEmptyOrWhitespace = value.trim() === ''

    if (isComposing) {
      setInputValue(value)
      return
    }

    if (!koreanRegex.test(value) && !isEmptyOrWhitespace) {
      showToast({ message: '한글만 입력할 수 있습니다.', iconType: 'error' })
    }
    if (value.length > 50) {
      showToast({ message: 'Maximum of 50 characters allowed', iconType: 'error' })
      value = value.substring(0, 50)
    }

    setInputValue(value)

    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      // 패딩을 고려
      const maxHeight = LINE_HEIGHT * MAX_ROWS + (SINGLE_LINE_HEIGHT - LINE_HEIGHT)
      const newHeight = Math.min(scrollHeight, maxHeight)

      textarea.style.height = `${newHeight}px`
      // 높이 초과하면 스크롤
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
      setTextareaHeight(newHeight)
    }
  }

  // 최초 마운트
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = `${SINGLE_LINE_HEIGHT}px`
      inputRef.current.style.overflowY = 'hidden'
      setTextareaHeight(SINGLE_LINE_HEIGHT)
    }
  }, [inputRef])

  // 전체 높이 계산
  const calculatedFooterHeight = isExpanded
    ? EXPANDED_SLIDER_HEIGHT
    : COLLAPSED_BASE_HEIGHT + Math.max(0, textareaHeight - SINGLE_LINE_HEIGHT)

  useEffect(() => {
    onHeightChange(calculatedFooterHeight)
  }, [calculatedFooterHeight, onHeightChange])

  return (
    <div
      className="bottom-0 mx-auto w-full max-w-md left-1/2 pb-[env(safe-area-inset-bottom)] bg-white border-t-[1px] border-gray-80 shadow-[0_-1px_2px_rgba(0,0,0,0.08)]"
      style={{ height: `${calculatedFooterHeight}px`, transition: 'height 0.2s ease-in-out' }}
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
        <div className="flex items-start py-[10px] w-full min-h-[58px]">
          <textarea
            ref={inputRef}
            placeholder="Type a message"
            value={inputValue}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            rows={1}
            style={{
              height: textareaHeight,
              lineHeight: `${LINE_HEIGHT}px`,
              resize: 'none',
            }}
            className="flex-grow px-3 py-2 mr-2 border border-gray-100 bg-gray-50 rounded-full focus:border-gray-100 focus:outline-none"
          />
          <button>
            {inputActive && inputValue.trim() ? (
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

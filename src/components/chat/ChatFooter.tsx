import { useEffect, useRef, useState, type JSX, type RefObject } from 'react'
import SendIcon from '../../assets/chat/send.svg'
import ErrorIcon from '../../assets/icon/error.svg'
import CheckIcon from '../../assets/icon/CheckIcon'
import PauseIcon from '../../assets/chat/pause.svg'

interface ChatFooterProps {
  inputRef: RefObject<HTMLTextAreaElement | null>
  onSendMessage: (message: string) => void
  disabled?: boolean
  isAiResponding?: boolean
  onCancel?: () => void
}

type IconType = 'error' | 'checkRound'

type ToastMessageProps = {
  message: string
  iconType: IconType
}

const MAX_ROWS = 3
const LINE_HEIGHT = 21
const SINGLE_LINE_HEIGHT = 21

const ToastMessage = ({ message, iconType }: ToastMessageProps) => {
  const iconMap: Record<IconType, JSX.Element> = {
    error: <img src={ErrorIcon} alt="error" />,
    checkRound: (
      <CheckIcon className="text-gray-700 fill-system-blue-okay m-0.5" />
    ),
  }

  return (
    <div className="flex items-start mb-5 bg-[rgba(15,16,16,0.8)] px-3.5 py-4 rounded-xl gap-2">
      {iconType && iconMap[iconType]}
      <span className="text-subtitle text-[14px] text-white">{message}</span>
    </div>
  )
}

const ChatFooter: React.FC<ChatFooterProps> = ({
  inputRef,
  onSendMessage,
  disabled,
  isAiResponding,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [textareaHeight, setTextareaHeight] = useState(SINGLE_LINE_HEIGHT)
  const [isComposing, setIsComposing] = useState(false)
  const [toast, setToast] = useState<ToastMessageProps | null>(null)
  const [isToastVisible, setIsToastVisible] = useState(false)

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showToast = (message: string, iconType: IconType) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, iconType })
    setIsToastVisible(true)
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false)
      setTimeout(() => setToast(null), 400)
    }, 3600)
  }

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => setIsComposing(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const originalValue = e.target.value
    let finalValue = originalValue
    if (finalValue.length > 50) {
      showToast('Maximum of 50 characters allowed', 'error')
      finalValue = finalValue.substring(0, 50)
    }
    setInputValue(finalValue)
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight =
        LINE_HEIGHT * MAX_ROWS + (SINGLE_LINE_HEIGHT - LINE_HEIGHT)
      const newHeight = Math.min(scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
      setTextareaHeight(newHeight)
    }
  }

  const handleSendClick = () => {
    if (disabled || !inputValue.trim()) return
    onSendMessage(inputValue.trim())
    setInputValue('')
    if (inputRef.current) {
      inputRef.current.style.height = `${SINGLE_LINE_HEIGHT}px`
      inputRef.current.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing && !disabled) {
      e.preventDefault()
      handleSendClick()
    }
  }

  // 버튼 표시 조건
  const isSendActive = !disabled && inputValue.trim().length > 0

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex justify-center">
      <div
        className={`w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-gray-0 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]`}
      >
        {/* 토스트 */}
        <div className="absolute bottom-full w-full left-0 flex justify-center pointer-events-none">
          {toast && (
            <div
              className={`mx-5 ${isToastVisible ? 'toast-slide-fade-in' : 'toast-slide-fade-out'}`}
            >
              <ToastMessage message={toast.message} iconType={toast.iconType} />
            </div>
          )}
        </div>

        {/* textarea */}
        <div className="w-full px-5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]">
          <div className="relative w-full px-4 py-3.75 bg-[#f1f1f1] border-[#f1f1f1] rounded-[22px] overflow-hidden text-14px min-h-[51px]">
            <textarea
              ref={inputRef}
              placeholder="Type a message"
              value={inputValue}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={1}
              style={{
                height: textareaHeight,
                lineHeight: `${LINE_HEIGHT}px`,
                resize: 'none',
              }}
              className="w-full pr-11.5 bg-transparent border-none outline-none focus:ring-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] block p-0 m-0"
            />

            {isAiResponding ? (
              <button
                onClick={onCancel}
                className="absolute bottom-2.5 right-4 flex items-center justify-center transition-opacity duration-200"
              >
                <img src={PauseIcon} alt="중지" />
              </button>
            ) : (
              isSendActive && (
                <button
                  onClick={handleSendClick}
                  className="absolute bottom-2.5 right-4 flex items-center justify-center transition-opacity duration-200"
                >
                  <img src={SendIcon} alt="보내기" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter

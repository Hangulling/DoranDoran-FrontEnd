import { useState, type RefObject } from 'react'
import Send from '../../assets/icon/send.svg'
import ActiveSend from '../../assets/icon/activeSend.svg'
import showToast from '../common/CommonToast'

interface ChatFooterProps {
  inputRef: RefObject<HTMLTextAreaElement | null>
  onSendMessage: (message: string) => void
}

const MAX_ROWS = 3
const LINE_HEIGHT = 21
const SINGLE_LINE_HEIGHT = 37

const ChatFooter = ({ inputRef, onSendMessage }: ChatFooterProps) => {
  const [inputActive, setInputActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaHeight, setTextareaHeight] = useState(SINGLE_LINE_HEIGHT)
  const [isComposing, setIsComposing] = useState(false)

  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false)
    const value = e.currentTarget.value
    const sanitizedValue = value.replace(/[a-zA-Z]/g, '')
    if (value !== sanitizedValue) {
      setInputValue(sanitizedValue)
      showToast({ message: 'Input is only available in Korean', iconType: 'error' })
    }
  }

  const handleInputFocus = () => setInputActive(true)
  const handleInputBlur = () => setInputActive(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const originalValue = e.target.value
    if (isComposing) {
      setInputValue(originalValue)
      return
    }
    const sanitizedValue = originalValue.replace(/[a-zA-Z]/g, '')
    if (originalValue && originalValue !== sanitizedValue) {
      showToast({ message: 'Input is only available in Korean', iconType: 'error' })
    }
    let finalValue = sanitizedValue
    if (finalValue.length > 50) {
      showToast({ message: 'Maximum of 50 characters allowed', iconType: 'error' })
      finalValue = finalValue.substring(0, 50)
    }
    setInputValue(finalValue)
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = LINE_HEIGHT * MAX_ROWS + (SINGLE_LINE_HEIGHT - LINE_HEIGHT)
      const newHeight = Math.min(scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
      setTextareaHeight(newHeight)
    }
  }

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      if (inputRef.current) {
        inputRef.current.style.height = `${SINGLE_LINE_HEIGHT}px`
        setTextareaHeight(SINGLE_LINE_HEIGHT)
      }
    }
  }

  return (
    <div className="w-full max-w-md bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.08)]">
      <div className="flex items-start w-full max-w-md mx-auto px-5 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
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
          className="flex-grow px-3 py-2 mr-2 border border-gray-100 bg-gray-50 rounded-full focus:border-gray-100 focus:outline-none  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />
        <button onClick={handleSendClick}>
          {inputActive && inputValue.trim() ? (
            <img src={ActiveSend} alt="활성화된 보내기" />
          ) : (
            <img src={Send} alt="보내기" />
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatFooter

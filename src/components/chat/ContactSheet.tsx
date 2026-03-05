import { useEffect, useMemo, useRef, useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'
import Input from '../common/Input'
import CheckIcon from '../../assets/icon/CheckIcon'
import { useFetchUser } from '../../hooks/useFetchUser'
import showToast from '../common/CommonToast'
import { Keyboard } from '@capacitor/keyboard'
import { useIOSKeyboard } from '../../hooks/useIOSKeyboard'

interface ContactSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    content: string,
    options?: { replyRequested: boolean; replyEmail?: string }
  ) => void
  category?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ContactSheet = ({ isOpen, onClose, onSubmit }: ContactSheetProps) => {
  const [content, setContent] = useState('')
  const [replyRequested, setReplyRequested] = useState<'yes' | 'no' | null>(
    null
  )
  const [replyEmail, setReplyEmail] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<HTMLDivElement>(null)
  const isTransitioning = useRef(false)

  const { userEmail } = useFetchUser()
  const { isIOSApp, keyboardHeight } = useIOSKeyboard()

  useEffect(() => {
    Keyboard.setScroll({ isDisabled: true })
    return () => {}
  }, [])

  useEffect(() => {
    if (keyboardHeight === 0) {
      setIsExpanded(false)
      setIsFocused(false)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }
  }, [keyboardHeight])

  // Textarea 포커스
  const handleTextareaFocus = () => {
    isTransitioning.current = true
    setIsExpanded(true)
    setIsFocused(true)
    setTimeout(() => {
      isTransitioning.current = false
    })
  }

  // Email 포커스
  const handleEmailFocus = () => {
    isTransitioning.current = true
    setIsExpanded(false)
    setIsFocused(false)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length > 500) {
      showToast({
        message: 'Maximum of 500 characters allowed',
        iconType: 'error',
        size: 'sheet',
      })
      setContent(value.slice(0, 500))
      return
    }
    setContent(value)
  }

  const handleReplyYes = () => {
    setReplyRequested('yes')
    if (userEmail && !replyEmail) setReplyEmail(userEmail)
    setTimeout(() => {
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }
  const isEmailFormatValid = useMemo(
    () => emailRegex.test(replyEmail),
    [replyEmail]
  )
  const isReplySelected = replyRequested === 'yes' || replyRequested === 'no'
  const isSubmitEnabled =
    !!content &&
    isReplySelected &&
    (replyRequested === 'no' ||
      (replyRequested === 'yes' && isEmailFormatValid))

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Contact us"
      isExpanded={isExpanded}
      className={isExpanded ? 'h-full transition-all duration-300' : ''}
      footer={
        <div
          className="w-full bg-gray-0 relative transition-transform duration-200"
          style={
            isIOSApp && keyboardHeight > 0
              ? { transform: `translateY(-${keyboardHeight}px)` }
              : undefined
          }
        >
          <Button
            variant="primary"
            size="confirm"
            onClick={() =>
              onSubmit(content, {
                replyRequested: replyRequested === 'yes',
                replyEmail,
              })
            }
            disabled={!isSubmitEnabled}
          >
            Send inquiry
          </Button>
        </div>
      }
    >
      <div
        className={`flex flex-col mt-1 ${isExpanded ? 'h-full' : ''}`}
        style={{ paddingBottom: keyboardHeight }}
      >
        <div className="mb-5">
          <label className="text-[16px] text-subtitle mb-1.5 block">
            Your Message
          </label>
          <textarea
            className={`w-full py-3.5 px-5 rounded-xl bg-gray-0 resize-none text-[14px] focus:outline-none transition-all h-38.5
            ${content || isFocused ? 'gradient-border' : 'border border-gray-100'}`}
            ref={textareaRef}
            placeholder="Feel free to share here :)"
            value={content}
            onChange={handleContentChange}
            onFocus={handleTextareaFocus}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[14px] text-gray-600">
              {content.length}/500
            </span>
          </div>
        </div>

        <div className="mb-7.5" ref={selectionRef}>
          <label className="text-[16px] text-subtitle mb-2 block">
            Receive a reply by email?
          </label>
          <div className="flex flex-col gap-1">
            <button
              className="flex items-center gap-2 py-1"
              onClick={handleReplyYes}
            >
              {replyRequested === 'yes' ? (
                <CheckIcon className="w-5 h-5 fill-primary-300 text-gray-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-0 ring-1 ring-inset ring-gray-200"></div>
              )}
              <span
                className={`text-[14px] ${replyRequested === 'yes' ? 'text-gray-800' : 'text-gray-500'}`}
              >
                Yes, please
              </span>
            </button>
            <button
              className="flex items-center gap-2 py-1"
              onClick={() => {
                setReplyRequested('no')
                setReplyEmail('')
                setIsExpanded(false)
              }}
            >
              {replyRequested === 'no' ? (
                <CheckIcon className="w-5 h-5 fill-primary-300 text-gray-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-0 ring-1 ring-inset ring-gray-200"></div>
              )}
              <span
                className={`text-[14px] ${replyRequested === 'no' ? 'text-gray-800' : 'text-gray-500'}`}
              >
                No, thanks
              </span>
            </button>
          </div>

          <div
            className={`transition-opacity duration-200 ${replyRequested === 'yes' ? 'opacity-100 pb-60' : 'opacity-0 h-0 overflow-hidden'}`}
            ref={emailRef}
          >
            <div className="mt-4">
              <Input
                type="email"
                variant="primary"
                value={replyEmail}
                clearable
                noUnderline
                onClear={() => setReplyEmail('')}
                onFocus={handleEmailFocus}
                onChange={e => setReplyEmail(e.target.value)}
              />
              <p className="mt-0.5 text-[12px] text-gray-300">
                Incorrect email entries may prevent a response.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ContactSheet

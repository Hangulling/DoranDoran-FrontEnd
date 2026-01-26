import { useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'
import Input from '../common/Input'
import CheckIcon from '../../assets/icon/CheckIcon'
import { useFetchUser } from '../../hooks/useFetchUser'

interface ContactSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    content: string,
    options?: {
      replyRequested: boolean
      replyEmail?: string
    }
  ) => void
  category?: string
}

const ContactSheet = ({ isOpen, onClose, onSubmit }: ContactSheetProps) => {
  const [content, setContent] = useState('')
  const [replyRequested, setReplyRequested] = useState<'yes' | 'no' | null>(
    null
  )
  const [replyEmail, setReplyEmail] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { userEmail } = useFetchUser()

  const isReplySelected = replyRequested === 'yes' || replyRequested === 'no'
  const isEmailValid = replyRequested !== 'yes' || !!replyEmail

  const handleReplyYes = () => {
    setReplyRequested('yes')
    if (userEmail && replyEmail.length === 0) {
      setReplyEmail(userEmail)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyEmail(e.target.value)
  }

  const handleSubmit = () => {
    onSubmit(content, {
      replyRequested: replyRequested === 'yes',
      replyEmail: replyEmail || undefined,
    })
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Contact us">
      <div className="flex flex-col mt-1">
        <div className="mb-5">
          <label className="text-[16px] text-subtitle mb-[6px] block">
            Your Message
          </label>
          <textarea
            className={`w-full h-[154px] py-[14px] px-5 rounded-[12px] bg-gray-0 resize-none text-[14px] focus:outline-none ${
              content || isFocused
                ? 'gradient-border'
                : 'border border-gray-100'
            }`}
            placeholder="Feel free to share here :)"
            value={content}
            maxLength={500}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="flex justify-end">
            <span className="text-[14px] text-gray-600">
              {content.length}/500
            </span>
          </div>
        </div>

        <div className="mb-[30px]">
          <label className="text-[16px] text-subtitle mb-2 block">
            Receive a reply by email?
          </label>

          <div className="flex flex-col gap-1">
            {/* YES */}
            <button className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer py-1"
                onClick={handleReplyYes}
              >
                {replyRequested === 'yes' ? (
                  <CheckIcon className="w-5 h-5 fill-primary-300 text-gray-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-0 ring-1 ring-inset ring-gray-200"></div>
                )}
                <span
                  className={`text-[14px] whitespace-nowrap transition-colors ${
                    replyRequested === 'yes' ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  Yes, please
                </span>
              </div>
            </button>

            {/* NO */}
            <button className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer py-1"
                onClick={() => {
                  setReplyRequested('no')
                  setReplyEmail('')
                }}
              >
                {replyRequested === 'no' ? (
                  <CheckIcon className="w-5 h-5 fill-primary-300 text-gray-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-0 ring-1 ring-inset ring-gray-200"></div>
                )}
                <span
                  className={`text-[14px] whitespace-nowrap transition-colors ${
                    replyRequested === 'no' ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  No, thanks
                </span>
              </div>
            </button>
          </div>

          <div
            className={replyRequested === 'yes' ? 'opacity-100' : 'opacity-0'}
          >
            <Input
              type="email"
              variant="primary"
              placeholder="Enter your E-mail"
              clearable
              value={replyEmail}
              onChange={handleEmailChange}
              onClear={() => setReplyEmail('')}
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="confirm"
          onClick={handleSubmit}
          disabled={!content || !isReplySelected || !isEmailValid}
        >
          Send inquiry
        </Button>
      </div>
    </BottomSheet>
  )
}

export default ContactSheet

import { useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'

interface ContactSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
  category?: string
}

const ContactSheet = ({ isOpen, onClose, onSubmit }: ContactSheetProps) => {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    onSubmit(content)
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Contact us">
      <div className="flex flex-col gap-4 mt-4 mb-6">
        <div>
          <label className="text-[14px] font-medium text-gray-700 mb-1 block">
            Your Message
          </label>
          <textarea
            className="w-full h-32 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary-500 resize-none text-[16px]"
            placeholder="Feel free to share here :)"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[14px] font-medium text-gray-700 mb-1 block">
            Receive a reply by email?
          </label>
        </div>

        <Button
          variant="primary"
          size="confirm"
          onClick={handleSubmit}
          disabled={!content}
        >
          Submit
        </Button>
      </div>
    </BottomSheet>
  )
}

export default ContactSheet

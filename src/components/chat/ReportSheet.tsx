import { useState } from 'react'
import BottomSheet from '../common/BottomSheet'
import Button from '../common/Button'

interface ReportSheetProps {
  isOpen: boolean
  onClose: () => void
  messageId: string | null
  onReport: (messageId: string, reason: string) => void
}

const REPORT_REASONS = [
  'Doesn’t make sense',
  'Repeated response',
  'Inappropriate or uncomfortable',
  'Other',
]

const ReportSheet = ({
  isOpen,
  onClose,
  messageId,
  onReport,
}: ReportSheetProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)

  const handleSave = () => {
    if (messageId && selectedReason) {
      onReport(messageId, selectedReason)
      onClose()
      setSelectedReason(null)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedReason(null)
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Report a Reply Issue"
      footer={
        <Button
          variant="primary"
          size="confirm"
          onClick={handleSave}
          disabled={!selectedReason}
        >
          Save
        </Button>
      }
    >
      <div className="flex flex-col items-center w-full mt-1 gap-[10px] mb-5">
        {REPORT_REASONS.map(reason => {
          const isSelected = selectedReason === reason
          return (
            <button
              key={reason}
              className={`w-full py-[14px] px-5 text-left text-[16px] border rounded-[12px] transition-colors ${
                isSelected
                  ? 'border-primary-200 bg-primary-10'
                  : 'bg-gray-0 border-gray-100'
              }`}
              onClick={() => setSelectedReason(reason)}
            >
              {reason}
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}

export default ReportSheet

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
  const handleReportSubmit = (reason: string) => {
    if (messageId) {
      console.log(`${messageId} 신고 접수: ${reason}`)
      onReport(messageId, reason)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Report a Reply Issue">
      <div className="flex flex-col items-center w-full mt-1 gap-[10px]">
        {REPORT_REASONS.map(reason => (
          <button
            key={reason}
            className="w-full py-[14px] px-5 text-left text-[16px] bg-gray-0 border border-gray-100 rounded-[12px] active:bg-[#F5F5F5] transition-colors"
            onClick={() => handleReportSubmit(reason)}
          >
            {reason}
          </button>
        ))}
      </div>

      <div className="w-full mt-5">
        <Button variant="bottomSheet" size="bottomSheetText" onClick={onClose}>
          Back to chat
        </Button>
      </div>
    </BottomSheet>
  )
}

export default ReportSheet

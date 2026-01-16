import React from 'react'
import { useModalStore } from '../../stores/useUiStateStore'
import CommonModal from '../common/CommonModal'
import CheckIcon from '../../assets/icon/CheckIcon'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ExitModal: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  const { noShowAgain, setNoShowAgain } = useModalStore()
  const [checked, setChecked] = React.useState(noShowAgain)

  React.useEffect(() => {
    setChecked(noShowAgain)
  }, [noShowAgain])

  if (!open) return null

  const verticalOffset = 125
  const translateXpx = window.innerWidth / 2 - 150

  return (
    <>
      {/* 모달 */}
      <CommonModal
        open={open}
        title="Leave chat room"
        description={[
          'If you leave, the chat',
          'history will be deleted.',
          'Are you sure you want to leave?',
        ]}
        confirmText="Leave"
        cancelText="Keep"
        onConfirm={() => {
          setNoShowAgain(checked)
          onConfirm()
        }}
        onCancel={onCancel}
      />

      {/* 다시 보지 않기 */}
      <div className="fixed w-full inset-x-0 top-1/2 z-[1001] -translate-y-1/2 pointer-events-none">
        <div
          className="w-[147px]"
          style={{
            transform: `translateX(${translateXpx}px) translateY(${verticalOffset}px)`,
          }}
        >
          <label className="flex items-center gap-[10px] text-[14px] text-gray-0 pointer-events-auto w-fit">
            <input
              type="checkbox"
              id="noShowAgainCheck"
              className="hidden"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
            />
            {checked ? (
              <CheckIcon className="w-5 h-5 fill-primary-400 text-gray-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-0 ring-1 ring-inset ring-gray-200"></div>
            )}
            <span>don't show again</span>
          </label>
        </div>
      </div>
    </>
  )
}

export default ExitModal

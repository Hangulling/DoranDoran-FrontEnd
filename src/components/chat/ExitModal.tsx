import React from 'react'
import { useModalStore } from '../../stores/useUiStateStore'
import CommonModal from '../common/CommonModal'
import CheckIcon from '../../assets/icon/checkAll.svg'
import DisabledCheckIcon from '../../assets/icon/disabledCheckAll.svg'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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

      <div className="absolute bottom-1/4 mb-4">
        <label className="flex items-center gap-2 text-[14px] text-white w-fit cursor-pointer">
          <input
            type="checkbox"
            id="noShowAgainCheck"
            className="hidden"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
          />
          <img
            src={checked ? CheckIcon : DisabledCheckIcon}
            alt={checked ? 'checked' : 'unchecked'}
          />
          <span>don't watch again</span>
        </label>
      </div>
    </div>
  )
}

export default ExitModal

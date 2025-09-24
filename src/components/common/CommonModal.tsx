import React from 'react'

interface CommonModalProps {
  open: boolean
  title: string
  description?: string | string[] // 상수 지정시 배열
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const CommonModal: React.FC<CommonModalProps> = ({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '닫기',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null

  return (
    <>
      <div className="modal modal-open" role="dialog">
        <div className="modal-box rounded-lg max-w-[303px] py-5 px-4 flex flex-col items-center">
          <h3 className="text-title text-[18px] mb-2">{title}</h3>

          {Array.isArray(description) ? (
            <div className="text-[14px] text-center">
              {description.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-center">{description}</p>
          )}

          <div className="modal-action w-full flex gap-x-[14px] mt-4">
            <button
              className="bg-gray-80 text-subtitle text-[14px] text-gray-600 rounded-lg flex-1 py-[14px]"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="bg-green-400 text-subtitle text-[14px] text-white rounded-lg flex-1 py-[14px]"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>

        <div className="modal-backdrop bg-black/65" onClick={onCancel}></div>
      </div>
    </>
  )
}

export default CommonModal

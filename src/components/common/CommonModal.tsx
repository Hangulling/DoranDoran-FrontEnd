import React from 'react'
import CheckIcon from '../../assets/icon/CheckIcon'
import Button from './Button'
import type { CommonModalProps } from '../../types/common'

const CommonModal: React.FC<CommonModalProps> = ({
  open,
  title,
  variant = 'common',
  description,
  confirmText = '확인',
  cancelText = '닫기',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null

  const isSignup = variant === 'signup'

  return (
    <div
      className="fixed inset-0 w-full mx-auto max-w-md z-100 flex items-center justify-center"
      role="dialog"
    >
      <div className="absolute inset-0 bg-gray-800/80" onClick={onCancel}></div>
      <div className="relative z-10 flex flex-col items-center w-[300px] rounded-xl bg-gray-0 py-5 px-5">
        {isSignup && (
          <div className="mb-3">
            <CheckIcon className="w-10 h-10 text-primary-400 fill-primary-50" />
          </div>
        )}
        <h3 className="text-title text-[18px] mb-1">{title}</h3>
        {Array.isArray(description) ? (
          <div className="text-[14px] text-center text-gray-600">
            {description.map((line, idx) =>
              typeof line === 'string' ? (
                <p key={idx}>{line}</p>
              ) : React.isValidElement(line) ? (
                React.cloneElement(line, { key: idx })
              ) : null
            )}
          </div>
        ) : (
          <p className="text-[14px] text-center text-gray-600">{description}</p>
        )}

        {isSignup ? (
          <div className="w-full flex mt-5">
            <Button
              variant="confirm"
              onClick={onConfirm}
              size="lg"
              className="text-[14px] text-white py-3 text-subtitle"
            >
              {confirmText}
            </Button>
          </div>
        ) : (
          <div className="w-full flex gap-x-[10px] mt-5">
            ]
            <button
              className="bg-gray-50 border-gray-80 text-subtitle text-[14px] rounded-xl flex-1 py-3"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="bg-primary-300 text-subtitle text-[14px] text-gray-0 rounded-xl flex-1 py-3"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommonModal

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
      className="fixed inset-0 w-full mx-auto max-w-app md:max-w-tablet lg:max-w-desktop z-100 flex items-center justify-center"
      role="dialog"
    >
      <div className="absolute inset-0 bg-gray-800/80" onClick={onCancel}></div>
      <div className="relative z-10 flex flex-col items-center w-[300px] rounded-xl bg-gray-0 py-6 px-5">
        {isSignup && (
          <div className="mb-3">
            <CheckIcon className="w-10 h-10 text-primary-400 fill-primary-50" />
          </div>
        )}
        <h3 className="text-title text-[18px] mb-1">{title}</h3>

        {/* 설명 */}
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

        {/* 버튼 */}
        {isSignup ? (
          <div className="w-full flex mt-5">
            <Button
              variant="confirm"
              onClick={onConfirm}
              size="lg"
              className="text-[14px] text-gray-0 py-3 text-subtitle rounded-[10px]"
            >
              {confirmText}
            </Button>
          </div>
        ) : (
          <div className="w-full flex gap-x-[10px] mt-5">
            <Button
              variant="modal"
              size="modal"
              className="bg-gray-50 border border-gray-100 flex-1"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              variant="modal"
              size="modal"
              className="bg-primary-300 text-gray-0 rounded-[10px] flex-1"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommonModal

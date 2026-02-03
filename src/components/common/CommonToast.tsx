import { type JSX } from 'react'
import { toast } from 'react-hot-toast'
import ErrorIcon from '../../assets/icon/error.svg'
import CheckIcon from '../../assets/icon/CheckIcon'
import type { ToastProps } from '../../types/common'

export type IconType = 'error' | 'checkRound'
export type ToastSize = 'default' | 'sheet' | 'manager'

// 에러 / 체크 아이콘 선택
const iconMap: Record<IconType, JSX.Element> = {
  error: <img src={ErrorIcon} alt="error" />,
  checkRound: (
    <CheckIcon className="text-gray-700 fill-system-blue-okay m-0.5" />
  ),
}

const sizeStyles: Record<ToastSize, string> = {
  default: 'mx-5 mb-5',
  sheet: 'mx-1 mb-[72px]',
  manager: 'mx-1 mb-[calc(92px+env(safe-area-inset-bottom))]',
}

let toastActive = false

const showToast = ({ message, iconType, size = 'default' }: ToastProps) => {
  if (toastActive) return

  toastActive = true

  toast.custom(
    t => (
      <div className="w-full max-w-app md:max-w-tablet lg:max-w-desktop">
        <div
          className={`flex items-start bg-[rgba(44,42,44,0.85)] px-4 py-[14px] rounded-[12px] gap-3
					${sizeStyles[size]}
          ${t.visible ? 'animate-fade-in-up' : 'toast-slide-fade-out'}
        `}
        >
          {iconType && iconMap[iconType]}
          <span className="text-subtitle text-[14px] text-gray-0">
            {message}
          </span>
        </div>
      </div>
    ),
    {
      id: `custom-toast-${Date.now()}`, // 중복 방지를 위한 고유 ID
      duration: 4000,
      position: 'bottom-center',
    }
  )
  setTimeout(() => {
    toastActive = false
  }, 4000)
}

export default showToast

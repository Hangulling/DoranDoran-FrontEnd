import type { IconType } from '../components/common/CommonToast'

// 네비 바
export interface NavBarProps {
  title?: string
  isMain?: boolean
  showBookmark?: boolean
  showDelete?: boolean
}

// 공통 모달
export interface CommonModalProps {
  open: boolean
  title: string
  variant?: 'common' | 'signup'
  description: string | React.ReactNode | Array<string | React.ReactNode> // 상수 지정시 배열
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

// 공통 토스트
export interface ToastProps {
  message: string
  iconType?: IconType
  size?: 'default' | 'sheet' | 'manager'
}

// 로딩 스피너
export interface LoadingSpinnerProps {
  message?: string
}

export type FromPage = 'signup' | 'login' | undefined

export interface ErrorPageProps {
  errorCode?: number
}

export interface ClientErrorViewProps {
  onClickBack: () => void
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant =
  | 'primary'
  | 'cancel'
  | 'text'
  | 'confirm'
  | 'tab'
  | 'archive'
  | 'home'
  | 'dropdown'
  | 'bottomSheet'
  | 'modal'
type Size =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'full'
  | 'archive'
  | 'confirm'
  | 'dropdown'
  | 'bottomSheetText'
  | 'modal'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary-300 text-gray-0 text-subtitle text-[16px] rounded-[12px] disabled:bg-gray-100 disabled:text-gray-0',
  cancel: 'bg-gray-80 text-gray-600 rounded-lg',
  text: 'bg-transparent',
  confirm: 'bg-primary-300 text-white rounded-xl',
  tab: 'rounded-[18px] px-[14px] py-2 text-body text-sm',
  archive: 'text-gray-500 text-sm text-body',
  home: 'bg-primary-300 text-gray-0 rounded-[10px] text-[14px] text-subtitle border border-primary-300',
  dropdown: 'px-3',
  bottomSheet:
    'rounded-xl text-subtitle text-sm text-gray-800 bg-gray-0 border border-gray-100 active:border-primary-200 active:bg-primary-10 focus:border-primary-200 focus:bg-primary-10 transition-colors',
  modal: 'rounded-[10px] text-subtitle text-[14px]',
}

const SIZES: Record<Size, string> = {
  xs: 'w-6',
  sm: 'w-[71px] h-12',
  md: 'w-32 h-12',
  lg: 'w-[260px] h-[45px]',
  xl: 'w-[335px] h-14',
  full: 'w-full h-14',
  archive: 'px-4 py-2',
  confirm: 'w-full h-13',
  dropdown: 'w-[335px] h-12',
  bottomSheetText: 'w-[335px] h-[49px]',
  modal: 'py-3',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDropdown = variant === 'dropdown'

  return (
    <button
      className={`${!isDropdown && `flex justify-center items-center`}
       ${VARIANTS[variant]} ${size ? SIZES[size] : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

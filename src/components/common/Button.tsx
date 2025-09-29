import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'cancel' | 'text' | 'confirm'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: Record<Variant, string> = {
  primary: 'text-white rounded-lg disabled:bg-gray-100 disabled:text-gray-300',
  cancel: 'bg-gray-80 text-gray-600 rounded-lg',
  text: 'bg-transparent',
  confirm: 'bg-green-400 text-white rounded-lg',
}

const SIZES: Record<Size, string> = {
  xs: 'w-6',
  sm: 'w-16 h-12',
  md: 'w-32 h-12',
  lg: 'w-[271px] h-12',
  xl: 'w-[335px] h-14',
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
  return (
    <button
      className={`flex justify-center items-center ${VARIANTS[variant]} ${
        size ? SIZES[size] : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

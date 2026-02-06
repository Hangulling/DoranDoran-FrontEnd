import { useState } from 'react'
import eye from '../../assets/icon/eye.svg'
import eyeOff from '../../assets/icon/eyeOff.svg'
import Button from './Button'
import CloseCircleIcon from '../../assets/icon/CloseCircleIcon'

interface InputProps {
  id?: string
  name?: string
  label?: string
  type?: string
  placeholder?: string
  variant?: 'primary' | 'error' | 'underline' | 'underlineError'
  error?: string
  size?: 'sm' | 'md' | 'lg'
  value?: string
  readOnly?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  clearable?: boolean
  noUnderline?: boolean
  rightElement?: React.ReactNode
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onClear?: () => void
}

export default function Input({
  id,
  name,
  label,
  variant = 'underline',
  type = 'text',
  size = 'lg',
  placeholder,
  value,
  inputMode,
  readOnly,
  clearable,
  noUnderline,
  rightElement,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onClear,
}: InputProps) {
  const [show, setShow] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === 'password'
  const hasValue = (value?.length ?? 0) > 0
  const isError = variant === 'error' || variant === 'underlineError'

  const labelColor = hasValue && !isFocused ? 'text-gray-400' : 'text-gray-800'

  const borderColor = isError
    ? 'border-system-red'
    : isFocused
      ? 'border-primary-200'
      : hasValue
        ? 'border-gray-400'
        : 'border-gray-100'

  const VARIANTS = {
    primary: 'flex border rounded-lg px-3 my-2',
    underline: 'flex border-b',
    error: 'flex border rounded-lg px-3 my-2',
    underlineError: 'flex border-b mb-2',
  } as const

  const SIZES = {
    sm: 'w-[247px] h-12',
    md: 'w-[254px] h-12',
    lg: 'w-[335px] h-12',
  } as const

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={id}
          className={`whitespace-nowrap text-sm text-subtitle my-2 transition-colors ${labelColor}`}
        >
          {label}
        </label>
      )}

      {noUnderline ? (
        <div className={`${SIZES[size]} flex items-center gap-2`}>
          <div
            className={`flex flex-1 items-center h-12 ${VARIANTS[variant]} ${borderColor} transition-colors`}
          >
            <input
              type={isPassword ? (show ? 'text' : 'password') : type}
              id={id}
              name={name}
              placeholder={placeholder}
              className="outline-none w-full text-base text-body py-2"
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={onKeyDown}
              inputMode={inputMode}
              readOnly={readOnly}
            />

            {isPassword && hasValue && (
              <Button
                type="button"
                variant="text"
                size="xs"
                onClick={() => setShow(s => !s)}
                className="mr-2"
              >
                <img src={show ? eye : eyeOff} alt="eye" className="w-5 h-5" />
              </Button>
            )}

            {clearable && hasValue && (
              <Button type="button" variant="text" size="xs" onClick={onClear}>
                <CloseCircleIcon />
              </Button>
            )}
          </div>

          {rightElement}
        </div>
      ) : (
        <div
          className={`${VARIANTS[variant]} ${SIZES[size]} ${borderColor} transition-colors`}
        >
          <input
            type={isPassword ? (show ? 'text' : 'password') : type}
            id={id}
            name={name}
            placeholder={placeholder}
            className="outline-none w-full text-sm text-body"
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            inputMode={inputMode}
            readOnly={readOnly}
          />

          {rightElement}

          {isPassword && hasValue && (
            <Button
              type="button"
              variant="text"
              size="xs"
              onClick={() => setShow(s => !s)}
              className="mr-2"
            >
              <img src={show ? eye : eyeOff} alt="eye" className="w-5 h-5" />
            </Button>
          )}

          {clearable && hasValue && (
            <Button type="button" variant="text" size="xs" onClick={onClear}>
              <CloseCircleIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

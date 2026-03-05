import Button from './Button'
import arrowDownIcon from '../../assets/icon/arrowDown.svg'
import { useState } from 'react'
import type { IdentityQuestion } from '../../constants/IdentityQuestionData'
import BottomSheet from './BottomSheet'

interface DropdownPropsProps {
  label?: string
  placeholder?: string
  variant?: 'primary' | 'error'
  options: IdentityQuestion[]
  value: IdentityQuestion | null
  onChange: (v: IdentityQuestion) => void
}

export default function Dropdown({
  label,
  placeholder,
  variant = 'primary',
  options,
  value,
  onChange,
}: DropdownPropsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasValue = Boolean(value)
  const isError = variant === 'error'

  const labelColor = hasValue ? 'text-gray-400' : 'text-gray-800'

  const borderColor = isError
    ? 'border-system-red'
    : isOpen
      ? 'border-primary-200'
      : hasValue
        ? 'border-gray-400'
        : 'border-gray-100'

  return (
    <div className="relative">
      {label && (
        <p className={`my-2 transition-colors ${labelColor}`}>{label}</p>
      )}

      <Button
        variant="dropdown"
        type="button"
        size="dropdown"
        className={`rounded-lg border ${borderColor} transition-colors`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="flex justify-between items-center">
          <p
            className={`${hasValue ? 'text-gray-800' : 'text-gray-300'} text-sm text-body`}
          >
            {value?.label ?? placeholder}
          </p>
          <img src={arrowDownIcon} alt="" />
        </div>
      </Button>

      {isOpen && (
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="flex flex-col items-center px-4 pb-5">
            {options.map(option => (
              <Button
                key={option.value}
                variant="bottomSheet"
                size="dropdown"
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className={`my-2 w-full mx-auto justify-start text-left border px-4 ${
                  value?.value === option.value
                    ? 'border-primary-200 bg-primary-10'
                    : 'border-gray-100 bg-gray-0'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}

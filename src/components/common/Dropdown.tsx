import Button from './Button'
import arrowDownIcon from '../../assets/icon/arrowDown.svg'
import { useState } from 'react'
import type { IdentityQuestion } from '../../constants/IdentityQuestionData'

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
  const VARIANTS = {
    primary: 'border-gray-100',
    error: 'border-orange-300 ',
  } as const

  return (
    <div className="relative">
      {label && <p className="my-2">{label}</p>}
      <Button
        variant="dropdown"
        type="button"
        size="dropdown"
        className={`rounded-lg border ${isOpen ? 'border-gray-500' : 'border-gray-100'} ${VARIANTS[variant]}`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="flex justify-between">
          <p className={`${value ? 'text-gray-800' : 'text-gray-300'} text-sm text-body`}>
            {value?.label ?? placeholder}
          </p>
          <img src={arrowDownIcon} />
        </div>
      </Button>
      {isOpen && (
        <ul className="mt-1 w-[335px] bg-white absolute z-10 rounded-lg shadow-[0_0_20px_0_rgba(0,0,0,0.12)]">
          {options.map(option => (
            <li
              key={option.value}
              className={`flex items-center px-3 h-[53px] border-b border-gray-30 text-gray-800 text-sm text-body ${value?.value === option.value ? 'bg-green-50' : ''}`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

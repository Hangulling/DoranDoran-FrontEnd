import { useState } from 'react'
import Button from '../common/Button'
import ArrowUpIcon from '../../assets/icon/ArrowUpIcon'
import ArrowDownIcon from '../../assets/icon/ArrowDownIcon'

export type ClosenessFilter = 'all' | 'Polite' | 'Friendly'
const OPTIONS: ClosenessFilter[] = ['all', 'Polite', 'Friendly']

interface ClosenessSelectProps {
  value: string
  onChange: (option: ClosenessFilter) => void
}

export default function ClosenessSelect({
  value,
  onChange,
}: ClosenessSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div className="flex items-center gap-2">
      <span className="text-body text-sm text-gray-500">Closeness</span>
      <div className="flex flex-col">
        <Button
          variant="text"
          className="flex !justify-between border border-gray-80 bg-gray-0 text-gray-600 rounded-lg w-[110px] h-8 px-3 mb-1"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span>{value}</span>
          {isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Button>
        {isOpen && (
          <div className="absolute top-[180px] border border-gray-100 bg-gray-0 rounded-lg w-[110px] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <div className="my-2">
              {OPTIONS.map(option => {
                const isSelected = option === value

                return (
                  <Button
                    variant="text"
                    className={`flex justify-start text-gray-800 ${isSelected ? '!bg-primary-10' : ''} w-full p-0.5 px-3`}
                    onClick={() => {
                      setIsOpen(false)
                      onChange(option)
                    }}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

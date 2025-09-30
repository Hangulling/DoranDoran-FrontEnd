import React from 'react'

interface ResponseOptionsProps {
  options: string[]
  onSelect: (option: string) => void
  selectedOption?: string | null
}

const Selection: React.FC<ResponseOptionsProps> = ({ options, onSelect, selectedOption }) => {
  return (
    <div className="flex gap-[10px] flex-wrap w-[265px] ml-10">
      {options.map((option, idx) => {
        const isSelected = option === selectedOption
        const isAnySelected = selectedOption !== null && selectedOption !== undefined

        // 스타일 조건별 분리
        const baseStyle = 'px-[14px] py-2 rounded-[18px] text-[14px]'
        const selectedStyle = 'bg-white border border-green-400 text-green-400 cursor-default'
        const unselectedStyle = 'bg-gray-80 text-gray-300 cursor-default'
        const defaultStyle = 'bg-green-50 cursor-pointer'

        const buttonStyle = isAnySelected
          ? isSelected
            ? selectedStyle
            : unselectedStyle
          : defaultStyle

        return (
          <button
            key={idx}
            type="button"
            disabled={isAnySelected}
            onClick={() => {
              if (!isAnySelected) {
                onSelect(option)
              }
            }}
            className={`${baseStyle} ${buttonStyle}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default Selection

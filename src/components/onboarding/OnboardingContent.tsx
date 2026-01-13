import { useEffect, useRef } from 'react'
import type { OnboardingStepData } from '../../constants/onboardingData'

interface OnboardingContentProps {
  stepData: OnboardingStepData
  selectedValues: string[]
  onSelect: (value: string) => void
  etcText?: string
  onEtcTextChange?: (text: string) => void
}

export default function OnboardingContent({
  stepData,
  selectedValues,
  onSelect,
  etcText = '',
  onEtcTextChange,
}: OnboardingContentProps) {
  const isGrid = stepData.layout === 'grid'

  const ETC_VALUE = 'Other'
  const MAX_LENGTH = 80
  const isEtcSelected = selectedValues.includes(ETC_VALUE)

  // textarea 높이 조절
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [etcText, isEtcSelected])

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      {/* 타이틀 */}
      <div className="shrink-0">
        <div className="mb-[30px]">
          <h2 className="text-[24px] text-display whitespace-pre-wrap mb-1">
            {stepData.title}
          </h2>
          <p className="text-body text-gray-300 text-[14px] min-h-[21px]">
            {stepData.description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-18 scrollbar-hide">
        {/* 옵션 목록 */}
        <div
          className={
            isGrid
              ? 'grid grid-cols-2 gap-[10px]' // Grid 모드
              : 'flex flex-col gap-[10px]' // List 모드
          }
        >
          {stepData.options.map(optionItem => {
            const value = optionItem.value
            const isSelected = selectedValues.includes(value)

            return (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className={`
                relative rounded-[12px] transition-all duration-200 overflow-hidden border
                ${
                  isSelected
                    ? 'bg-primary-10 border-primary-200'
                    : 'bg-gray-0 border-gray-100'
                }
                ${
                  isGrid
                    ? 'flex flex-col items-start justify-center h-[102px] gap-1 px-5 py-[14px]'
                    : 'w-full min-h-[49px] px-5 flex items-center justify-start gap-[10px] py-[14px]'
                }
              `}
              >
                {/* 텍스트 앞 아이콘 */}
                {optionItem.image && (
                  <img
                    src={optionItem.image}
                    alt="icon"
                    className="object-contain"
                  />
                )}

                {/* 텍스트 */}
                <div className="flex flex-col items-start text-left">
                  {/* Label */}
                  {optionItem.label && (
                    <span className={'text-subtitle text-[14px]'}>
                      {optionItem.label}
                    </span>
                  )}

                  {/* SubLabel */}
                  {optionItem.subLabel && (
                    <span className="text-[12px] text-gray-400 text-body mt-0.5 text-left">
                      {optionItem.subLabel}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Other */}
        {stepData.hasEtc && (
          <div
            onClick={() => onSelect(ETC_VALUE)}
            className={`
            w-full mt-[10px] py-[14px] rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
             ${
               isEtcSelected
                 ? 'bg-primary-10 border-primary-200'
                 : 'bg-gray-0 border-gray-100'
             }
          `}
          >
            <div className="w-full px-5 py-0 flex items-center justify-between">
              <span className="text-[14px] text-subtitle">Other</span>
            </div>

            {/* 확장 입력 영역 */}
            {isEtcSelected && (
              <div className="px-5 pt-1 animate-fadeIn">
                <textarea
                  ref={textareaRef}
                  value={etcText}
                  onChange={e => {
                    const text = e.target.value
                    // 80자 제한
                    if (text.length <= MAX_LENGTH) {
                      onEtcTextChange?.(text)
                    }
                  }}
                  onClick={e => e.stopPropagation()} // 클릭 시 선택 토글 방지
                  placeholder={`${isGrid ? 'Please tell us more! (Optional)' : 'Please tell us more!'}`}
                  rows={1}
                  className="block w-full py-3 bg-transparent border-b border-gray-100 focus:border-gray-400 focus:outline-none text-[14px] leading-relaxed resize-none placeholder-gray-300 overflow-hidden"
                />

                {/* 글자 수 카운터 */}
                <div className="text-right mt-0.5">
                  <span className="text-[14px] text-gray-400">
                    {etcText.length}/{MAX_LENGTH}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

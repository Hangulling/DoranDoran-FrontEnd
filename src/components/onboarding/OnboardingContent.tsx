import { useEffect, useRef } from 'react'
import CheckIcon from '../../assets/icon/CheckIcon'
import type { OnboardingStepData } from '../../constants/onboardingData'

interface OnboardingContentProps {
  stepData: OnboardingStepData
  selectedValues: string[]
  onSelect: (value: string) => void
  etcText?: string
  onEtcTextChange?: (text: string) => void
}

// 체크박스
function CheckCircle({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={`w-[20px] h-[20px] rounded-full border transition-all flex items-center justify-center
        ${isSelected ? 'bg-primary-300 border-primary-300' : 'bg-gray-0 border-gray-200 shadow-[inset_0_0_0_1px_rgb(196,195,198)]'}
      `}
    >
      {isSelected && <CheckIcon className="text-gray-0" />}
    </div>
  )
}

export default function OnboardingContent({
  stepData,
  selectedValues,
  onSelect,
  etcText = '',
  onEtcTextChange,
}: OnboardingContentProps) {
  const StepIcon = stepData.icon
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
      {/* 타이틀 & 아이콘 */}
      <div className="shrink-0">
        <div className="flex justify-left mb-4">
          <StepIcon />
        </div>

        <div className="mb-[30px]">
          <h2 className="text-[22px] text-display whitespace-pre-wrap mb-1">
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
                relative rounded-xl transition-all duration-200 overflow-hidden
                ${
                  isGrid
                    ? 'flex flex-col items-center justify-center'
                    : `w-full min-h-[50px] px-5 text-left flex items-center justify-start gap-3 border py-[14px] ${
                        isSelected
                          ? 'bg-primary-10 border-primary-200'
                          : 'bg-gray-0 border-gray-100'
                      }`
                }
              `}
              >
                {/* Grid 체크박스 */}
                {isGrid && (
                  <div className="absolute top-[10px] right-[9px] z-10">
                    <CheckCircle isSelected={isSelected} />
                  </div>
                )}

                {/* Grid 이미지 */}
                {isGrid && optionItem.image && (
                  <img
                    src={optionItem.image}
                    alt={value}
                    className="object-contain"
                  />
                )}

                {/* 텍스트 앞 아이콘 */}
                {!isGrid && optionItem.image && (
                  <img
                    src={optionItem.image}
                    alt="icon"
                    className="object-contain"
                  />
                )}

                {/* 텍스트 */}
                <div
                  className={`flex flex-col ${isGrid ? 'items-center' : 'items-start'}`}
                >
                  {/* Label */}
                  {optionItem.label && (
                    <span className={'text-subtitle text-[14px]'}>
                      {optionItem.label}
                    </span>
                  )}

                  {/* SubLabel */}
                  {!isGrid && optionItem.subLabel && (
                    <span className="text-[12px] text-gray-400 text-body mt-0.5 text-left">
                      {optionItem.subLabel}
                    </span>
                  )}
                </div>

                {/* 선택 시 오버레이 효과 */}
                {isGrid && isSelected && (
                  <div className="absolute inset-0 bg-[#6A4FF0]/20 pointer-events-none" />
                )}
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
            {/* 텍스트 + 체크박스 */}
            <div className="w-full px-5 py-0 flex items-center justify-between">
              <span className="text-[14px] text-subtitle">Other</span>
              {isGrid && <CheckCircle isSelected={isEtcSelected} />}
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

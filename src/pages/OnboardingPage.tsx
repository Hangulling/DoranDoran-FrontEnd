import { useNavigate } from 'react-router-dom'
import { useSlider } from '../hooks/useSlider'
import { updateOnboarding } from '../api'
import { useUserStore } from '../stores/useUserStore'
import OnboardingContent from '../components/onboarding/OnboardingContent'
import ProgressBar from '../components/common/ProgressBar'
import Button from '../components/common/Button'
import { useState } from 'react'
import { ONBOARDING_STEPS } from '../constants/onboardingData'
import LeftArrowIcon from '../assets/icon/leftArrow.svg?react'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const userId = useUserStore(state => state.id)

  const { page, paginate } = useSlider(ONBOARDING_STEPS.length)

  const [selections, setSelections] = useState<Record<number, string[]>>({})
  const [etcText, setEtcText] = useState('')

  const currentStepData = ONBOARDING_STEPS[page]
  const isLastPage = page === ONBOARDING_STEPS.length - 1

  // 현재 단계의 선택된 값들 가져오기
  const currentSelections = selections[page] || []

  const ETC_VALUE = 'Other'
  const isEtcSelected = currentSelections.includes(ETC_VALUE)
  const isGrid = currentStepData.layout === 'grid'

  // 버튼 활성화 조건
  const isNextEnabled =
    currentSelections.length > 0 &&
    (!isEtcSelected || isGrid || etcText.trim().length > 0)

  // 옵션 선택 핸들러
  const handleSelect = (option: string) => {
    setSelections(prev => {
      const currentList = prev[page] || []
      const isSelected = currentList.includes(option)

      if (currentStepData.type === 'single') {
        // 단일 선택
        return { ...prev, [page]: [option] }
      } else {
        // 다중 선택
        if (isSelected) {
          return {
            ...prev,
            [page]: currentList.filter(item => item !== option),
          }
        } else {
          return { ...prev, [page]: [...currentList, option] }
        }
      }
    })
  }

  // 완료 처리
  const handleCompleteOnboarding = async () => {
    if (!userId) {
      console.error('User ID를 찾을 수 없습니다.')
      navigate('/', { replace: true })
      return
    }

    try {
      await updateOnboarding(userId, true)
      console.log('온보딩 완료 처리 성공')
      navigate('/', {
        replace: true,
        state: { showOnboardingModal: true },
      })
    } catch (error) {
      console.error('온보딩 완료 처리 실패', error)
      navigate('/', { replace: true })
    }
  }

  // 뒤로가기
  const handleBack = () => {
    if (page > 0) {
      // setEtcText('')
      paginate(-1)
    } else {
      navigate(-1)
    }
  }

  // 스킵
  const handleSkip = () => {
    handleCompleteOnboarding()
  }

  const handleNextClick = () => {
    if (page < ONBOARDING_STEPS.length - 1) {
      setEtcText('')
      paginate(1)
    } else {
      handleCompleteOnboarding()
    }
  }

  return (
    <div className="flex flex-col min-h-full items-center bg-gray-0 relative px-5">
      <header className="sticky top-0 z-30 w-full bg-gray-0 mb-10">
        {/* Nav Bar */}
        <div className="flex justify-between items-center h-15 p-0">
          {page !== 0 && (
            <button onClick={handleBack}>
              <LeftArrowIcon className="gray-600" />
            </button>
          )}

          {page === 4 && (
            <button
              onClick={handleSkip}
              className="text-[14px] text-gray-400 text-body py-2 px-1"
            >
              Skip
            </button>
          )}
        </div>

        <ProgressBar
          totalSteps={ONBOARDING_STEPS.length}
          currentStep={page + 1}
        />
      </header>

      {/* 컨텐츠 */}
      <div className="flex-1 w-full max-w-app md:max-w-tablet lg:max-w-desktop overflow-y-auto pb-4">
        <OnboardingContent
          stepData={currentStepData}
          selectedValues={currentSelections}
          onSelect={handleSelect}
          etcText={etcText}
          onEtcTextChange={setEtcText}
        />
      </div>

      {/* 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-gray-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] h-18 px-5 py-[10px]">
          {isLastPage ? (
            <Button
              type="submit"
              className="bg-gray-800"
              variant="primary"
              size="confirm"
              disabled={!isNextEnabled}
              onClick={e => {
                e.stopPropagation()
                handleCompleteOnboarding()
              }}
            >
              Complete
            </Button>
          ) : (
            <Button
              className="bg-gray-800"
              variant="primary"
              size="confirm"
              disabled={!isNextEnabled}
              onClick={e => {
                e.stopPropagation()
                handleNextClick()
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

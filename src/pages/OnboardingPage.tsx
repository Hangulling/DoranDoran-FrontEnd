import { useNavigate } from 'react-router-dom'
import { useSlider } from '../hooks/useSlider'
import { useUserStore } from '../stores/useUserStore'
import OnboardingContent from '../components/onboarding/OnboardingContent'
import ProgressBar from '../components/common/ProgressBar'
import Button from '../components/common/Button'
import { useEffect, useState } from 'react'
import { ONBOARDING_STEPS } from '../constants/onboardingData'
import LeftArrowIcon from '../assets/icon/leftArrow.svg?react'
import type { OnboardingPayload } from '../types/user'
import { useCompleteOnboarding } from '../hooks/useCompleteOnboarding'
import { useIOSKeyboard } from '../hooks/useIOSKeyboard'
import { getTodayDate, getUnixTime, sendGAEvent } from '../utils/ga'
import { SplashScreen } from '@capacitor/splash-screen'

const ETC_VALUE = 'Other'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const userId = useUserStore(state => state.id)
  const { completeOnboarding } = useCompleteOnboarding(userId)

  const { page, paginate } = useSlider(ONBOARDING_STEPS.length)
  const [selections, setSelections] = useState<Record<number, string[]>>({})
  const [etcValues, setEtcValues] = useState<Record<number, string>>({})
  const [etcText, setEtcText] = useState('')

  const { isIOSApp, keyboardHeight } = useIOSKeyboard()

  const currentStepData = ONBOARDING_STEPS[page]
  const isLastPage = page === ONBOARDING_STEPS.length - 1

  // 현재 단계의 선택된 값들
  const currentSelections = selections[page] || []
  const isEtcSelected = currentSelections.includes(ETC_VALUE)
  // 버튼 활성화 조건
  const isNextEnabled =
    currentSelections.length > 0 &&
    (!isEtcSelected || etcText.trim().length > 0)

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

  // Payload
  const createPayload = (): OnboardingPayload => {
    const payload: OnboardingPayload = {}

    // Referral Source
    if (selections[0]?.[0]) {
      payload.referralSource =
        selections[0][0] === ETC_VALUE ? 'other' : selections[0][0]
      if (payload.referralSource === 'other')
        payload.referralOther = etcValues[0] || ''
    }

    // Korean Level
    if (selections[1]?.[0]) payload.koreanLevel = Number(selections[1][0])

    // Purpose
    if (selections[2]?.length) {
      payload.purposeKeys = selections[2].map(option =>
        option === ETC_VALUE ? 'other' : option
      )

      if (selections[2].includes(ETC_VALUE)) {
        payload.purposeOther = etcValues[2] || ''
      }
    }

    // Topic Keys
    if (selections[3]?.length) payload.topicKeys = selections[3]

    // Push Enabled
    if (selections[4]?.[0]) payload.pushEnabled = selections[4][0] === 'yes'

    return payload
  }

  const trackOnboardingStep = (isLast: boolean) => {
    const commonParams = {
      time: getUnixTime(),
      date: getTodayDate(),
    }

    if (isLast) {
      // ga_On_complete
      sendGAEvent('On_complete', commonParams)
    } else {
      const eventNames = [
        'On_marketing',
        'On_level',
        'On_purpose',
        'On_topic',
        'On_noti',
      ]
      const eventName = eventNames[page]

      // 각 단계별 type 값 설정
      let typeValue = ''
      // Level
      if (page === 1) {
        typeValue = `lv.${currentSelections[0]}`
        // 다중 선택
      } else if (currentStepData.type === 'multiple') {
        typeValue = currentSelections
          .map(val => (val === ETC_VALUE ? 'other' : val))
          .join(', ')
      } else {
        // 그 외
        typeValue =
          currentSelections[0] === ETC_VALUE ? 'other' : currentSelections[0]
      }

      sendGAEvent(eventName, {
        ...commonParams,
        type: typeValue,
      })
    }
  }

  const handleAction = (isCompleting: boolean) => {
    trackOnboardingStep(isCompleting)

    if (isCompleting) {
      completeOnboarding(createPayload(), false)
    } else {
      setEtcValues(prev => ({ ...prev, [page]: etcText }))
      setEtcText(etcValues[page + 1] || '')
      paginate(1)
    }
  }

  // 뒤로가기
  const handleBack = () => {
    if (page > 0) {
      setEtcValues(prev => ({ ...prev, [page]: etcText }))
      // 이전 페이지에 저장된 Etc 내용이 있다면 불러오기
      setEtcText(etcValues[page - 1] || '')
      paginate(-1)
    } else {
      navigate(-1)
    }
  }

  useEffect(() => {
    SplashScreen.hide()
  }, [])

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
        </div>

        <ProgressBar
          totalSteps={ONBOARDING_STEPS.length}
          currentStep={page + 1}
        />
      </header>

      {/* 컨텐츠 */}
      <div
        className="flex-1 w-full max-w-app md:max-w-tablet lg:max-w-desktop overflow-y-auto"
        style={{
          paddingBottom: '88px',
        }}
      >
        <OnboardingContent
          stepData={currentStepData}
          selectedValues={currentSelections}
          onSelect={handleSelect}
          etcText={etcText}
          onEtcTextChange={setEtcText}
        />
      </div>

      {/* 버튼 */}
      <div
        className="fixed inset-x-0 bottom-0 z-10 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-none transition-all duration-200"
        style={
          isIOSApp && keyboardHeight > 0
            ? {
                bottom: `${keyboardHeight}px`,
                paddingBottom: 0,
              }
            : undefined
        }
      >
        <div className="w-full max-w-app md:max-w-tablet lg:max-w-desktop bg-gray-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] h-18 px-5 py-2.5 pointer-events-auto">
          <Button
            type={isLastPage ? 'submit' : 'button'}
            className="bg-gray-800"
            variant="primary"
            size="confirm"
            disabled={!isNextEnabled}
            onClick={e => {
              e.stopPropagation()
              handleAction(isLastPage)
            }}
          >
            {isLastPage ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

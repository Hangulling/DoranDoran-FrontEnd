import React, { useEffect, useMemo, useRef, useState, type FC } from 'react'
import ChatBubble from './ChatBubble'
// import DescriptionBubble from './DescriptionBubble'
import useClosenessStore from '../../stores/useClosenessStore'
import { useParams } from 'react-router-dom'
import { greetingMessage } from '../../mocks/db/greetingMessages'
import { conceptMap } from '../../utils/conceptMap'

interface InitChatProps {
  avatar?: string
  onReady?: () => void
}
const LoadingDot = () => <span className="loading loading-dots loading-[5px] text-gray-200" />

const InitChat: React.FC<InitChatProps> = ({ avatar, onReady }) => {
  const { id } = useParams<{ id: string }>()
  const [step, setStep] = useState(0)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const LOADING_DURATION = 600
  const PAUSE_DURATION = 700

  // Closeness 상태 가져오기
  const closenessLevel = useClosenessStore(state => state.getCloseness(id ?? '')) ?? 1

  // id에 따른 컨셉 매핑 유틸 사용
  const concept = conceptMap(id)

  function getGreetingMessage(concept: string, closenessLevel: number) {
    const filtered = greetingMessage.filter(
      item => item.concept === concept && item.closenessLevel === closenessLevel
    )
    if (filtered.length === 0) {
      return {
        message: '메시지가 없습니다.', // 수정 필요
        systemMessage: '',
      }
    }
    // 랜덤 선택
    const randomItem = filtered[Math.floor(Math.random() * filtered.length)]
    return {
      message: randomItem.message,
      systemMessage: randomItem.systemMessage,
    }
  }

  // concept이나 closenessLevel이 바뀔 때만 함수 실행
  const { message, systemMessage } = useMemo(() => {
    return getGreetingMessage(concept, closenessLevel)
  }, [concept, closenessLevel])

  const LoadingBubble: FC<{ showAvatar?: boolean }> = ({ showAvatar }) => (
    <ChatBubble
      message={<LoadingDot />}
      isSender={false}
      avatarUrl={showAvatar ? avatar : undefined}
      variant={showAvatar ? 'basic' : 'second'}
      showIcon={false}
    />
  )

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    const schedule = (callback: () => void, duration: number) => {
      timers.push(setTimeout(callback, duration))
    }

    if (step >= 4) return

    switch (step) {
      case 0:
        schedule(() => setStep(1), 100)
        break
      case 1: // 첫 번째 버블 로딩 중
        schedule(() => setStep(2), LOADING_DURATION)
        break
      case 2: // 첫 번째 버블 완료
        schedule(() => setStep(3), PAUSE_DURATION)
        break
      case 3: // 두 번째 버블 로딩 중
        schedule(() => setStep(4), LOADING_DURATION)
        break
    }

    return () => timers.forEach(clearTimeout)
  }, [step])

  useEffect(() => {
    if (step === 4 && lastMessageRef.current) {
      setTimeout(() => {
        console.log('onReady called')
        onReady?.()
      }, 0)
    }
  }, [step, onReady])

  return (
    <div className="flex flex-col gap-y-2">
      {step === 1 && <LoadingBubble showAvatar={true} />}
      {step >= 2 && (
        <ChatBubble
          message={step === 1 ? <LoadingDot /> : message}
          isSender={false}
          avatarUrl={avatar}
          variant="basic"
        />
      )}

      {/* {step === 3 && <LoadingBubble showAvatar={false} />}
      {step >= 4 && (
        <DescriptionBubble
          word="치맥"
          pronunciation="chi-maek"
          descriptionByTab={{
            Kor: '맥주와 치킨을 같이 즐기는 어쩌구',
            Eng: 'A Korean slang term for the popular pairing of fried chicken and beer (maekju).',
          }}
        />
      )} */}

      {step === 3 && <LoadingBubble showAvatar={false} />}
      {step >= 4 && (
        <div ref={lastMessageRef}>
          <ChatBubble message={systemMessage} isSender={false} variant="second" />
        </div>
      )}
    </div>
  )
}

export default InitChat

import React, { useEffect, useMemo, useRef, useState, type FC } from 'react'
import ChatBubble from './ChatBubble'
import useClosenessStore from '../../stores/useClosenessStore'
import { useParams } from 'react-router-dom'
import { greetingMessage } from '../../mocks/db/greetingMessages'
import { conceptMap } from '../../utils/conceptMap'

interface InitChatProps {
  avatar?: string
  onReady?: () => void
}
const LoadingDot = () => <span className="loading loading-dots loading-[5px] text-gray-200" />

// 메시지 가져오는 함수 (의존성 안정화)
function getGreetingMessage(concept: string, closenessLevel: number) {
  const filtered = greetingMessage.filter(
    item => item.concept === concept && item.closenessLevel === closenessLevel
  )
  if (filtered.length === 0) {
    return {
      message: '메시지가 없습니다.',
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

const InitChat: React.FC<InitChatProps> = ({ avatar, onReady }) => {
  const { id } = useParams<{ id: string }>()
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const LOADING_DURATION = 600
  const PAUSE_DURATION = 700

  // Closeness 상태 가져오기
  const closenessLevel = useClosenessStore(state => state.getCloseness(id ?? '')) ?? 1

  // id에 따른 컨셉 매핑 유틸 사용
  const concept = conceptMap(id)

  const storageKey = useMemo(() => `initChat_${id}`, [id])

  const [initialState] = useState(() => {
    const storedData = sessionStorage.getItem(storageKey)
    if (storedData) {
      // 새로고침: 저장된 데이터로 즉시 4단계 시작
      return {
        step: 4,
        messages: JSON.parse(storedData) as {
          message: string
          systemMessage: string
        },
      }
    }
    // 첫 방문: 0단계에서 시작
    return {
      step: 0,
      messages: null,
    }
  })

  // 위에서 계산된 초기값으로 state 설정
  const [step, setStep] = useState(initialState.step)
  const [messages, setMessages] = useState(initialState.messages)

  useEffect(() => {
    // messages가 null일 때만 실행
    if (!messages && concept && closenessLevel) {
      const { message, systemMessage } = getGreetingMessage(concept, closenessLevel)

      // sessionStorage에 저장
      sessionStorage.setItem(storageKey, JSON.stringify({ message, systemMessage }))

      // state에 설정
      setMessages({ message, systemMessage })
    }
  }, [messages, concept, closenessLevel, storageKey])

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
    if (step >= 4) return // 새로고침 시 애니메이션 없음

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
      const timer = setTimeout(() => {
        console.log('onReady called')
        onReady?.()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [step, onReady])

  if (!messages) {
    // 첫 프레임 깜빡임을 방지하기 위해 첫 번째 로더를 보여줌
    return (
      <div className="flex flex-col gap-y-2">
        <LoadingBubble showAvatar={true} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-2">
      {step === 1 && <LoadingBubble showAvatar={true} />}
      {step >= 2 && (
        <ChatBubble
          message={step === 1 ? <LoadingDot /> : messages.message}
          isSender={false}
          avatarUrl={avatar}
          variant="basic"
        />
      )}

      {step === 3 && <LoadingBubble showAvatar={false} />}
      {step >= 4 && (
        <div ref={lastMessageRef}>
          <ChatBubble message={messages.systemMessage} isSender={false} variant="second" />
        </div>
      )}
    </div>
  )
}

export default InitChat

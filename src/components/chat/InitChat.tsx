import React, { useEffect, useRef, useState, type FC } from 'react'
import ChatBubble from './ChatBubble'
interface InitChatProps {
  avatar?: string
  onReady?: () => void
  message1: string
  message2: string
}
const LoadingDot = () => <span className="loading loading-dots loading-[5px] text-gray-200" />

const InitChat: React.FC<InitChatProps> = ({ avatar, onReady, message1, message2 }) => {
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const LOADING_DURATION = 600
  const PAUSE_DURATION = 700

  const [step, setStep] = useState(0)

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
      const timer = setTimeout(() => {
        console.log('onReady called')
        onReady?.()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [step, onReady])

  return (
    <div className="flex flex-col gap-y-2">
      {step === 1 && <LoadingBubble showAvatar={true} />}
      {step >= 2 && (
        <ChatBubble
          message={step === 1 ? <LoadingDot /> : message1}
          isSender={false}
          avatarUrl={avatar}
          variant="basic"
        />
      )}

      {step === 3 && <LoadingBubble showAvatar={false} />}
      {step >= 4 && (
        <div ref={lastMessageRef}>
          {message2 && <ChatBubble message={message2} isSender={false} variant="second" />}
        </div>
      )}
    </div>
  )
}

export default InitChat

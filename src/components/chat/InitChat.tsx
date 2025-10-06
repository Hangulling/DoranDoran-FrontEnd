import React, { useEffect } from 'react'
import ChatBubble from './ChatBubble'
import DescriptionBubble from './DescriptionBubble'

interface InitChatProps {
  onReady?: () => void
}

const InitChat: React.FC<InitChatProps> = ({ onReady }) => {
  useEffect(() => {
    // 마운트 완료 시점에 알림
    onReady?.()
  }, [onReady])

  return (
    <div>
      <ChatBubble
        message="배고파~ 치맥 먹으러 갈래?"
        isSender={false}
        avatarUrl="/public/chat/lover.svg"
        variant="basic"
        showIcon={true}
      />
      <DescriptionBubble
        word="치맥"
        pronunciation="chi-maek"
        descriptionByTab={{
          Kor: '맥주와 치킨을 같이 즐기는 어쩌구',
          Eng: 'A Korean slang term for the popular pairing of fried chicken and beer (maekju).',
        }}
      />
      <ChatBubble
        message="Let’s continue the conversation about what kind of chicken you want to eat!"
        isSender={false}
        variant="second"
      />
    </div>
  )
}

export default InitChat

import React from 'react'
import ChatBubble from './ChatBubble'

const InitChat: React.FC = () => {
  return (
    <div>
      <ChatBubble
        message="뭐라고 답변해야할지 고민될 땐, 아래의 추천 문구를 선택해봐!"
        isSender={false}
        variant="second"
      />
    </div>
  )
}

export default InitChat

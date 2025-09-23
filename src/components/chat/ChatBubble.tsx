import React from 'react'

interface ChatBubbleProps {
  message: string
  isSender: boolean
  avatarUrl?: string
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender }) => {
  const chatContainerClass = isSender ? 'chat chat-end gap-x-[0]' : 'chat chat-start gap-x-[8px]'

  // 말풍선 스타일
  const customBubbleClass = `
    py-[6px] px-2 text-[14px] text-subtitle max-w-[265px]
    ${isSender ? 'bg-green-400 text-white' : 'bg-white border border-gray-100'}
    rounded-lg
    ${isSender ? 'rounded-tr-none' : 'rounded-tl-none'} 
  `

  return (
    <div className={`${chatContainerClass} relative`}>
      {!isSender && (
        <div className="chat-image avatar absolute top-1 left-0 w-8 h-8">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img alt="Chat bubble avatar" src={'/public/chat/lover.svg'} />
          </div>
        </div>
      )}

      <div className={`${customBubbleClass} ml-10`}>{message}</div>
    </div>
  )
}

export default ChatBubble

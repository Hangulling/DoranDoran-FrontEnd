import { useEffect, useRef, useState } from 'react'
import ChatBubble from '../components/chat/ChatBubble'
import ChatDate from '../components/chat/ChatDate'
import CoachMark from '../components/chat/CoachMark'
import ChatFooter from '../components/chat/ChatFooter'
import InitChat from '../components/chat/InitChat'
import DescriptionBubble from '../components/chat/DescriptionBubble'
import { messages } from '../mocks/db/chat'

interface Message {
  id: number
  text: string
  isSender: boolean
  avatarUrl?: string
  variant?: 'basic' | 'second' | 'sender'
  showIcon?: boolean
}

interface ChatListProps {
  messages: Message[]
}

const ChatPage: React.FC<ChatListProps> = () => {
  const [showCoachMark, setShowCoachMark] = useState(true)
  const [footerHeight, setFooterHeight] = useState(173)
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) return

    const handleFocus = () => {
      setTimeout(() => {
        chatMainRef.current?.scrollTo({
          top: chatMainRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 100) // 키보드 올라올 대기시간 고려
    }

    inputEl.addEventListener('focus', handleFocus)
    return () => inputEl.removeEventListener('focus', handleFocus)
  }, [])

  // API 연동 위해 작성
  useEffect(() => {
    // const checkCoachMarkSeen = async () => {
    //   const hasSeen = await api.get('/user/coachMark'); // API 호출
    //   if (hasSeen) {
    //     setShowCoachMark(false);
    //   }
    // };
    // checkCoachMarkSeen();
  }, []) // 한 번만 실행

  const handleCloseCoachMark = () => {
    setShowCoachMark(false)

    // await api.post('/user/coachMark'); // 확인 시 API 전달
  }

  const handleFooterHeightChange = (height: number) => {
    setFooterHeight(height)
  }

  return (
    <div className="flex flex-col max-w-md mx-auto bg-white h-screen overflow-hidden">
      <main
        ref={chatMainRef}
        className="flex-grow min-h-0 overflow-y-auto px-5"
        style={{ paddingBottom: footerHeight + 24 }}
      >
        <ChatDate />

        {messages.map((msg, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : null
          const isSenderChanged = prevMsg ? prevMsg.isSender !== msg.isSender : false
          const marginClass = isSenderChanged ? 'mt-5' : 'mt-0'
          return (
            <div key={msg.id} className={marginClass}>
              <ChatBubble
                message={msg.text}
                isSender={msg.isSender}
                avatarUrl={msg.avatarUrl}
                variant={msg.variant ?? 'basic'}
                showIcon={msg.showIcon}
              />

              {msg.explanation && (
                <DescriptionBubble
                  word={msg.explanation.word}
                  pronunciation={msg.explanation.pronunciation}
                  descriptionByTab={msg.explanation.descriptionByTab}
                  initialTab={msg.explanation.selectedTab}
                />
              )}
            </div>
          )
        })}

        <InitChat />
      </main>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer
        className="fixed bottom-0 left-0 right-0 bg-white"
        style={{ height: footerHeight, zIndex: 10 }}
      >
        <ChatFooter onHeightChange={handleFooterHeightChange} inputRef={inputRef} />
      </footer>
    </div>
  )
}
export default ChatPage

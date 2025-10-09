import { useEffect, useRef, useState } from 'react'
import ChatBubble from '../components/chat/ChatBubble'
import CoachMark from '../components/chat/CoachMark'
import ChatFooter from '../components/chat/ChatFooter'
import DescriptionBubble from '../components/chat/DescriptionBubble'
//import { initialMessages } from '../mocks/db/chat'
import type { Message } from '../types/chat'
import InitChat from '../components/chat/InitChat'
import { useCoachStore } from '../stores/useUiStateStore'
import { useParams } from 'react-router-dom'
import { chatRooms } from '../mocks/db/chat'
import useScreenHeight from '../hooks/useScreenHeight'

const ChatPage: React.FC = () => {
  const { id } = useParams()
  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [isInitChatReady, setIsInitChatReady] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const screenHeight = useScreenHeight()

  const room = chatRooms.find(r => String(r.roomId) === String(id))

  // InitChat 렌더 후 콜백
  const handleInitReady = () => {
    setIsInitChatReady(true)
  }

  useEffect(() => {
    console.log('isInitChatReady, coachMarkSeen', isInitChatReady, coachMarkSeen)
    if (isInitChatReady && !coachMarkSeen) {
      const timer = setTimeout(() => {
        setShowCoachMark(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isInitChatReady, coachMarkSeen])

  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) return
    const handleFocus = () => {
      setTimeout(() => {
        chatMainRef.current?.scrollTo({ top: chatMainRef.current.scrollHeight, behavior: 'smooth' })
      }, 100) // 키보드 올라올 대기시간 고려
    }

    inputEl.addEventListener('focus', handleFocus)
    return () => inputEl.removeEventListener('focus', handleFocus)
  }, [])

  // 메시지 추가될때마다 자동 스크롤
  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

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
    setCoachMarkSeen(true)
    // await api.post('/user/coachMark'); // 확인 시 API 전달
  }

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      isSender: true,
      variant: 'sender',
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  return (
    <div
      className="flex flex-col max-w-md mx-auto bg-white overflow-hidden"
      style={{ height: screenHeight }}
    >
      <main
        ref={chatMainRef}
        className="flex-grow overflow-y-auto px-5 pt-10"
        style={{ minHeight: 0 }}
      >
        <InitChat avatar={room?.avatar} onReady={handleInitReady} />

        <div className="space-y-4">
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
        </div>
        {/* 입력창 사이의 여백 */}
        <div className="h-6" />
      </main>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer className="flex-shrink-0">
        <ChatFooter inputRef={inputRef} onSendMessage={handleSendMessage} />
      </footer>
    </div>
  )
}
export default ChatPage

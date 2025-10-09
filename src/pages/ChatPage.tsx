import { useEffect, useRef, useState } from 'react'
import ChatBubble from '../components/chat/ChatBubble'
import CoachMark from '../components/chat/CoachMark'
import ChatFooter from '../components/chat/ChatFooter'
import DescriptionBubble from '../components/chat/DescriptionBubble'
import type { Message } from '../types/chat'
import InitChat from '../components/chat/InitChat'
import { useCoachStore } from '../stores/useUiStateStore'
import { useParams } from 'react-router-dom'
import { chatRooms } from '../mocks/db/chat'

const ChatPage: React.FC = () => {
  const { id } = useParams()
  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [isInitChatReady, setIsInitChatReady] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined)

  const room = chatRooms.find(r => String(r.roomId) === String(id))

  const handleInitReady = () => {
    setIsInitChatReady(true)
  }

  // viewportHeight 상태 업데이트
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      }
    }

    // 초기 높이 설정
    handleResize()

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    console.log('isInitChatReady, coachMarkSeen', isInitChatReady, coachMarkSeen)
    if (isInitChatReady && !coachMarkSeen) {
      const timer = setTimeout(() => {
        setShowCoachMark(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isInitChatReady, coachMarkSeen])

  // 메시지 추가될때마다 자동 스크롤
  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) return
    const handleFocus = () => {
      setTimeout(() => {
        chatMainRef.current?.scrollTo({ top: chatMainRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }

    inputEl.addEventListener('focus', handleFocus)
    return () => inputEl.removeEventListener('focus', handleFocus)
  }, [])

  const handleCloseCoachMark = () => {
    setShowCoachMark(false)
    setCoachMarkSeen(true)
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
      className="flex flex-col overflow-hidden bg-white h-screen"
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100vh' }}
    >
      <main ref={chatMainRef} className="flex-grow overflow-y-auto px-5 pt-10">
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
      </main>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer className="flex-shrink-0">
        <ChatFooter inputRef={inputRef} onSendMessage={handleSendMessage} />
      </footer>
    </div>
  )
}
export default ChatPage

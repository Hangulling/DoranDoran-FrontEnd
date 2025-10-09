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

const ChatPage: React.FC = () => {
  const { id } = useParams()
  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const coachTimerRef = useRef<number | null>(null)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const footerRef = useRef<HTMLElement>(null)
  const [footerHeight, setFooterHeight] = useState(0)

  const room = chatRooms.find(r => String(r.roomId) === String(id))

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight)
    }
  }, [])

  const handleInitReady = () => {
    if (coachMarkSeen) return
    if (coachTimerRef.current) {
      window.clearTimeout(coachTimerRef.current)
      coachTimerRef.current = null
    }
    coachTimerRef.current = window.setTimeout(() => {
      setShowCoachMark(true)
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (coachTimerRef.current) {
        window.clearTimeout(coachTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!footerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setFooterHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(footerRef.current)
    return () => resizeObserver.disconnect()
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
    <div className="relative bg-white flex flex-col" style={{ height: windowHeight }}>
      <main
        ref={chatMainRef}
        className="flex-1 overflow-y-auto px-5 pt-10"
        style={{ paddingBottom: `${footerHeight}px` }}
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
        <div className="h-6" />
      </main>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer ref={footerRef} className="fixed bottom-0 left-0 w-full z-50">
        <ChatFooter inputRef={inputRef} onSendMessage={handleSendMessage} />
      </footer>
    </div>
  )
} //왜 저장이 안돼
export default ChatPage

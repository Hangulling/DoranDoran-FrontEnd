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
  const [messages, setMessages] = useState<Message[]>([])
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const coachTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      // 키보드 올라올 때 root 스크롤 영역이 생기지 않도록 강제 고정
      document.documentElement.style.height = `${window.visualViewport?.height || window.innerHeight}px`
      document.body.style.height = `${window.visualViewport?.height || window.innerHeight}px`
      document.body.style.overflow = 'hidden'
    }

    const reset = () => {
      document.documentElement.style.height = ''
      document.body.style.height = ''
      document.body.style.overflow = ''
    }

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', handleResize)
    }

    handleResize() // 초기 진입 시 1회 실행

    return () => {
      reset()
      if (viewport) viewport.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const mainElement = chatMainRef.current
    if (!mainElement) return

    const scrollToBottom = () => {
      setTimeout(() => {
        mainElement.scrollTop = mainElement.scrollHeight
      }, 100)
    }

    scrollToBottom()

    const viewport = window.visualViewport
    if (viewport) {
      viewport.addEventListener('resize', scrollToBottom)
      return () => viewport.removeEventListener('resize', scrollToBottom)
    }
  }, [messages])

  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

  const room = chatRooms.find(r => String(r.roomId) === String(id))

  // 코치 마크 오픈 시간
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

  const handleCloseCoachMark = () => {
    setShowCoachMark(false)
    setCoachMarkSeen(true)
  }

  useEffect(() => {
    document.body.classList.add('chat-page-active')
    return () => {
      document.body.classList.remove('chat-page-active')
    }
  }, [])

  // 메시지 전송
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      isSender: true,
      variant: 'sender',
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  useEffect(() => {
    const root = document.getElementById('root')
    const viewport = window.visualViewport

    const fixRootHeight = () => {
      if (!root || !viewport) return
      root.style.height = viewport.height + 'px'
      root.style.overflow = 'hidden' // 루트 스크롤 완전 차단
    }

    const resetRootHeight = () => {
      if (!root) return
      root.style.height = ''
      root.style.overflow = ''
    }

    if (viewport) {
      viewport.addEventListener('resize', fixRootHeight)
      viewport.addEventListener('scroll', fixRootHeight) // 일부 기기에서 resize 대신 scroll 발생
    }

    // 진입 시 바로 적용
    fixRootHeight()

    return () => {
      resetRootHeight()
      if (viewport) {
        viewport.removeEventListener('resize', fixRootHeight)
        viewport.removeEventListener('scroll', fixRootHeight)
      }
    }
  }, [])

  return (
    <div className="flex flex-col flex-grow min-h-0">
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
        <div className="h-4" />
      </main>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer>
        <ChatFooter inputRef={inputRef} onSendMessage={handleSendMessage} />
      </footer>
    </div>
  )
}

export default ChatPage

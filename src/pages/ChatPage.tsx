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
    const mainElement = chatMainRef.current
    const viewport = window.visualViewport

    if (!mainElement || !viewport) return

    // 스크롤을 맨 아래로 강제 이동시키는 함수
    const scrollToBottom = () => {
      setTimeout(() => {
        mainElement.scrollTop = mainElement.scrollHeight
      }, 100)
    }

    // 키보드가 올라왔을 때 스크롤 위치를 보정
    viewport.addEventListener('resize', scrollToBottom)
    const preventScrollChaining = (event: TouchEvent) => {
      const isTargetInMain = mainElement.contains(event.target as Node)
      if (!isTargetInMain) {
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = mainElement
      const isAtTop = scrollTop === 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight

      const currentY = event.touches[0].clientY
      // @ts-expect-error : _lastY는 이 함수 스코프 내에서 동적으로 추가
      const deltaY = currentY - (mainElement._lastY || currentY)

      // 위로 스크롤(내용을 아래로 내림)할 때 맨 위에 도달했다면
      if (isAtTop && deltaY > 0) {
        event.preventDefault()
      }

      // 아래로 스크롤(내용을 위로 올림)할 때 맨 아래에 도달했다면
      if (isAtBottom && deltaY < 0) {
        event.preventDefault()
      }

      // 현재 터치 위치를 저장
      // @ts-expect-error scroll
      mainElement._lastY = currentY
    }

    const resetLastY = () => {
      // @ts-expect-error scroll
      mainElement._lastY = null
    }

    // 채팅창 내부에서 터치가 시작되면 스크롤 체이닝 방지 로직을 활성화
    mainElement.addEventListener('touchstart', resetLastY)
    mainElement.addEventListener('touchmove', preventScrollChaining, { passive: false })

    // 컴포넌트가 사라질 때 모든 이벤트 리스너를 정리
    return () => {
      viewport.removeEventListener('resize', scrollToBottom)
      mainElement.removeEventListener('touchstart', resetLastY)
      mainElement.removeEventListener('touchmove', preventScrollChaining)
    }
  }, [])

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

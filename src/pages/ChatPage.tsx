import { useCallback, useEffect, useRef, useState } from 'react'
import ChatBubble from '../components/chat/ChatBubble'
import CoachMark from '../components/chat/CoachMark'
import ChatFooter from '../components/chat/ChatFooter'
import DescriptionBubble from '../components/chat/DescriptionBubble'
import type { Message } from '../types/chat'
import InitChat from '../components/chat/InitChat'
import { useCoachStore, useModalStore } from '../stores/useUiStateStore'
import { useNavigate, useParams } from 'react-router-dom'
import { chatRooms } from '../mocks/db/chat'
import ExitModal from '../components/chat/ExitModal'
import { useChatStream } from '../hooks/useChatStream'
import { useUserStore } from '../stores/useUserStore'
import useRoomIdStore from '../stores/useRoomIdStore'
import type { EventDataMap } from '../types/sseEvents'
import { sendMessage } from '../api'
import CorrectionBubble from '../components/chat/CorrectionBubble'
import { useUserMsgStore } from '../stores/useUserMsgStore'

const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const noShowAgain = useModalStore(state => state.noShowAgain)
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const coachTimerRef = useRef<number | null>(null)
  const userId = useUserStore(state => state.id)
  const roomsMap = useRoomIdStore(state => state.roomsMap)
  const chatroomId = id ? roomsMap[id] : undefined
  const accessToken = localStorage.getItem('accessToken') ?? ''

  const { setUserMsgId, setUserContent } = useUserMsgStore()

  const [intimacyAnalysis, setIntimacyAnalysis] = useState<any>(null)
  const [vocabulary, setVocabulary] = useState<any>(null)
  // const [aggregatedData, setAggregatedData] = useState<any>(null)

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // 뒤로가기 모달 오픈
      if (noShowAgain) {
        navigate('/')
        return
      }

      setIsModalOpen(true)
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate, noShowAgain])

  // SSE
  const handleSseEvent = useCallback(
    (eventType: string, data: any) => {
      switch (eventType) {
        case 'conversation_complete': {
          const room = chatRooms.find(r => String(r.roomRouteId) === String(id))
          setMessages(prev => [
            ...prev,
            {
              id: data.content.messageId,
              text: data.content,
              isSender: false,
              avatarUrl: room?.avatar ?? '',
              variant: 'basic',
              showIcon: true,
            },
          ])
          break
        }
        case 'intimacy_analysis': // 사용자 대답 교정
          setIntimacyAnalysis(data)
          break
        case 'vocabulary_extracted': //ai 답장에 대한 설명
          setVocabulary(data)
          break
        // case 'aggregated_complete':
        //  setAggregatedData(data)
        // break
        default:
          // 예상 못한 이벤트 처리 예: 메시지 상태에 기록
          setMessages(prev => [
            ...prev,
            {
              id: `unknown-${Date.now()}`,
              text: `[${eventType}] ${JSON.stringify(data)}`,
              isSender: false,
            },
          ])
          break
      }
    },
    [id]
  )

  // 여기서 useChatStream 호출
  useChatStream<EventDataMap>(chatroomId ?? '', userId, accessToken, handleSseEvent, e =>
    console.error('SSE Error', e)
  )

  // 버튼 핸들러
  const handleConfirm = () => {
    setIsModalOpen(false)
    navigate('/', { replace: true })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

  const room = chatRooms.find(r => String(r.roomRouteId) === String(id))

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

  // 메시지 전송
  const handleSendMessage = async (text: string) => {
    if (!chatroomId) {
      console.error('채팅방 ID가 없습니다.')
      return
    }

    try {
      // 서버에 메시지 전송
      const response = await sendMessage(chatroomId, {
        senderType: 'user',
        content: text,
        contentType: 'text',
      })

      setUserMsgId(response.id)
      setUserContent(response.content)

      // 서버에서 반환한 메시지 데이터로 로컬 메시지 업데이트 (id 등 서버에서 받은 값 사용 가능)
      const newMessage: Message = {
        id: response.id,
        text: response.content,
        isSender: true,
        variant: 'sender',
      }

      setMessages(prevMessages => [...prevMessages, newMessage])
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={chatMainRef} className="flex-grow overflow-y-auto px-5 pt-10">
        <InitChat avatar={room?.avatar} onReady={handleInitReady} />
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            // 키 나중에 추가
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
                {/* 사용자 응답에 대한 교정 */}
                {msg.isSender && intimacyAnalysis && (
                  <CorrectionBubble
                    chatRoomId={chatroomId ?? ''}
                    correctedSentence={intimacyAnalysis.correctedSentence}
                    descriptionByTab={{
                      Kor: intimacyAnalysis.feedback.ko,
                      Eng: intimacyAnalysis.feedback.en,
                    }}
                    isSender={true}
                  />
                )}
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
      </div>

      <CoachMark show={showCoachMark} onClose={handleCloseCoachMark} />

      <footer className="shrink-0">
        <ChatFooter inputRef={inputRef} onSendMessage={handleSendMessage} />
      </footer>

      <ExitModal open={isModalOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  )
}

export default ChatPage

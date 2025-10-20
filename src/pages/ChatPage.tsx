import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Perfect from '../assets/chat/correct.svg'
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
import type {
  EventDataMap,
  IntimacyAnalysisData,
  VocabularyExtractedData,
} from '../types/sseEvents'
import { getUserById, sendMessage, updateUser } from '../api'
import CorrectionBubble from '../components/chat/CorrectionBubble'
import { useUserMsgStore } from '../stores/useUserMsgStore'
import { createBookmark } from '../api/archive'
import useClosenessStore from '../stores/useClosenessStore'
import { getClosenessAsText } from '../utils/conceptMap'

interface EnrichedMessage extends Message {
  correction?: IntimacyAnalysisData | null // 교정 데이터 저장
  vocabularyData?: VocabularyExtractedData | null // 어휘 데이터 저장
  isPerfect?: boolean // Perfect 여부 저장
}

const chatBotIdByRoom = (conceptValue: string): string => {
  switch (conceptValue) {
    case '1':
      return '22222222-2222-2222-2222-222222222221'
    case '2':
      return '22222222-2222-2222-2222-222222222222'
    case '3':
      return '22222222-2222-2222-2222-222222222223'
    case '4':
      return '22222222-2222-2222-2222-222222222224'
    default:
      return ''
  }
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const chatbotId = chatBotIdByRoom(id ?? '')
  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [messages, setMessages] = useState<EnrichedMessage[]>([]) // 확장
  const [isModalOpen, setIsModalOpen] = useState(false)
  const noShowAgain = useModalStore(state => state.noShowAgain)
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const coachTimerRef = useRef<number | null>(null)
  const userId = useUserStore(state => state.id)
  const roomsMap = useRoomIdStore(state => state.roomsMap)
  const chatroomId = id ? roomsMap[id] : undefined
  const closenessLevel = useClosenessStore.getState().getCloseness(chatroomId ?? '') ?? 1
  const closenessText = getClosenessAsText(closenessLevel)
  const accessToken = localStorage.getItem('accessToken') ?? ''

  const lastUserMsgIdRef = useRef<string | null>(null) // 마지막 사용자 메시지 ID
  const lastAiMsgIdRef = useRef<string | null>(null) // 마지막 AI 메시지 ID
  const [sseError, setSseError] = useState<string | null>(null)

  const room = useMemo(() => {
    return chatRooms.find(r => String(r.roomRouteId) === String(id))
  }, [id])

  // 코치 마크 조회 확인
  useEffect(() => {
    if (coachMarkSeen) return
    async function checkCoachMark() {
      try {
        const user = await getUserById(userId)
        if (user?.coachCheck === false) {
          setShowCoachMark(true)
        }
      } catch (e) {
        console.error('유저 정보 조회 실패', e)
      }
    }
    if (userId) {
      checkCoachMark()
    }
  }, [userId, coachMarkSeen])

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

      useUserMsgStore.getState().addUserMsg({
        id: response.id,
        content: response.content,
      }) // 서버에서 반환한 메시지 데이터 배열 스토어에 저장

      // 마지막 사용자 메시지 ID를 ref에 저장
      lastUserMsgIdRef.current = response.id

      // EnrichedMessage 타입으로 새 메시지 객체 생성
      const newMessage: EnrichedMessage = {
        id: response.id,
        text: response.content,
        isSender: true,
        variant: 'sender',
        // correction, vocabulary, isPerfect는 undefined로 시작
      }

      setMessages(prevMessages => [...prevMessages, newMessage])
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    }
  }

  // SSE 이벤트
  const handleSseEvent = useCallback(
    (eventType: string, data: unknown) => {
      // 이벤트 수신되면 에러 초기화
      setSseError(null)

      switch (eventType) {
        case 'conversation_complete': {
          const conversationData = data as EventDataMap['conversation_complete']
          lastAiMsgIdRef.current = conversationData.messageId

          const newAiMessage: EnrichedMessage = {
            id: conversationData.messageId,
            text: conversationData.content,
            isSender: false,
            avatarUrl: room?.avatar ?? '',
            variant: 'basic',
            showIcon: true,
          }

          setMessages(prev => [...prev, newAiMessage])
          break
        }
        case 'intimacy_analysis': {
          // 사용자 메시지 교정
          const intimacyData = data as IntimacyAnalysisData
          const targetMsgId = lastUserMsgIdRef.current // ref에서 마지막 사용자 ID 가져오기
          if (!targetMsgId) break
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === targetMsgId) {
                // correctedSentence가 존재하고, corrections 필드에도 내용이 있을 때만 교정 버블 표시
                if (intimacyData && intimacyData.correctedSentence && intimacyData.corrections) {
                  return { ...msg, correction: intimacyData, isPerfect: false }
                } else {
                  // 교정할 내용이 없거나(correctedSentence가 없거나),
                  // 교정 내용(corrections)이 비어있으면 'isPerfect'를 true로 설정
                  return { ...msg, correction: null, isPerfect: true }
                }
              }
              return msg
            })
          )

          // 한 번 사용한 ref는 비워줘서 다음 교정이 엉뚱한 메시지에 붙는 것을 방지
          lastUserMsgIdRef.current = null
          break
        }
        case 'vocabulary_extracted': {
          //ai 답장에 대한 설명
          const vocabData = data as VocabularyExtractedData
          const targetMsgId = lastAiMsgIdRef.current // ref에서 마지막 AI ID 가져오기

          if (!targetMsgId) break // 대상 ID가 없으면 중단

          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === targetMsgId) {
                return { ...msg, vocabularyData: vocabData }
              }
              return msg
            })
          )
          lastAiMsgIdRef.current = null
          break
        }
        // case 'aggregated_complete':
        // setAggregatedData(data)
        // break
        default: // 예상 못한 이벤트 처리
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
    [room]
  )

  // useChatStream 호출
  useChatStream<EventDataMap>(chatroomId ?? '', userId, accessToken, handleSseEvent, e => {
    console.error('SSE Error', e)
    setSseError('SSE 연결 중 오류가 발생했습니다.')
  })

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

  // 코치 마크 오픈 시간
  const handleInitReady = () => {
    if (coachMarkSeen || coachTimerRef.current) return
    coachTimerRef.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setShowCoachMark(true)
        coachTimerRef.current = null
      })
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (coachTimerRef.current) {
        window.clearTimeout(coachTimerRef.current)
      }
    }
  }, [])

  const handleCloseCoachMark = async () => {
    setShowCoachMark(false)
    try {
      await updateUser(userId, { coachCheck: true })
      setCoachMarkSeen(true)
    } catch (e) {
      console.error('coachCheck 업데이트 실패', e)
    }
  }

  /* --------------------- 북마크 함수 관련 --------------------- */
  async function handleAddBookmark(
    messageId: string,
    options: { content: string; correctedContent?: string }
  ) {
    try {
      const requestBody = {
        messageId,
        chatroomId: chatroomId ?? '',
        chatbotId: chatbotId,
        content: options.content,
        correctedContent: options.correctedContent,
        aiResponse: {
          intimacyLevel: closenessText,
        },
      }

      const response = await createBookmark(requestBody)
      console.log('북마크 추가 성공', response)
    } catch (error) {
      console.error('북마크 추가 실패', error)
    }
  }

  const handleChatBubbleBookmark = (messageId: string, content: string) => {
    handleAddBookmark(
      messageId, // conversationData.messageId
      { content } // msg.text
    )
  }

  const handleCorrectionBubbleBookmark = (
    messageId: string,
    content: string,
    correctedContent: string
  ) => {
    handleAddBookmark(messageId, { content, correctedContent })
  }

  /* --------------------- 북마크 함수 관련 --------------------- */

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={chatMainRef} className="flex-grow overflow-y-auto px-5 pt-10">
        <InitChat avatar={room?.avatar} onReady={handleInitReady} />
        <div className="space-y-4">
          {messages.map(msg => {
            return (
              <div key={msg.id} className="mb-0">
                <div className="mt-5">
                  <ChatBubble
                    message={msg.text}
                    isSender={msg.isSender}
                    avatarUrl={msg.avatarUrl}
                    variant={msg.variant ?? 'basic'}
                    showIcon={msg.showIcon}
                    messageId={msg.id}
                    onBookmarkToggle={handleChatBubbleBookmark}
                  />
                </div>
                {/* 사용자 응답에 대한 교정 */}
                {
                  msg.isSender &&
                    (msg.correction && msg.correction.correctedSentence ? (
                      <CorrectionBubble
                        chatRoomId={chatroomId ?? ''}
                        messageId={msg.id} // msg.id 사용 (correction.messageId 아님)
                        originalContent={msg.text}
                        correctedContent={msg.correction.correctedSentence}
                        descriptionByTab={{
                          Kor: msg.correction.feedback.ko,
                          Eng: msg.correction.feedback.en,
                        }}
                        isSender={true}
                        onBookmarkToggle={handleCorrectionBubbleBookmark}
                      />
                    ) : msg.isPerfect ? ( // msg.isPerfect가 true일 때
                      <div className="flex flex-row justify-end text-[#54BDB4] text-[12px] mt-1 font-medium">
                        <img src={Perfect} alt="perfect" />
                        perfect
                      </div>
                    ) : null) // (교정 데이터가 아직 안 왔으면 null)
                }

                {!msg.isSender &&
                  msg.vocabularyData &&
                  msg.vocabularyData.words &&
                  msg.vocabularyData.words.map((vocabWord, idx) => (
                    <DescriptionBubble
                      key={idx}
                      word={vocabWord.word}
                      pronunciation={vocabWord.context.roma}
                      descriptionByTab={{
                        Kor: vocabWord.context.ko,
                        Eng: vocabWord.context.en,
                      }}
                      initialTab="Kor"
                    />
                  ))}
              </div>
            )
          })}
          <div className="mt-5">
            {sseError && (
              <ChatBubble
                message={'Failed to load AI response'}
                isSender={false}
                variant={'error'}
                showIcon={false}
              />
            )}
          </div>
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

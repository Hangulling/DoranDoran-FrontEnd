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
  GreetingBotMessageData,
  GreetingGuideMessageData,
  IntimacyAnalysisData,
  VocabularyExtractedData,
} from '../types/sseEvents'
import { getMessages, getUserById, leaveChatroom, sendMessage, updateUser } from '../api'
import CorrectionBubble from '../components/chat/CorrectionBubble'
import { useUserMsgStore } from '../stores/useUserMsgStore'
import { createBookmark, deleteBookmark, getBookmarksByRoomId } from '../api/archive'
import useClosenessStore from '../stores/useClosenessStore'
import { getClosenessAsText } from '../utils/conceptMap'
import LoadingSpinner from '../components/common/LoadingSpinner'
import showToast from '../components/common/CommonToast'

interface EnrichedMessage extends Message {
  correction?: IntimacyAnalysisData | null // 교정 데이터 저장
  vocabularyData?: VocabularyExtractedData | null // 어휘 데이터 저장
  isPerfect?: boolean // Perfect 여부 저장
  analysisState?: 'pending' | 'complete' // 교정 데이터 로딩
  bookmarkId?: string | null
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
  const [messages, setMessages] = useState<EnrichedMessage[]>([]) // 확장
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isInitChatReady, setIsInitChatReady] = useState(false)
  const [isNewChat, setIsNewChat] = useState<boolean | null>(null)
  const [greetingState, setGreetingState] = useState<'pending' | 'loading' | 'complete'>('pending')
  const [greetingMsg1, setGreetingMsg1] = useState<string | null>(null)
  const [greetingMsg2, setGreetingMsg2] = useState<string | null>(null)
  const coachMarkSeen = useCoachStore(s => s.coachMarkSeen)
  const setCoachMarkSeen = useCoachStore(s => s.setCoachMarkSeen)
  const [showCoachMark, setShowCoachMark] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const noShowAgain = useModalStore(state => state.noShowAgain)
  const setNoShowAgain = useModalStore(state => state.setNoShowAgain)
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const coachTimerRef = useRef<number | null>(null)
  const userId = useUserStore(state => state.id)
  const roomsMap = useRoomIdStore(state => state.roomsMap)
  const chatroomId = id ? roomsMap[id] : undefined
  const closenessLevel = useClosenessStore.getState().getCloseness(id ?? '') ?? 1
  const closenessText = getClosenessAsText(closenessLevel)
  const accessToken = localStorage.getItem('accessToken') ?? ''
  const [sseError, setSseError] = useState<string | null>(null)
  const hasLeftRef = useRef(false)

  const lastUserMsgIdRef = useRef<string | null>(null) // 마지막 사용자 메시지 ID
  const lastAiMsgIdRef = useRef<string | null>(null) // 마지막 AI 메시지 ID

  const room = useMemo(() => {
    return chatRooms.find(r => String(r.roomRouteId) === String(id))
  }, [id])

  // 채팅방 진입 시(새로고침 포함) 이전 대화 기록을 불러오는 useEffect
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatroomId || !userId) {
        setIsHistoryLoading(false)
        return
      }
      try {
        const [messagesResponse, bookmarksResponse] = await Promise.all([
          getMessages(chatroomId, { userId }),
          getBookmarksByRoomId(chatroomId),
        ])

        const historyMessages = messagesResponse.content

        // 북마크 데이터 조회
        const bookmarkMap = new Map<string, string>()
        if (Array.isArray(bookmarksResponse)) {
          bookmarksResponse.forEach(bookmark => {
            if (bookmark.messageId && bookmark.id) {
              bookmarkMap.set(bookmark.messageId, bookmark.id)
            }
          })
        }

        const botGreeting =
          historyMessages.length > 0 &&
          historyMessages[0].senderType === 'bot' &&
          historyMessages[0].metadata === null
            ? historyMessages[0]
            : null

        const guideGreeting = historyMessages.find(msg => msg.senderType === 'system') ?? null

        // 실제 대화내역 필터링
        const conversationMessages = historyMessages.filter(
          msg => msg.id !== botGreeting?.id && msg.id !== guideGreeting?.id
        )

        const enrichedHistory: EnrichedMessage[] = []
        for (let i = 0; i < conversationMessages.length; i++) {
          const apiMsg = conversationMessages[i]

          const baseMessage: EnrichedMessage = {
            id: apiMsg.id,
            text: apiMsg.content,
            isSender: apiMsg.senderType === 'user',
            avatarUrl: apiMsg.senderType !== 'user' ? room?.avatar : undefined,
            variant: apiMsg.senderType === 'user' ? 'sender' : 'basic',
            showIcon: apiMsg.senderType !== 'user',
            bookmarkId: bookmarkMap.get(apiMsg.id) || null,
            analysisState: 'complete', // 히스토리는 항상 'complete'
          }

          // 유저 메시지 + metadata가 있으면 교정 정보(correction) 파싱
          if (apiMsg.senderType === 'user') {
            // 사용자 메시지: 다음 봇 메시지에서 'userMessageAnalysis'를 찾아야 함
            const nextMsg = conversationMessages[i + 1]
            let foundAnalysis = false

            if (
              nextMsg &&
              nextMsg.senderType === 'bot' &&
              nextMsg.metadata?.userMessageAnalysis?.userMessageId === apiMsg.id
            ) {
              const intimacy = nextMsg.metadata.userMessageAnalysis.intimacy
              if (
                intimacy &&
                intimacy.correctedSentence &&
                (intimacy.corrections || intimacy.feedback?.ko)
              ) {
                // 교정 데이터가 있음
                baseMessage.correction = {
                  messageId: nextMsg.metadata.userMessageAnalysis.userMessageId,
                  corrections: intimacy.corrections,
                  feedback: intimacy.feedback,
                  correctedSentence: intimacy.correctedSentence,
                  detectedLevel: intimacy.detectedLevel,
                }
                baseMessage.isPerfect = false
                foundAnalysis = true
              } else if (intimacy) {
                // 교정 데이터는 있으나 교정 문장이 없음 (Perfect)
                baseMessage.correction = null
                baseMessage.isPerfect = true
                foundAnalysis = true
              }
            }

            if (!foundAnalysis) {
              // 짝이 되는 봇 메시지가 없거나, 분석이 없는 경우
              baseMessage.correction = null
              baseMessage.isPerfect = false // 또는 true, 정책에 따라 다름
            }
          } else if (apiMsg.senderType === 'bot') {
            // 봇 메시지: 이 메시지의 metadata에서 'botResponseAnalysis'를 찾음
            if (apiMsg.metadata?.botResponseAnalysis?.vocabulary) {
              baseMessage.vocabularyData = apiMsg.metadata.botResponseAnalysis.vocabulary
            }
          }

          enrichedHistory.push(baseMessage)
        }

        // 'enrichedHistory' (필터링된) 기준으로 분기 처리
        if (enrichedHistory.length === 0 && !botGreeting) {
          // Case 1: 정말 새로운 채팅 (히스토리 0개)
          setIsNewChat(true)
          setGreetingState('loading') // SSE 로딩 시작
        } else {
          // Case 2: 새로고침 (대화내역이 있거나, 그리팅 메시지만 있음)
          setIsNewChat(false)
          // 추출한 그리팅 메시지를 state에 저장
          if (botGreeting) {
            setGreetingMsg1(botGreeting.content)
            setGreetingMsg2(guideGreeting?.content ?? null) // 가이드는 없을 수 있음
            setGreetingState('complete') // 즉시 '완료'
          } else {
            // 대화내역은 있는데 그리팅이 없는 예외 상황
            setGreetingState('complete')
          }
        }

        // 불러온 기록(그리팅 제외)으로 messages 상태를 초기화
        setMessages(enrichedHistory)
      } catch (error) {
        navigate('/error', { state: { from: `/chat/${id}` } })
        console.error('Failed to fetch chat history:', error)
      } finally {
        setIsHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [chatroomId, userId, room?.avatar, id, navigate]) // chatroomId, userId가 확정되면 한 번만 실행

  // 봇/가이드 메시지 도착
  useEffect(() => {
    // 봇 메시지와 가이드 메시지가 모두 도착하면 'complete'
    if (greetingMsg1 && greetingMsg2) {
      setGreetingState('complete')
      return
    }

    // 봇 메시지만 오고 가이드 메시지가 2초간 안와도 'complete' (SSE 또는 새로고침)
    let timer: NodeJS.Timeout | null = null
    if (greetingMsg1 && !greetingMsg2) {
      // 즉시 완료되는 경우(새로고침)가 있으므로 타이머는 SSE 로딩 중에만
      if (greetingState === 'loading') {
        timer = setTimeout(() => {
          console.warn('[SSE] Greeting guide message timeout. Rendering with bot message only.')
          setGreetingState('complete') // 봇 메시지만이라도 렌더링
        }, 2000)
      } else if (greetingState !== 'pending') {
        // (새로고침 시) 봇 메시지만 있고 가이드가 없는 경우 즉시 완료
        setGreetingState('complete')
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [greetingMsg1, greetingMsg2, greetingState])

  // 코치 마크 조회 확인
  useEffect(() => {
    if (coachMarkSeen) return
    if (!isInitChatReady) return
    if (coachTimerRef.current) return // 타이머 이미 실행 중이면 중복 방지

    async function checkCoachMark() {
      try {
        const user = await getUserById(userId)
        if (user?.coachCheck === false) {
          coachTimerRef.current = window.setTimeout(() => {
            // 타이머 시작
            requestAnimationFrame(() => {
              setShowCoachMark(true)
              coachTimerRef.current = null
            })
          }, 600)
        }
      } catch (e) {
        console.error('유저 정보 조회 실패', e)
      }
    }
    if (userId) {
      checkCoachMark()
    }
  }, [userId, coachMarkSeen, isInitChatReady])

  const handleCloseCoachMark = async () => {
    setShowCoachMark(false)
    try {
      await updateUser(userId, { coachCheck: true })
      setCoachMarkSeen(true)
    } catch (e) {
      console.error('coachCheck 업데이트 실패', e)
    }
  }

  // 다시 보지 않기 설정을 스토어에 동기화
  useEffect(() => {
    const fetchUserExitSetting = async () => {
      if (!userId) return

      try {
        const user = await getUserById(userId)
        if (user && user.exitModalDoNotShowAgain === true) {
          setNoShowAgain(true)
        }
      } catch (error) {
        console.error('Failed to fetch user exit modal setting:', error)
      }
    }

    fetchUserExitSetting()
  }, [userId, setNoShowAgain])

  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      if (noShowAgain) {
        const storageKey = `initChat_${id}`
        sessionStorage.removeItem(storageKey)

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
  }, [navigate, noShowAgain, id])

  // 메시지 전송
  const handleSendMessage = async (text: string) => {
    if (!chatroomId) {
      console.error('채팅방 ID가 없습니다.')
      return
    }
    try {
      const response = await sendMessage(chatroomId, {
        senderType: 'user',
        content: text,
        contentType: 'text',
      })

      useUserMsgStore.getState().addUserMsg({
        id: response.id,
        content: response.content,
      }) // 서버에서 반환한 메시지 데이터 배열 스토어에 저장

      lastUserMsgIdRef.current = response.id // 마지막 사용자 메시지 ID를 ref에 저장
      const newMessage: EnrichedMessage = {
        id: response.id,
        text: response.content,
        isSender: true,
        variant: 'sender',
        analysisState: 'pending', // 명시적
      }
      setMessages(prevMessages => [...prevMessages, newMessage])
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    }
  }

  // SSE 이벤트
  const handleSseEvent = useCallback(
    (eventType: string, data: unknown) => {
      setSseError(null) // 이벤트 수신되면 에러 초기화

      switch (eventType) {
        case 'greeting_bot_message': {
          if (!isNewChat) break
          setGreetingMsg1((data as GreetingBotMessageData).content)
          setGreetingState('loading')
          break
        }
        case 'greeting_guide_message': {
          if (!isNewChat) break
          setGreetingMsg2((data as GreetingGuideMessageData).content)
          break
        }
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
          const intimacyData = data as IntimacyAnalysisData
          const targetMsgId = lastUserMsgIdRef.current // ref에서 마지막 사용자 ID 가져오기
          if (!targetMsgId) break
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === targetMsgId) {
                // 교정 버블 표시 조건
                if (intimacyData && intimacyData.correctedSentence && intimacyData.corrections) {
                  return {
                    ...msg,
                    correction: intimacyData,
                    isPerfect: false,
                    analysisState: 'complete',
                  }
                } else {
                  // 교정할 내용이 없음
                  return { ...msg, correction: null, isPerfect: true, analysisState: 'complete' } // <--- 'analysisState' 추가
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
          const vocabData = data as VocabularyExtractedData
          const targetMsgId = lastAiMsgIdRef.current
          if (!targetMsgId) break
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
        default: // 예상 못한 이벤트 처리
          console.warn(`[SSE] Unhandled event type: ${eventType}`, data)
          break
      }
    },
    [room, isNewChat]
  )

  // useChatStream 호출
  useChatStream<EventDataMap>(chatroomId ?? '', userId, accessToken, handleSseEvent, e => {
    console.error('SSE Error', e)
    setSseError('SSE 연결 중 오류가 발생했습니다.')
  })

  // 채팅방 나가기
  const handleConfirm = async () => {
    if (!chatroomId) {
      console.error('채팅방 ID가 없어 나갈 수 없습니다.')
      setIsModalOpen(false)
      return
    }

    if (hasLeftRef.current) return // 중복 방지
    hasLeftRef.current = true

    const noShowAgain = useModalStore.getState().noShowAgain

    if (noShowAgain) {
      try {
        await updateUser(userId, { exitModalDoNotShowAgain: true })
        console.log('사용자 "다시 보지 않기" 설정 저장 성공')
      } catch (e) {
        console.error('사용자 설정 업데이트 실패:', e)
      }
    }

    try {
      await leaveChatroom(chatroomId, userId)
      console.log('채팅방 나가기 성공')
      setMessages([]) // 로컬 메시지 상태 초기화
      useUserMsgStore.getState().clearUserMsgs()

      const storageKey = `initChat_${id}`
      sessionStorage.removeItem(storageKey) // InitChat 초기화

      setIsModalOpen(false)
      navigate('/', { replace: true })
    } catch (error) {
      console.error('채팅방 나가기 실패:', error)
      hasLeftRef.current = false
      setIsModalOpen(false)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // 나가기 처리
  useEffect(() => {
    // 뒤로가기(popstate)
    const handlePopState = async () => {
      if (hasLeftRef.current) return

      if (noShowAgain) {
        // 다시 보지 않기 상태
        hasLeftRef.current = true
        sessionStorage.removeItem(`initChat_${id}`)
        if (chatroomId && userId) {
          try {
            await leaveChatroom(chatroomId, userId)
            console.log('채팅방 나가기 성공 (noShowAgain)')
          } catch (e) {
            console.error('Failed to leave chatroom (noShowAgain):', e)
          }
        }
        navigate('/')
      } else {
        setIsModalOpen(true)
        window.history.pushState(null, '', window.location.href)
      }
    }
    window.addEventListener('popstate', handlePopState)

    // 새로고침 / 탭 닫기 (beforeunload)
    const handleUnload = () => {
      if (hasLeftRef.current) return

      // 새로고침인지 확인
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming
        if (navEntry.type === 'reload') {
          console.log('[ChatPage] Refresh detected. NOT leaving chatroom.')
          return
        }
      }

      // 탭 닫기
      console.log('[ChatPage] beforeunload (Tab Close / Multi-Back). Leaving chatroom.')

      if (chatroomId && userId) {
        leaveChatroom(chatroomId, userId)
      }
    }
    window.addEventListener('beforeunload', handleUnload)

    // 클린업 함수
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [chatroomId, userId, navigate, noShowAgain, id])

  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

  // 타이머 클린업
  useEffect(() => {
    return () => {
      if (coachTimerRef.current) {
        window.clearTimeout(coachTimerRef.current)
      }
    }
  }, [])

  /* --------------------- 북마크 함수 관련 --------------------- */

  async function handleAddBookmark(
    messageId: string,
    options: {
      content: string
      correctedContent?: string
      feedbackKo?: string
      feedbackEn?: string
      vocabularyData?: VocabularyExtractedData | null
    }
  ): Promise<string | null> {
    try {
      // aiResponse 객체를 동적으로 구성
      const aiResponse: {
        intimacyLevel: string
        description?: string
        translation?: { english: string }
        vocabulary?: {
          word: string
          pronunciation: string
          explanation: string
          korExplanation: string
        }[]
      } = {
        intimacyLevel: closenessText,
      }

      if (options.feedbackKo) {
        aiResponse.description = options.feedbackKo
      }
      if (options.feedbackEn) {
        aiResponse.translation = { english: options.feedbackEn }
      }
      if (options.vocabularyData && options.vocabularyData.words) {
        aiResponse.vocabulary = options.vocabularyData.words.map(vocabWord => ({
          word: vocabWord.word,
          pronunciation: vocabWord.context.roma,
          explanation: vocabWord.context.en, // 'explanation'을 'context.en'으로 매핑
          korExplanation: vocabWord.context.ko,
        }))
      }
      const requestBody = {
        messageId,
        chatroomId: chatroomId ?? '',
        chatbotId: chatbotId,
        content: options.content,
        correctedContent: options.correctedContent,
        aiResponse: aiResponse,
      }
      const response = await createBookmark(requestBody)
      console.log('북마크 추가 성공', response)

      return response.id
    } catch (error) {
      showToast({ message: 'Failed to save', iconType: 'error' })
      console.error('북마크 추가 실패', error)

      return null
    }
  }
  // 토글 핸들러
  const handleChatBubbleBookmark = async (
    messageId: string,
    content: string,
    vocabularyData: VocabularyExtractedData | null | undefined
  ) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    if (message.bookmarkId) {
      // 북마크 상태
      try {
        await deleteBookmark(message.bookmarkId)
        setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, bookmarkId: null } : m)))
        console.log('북마크 성공')
      } catch (error) {
        console.error('북마크 삭제 실패', error)
      }
    } else {
      // 북마크 안됨
      const newBookmarkId = await handleAddBookmark(messageId, { content, vocabularyData })
      if (newBookmarkId) {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, bookmarkId: newBookmarkId } : m))
        )
      }
    }
  }

  const handleCorrectionBubbleBookmark = async (
    messageId: string,
    content: string,
    correctedContent: string,
    feedbackKo: string,
    feedbackEn: string
  ) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    if (message.bookmarkId) {
      try {
        await deleteBookmark(message.bookmarkId)
        setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, bookmarkId: null } : m)))
      } catch (error) {
        console.error('북마크 삭제 실패', error)
      }
    } else {
      const newBookmarkId = await handleAddBookmark(messageId, {
        content,
        correctedContent,
        feedbackKo,
        feedbackEn,
      })
      if (newBookmarkId) {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, bookmarkId: newBookmarkId } : m))
        )
      }
    }
  }

  /* --------------------- 북마크 함수 관련 --------------------- */

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div ref={chatMainRef} className="flex-grow overflow-y-auto px-5 pt-10">
        {isHistoryLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {greetingState === 'complete' && greetingMsg1 && (
              <InitChat
                avatar={room?.avatar}
                onReady={() => setIsInitChatReady(true)}
                message1={greetingMsg1} // 봇 메시지 전달
                message2={greetingMsg2 ?? ''} // 가이드 메시지 전달 (없으면 빈칸)
                skipAnimation={isNewChat === false} // 애니메이션 스킵 여부
              />
            )}

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
                        isBookmarked={!!msg.bookmarkId}
                        onBookmarkToggle={(messageId, content) =>
                          handleChatBubbleBookmark(messageId, content, msg.vocabularyData)
                        }
                      />
                    </div>
                    {msg.isSender &&
                      (msg.analysisState === 'pending' ? (
                        // PENDING
                        <CorrectionBubble
                          chatRoomId={chatroomId ?? ''}
                          messageId={msg.id}
                          originalContent={msg.text}
                          isSender={true}
                          isLoading={true} // 스켈레톤
                        />
                      ) : msg.isPerfect ? (
                        // COMPLETE + PERFECT
                        <div className="flex flex-row justify-end text-[#54BDB4] text-[12px] mt-1 font-medium">
                          <img src={Perfect} alt="perfect" />
                          perfect
                        </div>
                      ) : msg.correction && msg.correction.correctedSentence ? (
                        // COMPLETE + CORRECTION
                        <CorrectionBubble
                          chatRoomId={chatroomId ?? ''}
                          messageId={msg.id}
                          originalContent={msg.text}
                          correctedContent={msg.correction.correctedSentence}
                          descriptionByTab={{
                            Kor: msg.correction.feedback.ko,
                            Eng: msg.correction.feedback.en,
                          }}
                          isSender={true}
                          isLoading={false} // 스켈레톤 모드 비활성화 (명시적)
                          isBookmarked={!!msg.bookmarkId}
                          onBookmarkToggle={(messageId, content, correctedContent) =>
                            handleCorrectionBubbleBookmark(
                              messageId,
                              content,
                              correctedContent,
                              msg.correction!.feedback.ko,
                              msg.correction!.feedback.en
                            )
                          }
                        />
                      ) : null)}
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
                          initialTab="Eng"
                        />
                      ))}
                  </div>
                )
              })}
              <div className="mt-5">
                {sseError && (
                  <ChatBubble
                    avatarUrl={room?.avatar}
                    message={'Failed to load AI response'}
                    isSender={false}
                    variant={'error'}
                    showIcon={false}
                  />
                )}
              </div>
            </div>
            <div className="h-4" />
          </>
        )}
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

import { useEffect, useMemo, useRef, useState } from 'react'
import ChatFooter from '../components/chat/ChatFooter'
import type { Message } from '../types/chat'
import { useModalStore } from '../stores/useUiStateStore'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { MAIN_DATA, MANAGER_ROOM } from '../constants/mainData'
import ExitModal from '../components/chat/ExitModal'
import { useUserStore } from '../stores/useUserStore'
import useRoomIdStore from '../stores/useRoomIdStore'
import type {
  IntimacyAnalysisData,
  VocabularyExtractedData,
} from '../types/sseEvents'
import { getUserById } from '../api'
import useClosenessStore from '../stores/useClosenessStore'
import { getClosenessAsText } from '../utils/conceptMap'
import ReactGA from 'react-ga4'
import { GA_ENABLED, IS_PROD } from '../constants/env'
import { useBookmarkManager } from '../hooks/chat/useBookmarkManager'
import { useChatExit } from '../hooks/chat/useChatExit'
import { useInactivityTimer } from '../hooks/chat/useInactivityTimer'
import { useChatHistory } from '../hooks/chat/useChatHistory'
import ChatBody from '../components/chat/ChatBody'
import { useChatInteraction } from '../hooks/chat/useChatInteraction'
import ChatHeader from '../components/chat/ChatHeader'
import BottomSheet from '../components/common/BottomSheet'
import ToggleSwitch from '../components/common/ToggleSwitch'
import Button from '../components/common/Button'
import { useChatSettingStore } from '../stores/useChatSetting'
import ReportSheet from '../components/chat/ReportSheet'
import { createSupport } from '../api/support'
import showToast from '../components/common/CommonToast'

const INACTIVITY_DURATION_MS = 300000

export interface EnrichedMessage extends Message {
  correction?: IntimacyAnalysisData | null // 교정 데이터 저장
  vocabularyData?: VocabularyExtractedData | null // 어휘 데이터 저장
  isPerfect?: boolean // Perfect 여부 저장
  analysisState?: 'pending' | 'complete' // 교정 데이터 로딩
  bookmarkId?: string | null
  isSendFailed?: boolean
  isCancelled?: boolean
  targetUserMsgId?: string | null
  isReported?: boolean
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
  const location = useLocation()
  const setNoShowAgain = useModalStore(state => state.setNoShowAgain)
  const [messages, setMessages] = useState<EnrichedMessage[]>([]) // 확장
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isInitChatReady, setIsInitChatReady] = useState(false)
  const [isNewChat, setIsNewChat] = useState<boolean | null>(null)
  const [greetingState, setGreetingState] = useState<
    'pending' | 'loading' | 'complete'
  >('pending')
  const [greetingMsg1, setGreetingMsg1] = useState<string | null>(null)
  const [greetingMsg2, setGreetingMsg2] = useState<string | null>(null)
  const [isSettingOpen, setIsSettingOpen] = useState(false) // 세팅 오픈
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportTargetId, setReportTargetId] = useState<string | null>(null)
  const chatMainRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const userId = useUserStore(state => state.id)
  const roomsMap = useRoomIdStore(state => state.roomsMap)
  const {
    isVocabularyEnabled,
    setVocabularyEnabled,
    isCorrectionEnabled,
    setCorrectionEnabled,
    isTranslationEnabled,
    setTranslationEnabled,
  } = useChatSettingStore()
  const [tempVocabulary, setTempVocabulary] = useState(isVocabularyEnabled)
  const [tempCorrection, setTempCorrection] = useState(isCorrectionEnabled)
  const [tempTranslation, setTempTranslation] = useState(isTranslationEnabled)
  const chatroomId = id
  const accessToken = sessionStorage.getItem('accessToken') ?? ''

  const routeId = useMemo(() => {
    if (location.state?.roomRouteId) {
      return String(location.state.roomRouteId)
    }
    const foundId = Object.keys(roomsMap).find(key => roomsMap[key] === id)
    return foundId
  }, [id, location.state, roomsMap])

  const chatbotId = chatBotIdByRoom(routeId ?? '')
  const closenessLevel =
    useClosenessStore.getState().getCloseness(routeId ?? '') ?? 1
  const closenessText = getClosenessAsText(closenessLevel)
  const isManagerRoom = String(routeId) === String(MANAGER_ROOM.roomRouteId)

  const room = useMemo(() => {
    if (isManagerRoom) return MANAGER_ROOM
    return MAIN_DATA.find(r => String(r.roomRouteId) === String(routeId))
  }, [routeId, isManagerRoom])

  // 세팅 열기
  const openSettings = () => {
    setTempVocabulary(isVocabularyEnabled)
    setTempCorrection(isCorrectionEnabled)
    setTempTranslation(isTranslationEnabled)
    setIsSettingOpen(true)
  }

  // 세팅 저장 버튼
  const handleSaveSettings = () => {
    setVocabularyEnabled(tempVocabulary)
    setCorrectionEnabled(tempCorrection)
    setTranslationEnabled(tempTranslation)
    setIsSettingOpen(false)
    console.log('설정 저장 완료:', {
      vocabulary: tempVocabulary,
      correction: tempCorrection,
      translation: tempTranslation,
    })
  }

  // 북마크
  const { handleChatBubbleBookmark, handleCorrectionBubbleBookmark } =
    useBookmarkManager({
      chatroomId,
      chatbotId,
      closenessText,
      messages,
      setMessages,
    })

  const handleOpenReport = (messageId: string) => {
    setReportTargetId(messageId)
    setIsReportOpen(true)
  }

  const handleCloseReport = () => {
    setIsReportOpen(false)
    setReportTargetId(null)
  }

  // 신고 접수
  const handleReportSubmit = async (messageId: string, reason: string) => {
    try {
      const targetMessage = messages.find(m => m.id === messageId)
      const messageContent = targetMessage?.text || ''

      await createSupport(
        {
          type: 'REPORT',
          category: reason,
          content: reason,
          chatroomId,
          messageId,
          messageContent,
        },
        {
          userId, // 헤더에 들어갈 User ID
        }
      )
      showToast({
        message: 'Thanks for letting us know!',
        iconType: 'checkRound',
      })
      console.log('신고 완료 처리:', messageId, reason)

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isReported: true } : msg
        )
      )
    } catch (error) {
      console.error('신고 요청 실패:', error)
    } finally {
      handleCloseReport()
    }
  }

  const { isModalOpen, handleConfirmExit, handleCancelExit, handleGoBack } =
    useChatExit({
      chatroomId,
      userId,
      routeId: routeId,
      enableGuard: !isManagerRoom,
    })

  const { inactivityError, resetInactivityTimer, stopInactivityTimer } =
    useInactivityTimer(INACTIVITY_DURATION_MS)

  useChatHistory({
    chatroomId,
    userId,
    roomAvatar: room?.avatar,
    id: routeId,
    navigate,
    setMessages,
    setIsHistoryLoading,
    setIsNewChat,
    setGreetingState,
    setGreetingMsg1,
    setGreetingMsg2,
  })

  // 채팅 기능
  const {
    isAiResponding,
    sseError,
    sendError,
    handleSendMessage,
    handleRetry,
    handleCancel,
    handleResend,
  } = useChatInteraction({
    chatroomId,
    userId,
    accessToken,
    roomAvatar: room?.avatar,
    isNewChat,
    setMessages,
    resetInactivityTimer,
    stopInactivityTimer,
    setGreetingMsg1,
    setGreetingMsg2,
    setGreetingState,
  })

  // 재전송
  const handleRetryUserMessage = (msgId: string, content: string) => {
    // 기존 실패 메시지 삭제
    setMessages(prev => prev.filter(m => m.id !== msgId))
    handleSendMessage(content)
  }

  // 봇/가이드 메시지 도착
  useEffect(() => {
    const checkCompletion = (botMsg: string, guideMsg: string | null) => {
      // 'loading' 상태는 isNewChat == true일 때만 설정됨
      if (greetingState !== 'loading') return // 중복 실행 방지

      if (IS_PROD && GA_ENABLED && chatroomId) {
        ReactGA.event('send_greeting_message', {
          chatroom_id: chatroomId,
          bot_message: botMsg,
          guide_message: guideMsg ?? '',
        })
      }
      setGreetingState('complete')
    }

    // 봇 메시지와 가이드 메시지가 모두 도착하면 'complete'
    if (greetingMsg1 && greetingMsg2) {
      checkCompletion(greetingMsg1, greetingMsg2)
      setGreetingState('complete')
      return
    }
    // InitChat 렌더링 시작
    if (greetingMsg1 && greetingState === 'loading') {
      setGreetingState('complete')
      return
    }
    // (새로고침 시) 봇 메시지만 있고 가이드가 없는 경우 즉시 완료
    if (
      greetingMsg1 &&
      !greetingMsg2 &&
      greetingState !== 'pending' &&
      greetingState !== 'loading'
    ) {
      setGreetingState('complete')
    }
  }, [userId, greetingMsg1, greetingMsg2, greetingState, chatroomId])

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
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-gray-0 pt-[env(safe-area-inset-top)]">
      <ChatHeader
        title={room?.roomName || 'Chat'}
        avatar={room?.avatar}
        closenessLevel={closenessLevel}
        onBack={handleGoBack}
        onSettingClick={openSettings}
      />

      <div
        ref={chatMainRef}
        className="flex-1 w-full bg-gray-10 relative pb-[80px]"
      >
        <div className="px-5 pt-6 pb-4">
          <ChatBody
            isHistoryLoading={isHistoryLoading}
            greetingState={greetingState}
            roomAvatar={room?.avatar}
            onInitReady={() => setIsInitChatReady(true)}
            greetingMsg1={greetingMsg1}
            greetingMsg2={greetingMsg2}
            isNewChat={isNewChat}
            messages={messages}
            isAiResponding={isAiResponding}
            sseError={sseError}
            sendError={sendError}
            onRetry={handleRetry}
            inactivityError={inactivityError}
            chatroomId={chatroomId}
            isVocabularyEnabled={isVocabularyEnabled}
            isCorrectionEnabled={isCorrectionEnabled}
            isTranslationEnabled={isTranslationEnabled}
            onChatBubbleBookmark={handleChatBubbleBookmark}
            onCorrectionBubbleBookmark={handleCorrectionBubbleBookmark}
            onReport={handleOpenReport}
            onResend={handleResend}
            onRetryUserMessage={handleRetryUserMessage}
          />
        </div>
      </div>

      {!isManagerRoom && (
        <ChatFooter
          inputRef={inputRef}
          onSendMessage={handleSendMessage}
          disabled={isHistoryLoading || !isInitChatReady || isAiResponding}
          isAiResponding={isAiResponding}
          onCancel={handleCancel}
        />
      )}

      <ExitModal
        open={isModalOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      <ReportSheet
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        messageId={reportTargetId}
        onReport={handleReportSubmit}
      />

      {!isManagerRoom && (
        <BottomSheet
          isOpen={isSettingOpen}
          onClose={() => setIsSettingOpen(false)}
          title="Auto-open messages"
          description="Turn this on to view messages instantly."
        >
          <div className="flex flex-col gap-[20px] mt-[14px] mb-[30px]">
            <div className="flex justify-between items-center">
              <span className="text-[16px]">Vocabulary</span>
              <ToggleSwitch
                checked={tempVocabulary}
                onClick={() => setTempVocabulary(!tempVocabulary)}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[16px]">Tone Adjustment</span>
              <ToggleSwitch
                checked={tempCorrection}
                onClick={() => setTempCorrection(!tempCorrection)}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[16px]">Korean Explanation</span>
              <ToggleSwitch
                checked={tempTranslation}
                onClick={() => setTempTranslation(!tempTranslation)}
              />
            </div>
          </div>
          <Button variant="primary" size="confirm" onClick={handleSaveSettings}>
            Save
          </Button>
        </BottomSheet>
      )}
    </div>
  )
}

export default ChatPage

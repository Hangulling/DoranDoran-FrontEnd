import { useEffect, useMemo, useRef, useState } from 'react'
import ChatFooter from '../components/chat/ChatFooter'
import type { Message } from '../types/chat'
import { useModalStore } from '../stores/useUiStateStore'
import { useNavigate, useParams } from 'react-router-dom'
import { chatRooms } from '../mocks/db/chat'
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

const INACTIVITY_DURATION_MS = 300000

export interface EnrichedMessage extends Message {
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
  const chatroomId = id ? roomsMap[id] : undefined
  const closenessLevel =
    useClosenessStore.getState().getCloseness(id ?? '') ?? 1
  const closenessText = getClosenessAsText(closenessLevel)
  const accessToken = sessionStorage.getItem('accessToken') ?? ''
  const isAtBottomRef = useRef(true) // 스크롤 감지

  const room = useMemo(() => {
    return chatRooms.find(r => String(r.roomRouteId) === String(id))
  }, [id])

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

  const { handleChatBubbleBookmark, handleCorrectionBubbleBookmark } =
    useBookmarkManager({
      chatroomId,
      chatbotId,
      closenessText,
      messages,
      setMessages,
    })

  const { isModalOpen, handleConfirmExit, handleCancelExit, handleGoBack } =
    useChatExit({
      chatroomId,
      userId,
      routeId: id,
    })

  const { inactivityError, resetInactivityTimer, stopInactivityTimer } =
    useInactivityTimer(INACTIVITY_DURATION_MS)

  useChatHistory({
    chatroomId,
    userId,
    roomAvatar: room?.avatar,
    id,
    navigate,
    setMessages,
    setIsHistoryLoading,
    setIsNewChat,
    setGreetingState,
    setGreetingMsg1,
    setGreetingMsg2,
  })

  const { isAiResponding, sseError, handleSendMessage } = useChatInteraction({
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

  // 스크롤 위치 감지 함수
  const handleScroll = () => {
    if (!chatMainRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatMainRef.current
    const isBottom = scrollHeight - scrollTop - clientHeight < 50
    isAtBottomRef.current = isBottom
  }

  // 키보드 올라올 때 스크롤 보정
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatMainRef.current) {
        chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight
      }
    }

    const handleResize = () => {
      if (isAtBottomRef.current) {
        scrollToBottom()
        setTimeout(scrollToBottom, 100)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

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
    <div className="flex flex-col h-full overflow-hidden relative">
      <ChatHeader
        title={room?.roomName || 'Chat'}
        closenessLevel={closenessLevel}
        onBack={handleGoBack}
        onSettingClick={openSettings}
      />

      <div
        ref={chatMainRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-5 pt-6"
      >
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
          inactivityError={inactivityError}
          chatroomId={chatroomId}
          isVocabularyEnabled={isVocabularyEnabled}
          isCorrectionEnabled={isCorrectionEnabled}
          isTranslationEnabled={isTranslationEnabled}
          onChatBubbleBookmark={handleChatBubbleBookmark}
          onCorrectionBubbleBookmark={handleCorrectionBubbleBookmark}
        />
      </div>

      <footer className="shrink-0">
        <ChatFooter
          inputRef={inputRef}
          onSendMessage={handleSendMessage}
          disabled={isHistoryLoading || !isInitChatReady || isAiResponding}
        />
      </footer>
      <ExitModal
        open={isModalOpen}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

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
    </div>
  )
}

export default ChatPage

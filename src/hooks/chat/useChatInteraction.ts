import { useCallback, useRef, useState } from 'react'
import { useChatStream } from './useChatStream'
import type { EnrichedMessage } from '../../pages/ChatPage'
import type {
  EventDataMap,
  GreetingBotMessageData,
  GreetingGuideMessageData,
  IntimacyAnalysisData,
  VocabularyExtractedData,
} from '../../types/sseEvents'
import { cancelMessage, getMessage, sendMessage } from '../../api'
import { useUserMsgStore } from '../../stores/useUserMsgStore'
import { sendGAEvent } from '../../utils/ga'

interface UseChatInteractionProps {
  chatroomId: string | undefined
  userId: string
  accessToken: string
  roomAvatar: string | undefined
  isNewChat: boolean | null

  setMessages: React.Dispatch<React.SetStateAction<EnrichedMessage[]>>
  resetInactivityTimer: () => void
  stopInactivityTimer: () => void

  setGreetingMsg1: React.Dispatch<React.SetStateAction<string | null>>
  setGreetingMsg2: React.Dispatch<React.SetStateAction<string | null>>
  setGreetingState: React.Dispatch<
    React.SetStateAction<'pending' | 'loading' | 'complete'>
  >
}

export const useChatInteraction = ({
  chatroomId,
  userId,
  accessToken,
  roomAvatar,
  isNewChat,
  setMessages,
  resetInactivityTimer,
  stopInactivityTimer,
  setGreetingMsg1,
  setGreetingMsg2,
  setGreetingState,
}: UseChatInteractionProps) => {
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [sseError, setSseError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null) // 메시지 전송 실패
  const [retryCount, setRetryCount] = useState(0)

  const pendingVocabularyRef = useRef<VocabularyExtractedData | null>(null)
  const lastUserMsgIdRef = useRef<string | null>(null)
  const lastAiMsgIdRef = useRef<string | null>(null)

  // 재시도 아이콘 눌렀을 때 핸들러
  const handleRetry = useCallback(() => {
    console.log('Retrying connection...')
    setSseError(null)
    setSendError(null)
    resetInactivityTimer()
    setRetryCount(prev => prev + 1)
  }, [resetInactivityTimer])

  const handleResend = async (
    cancelledMsgId: string,
    targetUserMsgId: string
  ) => {
    try {
      const originMessage = await getMessage(targetUserMsgId)
      const content = originMessage.content

      setMessages(prev =>
        prev.filter(
          msg => msg.id !== cancelledMsgId && msg.id !== targetUserMsgId
        )
      )

      // 메시지 다시 전송
      await handleSendMessage(content)
    } catch (error) {
      console.error('Failed to resend message:', error)
    }
  }

  // 메시지 중지
  const handleCancel = async () => {
    if (!isAiResponding) return

    // 로딩 중지
    setIsAiResponding(false)
    resetInactivityTimer()

    // correctionBubble 숨김
    const targetUserMsgId = lastUserMsgIdRef.current
    if (targetUserMsgId) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === targetUserMsgId
            ? { ...msg, analysisState: 'complete' }
            : msg
        )
      )
    }

    // 빈 말풍선 추가
    const cancelledMessage: EnrichedMessage = {
      id: Date.now().toString(),
      text: '',
      isSender: false,
      avatarUrl: roomAvatar ?? '',
      variant: 'basic',
      showIcon: false,
      isCancelled: true,
      targetUserMsgId: targetUserMsgId,
    }
    setMessages(prev => [...prev, cancelledMessage])

    // 서버에 전송 취소
    if (targetUserMsgId) {
      try {
        await cancelMessage(targetUserMsgId)
      } catch (error) {
        console.error('Failed to cancel message:', error)
      }
      // 중단 후 참조 초기화
      lastUserMsgIdRef.current = null
    }
  }

  // 메시지 전송
  const handleSendMessage = async (text: string) => {
    resetInactivityTimer() // 타이머 리셋
    setSendError(null)
    setSseError(null)

    lastUserMsgIdRef.current = text

    if (!chatroomId) {
      console.error('채팅방 ID가 없습니다.')
      return
    }

    // 임시 메시지 즉시 추가
    const tempId = Date.now().toString()
    const tempMessage: EnrichedMessage = {
      id: tempId,
      text: text,
      isSender: true,
      variant: 'sender',
      analysisState: 'pending',
      isSendFailed: false,
    }

    setMessages(prevMessages => [...prevMessages, tempMessage])
    setIsAiResponding(true)

    try {
      const response = await sendMessage(chatroomId, {
        senderType: 'user',
        content: text,
        contentType: 'text',
      })

      // GA_send_user_message
      sendGAEvent('send_user_message', {
        chatroom_id: chatroomId,
        user_message: text,
      })

      useUserMsgStore.getState().addUserMsg({
        id: response.id,
        content: response.content,
      })

      lastUserMsgIdRef.current = response.id // 마지막 사용자 메시지 ID 저장

      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? {
                ...msg,
                id: response.id,
                text: response.content,
                isSendFailed: false,
              }
            : msg
        )
      )
      setIsAiResponding(true)
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      setIsAiResponding(false) // AI 응답 대기 해제

      // 전송 실패 시 플래그 설정
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? { ...msg, isSendFailed: true, analysisState: 'complete' }
            : msg
        )
      )
    }
  }

  // SSE 이벤트 처리
  const handleSseEvent = useCallback(
    (eventType: string, data: unknown) => {
      resetInactivityTimer() // 타이머 리셋
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
          const vocabData = pendingVocabularyRef.current

          setIsAiResponding(false) // 로딩 종료

          // GA_send_ai_reply
          sendGAEvent('send_ai_reply', {
            chatroom_id: chatroomId,
            intimacy_message: conversationData.content,
          })

          lastAiMsgIdRef.current = conversationData.messageId

          const newAiMessage: EnrichedMessage = {
            id: conversationData.messageId,
            text: conversationData.content,
            isSender: false,
            avatarUrl: roomAvatar ?? '',
            variant: 'basic',
            showIcon: true,
            vocabularyData: vocabData,
          }
          setMessages(prev => [...prev, newAiMessage])
          pendingVocabularyRef.current = null // 대기 데이터 비우기
          break
        }
        case 'intimacy_analysis': {
          const intimacyData = data as IntimacyAnalysisData

          // GA_send_ai_intimacy
          sendGAEvent('send_ai_intimacy', {
            chatroom_id: chatroomId,
            ai_message: intimacyData.corrections
              ? intimacyData.correctedSentence
              : '',
          })

          const targetMsgId = lastUserMsgIdRef.current
          if (!targetMsgId) break

          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === targetMsgId) {
                if (intimacyData && intimacyData.corrections) {
                  return {
                    ...msg,
                    correction: intimacyData,
                    isPerfect: false,
                    analysisState: 'complete',
                  }
                } else {
                  return {
                    ...msg,
                    correction: null,
                    isPerfect: true,
                    analysisState: 'complete',
                  }
                }
              }
              return msg
            })
          )
          lastUserMsgIdRef.current = null
          break
        }
        case 'vocabulary_extracted': {
          const vocabData = data as VocabularyExtractedData
          pendingVocabularyRef.current = vocabData
          break
        }
        default:
          console.warn(`[SSE] Unhandled event type: ${eventType}`, data)
          break
      }
    },
    [
      chatroomId,
      roomAvatar,
      isNewChat,
      resetInactivityTimer,
      setMessages,
      setGreetingMsg1,
      setGreetingState,
      setGreetingMsg2,
    ]
  )

  useChatStream<EventDataMap>(
    chatroomId ?? '',
    userId,
    accessToken,
    handleSseEvent,
    e => {
      console.error('SSE Error (Network/Server)', e)
      setSseError('SSE 연결 중 오류가 발생했습니다.')
      stopInactivityTimer() // 타이머 완전 중지
    },
    () => {
      setSseError(null) // 백그라운드에서 돌아와서 재연결 시도 성공 시 에러 지움
    },
    retryCount
  )

  return {
    isAiResponding,
    sseError,
    sendError,
    handleSendMessage,
    handleRetry,
    handleCancel,
    handleResend,
  }
}

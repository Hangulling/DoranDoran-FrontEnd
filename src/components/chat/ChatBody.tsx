import React from 'react'
import LoadingSpinner from '../common/LoadingSpinner'
import InitChat from './InitChat'
import ChatMessageList from './ChatMessageList'
import type { EnrichedMessage } from '../../pages/ChatPage'
import type { VocabularyExtractedData } from '../../types/sseEvents'

interface ChatBodyProps {
  isHistoryLoading: boolean
  greetingState: 'pending' | 'loading' | 'complete'
  roomAvatar: string | undefined
  onInitReady: () => void
  greetingMsg1: string | null
  greetingMsg2: string | null
  isNewChat: boolean | null

  // ChatMessageList에 전달할 Props
  messages: EnrichedMessage[]
  isAiResponding: boolean
  sseError: string | null
  sendError: string | null
  onRetry: () => void
  inactivityError: boolean
  chatroomId: string | undefined
  isVocabularyEnabled: boolean
  isCorrectionEnabled: boolean
  isTranslationEnabled: boolean
  onChatBubbleBookmark: (
    messageId: string,
    content: string,
    vocabularyData: VocabularyExtractedData | null | undefined
  ) => void
  onCorrectionBubbleBookmark: (
    messageId: string,
    content: string,
    correctedContent: string,
    feedbackKo: string,
    feedbackEn: string
  ) => void
  onReport: (messageId: string) => void
  onResend?: (cancelledMsgId: string, targetUserMsgId: string) => void
}

const ChatBody: React.FC<ChatBodyProps> = props => {
  if (props.isHistoryLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      {/* 그리팅 */}
      {(props.greetingState === 'loading' ||
        props.greetingState === 'complete') && (
        <InitChat
          avatar={props.roomAvatar}
          onReady={props.onInitReady}
          message1={props.greetingMsg1}
          message2={props.greetingMsg2 ?? ''}
          skipAnimation={props.isNewChat === false}
        />
      )}

      {/* 메시지 목록 */}
      <ChatMessageList
        messages={props.messages}
        isAiResponding={props.isAiResponding}
        sseError={props.sseError}
        sendError={props.sendError}
        onRetry={props.onRetry}
        inactivityError={props.inactivityError}
        roomAvatar={props.roomAvatar}
        chatroomId={props.chatroomId}
        isVocabularyEnabled={props.isVocabularyEnabled}
        isCorrectionEnabled={props.isCorrectionEnabled}
        isTranslationEnabled={props.isTranslationEnabled}
        onChatBubbleBookmark={props.onChatBubbleBookmark}
        onCorrectionBubbleBookmark={props.onCorrectionBubbleBookmark}
        onReport={props.onReport}
        onResend={props.onResend}
      />
    </>
  )
}

export default ChatBody

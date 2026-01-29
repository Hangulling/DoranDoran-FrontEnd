import React from 'react'
import type { EnrichedMessage } from '../../pages/ChatPage'
import type { VocabularyExtractedData } from '../../types/sseEvents'
import ChatBubble from './ChatBubble'
import ChatMessageItem from './ChatMessageItem'
import ReloadIcon from '../../assets/icon/reload.svg?react'

const LoadingDot = () => (
  <span className="loading loading-dots loading-[5px] text-gray-200" />
)

interface ChatMessageListProps {
  messages: EnrichedMessage[]
  isAiResponding: boolean
  sseError: string | null
  sendError: string | null
  inactivityError: boolean
  roomAvatar: string | undefined
  chatroomId: string | undefined
  isVocabularyEnabled: boolean
  isCorrectionEnabled: boolean
  isTranslationEnabled: boolean
  onRetry: () => void
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
  onRetryUserMessage?: (msgId: string, content: string) => void
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isAiResponding,
  sseError,
  sendError,
  inactivityError,
  roomAvatar,
  chatroomId,
  isVocabularyEnabled,
  isCorrectionEnabled,
  isTranslationEnabled,
  onRetry,
  onChatBubbleBookmark,
  onCorrectionBubbleBookmark,
  onReport,
  onResend,
  onRetryUserMessage,
}) => {
  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <ChatMessageItem
          key={msg.id}
          msg={msg}
          chatroomId={chatroomId}
          isVocabularyEnabled={isVocabularyEnabled}
          isCorrectionEnabled={isCorrectionEnabled}
          isTranslationEnabled={isTranslationEnabled}
          onChatBubbleBookmark={onChatBubbleBookmark}
          onCorrectionBubbleBookmark={onCorrectionBubbleBookmark}
          onReport={onReport}
          onResend={onResend}
          onRetryUserMessage={onRetryUserMessage}
        />
      ))}

      {/* 응답 로딩 */}
      {isAiResponding && (
        <div className="mt-5">
          <ChatBubble
            message={<LoadingDot />}
            isSender={false}
            avatarUrl={roomAvatar}
            variant={'basic'}
            showIcon={false}
          />
        </div>
      )}

      {/* 에러 */}
      <div className="mt-5">
        {sseError && (
          <div className="flex items-center gap-[6px]">
            <ChatBubble
              message={'Oops, network error. Please try again.'}
              isSender={false}
              variant={'error'}
              showIcon={false}
            />
            <button onClick={onRetry} aria-label="Retry">
              <ReloadIcon />
            </button>
          </div>
        )}

        {/* 사용자 메시지 전송 실패*/}
        {sendError && (
          <ChatBubble
            message={sendError}
            isSender={true}
            variant={'error'}
            showIcon={false}
          />
        )}

        {inactivityError && (
          <ChatBubble
            message={'Knock knock'}
            isSender={false}
            variant={'basic'}
            showIcon={false}
          />
        )}
      </div>

      <div className="h-4" />
    </div>
  )
}

export default ChatMessageList

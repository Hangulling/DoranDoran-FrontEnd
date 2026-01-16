import React, { useState } from 'react'
import type { EnrichedMessage } from '../../pages/ChatPage'
import type { VocabularyExtractedData } from '../../types/sseEvents'
import ChatBubble from './ChatBubble'
import CorrectionBubble from './CorrectionBubble'
import DescriptionBubble from './DescriptionBubble'
import CheckIcon from '../../assets/icon/CheckIcon'
import StarIcon from '../../assets/icon/Asterisk'
import ReloadIcon from '../../assets/icon/reload.svg?react'

interface ChatMessageItemProps {
  msg: EnrichedMessage
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
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(
  ({
    msg,
    chatroomId,
    isVocabularyEnabled,
    isCorrectionEnabled,
    isTranslationEnabled,
    onChatBubbleBookmark,
    onCorrectionBubbleBookmark,
  }) => {
    const [showDescription, setShowDescription] = useState(true)
    const [showFeedback, setShowFeedback] = useState(true)

    const toggleFeedback = () => {
      if (!msg.isSendFailed) {
        setShowFeedback(prev => !prev)
      }
    }

    const renderStatusIcon = () => {
      let IconComponent = null

      // 전송 실패
      if (msg.isSendFailed) {
        IconComponent = ReloadIcon
        return (
          <button
            onClick={() => {
              // 재전송 미정
              console.log('재전송 클릭')
            }}
          >
            <IconComponent />
          </button>
        )
      }
      // Perfect인 경우
      if (msg.isPerfect) {
        IconComponent = CheckIcon
      }
      // 교정 아이콘 표시
      else if (
        msg.analysisState === 'pending' ||
        (msg.correction && msg.correction.correctedSentence)
      ) {
        IconComponent = StarIcon
      } else {
        return null
      }

      return (
        <button
          onClick={toggleFeedback}
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 mr-[6px] ${
            showFeedback
              ? 'bg-purple-10 text-primary-300'
              : 'bg-gradient-1 text-gray-0'
          }`}
        >
          <IconComponent />
        </button>
      )
    }

    return (
      <div className="mb-0">
        <div
          className={`mt-5 flex items-center justify-${msg.isSender ? 'end' : 'start'}`}
        >
          {msg.isSender && renderStatusIcon()}

          <ChatBubble
            message={msg.text}
            isSender={msg.isSender}
            avatarUrl={msg.avatarUrl}
            variant={msg.variant ?? 'basic'}
            showIcon={msg.showIcon}
            messageId={msg.id}
            isBookmarked={!!msg.bookmarkId}
            onBookmarkToggle={(messageId, content) =>
              onChatBubbleBookmark(messageId, content, msg.vocabularyData)
            }
            isBookActive={showDescription}
            onBookToggle={() => setShowDescription(prev => !prev)}
          />
        </div>

        {/* 사용자 메시지 교정 */}
        {msg.isSender &&
          (msg.isSendFailed ? (
            <div className="flex flex-row justify-end text-system-red text-[12px] mt-1 text-subtitle animate-fadeIn">
              Not sent
            </div>
          ) : (
            isCorrectionEnabled &&
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
              showFeedback && (
                <div className="flex flex-row justify-end text-transparent bg-clip-text bg-gradient-1 text-[12px] mt-1 text-subtitle animate-fadeIn">
                  Perfect
                </div>
              )
            ) : msg.correction && msg.correction.correctedSentence ? (
              // COMPLETE + CORRECTION
              showFeedback && (
                <CorrectionBubble
                  chatRoomId={chatroomId ?? ''}
                  messageId={msg.id}
                  originalContent={msg.text}
                  correctedContent={msg.correction.correctedSentence}
                  descriptionByTab={{
                    Kor: msg.correction.feedback.ko,
                    Eng: msg.correction.feedback.en,
                  }}
                  showKorean={isTranslationEnabled}
                  isSender={true}
                  isLoading={false}
                  isBookmarked={!!msg.bookmarkId}
                  onBookmarkToggle={(messageId, content, correctedContent) =>
                    onCorrectionBubbleBookmark(
                      messageId,
                      content,
                      correctedContent,
                      msg.correction!.feedback.ko,
                      msg.correction!.feedback.en
                    )
                  }
                />
              )
            ) : null)
          ))}

        {/* 어휘 */}
        {!msg.isSender &&
          isVocabularyEnabled &&
          showDescription &&
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
              showKorean={isTranslationEnabled}
            />
          ))}
      </div>
    )
  }
)

export default ChatMessageItem

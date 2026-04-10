import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MANAGER_DATA, type ManagerStepId } from '../constants/managerData'
import { MANAGER_ROOM } from '../constants/mainData'
import ChatHeader from '../components/chat/ChatHeader'
import ChatBubble from '../components/chat/ChatBubble'
import ContactSheet from '../components/chat/ContactSheet'
import { createSupport } from '../api/support'
import { useUserStore } from '../stores/useUserStore'
import showToast from '../components/common/CommonToast'
import Restart from '../assets/icon/restart.svg?react'
import CommonModal from '../components/common/CommonModal'
import { useBackButton } from '../hooks/useBackButton'
import { sendGAEvent } from '../utils/ga'

interface ManagerMessage {
  id: string
  texts: string[]
  type: 'bot' | 'user'
  hasContactButton?: boolean
  group?: 'completed'
}

const ManagerChatPage: React.FC = () => {
  const navigate = useNavigate()
  const chatMainRef = useRef<HTMLDivElement>(null)

  const [currentStepId, setCurrentStepId] = useState<ManagerStepId>('intro')
  const [messages, setMessages] = useState<ManagerMessage[]>([])
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [selectedStepId, setSelectedStepId] = useState<ManagerStepId | null>(
    null
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasProgress, setHasProgress] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'back' | 'home' | null>(
    null
  )

  const userId = useUserStore(state => state.id)

  // 인트로 메시지
  useEffect(() => {
    setMessages([
      { id: 'intro', texts: MANAGER_DATA.intro.message, type: 'bot' },
    ])
  }, [])

  // 스크롤
  useEffect(() => {
    chatMainRef.current?.scrollTo(0, chatMainRef.current.scrollHeight)
  }, [messages])

  const introOptions = [
    {
      label: 'Inconvenience while using the service',
      nextStepId: 'inconvenience' as ManagerStepId,
    },
    {
      label: 'Feature suggestions and ideas',
      nextStepId: 'suggestions' as ManagerStepId,
    },
    { label: 'Bug / Error', nextStepId: 'error' as ManagerStepId },
    { label: 'Chatbot feedback', nextStepId: 'feedback' as ManagerStepId },
    { label: 'Other inquiries', nextStepId: 'other' as ManagerStepId },
  ]

  const backButtonHandlers = useMemo(
    () => [
      {
        priority: 3,
        condition: showLeaveModal,
        callback: () => {
          setShowLeaveModal(false)
          setPendingAction(null)
        },
      },
      {
        priority: 2,
        condition: isContactSheetOpen,
        callback: () => setIsContactSheetOpen(false),
      },
      {
        priority: 1,
        condition: hasProgress && !isCompleted,
        callback: () => {
          setPendingAction('back')
          setShowLeaveModal(true)
        },
      },
      {
        priority: 0,
        condition: true,
        callback: () => {
          navigate('/')
        },
      },
    ],
    [showLeaveModal, isContactSheetOpen, hasProgress, isCompleted, navigate]
  )

  useBackButton(backButtonHandlers)

  // 옵션 선택
  const handleOptionClick = (
    optionLabel: string,
    nextStepId: ManagerStepId
  ) => {
    // ga_select_inquiry_type
    sendGAEvent('select_inquiry_type', {
      inquiry_type: optionLabel,
    })

    setHasProgress(true)
    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, texts: [optionLabel], type: 'user' },
    ])
    setShowOptions(false)

    setSelectedStepId(nextStepId)

    setCurrentStepId(nextStepId)
    setTimeout(() => {
      const nextStep = MANAGER_DATA[nextStepId]
      setMessages(prev => [
        ...prev,
        {
          id: `${nextStepId}-${Date.now()}`,
          texts: nextStep.message,
          type: 'bot',
          hasContactButton: true,
        },
      ])
    }, 500)
  }

  // 나가기
  const requestLeave = (action: 'back' | 'home') => {
    if (hasProgress && !isCompleted) {
      setPendingAction(action)
      setShowLeaveModal(true)
    } else {
      if (action === 'home') navigate('/')
      if (action === 'back') navigate(-1)
    }
  }

  // 제출
  const handleSubmit = async (
    content: string,
    options?: { replyRequested: boolean; replyEmail?: string }
  ) => {
    try {
      await createSupport(
        {
          type: 'INQUIRY',
          category: selectedOption,
          content,
          replyRequested: options?.replyRequested || false,
          ...(options?.replyEmail && { replyEmail: options?.replyEmail }),
        },
        { userId }
      )

      showToast({
        message: 'Email reply request sent',
        iconType: 'checkRound',
        size: 'manager',
      })

      const completedStep = MANAGER_DATA.completed
      const categoryCompletedMsg: string[] =
        selectedStepId &&
        selectedStepId !== 'intro' &&
        selectedStepId !== 'completed'
          ? completedStep.completedMessages?.[selectedStepId] || []
          : []

      setIsCompleted(true)
      setHasProgress(false)

      const isCheckEmail = options?.replyRequested === true

      setTimeout(() => {
        setMessages(prev => {
          const withoutContact = prev.map((m, idx, arr) =>
            idx === arr.length - 1 && m.hasContactButton
              ? { ...m, hasContactButton: false }
              : m
          )

          const base: ManagerMessage[] = [...withoutContact]

          base.push({
            id: `user-sent-${Date.now()}`,
            texts: ['Sent my inquiry'],
            type: 'user',
          })

          base.push({
            id: `completed-${Date.now()}`,
            texts: categoryCompletedMsg,
            type: 'bot',
            group: 'completed',
          })

          if (isCheckEmail) {
            base.push({
              id: `final-${Date.now()}`,
              texts: completedStep.message,
              type: 'bot',
              group: 'completed',
            })
          }
          return base
        })
      }, 500)
      setIsContactSheetOpen(false)
      setSelectedOption('')
    } catch (error) {
      showToast({
        message:
          'An error occurred while sending your message. Please try again.',
        iconType: 'error',
        size: 'manager',
      })
      console.error('지원 문의 실패:', error)
    }
  }

  const handleLeaveConfirm = () => {
    setShowLeaveModal(false)
    const action = pendingAction
    setPendingAction(null)
    setHasProgress(false)

    if (action === 'back') navigate(-1)
    if (action === 'home') navigate('/')
  }

  const handleLeaveCancel = () => {
    setShowLeaveModal(false)
    setPendingAction(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-gray-10 pb-[env(safe-area-inset-bottom)]">
      <ChatHeader
        title={MANAGER_ROOM.roomName}
        avatar={MANAGER_ROOM.avatar}
        onBack={() => requestLeave('back')}
      />

      <div
        ref={chatMainRef}
        className={`grow overflow-y-auto px-5 pt-6 ${
          isCompleted ? 'pb-[calc(92px+env(safe-area-inset-bottom))]' : 'pb-6'
        }`}
      >
        <div className="flex flex-col gap-5">
          {messages.map((message, idx) => {
            // completed 그룹
            if (message.group === 'completed') {
              const next = messages[idx + 1]
              if (next?.group === 'completed') {
                return (
                  <div key={message.id} className="flex flex-col gap-2.5">
                    <ChatBubble
                      message={
                        <div className="flex flex-col">
                          {message.texts.map((t, i) => (
                            <p key={i}>{t}</p>
                          ))}
                        </div>
                      }
                      isSender={false}
                      variant="basic"
                      showIcon={false}
                    />
                    <ChatBubble
                      message={
                        <div className="flex flex-col">
                          {next.texts.map((t, i) => (
                            <p key={i}>{t}</p>
                          ))}
                        </div>
                      }
                      isSender={false}
                      variant="basic"
                      showIcon={false}
                    />
                  </div>
                )
              }
            }

            if (
              message.group === 'completed' &&
              messages[idx - 1]?.group === 'completed'
            ) {
              return null
            }

            // 나머지 일반 메시지
            return (
              <ChatBubble
                key={message.id}
                message={
                  <div className="flex flex-col">
                    {message.texts.map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                    {message.hasContactButton && (
                      <button
                        onClick={() => setIsContactSheetOpen(true)}
                        className="mt-2 self-start py-2 bg-primary-10 border border-primary-300 text-primary-300 rounded-[10px] text-[14px] text-subtitle w-full"
                      >
                        Contact Us
                      </button>
                    )}
                  </div>
                }
                isSender={message.type === 'user'}
                variant={message.type === 'user' ? 'sender' : 'basic'}
                showIcon={false}
              />
            )
          })}
        </div>

        {/* 옵션 리스트 */}
        {showOptions && currentStepId === 'intro' && (
          <>
            <div className="my-5 w-full border-t border-dashed border-gray-100" />
            <div className="flex flex-col gap-2.5">
              {introOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleOptionClick(option.label, option.nextStepId!)
                  }
                  className="h-12.25 px-5 py-3.5 bg-gray-0 border border-gray-100 rounded-xl text-left active:bg-primary-10 active:border-primary-200 focus:bg-primary-10 focus:border-primary-200 transition-colors text-[14px]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 고정 버튼 */}
      {isCompleted && (
        <div className="flex flex-row gap-2.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] px-5 bg-gray-0 shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] border-t border-gray-100 fixed bottom-0 left-0 right-0 z-10 max-w-app mx-auto">
          <button
            onClick={() => {
              setCurrentStepId('intro')
              setMessages([
                {
                  id: 'intro-reset',
                  texts: MANAGER_DATA.intro.message,
                  type: 'bot',
                },
              ])
              setIsCompleted(false)
              setShowOptions(true)
              setHasProgress(false)
            }}
            className="flex w-14 items-center justify-center bg-gray-50 border border-gray-100 rounded-xl"
          >
            <Restart />
          </button>
          <button
            onClick={() => requestLeave('home')}
            className="flex-1 h-13 bg-primary-10 text-primary-300 border border-primary-300 rounded-xl text-[16px] text-subtitle"
          >
            Go Home
          </button>
        </div>
      )}

      {isContactSheetOpen && (
        <ContactSheet
          isOpen
          onClose={() => setIsContactSheetOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <CommonModal
        open={showLeaveModal}
        title="Unsaved"
        description={
          <>
            Your message won’t be sent
            <br />
            if you leave this page.
          </>
        }
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={handleLeaveConfirm}
        onCancel={handleLeaveCancel}
      />
    </div>
  )
}

export default ManagerChatPage

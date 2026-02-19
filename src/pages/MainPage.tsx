import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import ChatRoomList from '../components/main/ChatRoomList'
import ClosenessSheet from '../components/chat/ClosenessSheet'
import CommonModal from '../components/common/CommonModal'
import { useFetchUser } from '../hooks/useFetchUser'
import { useFetchChatRooms } from '../hooks/useFetchChatRooms'
import { useCreateChatRoom } from '../hooks/useCreateChatRoom'
import { getChatBotIdByConcept } from '../utils/chatbotMap'
import Carousel from '../components/main/Carousel'
import Dashboard from '../components/main/Dashboard'
import InstaContent from '../components/main/InstaContent'
import { MANAGER_ROOM } from '../constants/mainData'
import useUnreadStore from '../stores/useUnreadStore'
import { getDeepLinkChatroom, postStartGreeting } from '../api'
import { useMutation } from '@tanstack/react-query'
import ReactGA from 'react-ga4'
import { GA_ENABLED, IS_PROD } from '../constants/env'
import type { ChatRoomWithMessage } from '../types/main'
import type { AxiosError } from 'axios'
import { getRouteIdByConcept } from '../utils/conceptMap'

interface ApiError {
  success?: boolean
  error?: string
}

const MainPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUnread } = useUnreadStore()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number | string
    name: string
  } | null>(null)
  const [pushData, setPushData] = useState<{
    chatroomId?: string
    startMessage?: string
    targetChatbotId?: string
    targetTopic?: string
  } | null>(null)

  const { userId } = useFetchUser()
  const { chatMsg, isLoading } = useFetchChatRooms(userId)

  // view_main GA
  useEffect(() => {
    if (IS_PROD && GA_ENABLED && userId) {
      const entryTimestamp = Math.floor(Date.now() / 1000)
      ReactGA.event('view_main', {
        entry_timestamp: entryTimestamp,
      })
    }
  }, [userId])

  // 일반 방 생성
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateChatRoom(
    selectedRoom ? String(selectedRoom.id) : ''
  )

  // 인사말 생성 및 친밀도 설정
  const { mutate: mutateGreeting, isPending: isSettingGreeting } = useMutation({
    mutationFn: ({
      chatroomId,
      intimacyLevel,
      startMessage,
    }: {
      chatroomId: string
      intimacyLevel: number
      startMessage?: string
    }) => {
      console.group('postStartGreeting 시작')
      console.log('Target ID:', chatroomId)
      console.log('Intimacy:', intimacyLevel)
      console.log('Message:', startMessage)
      console.groupEnd()

      return postStartGreeting(chatroomId, {
        intimacyLevel,
        startMessage,
      })
    },
    onSuccess: (_, variables) => {
      setIsSheetOpen(false)
      // 최종 이동
      const targetRouteId = getRouteIdByConcept(selectedRoom?.name || 'friend')
      if (variables.chatroomId) {
        navigate(`/chat/${variables.chatroomId}`, {
          state: {
            roomRouteId: targetRouteId,
            concept: selectedRoom?.name,
            closeness: variables.intimacyLevel,
          },
        })
      }
      setPushData(null)
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error('Error Status:', error.response?.status)
      console.error(
        'Error Data:',
        JSON.stringify(error.response?.data, null, 2)
      )
      console.groupEnd()

      setIsSheetOpen(false)
    },
  })

  // 딥링크 방 생성
  const { mutateAsync: createRoomByDeepLink, isPending: isCreatingDeepLink } =
    useMutation({
      mutationFn: (params: {
        chatbotId: string
        topic?: string
        concept?: string
        userId?: string
      }) => getDeepLinkChatroom(params),
    })

  // 푸시 클릭 로직
  useEffect(() => {
    if (location.state?.fromPush) {
      const {
        targetChatroomId,
        targetChatbotId,
        targetTopic,
        targetConcept,
        startMessage,
      } = location.state

      if (targetConcept) {
        setSelectedRoom({
          id: 0,
          name: targetConcept,
        })

        // 사용할 데이터 저장
        setPushData({
          chatroomId: targetChatroomId,
          startMessage: startMessage,
          targetChatbotId: targetChatbotId,
          targetTopic: targetTopic,
        })

        setIsSheetOpen(true)
      }

      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // 온보딩 완료 모달
  useEffect(() => {
    if (location.state?.showOnboardingModal) {
      setShowCompleteModal(true)
      history.replaceState({}, '')
    }
  }, [location])

  const handleCardClick = (externalId: string) => {
    navigate(`/insta/${externalId}`)
  }

  const handleRoomClick = (id: number | string, roomName: string) => {
    if (id === MANAGER_ROOM.roomRouteId) {
      navigate(`/manager`, {
        state: {
          roomRouteId: id,
          concept: roomName,
          closeness: 0,
        },
      })
      return
    }

    // enter_chatroom GA
    if (IS_PROD && GA_ENABLED) {
      const entryTimestamp = Math.floor(Date.now() / 1000)
      ReactGA.event('enter_chatroom', {
        concept: roomName,
        entry_timestamp: entryTimestamp,
      })
    }

    const room = chatMsg.find((r: ChatRoomWithMessage) => r.roomRouteId === id)
    if (room?.chatroomId) {
      setUnread(room.chatroomId, false)
    }

    setSelectedRoom({ id, name: roomName })
    setPushData(null)
    setIsSheetOpen(true)
  }

  // 시작 버튼 클릭 핸들러
  const handleStartChat = async (closeness: number) => {
    console.log('선택된 친밀도 값:', closeness)

    if (!selectedRoom || !userId) return

    // 푸시로 들어온 경우
    if (pushData) {
      try {
        let targetId = pushData.chatroomId

        if (!targetId && pushData.targetChatbotId) {
          const roomData = await createRoomByDeepLink({
            chatbotId: pushData.targetChatbotId,
            topic: pushData.targetTopic,
            concept: selectedRoom.name.toUpperCase(),
            userId: userId,
          })
          targetId = roomData.id
        }

        if (targetId) {
          // 읽음 처리 및 인사말 생성 요청
          setUnread(targetId, false)
          mutateGreeting({
            chatroomId: targetId,
            intimacyLevel: closeness,
            startMessage: pushData.startMessage,
          })
        }
      } catch (error) {
        console.error('딥링크 방 진입 실패:', error)
        setIsSheetOpen(false) // 에러 시 시트 닫기
      }
      return
    }

    // 일반 방 생성
    const chatbotId = getChatBotIdByConcept(selectedRoom.name)
    createRoom(
      {
        userId,
        concept: selectedRoom.name,
        chatbotId: chatbotId,
        intimacyLevel: closeness,
      },
      {
        onSuccess: newRoom => {
          setIsSheetOpen(false)
          navigate(`/chat/${newRoom.id}`, {
            state: {
              roomRouteId: selectedRoom.id,
              concept: selectedRoom.name,
              closeness: closeness,
            },
          })
        },
        onError: () => {
          setIsSheetOpen(false)
        },
      }
    )
  }

  return (
    <div>
      <Carousel />

      <div className="px-5 relative z-20">
        {/* 카드의 정중앙이 캐러셀 밑변 */}
        <div className="-mt-[33px]">
          <Dashboard />
        </div>
      </div>

      <div className="max-w-app md:max-w-tablet lg:max-w-desktop mx-auto px-5 my-8">
        <div className="text-title mb-2 text-[18px]">Chatting Room</div>

        <ChatRoomList
          isLoading={isLoading}
          chatMsg={chatMsg}
          onRoomClick={handleRoomClick}
        />
      </div>

      <section className="max-w-app md:max-w-tablet lg:max-w-desktop mx-auto ml-5 mb-[77px]">
        <div className="text-title mb-3 mr-5 text-[18px]">
          Koach Pick K - contents
        </div>
        <InstaContent onCardClick={handleCardClick} />
      </section>

      <ClosenessSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        concept={selectedRoom?.name || 'friend'}
        onStartChat={handleStartChat}
        isLoading={isCreatingRoom || isCreatingDeepLink || isSettingGreeting}
      />

      {/* 온보딩 완료 모달 */}
      {showCompleteModal && (
        <CommonModal
          open={showCompleteModal}
          title="Welcome! You’re all set"
          description={['Ready to start practicing', 'Korean with chat?']}
          variant="signup"
          confirmText="Start"
          onConfirm={() => {
            setShowCompleteModal(false)
          }}
          onCancel={() => setShowCompleteModal(false)}
        />
      )}
    </div>
  )
}

export default MainPage

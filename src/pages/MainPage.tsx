import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import ChatRoomList from '../components/main/ChatRoomList'
import ClosenessSheet from '../components/chat/ClosenessSheet'
import CommonModal from '../components/common/CommonModal'
import { useFetchChatRooms } from '../hooks/main/useFetchChatRooms'
import { useCreateChatRoom } from '../hooks/main/useCreateChatRoom'
import { getChatBotIdByConcept } from '../utils/chatbotMap'
import Carousel from '../components/main/Carousel'
import Dashboard from '../components/main/Dashboard'
import InstaContent from '../components/main/InstaContent'
import { MANAGER_ROOM } from '../constants/mainData'
import useUnreadStore from '../stores/useUnreadStore'
import type { ChatRoomWithMessage } from '../types/main'
import { useDeepLinkChatRoom } from '../hooks/main/useDeepLinkChatRoom'
import { useStartGreeting } from '../hooks/main/useStartGreeting'
import { getTodayDate, getUnixTime, sendGAEvent } from '../utils/ga'
import { useFetchUser } from '../hooks/useFetchUser'
import { SplashScreen } from '@capacitor/splash-screen'
import { useUserStore } from '../stores/useUserStore'
//import { getUnreadNotifications } from '../api/notification'

const MainPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUnread } = useUnreadStore()

  const { isOnboarded: storedOnboarded } = useUserStore()
  const {
    userId,
    isLoading: isUserLoading,
    isOnboarded: fetchedOnboarded,
  } = useFetchUser()

  const { chatMsg, isLoading: isChatLoading } = useFetchChatRooms(userId)

  const [isReady, setIsReady] = useState(false)

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

  // useEffect(() => {
  //   if (userId) {
  //     getUnreadNotifications()
  //       .then(res => {
  //         console.log('[DEBUG] Unread Notifications:', res)
  //       })
  //       .catch(err => {
  //         console.error('[DEBUG] Failed to fetch notifications:', err)
  //       })
  //   }
  // }, [userId])

  // 스플래시, 온보딩 제어
  useEffect(() => {
    if (isUserLoading) return

    const finalStatus = fetchedOnboarded ?? storedOnboarded

    if (finalStatus === false) {
      navigate('/onboarding', { replace: true })
    } else if (finalStatus === true) {
      setIsReady(true)
      setTimeout(() => {
        SplashScreen.hide()
      }, 300)
    } else {
      setIsReady(true)
      SplashScreen.hide()
    }
  }, [isUserLoading, fetchedOnboarded, storedOnboarded, navigate])

  // GA_view_main
  useEffect(() => {
    if (isReady && userId) {
      sendGAEvent('view_main', {
        time: getUnixTime(),
        date: getTodayDate(),
      })
    }
  }, [isReady, userId])

  // API 로직
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateChatRoom(
    selectedRoom ? String(selectedRoom.id) : ''
  )
  const { mutateAsync: createRoomByDeepLink, isPending: isCreatingDeepLink } =
    useDeepLinkChatRoom()
  const { mutate: mutateGreeting, isPending: isSettingGreeting } =
    useStartGreeting(
      () => {
        setIsSheetOpen(false)
        setPushData(null)
      },
      () => setIsSheetOpen(false)
    )

  // 푸시 라우팅 및 온보딩 모달
  useEffect(() => {
    const state = location.state

    if (state?.fromPush && state.targetConcept) {
      setSelectedRoom({ id: 0, name: state.targetConcept })
      setPushData({
        chatroomId: state.targetChatroomId,
        startMessage: state.startMessage,
        targetChatbotId: state.targetChatbotId,
        targetTopic: state.targetTopic,
      })
      setIsSheetOpen(true)
      window.history.replaceState({}, document.title)
    }

    if (state?.showOnboardingModal) {
      setShowCompleteModal(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleCardClick = (externalId: string) => {
    sendGAEvent('view_content_detail', {
      time: getUnixTime(),
      content_id: externalId,
    })
    navigate(`/insta/${externalId}`)
  }

  const handleRoomClick = (id: number | string, roomName: string) => {
    if (id === MANAGER_ROOM.roomRouteId) {
      navigate(`/manager`, {
        state: { roomRouteId: id, concept: roomName, closeness: 0 },
      })
      return
    }

    // GA_enter_chatroom
    sendGAEvent('enter_chatroom', {
      concept: roomName,
      entry_timestamp: getUnixTime(),
    })

    const room = chatMsg.find((r: ChatRoomWithMessage) => r.roomRouteId === id)
    if (room?.chatroomId) setUnread(room.chatroomId, false)

    setSelectedRoom({ id, name: roomName })
    setPushData(null)
    setIsSheetOpen(true)
  }

  // 푸시 채팅방 시작
  const handlePushRoomStart = async (closeness: number) => {
    if (!pushData) return

    try {
      let targetId = pushData.chatroomId
      if (!targetId && pushData.targetChatbotId) {
        const roomData = await createRoomByDeepLink({
          chatbotId: pushData.targetChatbotId,
          topic: pushData.targetTopic,
          concept: selectedRoom!.name.toUpperCase(),
          userId: userId,
        })
        targetId = roomData.id
      }

      if (targetId) {
        // ga_enter_chatroom_push
        sendGAEvent('enter_chatroom_push', {
          notification_type: 'push',
          chatroom_id: targetId,
          enter_timestamp: Math.floor(Date.now() / 1000),
        })

        setUnread(targetId, false)
        mutateGreeting({
          chatroomId: targetId,
          intimacyLevel: closeness,
          startMessage: pushData.startMessage,
          concept: selectedRoom!.name,
        })
      }
    } catch (error) {
      console.error('딥링크 방 진입 실패:', error)
      setIsSheetOpen(false)
    }
  }

  // 일반 채팅방 시작
  const handleNormalRoomStart = (closeness: number) => {
    const chatbotId = getChatBotIdByConcept(selectedRoom!.name)
    createRoom(
      {
        userId: userId!,
        concept: selectedRoom!.name,
        chatbotId,
        intimacyLevel: closeness,
      },
      {
        onSuccess: newRoom => {
          setIsSheetOpen(false)
          navigate(`/chat/${newRoom.id}`, {
            state: {
              roomRouteId: selectedRoom!.id,
              concept: selectedRoom!.name,
              closeness,
            },
          })
        },
        onError: () => setIsSheetOpen(false),
      }
    )
  }

  // 시작 버튼 클릭 핸들러
  const handleStartChat = async (closeness: number) => {
    if (!selectedRoom || !userId) return
    if (pushData) {
      await handlePushRoomStart(closeness)
    } else {
      handleNormalRoomStart(closeness)
    }
  }

  if (!isReady) return null

  return (
    <div>
      <Carousel />

      <div className="px-5 relative z-20">
        {/* 카드의 정중앙이 캐러셀 밑변 */}
        <div className="-mt-8.25">
          <Dashboard />
        </div>
      </div>

      <div className="max-w-app md:max-w-tablet lg:max-w-desktop mx-auto px-5 my-8">
        <div className="text-title mb-2 text-[18px]">Chatting Room</div>

        <ChatRoomList
          isLoading={isChatLoading}
          chatMsg={chatMsg}
          onRoomClick={handleRoomClick}
        />
      </div>

      <section className="max-w-app md:max-w-tablet lg:max-w-desktop mx-auto ml-5 mb-19.25">
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

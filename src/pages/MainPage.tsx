import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

import ChatRoomList from '../components/main/ChatRoomList'
import ClosenessSheet from '../components/chat/ClosenessSheet'
import CommonModal from '../components/common/CommonModal'
import { useFetchUser } from '../hooks/useFetchUser'
import { useFetchChatRooms } from '../hooks/useFetchChatRooms'
import { useCreateChatRoom } from '../hooks/useCreateChatRoom'
import { getChatBotIdByConcept } from '../utils/chatbotMap'
import ReactGA from 'react-ga4'
import Carousel from '../components/main/Carousel'
import Dashboard from '../components/main/Dashboard'
import InstaContent from '../components/main/InstaContent'
import { MANAGER_ROOM } from '../constants/mainData'
import useUnreadStore from '../stores/useUnreadStore'
import { updateIntimacy } from '../api'
import { useMutation } from '@tanstack/react-query'
import type { ChatRoomWithMessage } from '../types/main'
import { GA_ENABLED, IS_PROD } from '../constants/env'

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
    chatroomId: string
    startMessage: string
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

  // 기존 방 생성
  const { mutate: createRoom, isPending: isCreating } = useCreateChatRoom(
    selectedRoom ? String(selectedRoom.id) : ''
  )

  // 푸시 클릭 시 친밀도 업데이트
  const { mutate: mutateIntimacy, isPending: isUpdating } = useMutation({
    mutationFn: ({
      chatroomId,
      intimacyLevel,
    }: {
      chatroomId: string
      intimacyLevel: number
    }) => updateIntimacy(chatroomId, { intimacyLevel }),
    onSuccess: (_, variables) => {
      setIsSheetOpen(false)

      if (selectedRoom) {
        navigate(`/chat/${variables.chatroomId}`, {
          state: {
            roomRouteId: selectedRoom.id,
            concept: selectedRoom.name,
            closeness: variables.intimacyLevel,
          },
        })
      }
      setPushData(null)
    },
    onError: error => {
      console.error('친밀도 업데이트 실패:', error)
      setIsSheetOpen(false)
    },
  })

  // 푸시 클릭 방 생성
  useEffect(() => {
    if (
      location.state?.fromPush &&
      location.state?.targetChatroomId &&
      chatMsg.length > 0
    ) {
      const { targetChatroomId, startMessage } = location.state

      // UUID로 방 찾기
      const targetRoom = chatMsg.find(
        (room: ChatRoomWithMessage) => room.chatroomId === targetChatroomId
      )

      if (targetRoom) {
        // 읽음 처리
        setUnread(targetChatroomId, false)

        // 시트 열기
        setSelectedRoom({
          id: targetRoom.roomRouteId,
          name: targetRoom.concept,
        })
        setPushData({
          chatroomId: targetChatroomId,
          startMessage: startMessage,
        })
        setIsSheetOpen(true)
      }

      window.history.replaceState({}, document.title)
    }
  }, [location.state, chatMsg, setUnread])

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

    // 일반 진입 시 해당 방에 매칭되는 UUID가 있다면 읽음 처리
    const room = chatMsg.find((r: ChatRoomWithMessage) => r.roomRouteId === id)
    if (room?.chatroomId) {
      setUnread(room.chatroomId, false)
    }

    setSelectedRoom({ id, name: roomName })
    setPushData(null)
    setIsSheetOpen(true)
  }

  const handleStartChat = (closeness: number) => {
    if (!selectedRoom || !userId) return
    // 푸시로 들어온 경우
    if (pushData) {
      mutateIntimacy({
        chatroomId: pushData.chatroomId,
        intimacyLevel: closeness,
      })
      return
    }

    // 기존
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
          // 채팅방 생성 완료 후 이동
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

  useEffect(() => {
    const setTransparentBar = async () => {
      try {
        // 웹뷰를 상태바 밑으로 확장
        await StatusBar.setOverlaysWebView({ overlay: true })

        await StatusBar.setBackgroundColor({ color: '#00000000' })

        await StatusBar.setStyle({ style: Style.Light })
      } catch (e) {
        console.log('StatusBar error', e)
      }
    }

    setTransparentBar()

    // 원래대로 복구
    return () => {
      const resetStatusBar = async () => {
        try {
          // 투명 모드 해제
          await StatusBar.setOverlaysWebView({ overlay: false })
          // 원래 앱의 배경색으로 복구
          await StatusBar.setBackgroundColor({ color: '#FFFFFF' })
          // 글자색을 원래대로
          await StatusBar.setStyle({ style: Style.Light })
        } catch (e) {
          console.log('StatusBar reset error', e)
        }
      }
      resetStatusBar()
    }
  }, [])

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
        isLoading={isCreating || isUpdating}
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

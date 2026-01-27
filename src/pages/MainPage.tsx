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
import Carousel from '../components/main/Carousel'
import Dashboard from '../components/main/Dashboard'
import InstaContent from '../components/main/InstaContent'
import { MANAGER_ROOM } from '../constants/mainData'

const MainPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number
    name: string
  } | null>(null)
  const { userId } = useFetchUser()
  const { chatMsg, isLoading } = useFetchChatRooms(userId)

  const { mutate: createRoom, isPending: isCreating } = useCreateChatRoom(
    selectedRoom ? String(selectedRoom.id) : ''
  )

  useEffect(() => {
    if (location.state?.showOnboardingModal) {
      setShowCompleteModal(true)
      history.replaceState({}, '')
    }
  }, [location])

  const handleCardClick = (externalId: string) => {
    navigate(`/insta/${externalId}`)
  }

  const handleRoomClick = (id: number, roomName: string) => {
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

    setSelectedRoom({ id, name: roomName })
    setIsSheetOpen(true)
  }

  const handleStartChat = (closeness: number) => {
    if (!selectedRoom || !userId) return

    const chatbotId = getChatBotIdByConcept(selectedRoom.name)
    createRoom(
      {
        userId,
        concept: selectedRoom.name,
        chatbotId: chatbotId,
        intimacyLevel: closeness,
      },
      {
        onSuccess: () => {
          setIsSheetOpen(false)
          // 채팅방 생성 완료 후 이동
          navigate(`/chat/${selectedRoom.id}`, {
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
        isLoading={isCreating}
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

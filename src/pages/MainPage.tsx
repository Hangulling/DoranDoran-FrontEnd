import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Banner from '../components/main/Banner'
import ChatRoomList from '../components/main/ChatRoomList'
import ClosenessSheet from '../components/chat/ClosenessSheet'
import CommonModal from '../components/common/CommonModal'
import { useGoBack } from '../hooks/useGoBack'
import { useFetchUser } from '../hooks/useFetchUser'
import { useFetchChatRooms } from '../hooks/useFetchChatRooms'
import { useCreateChatRoom } from '../hooks/useCreateChatRoom'
import { getChatBotIdByConcept } from '../utils/chatbotMap'

const MainPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number
    name: string
  } | null>(null)
  const { userName, userId } = useFetchUser()
  const { chatMsg, isLoading } = useFetchChatRooms(userId)

  const { mutate: createRoom, isPending: isCreating } = useCreateChatRoom(
    selectedRoom ? String(selectedRoom.id) : ''
  )

  // 뒤로 가기 방지
  useGoBack()

  useEffect(() => {
    if (location.state?.showOnboardingModal) {
      setShowCompleteModal(true)
      history.replaceState({}, '')
    }
  }, [location])

  const handleRoomClick = (id: number, roomName: string) => {
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

  return (
    <div>
      <Banner userName={userName} />

      <div className="max-w-md mx-auto px-5 pb-16 mt-[30px]">
        <div className="text-title mb-4 text-[20px] border-b border-gray-80 pb-2">
          Chats
        </div>

        <ChatRoomList
          isLoading={isLoading}
          chatMsg={chatMsg}
          onRoomClick={handleRoomClick}
        />
      </div>

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

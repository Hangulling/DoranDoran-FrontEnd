import { useLocation, useNavigate } from 'react-router-dom'
import { useGoBack } from '../hooks/useGoBack'
import { useFetchUser } from '../hooks/useFetchUser'
import { useFetchChatRooms } from '../hooks/useFetchChatRooms'
import Banner from '../components/main/Banner'
import ChatRoomList from '../components/main/ChatRoomList'
import { useEffect, useState } from 'react'
import CommonModal from '../components/common/CommonModal'

const MainPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const { userName, userId } = useFetchUser()
  const { chatMsg, isLoading } = useFetchChatRooms(userId)

  // 뒤로 가기 방지
  useGoBack()

  useEffect(() => {
    if (location.state?.showOnboardingModal) {
      setShowCompleteModal(true)
      history.replaceState({}, '')
    }
  }, [location])

  const handleRoomClick = (id: number, roomName: string) => {
    navigate(`/closeness/${id}`, {
      state: { roomRouteId: id, concept: roomName },
    })
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

        <p className="mt-45 text-center text-gray-300 text-[12px]">
          Copyright 2025. dorandoran all rights reserved.
        </p>
      </div>
      {/* 온보딩 완료 모달 */}
      {showCompleteModal && (
        <CommonModal
          open={showCompleteModal}
          title="Welcome! You’re all set"
          description="Ready to start practicing Korean with chat?"
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

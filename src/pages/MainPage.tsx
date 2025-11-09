import { useNavigate } from 'react-router-dom'
import { useGoBack } from '../hooks/useGoBack'
import { useFetchUser } from '../hooks/useFetchUser'
import { useFetchChatRooms } from '../hooks/useFetchChatRooms'
import ReactGA from 'react-ga4'
import Banner from '../components/main/Banner'
import ChatRoomList from '../components/main/ChatRoomList'
import { GA_ENABLED, IS_PROD } from '../constants/env'

const MainPage = () => {
  const navigate = useNavigate()
  const { userName, userId } = useFetchUser()
  const { chatMsg, isLoading } = useFetchChatRooms(userId)

  // 뒤로 가기 방지
  useGoBack()

  const handleRoomClick = (id: number, roomName: string) => {
    if (IS_PROD && GA_ENABLED) {
      ReactGA.event('enter_chatroom', {
        user_id: userId,
        concept: roomName, // 'friend', 'honey' 등
      })
    }

    navigate(`/closeness/${id}`, {
      state: { roomRouteId: id, concept: roomName },
    })
  }

  return (
    <div>
      <Banner userName={userName} />

      <div className="max-w-md mx-auto px-5 pb-16 mt-[30px]">
        <div className="text-title mb-4 text-[20px] border-b border-gray-80 pb-2">Chats</div>

        <ChatRoomList isLoading={isLoading} chatMsg={chatMsg} onRoomClick={handleRoomClick} />

        <p className="mt-45 text-center text-gray-300 text-[12px]">
          Copyright 2025. dorandoran all rights reserved.
        </p>
      </div>
    </div>
  )
}

export default MainPage

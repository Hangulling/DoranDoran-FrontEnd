import Character from '../assets/main/mainCharacter.svg'
import { useNavigate } from 'react-router-dom'
import { chatRooms } from '../mocks/db/chat'
import { useEffect, useState } from 'react'
import { useUserStore } from '../stores/useUserStore'
import { useGoBack } from '../hooks/useGoBack'
import { chatRoomList } from '../api'
import { getDaysDiff } from '../utils/getDaysDiff'

interface ChatRoomWithMessage {
  roomRouteId: number
  roomName: string
  concept: string
  avatar: string
  message: string
}

const MainPage = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [chatMsg, setChatMsg] = useState<ChatRoomWithMessage[]>([])
  const setStoreName = useUserStore(state => state.setName)
  const setStoreId = useUserStore(state => state.setId)

  // 뒤로 가기 방지
  useGoBack()

  // 사용자 정보 GET, store 저장
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(profile => {
        setUserName(profile.data.name)
        setStoreName(profile.data.name)
        setUserId(profile.data.id)
        setStoreId(profile.data.id)
      })
      .catch(err => {
        console.error('사용자 정보 로드 실패:', err)
        //   navigate('/error', { state: { from: '/main' } })
      })
  }, [setStoreName, setStoreId, navigate])

  // 상태 메세지 설정
  useEffect(() => {
    if (!userId) return

    const statusMessage = (diffDays: number | undefined): string => {
      if (diffDays === undefined) return '반가워요! 우리 대화를 시작해 볼까요?'
      if (diffDays === 0) return '우리 더 대화해 볼까요?'
      if (diffDays === 2) return '왜 이제 왔어요~ 우리 수다 떨어요!'
      return '오랜만에 함께 이야기 나눠요!'
    }

    // chatRoomList 호출 시 반환 타입은 ChatRoomListParams
    chatRoomList(0, 20, userId)
      .then(response => {
        // response.content는 ApiChatRoom[] 타입
        const mergedRooms = chatRooms.map(mockRoom => {
          const serverRoom = response.content.find(r => r.concept === mockRoom.roomName)
          const diffDays = serverRoom?.lastMessageAt
            ? getDaysDiff(serverRoom.lastMessageAt)
            : undefined
          const message = statusMessage(diffDays)

          return {
            ...mockRoom,
            message,
            concept: mockRoom.roomName,
          }
        })
        setChatMsg(mergedRooms)
      })
      .catch(err => {
        console.error('채팅방 목록 로드 실패:', err)
        //  navigate('/error', { state: { from: '/main' } })
      })
  }, [userId, navigate])

  const handleRoomClick = (id: number, roomName: string) => {
    navigate(`/closeness/${id}`, {
      state: { roomRouteId: id, concept: roomName },
    })
  }

  return (
    <div>
      {/* 상단 환영 메시지 */}
      <div className="w-full bg-[#9ADAD5] h-[99px] relative max-w-md mx-auto overflow-hidden">
        <div className="absolute top-[14px] left-[20px]">
          <div className="text-[14px]">Welcome,</div>
          <div className="text-[16px]">
            <span className="text-title">{userName}</span>
            <span> :)</span>
          </div>
          <p className="mt-[8px] text-[12px] text-gray-600">Learn Korean expressions by chat!</p>
        </div>
        <img src={Character} alt="캐릭터 이미지" className="absolute top-[23px] right-[20.16px]" />
      </div>

      <div className="max-w-md mx-auto px-5 pb-16 mt-[30px]">
        {/* 채팅방 목록 */}
        <div className="text-title mb-4 text-[20px] border-b border-gray-80 pb-2">Chats</div>
        <div className="flex flex-col gap-[10px]">
          {chatMsg.map(room => (
            <button
              key={room.roomRouteId}
              onClick={() => handleRoomClick(room.roomRouteId, room.roomName)}
              className="flex items-center gap-4 w-full h-21 bg-white rounded-lg shadow-[1px_1px_10px_rgba(0,0,0,0.1)] py-3 px-4 active:bg-green-80"
            >
              <div className="w-13 h-13 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                <img src={room.avatar} alt={room.roomName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-title text-[16px]">{room.roomName}</span>
                <span className="text-gray-600 text-[14px]">{room.message}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-45 text-center text-gray-300 text-[12px]">
          Copyright 2025. dorandoran all rights reserved.
        </p>
      </div>
    </div>
  )
}

export default MainPage

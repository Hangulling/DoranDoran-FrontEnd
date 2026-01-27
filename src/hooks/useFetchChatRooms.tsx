import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLastInteractions } from '../api'
import { MAIN_DATA } from '../constants/mainData'
import { getDaysDiff } from '../utils/getDaysDiff'
import { getChatbotValueById } from '../utils/chatbotMap'
import type { ChatRoomWithMessage } from '../types/main'

const getStatusMessage = (diffDays: number | undefined): string => {
  if (diffDays === undefined) return 'Start your first chat now'
  if (diffDays <= 0) return 'Talk again with a new topic'
  return 'It’s been a while! Let’s chat again'
}

export const useFetchChatRooms = (userId: string) => {
  const navigate = useNavigate()

  const {
    data: chatMsg = [],
    isLoading,
    isError,
  } = useQuery<ChatRoomWithMessage[]>({
    queryKey: ['chatRooms', userId],
    queryFn: async () => {
      const response = await getLastInteractions(userId)

      const mergedRooms = MAIN_DATA.map(mockRoom => {
        const serverRoom = response.find(r => {
          const serverValue = getChatbotValueById(r.chatbotId)
          const mockValue = String(mockRoom.roomRouteId)
          return serverValue === mockValue
        })

        const diffDays = serverRoom?.lastInteractionAt
          ? getDaysDiff(serverRoom.lastInteractionAt)
          : undefined

        const message = getStatusMessage(diffDays)

        return {
          ...mockRoom,
          message,
          concept: mockRoom.roomName,
        }
      })

      return mergedRooms as ChatRoomWithMessage[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1분간 캐시 유지
  })

  // 에러 처리
  useEffect(() => {
    if (isError) {
      console.error('채팅방 목록 로드 실패')
      navigate('/error', { state: { from: '/main' } })
    }
  }, [isError, navigate])

  return { chatMsg, isLoading }
}

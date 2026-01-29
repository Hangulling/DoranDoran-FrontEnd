import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLastInteractions } from '../api'
import { MAIN_DATA } from '../constants/mainData'
import { getDaysDiff } from '../utils/getDaysDiff'
import { getChatbotValueById } from '../utils/chatbotMap'
import type { ChatRoomWithMessage } from '../types/main'
import useUnreadStore from '../stores/useUnreadStore'

const getStatusMessage = (diffDays: number | undefined): string => {
  if (diffDays === undefined) return 'Start your first chat now'
  if (diffDays <= 0) return 'Talk again with a new topic'
  return 'It’s been a while! Let’s chat again'
}

export const useFetchChatRooms = (userId: string) => {
  const navigate = useNavigate()
  const { unreadMap } = useUnreadStore()

  const {
    data: rawChatMsg = [],
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
          // 푸시 알림의 UUID와 매칭
          chatroomId: serverRoom?.lastRoomId || null,
        }
      })

      return mergedRooms as ChatRoomWithMessage[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1분간 캐시 유지
  })

  const chatMsg = useMemo(() => {
    return rawChatMsg.map(room => ({
      ...room,
      // 안읽음이면 점 표시
      hasNewMessage: room.chatroomId ? !!unreadMap[room.chatroomId] : false,
    }))
  }, [rawChatMsg, unreadMap])

  // 에러 처리
  useEffect(() => {
    if (isError) {
      console.error('채팅방 목록 로드 실패')
      navigate('/error', { state: { from: '/main' } })
    }
  }, [isError, navigate])

  return { chatMsg, isLoading }
}

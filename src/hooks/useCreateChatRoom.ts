import { useMutation } from '@tanstack/react-query'
import { createChatRoom } from '../api'
import useRoomIdStore from '../stores/useRoomIdStore'
import useClosenessStore from '../stores/useClosenessStore'

interface CreateChatRoomParams {
  userId: string
  concept: string
  chatbotId: string
  intimacyLevel: number
}

export const useCreateChatRoom = (routeId: string) => {
  const { addRoomMapping, setChatbotId } = useRoomIdStore.getState()
  const { setCloseness } = useClosenessStore.getState()

  return useMutation({
    mutationFn: (params: CreateChatRoomParams) => createChatRoom(params),

    onSuccess: (newRoom, variables) => {
      // set_intimacy_level
      addRoomMapping(routeId, newRoom.id)
      setChatbotId(routeId, variables.chatbotId)
      setCloseness(routeId, variables.intimacyLevel)
    },

    onError: error => {
      console.error('채팅방 생성 실패:', error)
    },
  })
}

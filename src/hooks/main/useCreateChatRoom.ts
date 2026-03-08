import { useMutation } from '@tanstack/react-query'
import { createChatRoom } from '../../api'
import useRoomIdStore from '../../stores/useRoomIdStore'
import useClosenessStore from '../../stores/useClosenessStore'
import showToast from '../../components/common/CommonToast'
import { sendGAEvent } from '../../utils/ga'

interface CreateChatRoomParams {
  userId: string
  concept: string
  chatbotId: string
  intimacyLevel: number
  topic?: string
}

export const useCreateChatRoom = (routeId: string) => {
  const { addRoomMapping, setChatbotId } = useRoomIdStore.getState()
  const { setCloseness } = useClosenessStore.getState()

  return useMutation({
    mutationFn: (params: CreateChatRoomParams) => createChatRoom(params),

    onSuccess: (newRoom, variables) => {
      // 상태 업데이트
      addRoomMapping(routeId, newRoom.id)
      setChatbotId(routeId, variables.chatbotId)
      setCloseness(routeId, variables.intimacyLevel)

      // GA_set_intimacy_level
      sendGAEvent('set_intimacy_level', {
        chatroom_id: newRoom.id,
        concept: variables.concept,
        intimacy_level: variables.intimacyLevel,
      })
    },

    onError: error => {
      showToast({
        message: 'Oops! The chat didn’t start. Try again!',
        iconType: 'error',
      })
      console.error('채팅방 생성 실패:', error)
    },
  })
}

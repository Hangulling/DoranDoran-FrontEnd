import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createChatRoom } from '../api' // (API 함수 경로는 맞게 수정)
import useRoomIdStore from '../stores/useRoomIdStore'
import useClosenessStore from '../stores/useClosenessStore'
import ReactGA from 'react-ga4'
import { GA_ENABLED, IS_PROD } from '../constants/env'

// createChatRoom의 인자 타입 (API 정의에 따라 수정 필요)
interface CreateChatRoomParams {
  userId: string
  concept: string
  chatbotId: string
  intimacyLevel: number
}

export const useCreateChatRoom = (routeId: string) => {
  const navigate = useNavigate()
  const { addRoomMapping, setChatbotId } = useRoomIdStore.getState()
  const { setCloseness } = useClosenessStore.getState()

  // useMutation 훅 사용
  return useMutation({
    // 1. 뮤테이션 함수 (API 호출)
    mutationFn: (params: CreateChatRoomParams) => createChatRoom(params),

    // 2. API 호출 성공 시
    onSuccess: (newRoom, variables) => {
      // (variables는 mutationFn에 전달된 params입니다)

      // GA 이벤트 전송
      if (IS_PROD && GA_ENABLED) {
        ReactGA.event('set_intimacy_level', {
          chatroom_id: newRoom.id,
          concept: variables.concept,
          intimacy_level: variables.intimacyLevel,
        })
      }

      // Zustand 스토어 업데이트
      addRoomMapping(routeId, newRoom.id)
      setChatbotId(routeId, variables.chatbotId)
      setCloseness(routeId, variables.intimacyLevel)

      // 성공 시 페이지 이동 (애니메이션은 컴포넌트에서 처리)
    },

    // 3. API 호출 실패 시
    onError: error => {
      console.error('채팅방 생성 실패:', error)
      navigate('/error', { state: { from: `/closeness/${routeId}` } })
    },
  })
}

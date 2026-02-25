import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { postStartGreeting } from '../../api'
import { getRouteIdByConcept } from '../../utils/conceptMap'
import type { AxiosError } from 'axios'

interface GreetingParams {
  chatroomId: string
  intimacyLevel: number
  startMessage?: string
  concept?: string
}

interface ApiError {
  success?: boolean
  error?: string
}

export const useStartGreeting = (
  onSuccessCallback?: () => void,
  onErrorCallback?: () => void
) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      chatroomId,
      intimacyLevel,
      startMessage,
    }: GreetingParams) => {
      return postStartGreeting(chatroomId, { intimacyLevel, startMessage })
    },
    onSuccess: (_, variables) => {
      onSuccessCallback?.()
      const targetRouteId = getRouteIdByConcept(variables.concept || 'friend')

      if (variables.chatroomId) {
        navigate(`/chat/${variables.chatroomId}`, {
          state: {
            roomRouteId: targetRouteId,
            concept: variables.concept,
            closeness: variables.intimacyLevel,
          },
        })
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error('Greeting Error:', error.response?.data)
      onErrorCallback?.()
    },
  })
}

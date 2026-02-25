import { useMutation } from '@tanstack/react-query'
import { getDeepLinkChatroom } from '../../api'

interface DeepLinkParams {
  chatbotId: string
  topic?: string
  concept?: string
  userId?: string
}

export const useDeepLinkChatRoom = () => {
  return useMutation({
    mutationFn: (params: DeepLinkParams) => getDeepLinkChatroom(params),
  })
}

import api from './api'
import { SUPPORT_ENDPOINTS } from './endpoints'

export interface SupportPayload {
  type: 'INQUIRY' | 'REPORT'
  category: string
  content?: string
  replyRequested?: boolean
  replyEmail?: string
  chatroomId?: string
  messageId?: string
  messageContent?: string
  aiResponseSnapshot?: string
}

export interface SupportResponse {
  id: number
  createdAt: string
}

// 문의/신고 생성
export const createSupport = async (
  payload: SupportPayload,
  headers?: {
    userId: string
    email?: string
    name?: string
  }
) => {
  const config = {
    headers: {
      'X-User-Id': headers?.userId,
      ...(headers?.email && { 'X-User-Email': headers.email }),
      ...(headers?.name && { 'X-User-Name': headers.name }),
    },
  }
  const response = await api.post(SUPPORT_ENDPOINTS.CREATE, payload, config)
  return response.data
}

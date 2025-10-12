import type { ChatRoom, Message } from '../types/chat'
import api from './api'
import { CHAT_ENDPOINTS } from './endpoints'

// 채팅방 생성
export async function createChatroom(data: {
  userId: string
  chatbotId: string
  name: string
}): Promise<ChatRoom> {
  const response = await api.post(CHAT_ENDPOINTS.CREATE, data)
  return response.data
}

// 채팅방 조회
export async function getChatroom(params: {
  userId?: string
  page?: number
  size?: number
}): Promise<ChatRoom> {
  const response = await api.get(CHAT_ENDPOINTS.CREATE, { params })
  return response.data
}

// 메시지 목록 조회
export async function getMessages(
  chatroomId: string,
  params: {
    userId?: string
    page?: number
    size?: number
  }
): Promise<Message[]> {
  const response = await api.get(CHAT_ENDPOINTS.MESSAGES_LIST(chatroomId), { params })
  return response.data
}

// 메시지 전송
export async function sendMessage(
  chatroomId: string,
  data: {
    content: string
    contentType: string
    senderType: string
  }
): Promise<Message> {
  const response = await api.post(CHAT_ENDPOINTS.SEND_MESSAGE(chatroomId), data)
  return response.data
}

// SSE
export function getMessageStream(chatroomId: string, userId?: string): EventSource {
  // SSE 전용 URL 생성
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = new URL(CHAT_ENDPOINTS.MESSAGE_STREAM(chatroomId), baseUrl)

  if (userId) {
    url.searchParams.append('userId', userId)
  }

  return new EventSource(url.toString(), {
    withCredentials: true,
  })
}

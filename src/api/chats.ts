import type {
  ApiChatRoom,
  ApiMessage,
  ChatroomListParams,
  CreateChatroomPayload,
  SendMessagePayload,
} from '../types/chat'
import api from './api'
import { CHAT_ENDPOINTS } from './endpoints'

// 채팅방 생성(또는 기존 채팅방 조회)
export async function createChatRoom(data: CreateChatroomPayload): Promise<ApiChatRoom> {
  const res = await api.post(CHAT_ENDPOINTS.CREATE, data)
  return res.data
}

// 채팅방(목록) 조회
export async function getChatRooms(params: ChatroomListParams = {}): Promise<ApiChatRoom[]> {
  const res = await api.get(CHAT_ENDPOINTS.CREATE, { params })
  return res.data
}

// 메시지 목록 조회
export async function getMessages(
  chatroomId: string,
  params: {
    userId?: string
    page?: number
    size?: number
  } = {}
): Promise<ApiMessage[]> {
  const res = await api.get(CHAT_ENDPOINTS.MESSAGES_LIST(chatroomId), { params })
  return res.data
}

// 메시지 전송
export async function sendMessage(
  chatroomId: string,
  data: SendMessagePayload
): Promise<ApiMessage> {
  const res = await api.post(CHAT_ENDPOINTS.SEND_MESSAGE(chatroomId), data)
  return res.data
}

// SSE(실시간 메시지 스트림)
export function getMessageStream(chatroomId: string, userId?: string): EventSource {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string
  const url = new URL(CHAT_ENDPOINTS.MESSAGE_STREAM(chatroomId), baseUrl)

  if (userId) {
    url.searchParams.append('userId', userId)
  }

  return new EventSource(url.toString())
}

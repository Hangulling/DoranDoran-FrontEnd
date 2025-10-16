import type {
  ApiChatRoom,
  ApiMessage,
  ChatRoomListParams,
  CreateChatroomPayload,
  SendMessagePayload,
  UpdateIntimacyPayload,
} from '../types/chat'
import { chatApi } from './api'
import { CHAT_ENDPOINTS } from './endpoints'

// 채팅방 생성(또는 기존 채팅방 조회)
export async function createChatRoom(data: CreateChatroomPayload): Promise<ApiChatRoom> {
  const res = await chatApi.post(CHAT_ENDPOINTS.CREATE, data)
  return res.data
}

// 채팅방(목록) 조회
export async function chatRoomList(
  page?: number,
  size?: number,
  userId?: string
): Promise<ChatRoomListParams> {
  const url = CHAT_ENDPOINTS.CHATROOM_LIST(userId, page ?? 0, size ?? 20)
  const response = await chatApi.get(url)
  return response.data
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
  const res = await chatApi.get(CHAT_ENDPOINTS.MESSAGES_LIST(chatroomId), { params })
  return res.data
}

// 메시지 전송
export async function sendMessage(
  chatroomId: string,
  data: SendMessagePayload
): Promise<ApiMessage> {
  const res = await chatApi.post(CHAT_ENDPOINTS.SEND_MESSAGE(chatroomId), data)
  return res.data
}

// 친밀도 업데이트
export async function updateIntimacy(
  chatroomId: string,
  payload: UpdateIntimacyPayload
): Promise<ApiChatRoom> {
  const response = await chatApi.patch(CHAT_ENDPOINTS.UPDATE_INTIMACY_LEVEL(chatroomId), payload)
  return response.data
}

// 채팅방 나가기 (소프트 딜리트)
export async function leaveChatroom(chatroomId: string): Promise<void> {
  await chatApi.post(CHAT_ENDPOINTS.LEAVE_CHATROOM(chatroomId))
}

// WebSocket 채팅 연결 -> 확인하기
export function getWebSocketUrl(chatroomId: string, userId?: string): string {
  return CHAT_ENDPOINTS.WEBSOCKET_CHAT(chatroomId, userId)
}

// SSE(실시간 메시지 스트림)
export function getSseUrl(chatroomId: string, userId?: string): string {
  return CHAT_ENDPOINTS.MESSAGE_STREAM(chatroomId, userId)
}

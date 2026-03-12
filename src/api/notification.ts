import api from './api'
import { NOTIFICATION_ENDPOINTS } from './endpoints'

export interface UnreadNotification {
  id: number
  pushType: 'CHATROOM_CREATE' | 'NEW_MESSAGE'
  chatbotId: string | null
  chatroomId: string | null
  messageId: string | null
  concept: string
  topic: string
  startMessage: string
  title: string
  body: string
  sentAt: string
}

export interface UnreadNotificationResponse {
  content: UnreadNotification[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  unreadCount: number
}

// FCM 토큰 등록
export const registerFcmToken = async (
  token: string,
  platform: 'android' | 'ios' | 'web'
) => {
  const response = await api.post(NOTIFICATION_ENDPOINTS.REGISTER, {
    token,
    platform,
  })
  return response.data
}

// 안읽음 푸시 조회
export const getUnreadNotifications = async (
  page: number = 0,
  size: number = 20
) => {
  const response = await api.get<{
    success: boolean
    data: UnreadNotificationResponse
  }>(NOTIFICATION_ENDPOINTS.UNREAD_LIST(page, size))
  return response.data.data
}

// 안읽음 푸시 일괄/전체 읽음 처리
export const markNotificationsAsRead = async (ids?: number[] | null) => {
  const response = await api.post(NOTIFICATION_ENDPOINTS.MARK_READ_BULK, {
    ids,
  })
  return response.data
}

// 안읽음 푸시 단건 읽음 처리
export const markSingleNotificationAsRead = async (id: number) => {
  const response = await api.post(NOTIFICATION_ENDPOINTS.MARK_READ_SINGLE(id))
  return response.data
}

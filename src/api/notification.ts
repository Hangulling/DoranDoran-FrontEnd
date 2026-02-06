import api from './api'
import { NOTIFICATION_ENDPOINTS } from './endpoints'

export interface NotificationLog {
  deeplink: string
  universalLink: string
  chatroomId: string
  messageId: string
  startMessage: string
  sentAt: string
}

export interface PushNotificationRequest {
  userId: string
  title?: string
  body?: string
  chatroomId?: string
  messageId?: string
}

export interface TestChatroomPushRequest {
  userId: string
  chatbotId: string
  topic: string
  concept?: string
  intimacyLevel?: number
  title?: string
  body?: string
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

// 푸시 발송 (테스트/내부용)
export const sendPushNotification = async (payload: {
  userId: string
  title: string
  body: string
  chatroomId: string
  messageId: string
}) => {
  const response = await api.post(NOTIFICATION_ENDPOINTS.SEND, payload)
  return response.data
}

// 푸시 발송 로그 조회
export const getNotificationLogs = async (
  userId: string,
  page: number = 0,
  size: number = 20
) => {
  const response = await api.get<NotificationLog[]>(
    NOTIFICATION_ENDPOINTS.LOGS(userId),
    {
      params: { page, size },
    }
  )
  return response.data
}

// 테스트 푸시 발송
export const sendTestPush = async (data: PushNotificationRequest) => {
  const response = await api.post(NOTIFICATION_ENDPOINTS.TEST_PUSH, data)
  return response.data
}

// 테스트 채팅방 딥링크 푸시 발송
export const sendTestChatroomPush = async (data: TestChatroomPushRequest) => {
  const response = await api.post(
    NOTIFICATION_ENDPOINTS.TEST_CHATROOM_PUSH,
    data
  )
  return response.data
}

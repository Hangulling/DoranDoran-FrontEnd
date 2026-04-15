import { useEffect } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import { FCM } from '@capacitor-community/fcm'
import type {
  Token,
  ActionPerformed,
  PushNotificationSchema,
} from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { markNotificationsAsRead, registerFcmToken } from '../api/notification'
import useUnreadStore, { DAILY_UNREAD_KEY } from '../stores/useUnreadStore'
import { useUserStore } from '../stores/useUserStore'

const usePushNotification = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setUnread, clearAllUnread } = useUnreadStore() // 확인 유무
  const { id: userId } = useUserStore()

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) {
      return
    }

    const initPush = async () => {
      // 현재 권한 상태 확인
      const permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
      }
    }
    initPush()

    // 토큰 발급 성공 시 백엔드에 등록
    const registerListener = PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        try {
          let fcmToken = token.value
          if (Capacitor.getPlatform() === 'ios') {
            // iOS일 경우 APNs 토큰을 FCM 토큰으로 교체
            const res = await FCM.getToken()
            fcmToken = res.token
          }
          console.log('fcm 토큰:', fcmToken)

          const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
          await registerFcmToken(fcmToken, platform)
        } catch (error) {
          console.error('FCM 토큰 발급 실패:', error)
        }
      }
    )

    // 토큰 발급 실패
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error: unknown) => {
        console.error('FCM 토큰 발급 실패: ', error)
      }
    )

    // 앱이 켜져있을 때 푸시 수신
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        const data = notification.data
        console.log('Foreground Push received:', JSON.stringify(data, null, 2))

        if (data?.topic || data?.concept) {
          setUnread(DAILY_UNREAD_KEY, true, data.startMessage, data.concept)
        }

        // 메시지 내용 업데이트
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
      }
    )

    // 푸시 알림 클릭 시 동작
    const actionPerformedListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const data = notification.notification.data
        console.log('Push Payload:', JSON.stringify(data, null, 2))

        clearAllUnread()

        // 읽음 처리
        try {
          await markNotificationsAsRead(null)
          console.log('읽음 처리 성공')
        } catch (error) {
          console.error('푸시 읽음 처리 실패 (서버 에러):', error)
        }

        if (data.topic) {
          navigate('/', {
            state: {
              fromPush: true,
              targetChatbotId: data.chatbotId,
              targetTopic: data.topic,
              targetConcept: data.concept || 'FRIEND',
              startMessage: data.startMessage,
            },
          })
        }
      }
    )

    return () => {
      registerListener.then(l => l.remove())
      errorListener.then(l => l.remove())
      receivedListener.then(l => l.remove())
      actionPerformedListener.then(l => l.remove())
    }
  }, [clearAllUnread, navigate, queryClient, setUnread, userId])
}

export default usePushNotification

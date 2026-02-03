import { useEffect } from 'react'
import { PushNotifications } from '@capacitor/push-notifications'
import type {
  Token,
  ActionPerformed,
  PushNotificationSchema,
} from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { registerFcmToken } from '../api/notification'
import useUnreadStore from '../stores/useUnreadStore'

const usePushNotification = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setUnread } = useUnreadStore() // 확인 유무

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
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
          const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'

          await registerFcmToken(token.value, platform)
          console.log('FCM Token registered:', token.value)
        } catch (error) {
          console.error('Failed to register FCM token to server:', error)
        }
      }
    )

    // 토큰 발급 실패
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error: unknown) => {
        console.error('Registration error: ', error)
      }
    )

    // 앱이 켜져있을 때 푸시 수신
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Foreground Push received:', notification)
        const data = notification.data
        if (data?.chatroomId) {
          // 안 읽음 상태
          setUnread(data.chatroomId, true)
        }

        // 메시지 내용 업데이트
        queryClient.invalidateQueries({ queryKey: ['chatRooms'] })
      }
    )

    // 푸시 알림 클릭 시 동작
    const actionPerformedListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        const data = notification.notification.data

        const { chatroomId, startMessage } = data

        if (chatroomId) {
          setUnread(chatroomId, false)
          navigate('/', {
            state: {
              fromPush: true,
              targetChatroomId: chatroomId, // UUID
              startMessage: startMessage,
            },
          })
        }
      }
    )

    // 클린업
    return () => {
      registerListener.then(l => l.remove())
      errorListener.then(l => l.remove())
      receivedListener.then(l => l.remove())
      actionPerformedListener.then(l => l.remove())
    }
  }, [navigate, queryClient, setUnread])
}

export default usePushNotification

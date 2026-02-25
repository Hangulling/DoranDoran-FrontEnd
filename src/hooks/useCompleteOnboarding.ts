import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { updateOnboarding } from '../api'
import type { OnboardingPayload } from '../types/user'

export const useCompleteOnboarding = (userId: string | null) => {
  const navigate = useNavigate()

  const registerPush = async () => {
    if (!Capacitor.isNativePlatform()) return
    try {
      let permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions()
      }
      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
      }
    } catch (e) {
      console.error('Push registration failed during onboarding', e)
    }
  }

  const completeOnboarding = async (
    payload: OnboardingPayload,
    skip: boolean = false
  ) => {
    if (!userId) {
      console.error('User ID를 찾을 수 없습니다.')
      navigate('/', { replace: true })
      return
    }

    try {
      const finalPayload = { ...payload }
      if (skip || finalPayload.pushEnabled === undefined) {
        finalPayload.pushEnabled = false
      }

      await updateOnboarding(userId, finalPayload)

      if (finalPayload.pushEnabled) {
        await registerPush()
      }

      navigate('/', {
        replace: true,
        state: { showOnboardingModal: true },
      })
    } catch (error) {
      console.error('온보딩 완료 처리 실패', error)
      navigate('/', { replace: true })
    }
  }

  return { completeOnboarding }
}

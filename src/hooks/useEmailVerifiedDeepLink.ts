import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'
import { parseEmailVerifiedUrl } from '../utils/emailVerifiedDeepLink'
import { useSignupFormStore } from '../stores/useSignupStore'

export const useEmailVerifiedDeepLink = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = App.addListener('appUrlOpen', ev => {
      const payload = parseEmailVerifiedUrl(ev.url)
      if (!payload) return

      useSignupFormStore.getState().setMany({
        email: payload.email,
        firstName: payload.firstName ?? '',
        lastName: payload.lastName ?? '',
        emailVerified: payload.verified,
        verifiedEmail: payload.verified ? payload.email : null,
      })

      navigate('/signup/email', { replace: true })
    })

    return () => {
      listenerPromise.then(l => l.remove())
    }
  }, [navigate])
}

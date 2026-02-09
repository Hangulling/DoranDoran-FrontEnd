import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export const useEmailVerifiedDeepLink = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listener = App.addListener('appUrlOpen', ev => {
      alert(`appUrlOpen fired\nurl = ${ev.url}`)
    })

    return () => {
      listener.then(l => l.remove())
    }
  }, [])
}

import { useMemo } from 'react'
import { Capacitor } from '@capacitor/core'
import { isNativeApp } from '../utils/isNativeApp'
import { useKeyboard } from './useKeyboard'

export function useIOSKeyboard() {
  const isIOSApp = useMemo(
    () => isNativeApp() && Capacitor.getPlatform() === 'ios',
    []
  )
  const keyboardHeight = useKeyboard(isIOSApp)

  return { isIOSApp, keyboardHeight }
}

import { useEffect, useState } from 'react'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

export function useKeyboard(enable: boolean) {
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let handles: PluginListenerHandle[] = []

    const setup = async () => {
      const h1 = await Keyboard.addListener('keyboardWillShow', info => {
        setHeight(info.keyboardHeight ?? 0)
      })
      const h2 = await Keyboard.addListener('keyboardDidShow', info => {
        setHeight(info.keyboardHeight ?? 0)
      })
      const h3 = await Keyboard.addListener('keyboardWillHide', () => {
        setHeight(0)
      })
      const h4 = await Keyboard.addListener('keyboardDidHide', () => {
        setHeight(0)
      })

      handles = [h1, h2, h3, h4]
    }

    setup()

    return () => {
      handles.forEach(h => h.remove())
      handles = []
    }
  }, [enable])

  return height
}

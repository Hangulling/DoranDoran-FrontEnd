import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useNavigate } from 'react-router-dom'
import type { PluginListenerHandle } from '@capacitor/core'

export interface BackButtonHandler {
  priority: number
  condition: boolean
  callback: () => void
}

export const useBackButton = (handlers: BackButtonHandler[]) => {
  const navigate = useNavigate()

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null

    const setupListener = async () => {
      await App.removeAllListeners()

      listenerHandle = await App.addListener('backButton', () => {
        const activeHandlers = handlers.filter(h => h.condition)

        activeHandlers.sort((a, b) => b.priority - a.priority)

        if (activeHandlers.length > 0) {
          activeHandlers[0].callback()
        } else {
          navigate(-1)
        }
      })
    }

    setupListener()

    return () => {
      if (listenerHandle) {
        listenerHandle.remove()
      }
    }
  }, [handlers, navigate])
}

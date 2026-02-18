import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { useNavigate, useLocation } from 'react-router-dom'

export interface BackButtonHandler {
  priority: number
  condition: boolean
  callback: () => void
}

type HandlerSet = {
  id: string
  handlers: BackButtonHandler[]
}

// 전역 상태 관리
let handlerSets: HandlerSet[] = []
let isListening = false
let navigateRef: ((delta: number) => void) | null = null
let locationPathRef: string = '/'

// 앱 종료 경로
const EXIT_ROUTES = ['/', '/login']

export const useBackButton = (handlers: BackButtonHandler[]) => {
  const navigate = useNavigate()
  const location = useLocation()
  const id = useRef(Math.random().toString(36).substring(7)).current

  useEffect(() => {
    navigateRef = navigate
    locationPathRef = location.pathname
  }, [navigate, location])

  useEffect(() => {
    const updateHandlers = () => {
      const existingIndex = handlerSets.findIndex(set => set.id === id)
      if (existingIndex >= 0) {
        handlerSets[existingIndex].handlers = handlers
      } else {
        handlerSets.push({ id, handlers })
      }
    }

    updateHandlers()

    if (!isListening) {
      isListening = true

      App.removeAllListeners().then(() => {
        App.addListener('backButton', () => {
          const allHandlers = handlerSets.flatMap(set => set.handlers)
          const activeHandlers = allHandlers.filter(h => h.condition)
          activeHandlers.sort((a, b) => b.priority - a.priority)

          if (activeHandlers.length > 0) {
            activeHandlers[0].callback()
          } else {
            if (EXIT_ROUTES.includes(locationPathRef)) {
              App.exitApp()
            } else {
              if (navigateRef) {
                navigateRef(-1)
              }
            }
          }
        })
      })
    }

    return () => {
      handlerSets = handlerSets.filter(set => set.id !== id)
    }
  }, [handlers, id])
}

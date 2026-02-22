import { useEffect, useRef, useState } from 'react'
import { App } from '@capacitor/app'
import { getWebSocketUrl } from '../../api'

export function useWebSocket<T>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey?: number,
  enabled: boolean = true
) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const onEventReceivedRef = useRef(onEventReceived)
  const onErrorRef = useRef(onError)
  const onOpenRef = useRef(onOpen)

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived
    onErrorRef.current = onError
    onOpenRef.current = onOpen
  }, [onEventReceived, onError, onOpen])

  const retryCountRef = useRef(0)
  const maxRetries = 5

  useEffect(() => {
    if (!enabled || !chatroomId) {
      setIsLoading(false)
      return
    }

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isUnmounted = false
    let isAppBackground = false

    const connect = () => {
      // 언마운트되었거나 앱이 백그라운드 상태라면 연결 시도 중단
      if (isUnmounted || isAppBackground) return

      cleanup() // 기존 연결 및 타이머 초기화

      setIsLoading(true)
      setError(null)

      try {
        const url = getWebSocketUrl(chatroomId, userId, accessToken)
        ws = new WebSocket(url)

        ws.onopen = () => {
          console.log('[WebSocket] Connected')
          setIsLoading(false)
          retryCountRef.current = 0 // 재연결 횟수 리셋
          onOpenRef.current?.()
        }

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data)
            if (message && message.event) {
              onEventReceivedRef.current?.(message.event, message.data)
            }
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e)
          }
        }

        ws.onerror = event => {
          console.error('[WebSocket] Error:', event)
          setError(new Error('WebSocket connection error'))
          onErrorRef.current?.(event)
        }

        ws.onclose = event => {
          console.log('[WebSocket] Closed:', event.code, event.reason)

          // 앱이 동작 중일 때만 재연결 스케줄링
          if (!isUnmounted && !isAppBackground && event.code !== 1000) {
            scheduleReconnect()
          }
        }
      } catch (err) {
        console.error('[WebSocket] Setup error:', err)
        setError(
          err instanceof Error ? err : new Error('WebSocket setup error')
        )
        scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      if (isUnmounted || isAppBackground) return

      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(3000 * Math.pow(2, retryCountRef.current), 30000)
        console.log(
          `[WebSocket] Reconnecting in ${delay}ms... (Attempt ${retryCountRef.current + 1}/${maxRetries})`
        )

        reconnectTimeout = setTimeout(() => {
          retryCountRef.current += 1
          connect()
        }, delay)
      } else {
        console.log('[WebSocket] Max retries reached. Stopping reconnection.')
        setError(new Error('최대 재연결 횟수를 초과했습니다.'))
        setIsLoading(false)
      }
    }

    const cleanup = () => {
      if (ws) {
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(1000, 'Client closed connection')
        }
        ws = null
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
    }

    // 최초 연결
    connect()

    // 백그라운드/포그라운드
    const appStateListener = App.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (isActive) {
          // 포그라운드 복귀
          isAppBackground = false
          retryCountRef.current = 0
          connect()
        } else {
          // 백그라운드 전환
          isAppBackground = true
          cleanup()
        }
      }
    )

    return () => {
      isUnmounted = true
      cleanup()
      appStateListener.then(listener => listener.remove()).catch(console.error)
    }
  }, [chatroomId, userId, accessToken, enabled, retryKey])

  return { isLoading, error }
}

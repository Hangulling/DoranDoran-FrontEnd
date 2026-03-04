import { useEffect, useRef, useState } from 'react'
import { App } from '@capacitor/app'
import { getWebSocketUrl } from '../../api'
import { tokenService } from '../../api/tokenService'

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
    if (!enabled || !chatroomId || !userId) {
      setIsLoading(false)
      return
    }

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isUnmounted = false
    let isAppBackground = false

    const connect = () => {
      if (isUnmounted || isAppBackground) {
        //  console.log('[WebSocket] ⚠️ Skip connect (unmounted or background)')
        return
      }

      cleanup()

      setIsLoading(true)
      setError(null)

      try {
        // 토큰 가져오기
        const token = tokenService.access || accessToken

        if (!token) {
          setError(new Error('Authentication token not found'))
          setIsLoading(false)
          return
        }

        const url = getWebSocketUrl(chatroomId, userId, token)
        //  console.log('[WebSocket] 연결 시도')

        ws = new WebSocket(url)

        ws.onopen = () => {
          //  console.log('[WebSocket] 연결 성공')
          setIsLoading(false)
          retryCountRef.current = 0
          onOpenRef.current?.()
        }

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data)
            //  console.log('[WebSocket] 파싱된 메시지:', message)

            // event 필드 확인
            if (!message.event) {
              console.warn('[WebSocket] 메시지에 event 필드 없음:', message)
              return
            }

            // data 필드 확인 (없으면 빈 객체)
            const eventData = message.data !== undefined ? message.data : {}

            if (onEventReceivedRef.current) {
              onEventReceivedRef.current(message.event, eventData as T)
            }
          } catch (e) {
            console.error('[WebSocket] 에러:', e)
          }
        }

        ws.onerror = event => {
          setError(new Error('WebSocket connection error'))
          onErrorRef.current?.(event)
        }

        ws.onclose = event => {
          if (event.code === 1008) {
            setError(new Error('채팅방 접근 권한 없음'))
            setIsLoading(false)
            return
          }

          if (!isUnmounted && !isAppBackground && event.code !== 1000) {
            scheduleReconnect()
          }
        }
      } catch (err) {
        console.error('[WebSocket] 에러:', err)
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
        // console.log(
        //   `[WebSocket] 재연결... (${retryCountRef.current + 1}/${maxRetries})`
        // )

        reconnectTimeout = setTimeout(() => {
          retryCountRef.current += 1
          connect()
        }, delay)
      } else {
        console.log('[WebSocket] 최대 재연결 횟수 도달')
        setError(new Error('최대 재연결 횟수를 초과했습니다'))
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

    //  console.log('[WebSocket] 최초 연결 시작')
    connect()

    const appStateListener = App.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (isActive) {
          //  console.log('[WebSocket] 포그라운드 복귀')
          isAppBackground = false
          retryCountRef.current = 0
          connect()
        } else {
          //  console.log('[WebSocket] 백그라운드 전환')
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

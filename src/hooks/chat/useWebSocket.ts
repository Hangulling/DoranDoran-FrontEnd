import { useEffect, useRef, useState } from 'react'
import { App } from '@capacitor/app'
//import { getWebSocketUrl } from '../../api'
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
      console.log('[WebSocket] ⚠️ Disabled:', { enabled, chatroomId, userId })
      setIsLoading(false)
      return
    }

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isUnmounted = false
    let isAppBackground = false

    const connect = () => {
      if (isUnmounted || isAppBackground) {
        console.log('[WebSocket] ⚠️ Skip connect (unmounted or background)')
        return
      }

      cleanup()

      setIsLoading(true)
      setError(null)

      try {
        // 토큰 가져오기
        const token = tokenService.access || accessToken

        if (!token) {
          console.error('[WebSocket] No token available')
          setError(new Error('Authentication token not found'))
          setIsLoading(false)
          return
        }

        // const url = getWebSocketUrl(chatroomId, userId, token)
        const url = 'wss://ws.postman-echo.com/raw'
        console.log('[WebSocket] 연결 시도')
        console.log('[WebSocket] chatroomId:', chatroomId)
        console.log('[WebSocket] userId:', userId)
        console.log('[WebSocket] URL:', url.replace(/token=[^&]+/, 'token=***'))

        ws = new WebSocket(url)

        ws.onopen = () => {
          console.log('[WebSocket] 연결 성공!')
          console.log('[WebSocket] ReadyState:', ws?.readyState, '(1=OPEN)')
          setIsLoading(false)
          retryCountRef.current = 0
          onOpenRef.current?.()
        }

        ws.onmessage = event => {
          console.log('[WebSocket] 원본 메시지:', event.data)
          console.log('[WebSocket] 데이터 타입:', typeof event.data)

          try {
            const message = JSON.parse(event.data)
            console.log('[WebSocket] 파싱된 메시지:', message)

            // event 필드 확인
            if (!message.event) {
              console.warn('[WebSocket] 메시지에 event 필드 없음:', message)
              console.warn('[WebSocket] 메시지 구조:', Object.keys(message))
              return
            }

            console.log(`[WebSocket] Event: ${message.event}`)

            // data 필드 확인 (없으면 빈 객체)
            const eventData = message.data !== undefined ? message.data : {}

            if (onEventReceivedRef.current) {
              onEventReceivedRef.current(message.event, eventData as T)
            }
          } catch (e) {
            console.error('[WebSocket] JSON 파싱 실패!')
            console.error('[WebSocket] 에러:', e)
            console.error('[WebSocket] 원본 데이터:', event.data)
            console.error('[WebSocket] 데이터 길이:', event.data?.length)
            console.error(
              '[WebSocket] 첫 100자:',
              event.data?.substring(0, 100)
            )
          }
        }

        ws.onerror = event => {
          console.error('[WebSocket] 에러 발생')
          console.error('[WebSocket] Event:', event)
          console.error('[WebSocket] Event type:', event.type)
          console.error('[WebSocket] ReadyState:', ws?.readyState)

          const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
          console.error('[WebSocket] State:', states[ws?.readyState ?? 3])

          setError(new Error('WebSocket connection error'))
          onErrorRef.current?.(event)
        }

        ws.onclose = event => {
          console.log('[WebSocket] 연결 종료')
          console.log('[WebSocket] Code:', event.code)
          console.log('[WebSocket] Reason:', event.reason || '(없음)')
          console.log('[WebSocket] WasClean:', event.wasClean)

          const closeCodes: Record<number, string> = {
            1000: 'Normal Closure',
            1001: 'Going Away',
            1002: 'Protocol Error',
            1003: 'Unsupported Data',
            1006: 'Abnormal Closure (연결 실패)',
            1007: 'Invalid frame payload data',
            1008: 'Policy Violation (권한 없음)',
            1009: 'Message too big',
            1011: 'Server error',
          }
          console.log('[WebSocket] 의미:', closeCodes[event.code] || 'Unknown')

          // 1008 = 채팅방 접근 권한 없음
          if (event.code === 1008) {
            console.error('[WebSocket] 채팅방 접근 권한 없음')
            setError(new Error('채팅방 접근 권한이 없습니다'))
            setIsLoading(false)
            return
          }

          // 정상 종료가 아니면 재연결
          if (!isUnmounted && !isAppBackground && event.code !== 1000) {
            scheduleReconnect()
          }
        }
      } catch (err) {
        console.error('[WebSocket] Setup error:', err)
        console.error(
          '[WebSocket] Error:',
          err instanceof Error ? err.message : String(err)
        )

        setError(
          err instanceof Error ? err : new Error('WebSocket setup error')
        )
        scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      if (isUnmounted || isAppBackground) {
        console.log('[WebSocket] Skip reconnect (unmounted or background)')
        return
      }

      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(3000 * Math.pow(2, retryCountRef.current), 30000)
        console.log(
          `[WebSocket] ${delay}ms 후 재연결... (${retryCountRef.current + 1}/${maxRetries})`
        )

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
        console.log('[WebSocket] 기존 연결 정리 (state:', ws.readyState, ')')
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

    console.log('[WebSocket] 최초 연결 시작')
    connect()

    const appStateListener = App.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (isActive) {
          console.log('[WebSocket] 포그라운드 복귀 → 재연결')
          isAppBackground = false
          retryCountRef.current = 0
          connect()
        } else {
          console.log('[WebSocket] 백그라운드 전환 → 연결 종료')
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

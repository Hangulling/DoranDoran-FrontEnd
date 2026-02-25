import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { getSseUrl } from '../../api'
import { tokenService } from '../../api/tokenService'
import { useWebSocket } from './useWebSocket'

const eventNames = [
  'intimacy_analysis',
  'vocabulary_extracted',
  'vocabulary_translated',
  'conversation_complete',
  'aggregated_complete',
  'greeting_bot_message',
  'greeting_guide_message',
]

export interface UseChatStreamResult {
  isLoading: boolean
  error: Error | null
}

// SSE 로직 (Android, Web)
function useChatStreamOverSse<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey: number = 0,
  enabled: boolean = true
): UseChatStreamResult {
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const onEventReceivedRef = useRef(onEventReceived)
  const onErrorRef = useRef(onError)
  const onOpenRef = useRef(onOpen)
  const isConnectingRef = useRef(false)

  useLayoutEffect(() => {
    onEventReceivedRef.current = onEventReceived
  }, [onEventReceived])

  useLayoutEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useLayoutEffect(() => {
    onOpenRef.current = onOpen
  }, [onOpen])

  useEffect(() => {
    if (!enabled || !chatroomId) {
      console.log('[SSE] Disabled or no chatroomId')
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    let retryCount = 0
    const maxRetries = 5
    const retryDelayInitial = 3000

    const connect = () => {
      const sseUrl = getSseUrl(chatroomId, userId)
      const currentToken = tokenService.access || accessToken

      console.log('[SSE] 연결 시도:', sseUrl)

      if (isConnectingRef.current) {
        console.log('[SSE] 이미 연결 중')
        return
      }
      isConnectingRef.current = true

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      const fetchHeaders: Record<string, string> = {
        'Cache-Control': 'no-cache',
      }

      if (currentToken) {
        fetchHeaders['Authorization'] = `Bearer ${currentToken}`
      }

      const es = new EventSourcePolyfill(sseUrl, {
        headers: fetchHeaders,
        heartbeatTimeout: 60000,
      })

      eventSourceRef.current = es

      es.onopen = () => {
        console.log('[SSE] 연결 성공')
        setIsLoading(false)
        setError(null)
        isConnectingRef.current = false

        if (onOpenRef.current) {
          onOpenRef.current()
        }
        retryCount = 0
      }

      es.onmessage = (msg: MessageEvent) => {
        isConnectingRef.current = false
        if (!msg.data) return

        try {
          const parsedData = JSON.parse(msg.data)
          console.log('[SSE] Message:', parsedData)
          if (onEventReceivedRef.current) {
            onEventReceivedRef.current('message', parsedData)
          }
        } catch (e) {
          console.error('[SSE] JSON 파싱 실패', e)
        }
      }

      eventNames.forEach(eventName => {
        es.addEventListener(eventName, (e: Event) => {
          const msg = e as MessageEvent
          isConnectingRef.current = false
          if (!msg.data) return

          try {
            const parsedData = JSON.parse(msg.data)
            console.log(`[SSE] Event [${eventName}]:`, parsedData)
            if (onEventReceivedRef.current) {
              onEventReceivedRef.current(eventName, parsedData)
            }
          } catch (e) {
            console.error(`[SSE] JSON 파싱 실패 [${eventName}]`, e)
          }
        })
      })

      es.onerror = (err: unknown) => {
        isConnectingRef.current = false
        console.error('[SSE] 에러:', err)

        es.close()

        if (onErrorRef.current) {
          onErrorRef.current(err)
        }

        retryCount++
        if (retryCount >= maxRetries) {
          console.error('[SSE] 최대 재연결 횟수 도달')
          setError(
            err instanceof Error
              ? err
              : new Error('SSE connection failed after max retries')
          )
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        const jitter = Math.random() * 1000
        const delay =
          Math.min(retryDelayInitial * Math.pow(2, retryCount), 30000) + jitter

        console.log(
          `[SSE] ${Math.round(delay)}ms 후 재연결... (${retryCount}/${maxRetries})`
        )
        retryTimeoutRef.current = setTimeout(() => {
          connect()
        }, delay)
      }
    }

    const appStateListenerPromise = App.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (isActive) {
          console.log('[SSE] 포그라운드 복귀, 재연결')
          connect()
        } else {
          console.log('[SSE] 백그라운드 전환, 연결 종료')
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
          }
          isConnectingRef.current = false
        }
      }
    )

    connect()

    // 컴포넌트 언마운트 시 정리
    return () => {
      appStateListenerPromise.then(listener => listener.remove())

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      isConnectingRef.current = false
    }
  }, [chatroomId, userId, accessToken, retryKey, enabled])

  return { isLoading, error }
}

// iOS는 WebSocket, 나머지는 SSE
export function useChatStream<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey: number = 0
): UseChatStreamResult {
  const isIos =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

  console.log('[useChatStream] Platform:', Capacitor.getPlatform())
  console.log('[useChatStream] isNative:', Capacitor.isNativePlatform())
  console.log('[useChatStream] Using:', isIos ? 'WebSocket' : 'SSE')

  const wsResult = useWebSocket(
    chatroomId,
    userId,
    accessToken,
    onEventReceived,
    onError,
    onOpen,
    retryKey,
    isIos
  )

  const sseResult = useChatStreamOverSse(
    chatroomId,
    userId,
    accessToken,
    onEventReceived,
    onError,
    onOpen,
    retryKey,
    !isIos
  )

  return isIos ? wsResult : sseResult
}

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

// 1. 기존 SSE 로직 (안드로이드, 웹 용)
function useChatStreamOverSse<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey: number = 0,
  enabled: boolean = true // 활성화 플래그 추가
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

      if (isConnectingRef.current) return
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
        headers: fetchHeaders, // 헤더 주입
        heartbeatTimeout: 60000,
      })

      eventSourceRef.current = es

      es.onopen = () => {
        console.log('[SSE] Connection opened')
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
          console.log('[SSE Message]', parsedData)
          if (onEventReceivedRef.current) {
            onEventReceivedRef.current('message', parsedData)
          }
        } catch (e) {
          console.error('SSE JSON 파싱 실패', e)
        }
      }

      eventNames.forEach(eventName => {
        es.addEventListener(eventName, (e: Event) => {
          const msg = e as MessageEvent
          isConnectingRef.current = false
          if (!msg.data) return

          try {
            const parsedData = JSON.parse(msg.data)
            console.log(`[SSE Event: ${eventName}]`, parsedData)
            if (onEventReceivedRef.current) {
              onEventReceivedRef.current(eventName, parsedData)
            }
          } catch (e) {
            console.error(`SSE 커스텀 이벤트 JSON 파싱 실패: ${eventName}`, e)
          }
        })
      })

      es.onerror = (err: unknown) => {
        isConnectingRef.current = false
        console.error('[SSE Error]', err)

        es.close()

        if (onErrorRef.current) {
          onErrorRef.current(err)
        }

        retryCount++
        if (retryCount >= maxRetries) {
          console.error('[SSE] 재접속 시도 최대 횟수 초과')
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
          `[SSE] ${delay}ms 후 재연결 시도... (시도 횟수: ${retryCount})`
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
          console.log('[SSE] App came to foreground, reconnecting...')
          connect()
        } else {
          console.log('[SSE] App went to background, aborting connection...')
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

export function useChatStream<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey: number = 0
): UseChatStreamResult {
  // iOS 네이티브 앱인지 확인
  const isIos =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

  const wsResult = useWebSocket(
    chatroomId,
    userId,
    accessToken,
    onEventReceived,
    onError,
    onOpen,
    retryKey,
    isIos // iOS일 때만 WebSocket 활성화
  )

  const sseResult = useChatStreamOverSse(
    chatroomId,
    userId,
    accessToken,
    onEventReceived,
    onError,
    onOpen,
    retryKey,
    !isIos // iOS가 아닐 때만 SSE 활성화
  )

  return isIos ? wsResult : sseResult
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getSseUrl } from '../../api'
import { EventSourcePolyfill } from 'event-source-polyfill'

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

export function useChatStream<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event) => void,
  onOpen?: () => void,
  retryKey: number = 0
): UseChatStreamResult {
  const eventSourceRef = useRef<EventSource | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const onEventReceivedRef = useRef(onEventReceived)
  const onErrorRef = useRef(onError)

  useLayoutEffect(() => {
    onEventReceivedRef.current = onEventReceived
  }, [onEventReceived])

  // 콜백 prop이 변경될 때마다 ref를 업데이트
  useLayoutEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!chatroomId) {
      setIsLoading(false)
      setError(null)
      return
    }

    // 연결 시도 시작: 로딩 true, 에러 null
    setIsLoading(true)
    setError(null)

    let retryCount = 0
    const maxRetries = 5
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    const retryDelayInitial = 3000
    let retryDelay = retryDelayInitial

    const connect = () => {
      const sseUrl = getSseUrl(chatroomId, userId)
      const eventSource = new EventSourcePolyfill(sseUrl, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        heartbeatTimeout: 3600000, // 1시간
      })

      // 연결 성공 시 리셋
      eventSource.onopen = () => {
        console.log('[SSE] Connection opened')
        setIsLoading(false)
        setError(null)
        if (onOpen) onOpen()
        retryCount = 0
        retryDelay = retryDelayInitial
      }

      eventSource.onmessage = event => {
        const parsedData = JSON.parse(event.data)
        console.log('[SSE Message]', parsedData)

        if (onEventReceivedRef.current) {
          onEventReceivedRef.current('message', parsedData)
        }
      }

      eventNames.forEach(name => {
        eventSource.addEventListener(name, (event: MessageEvent) => {
          const parsedData = JSON.parse(event.data)

          console.log(`[SSE Event: ${name}]`, parsedData)
          if (onEventReceivedRef.current) {
            onEventReceivedRef.current(name, parsedData)
          }
        })
      })

      eventSource.onerror = event => {
        if (document.visibilityState === 'hidden') {
          eventSource.close()
          return
        }

        if (onErrorRef.current) {
          onErrorRef.current(event)
        }
        console.error('[SSE Error]', event)
        // 완전히 닫힌 상태일 때만 수동 재연결
        if (eventSource.readyState === EventSource.CLOSED) {
          if (onErrorRef.current) {
            onErrorRef.current(event)
          }

          console.log('[SSE] Connection fully closed. Starting manual retry')

          if (retryCount < maxRetries) {
            setIsLoading(true)
            retryTimeout = setTimeout(() => {
              retryCount++
              const jitter = Math.random() * 1000
              const nextDelay = Math.min(retryDelay * 2, 30000)
              retryDelay = nextDelay + jitter

              console.log(
                `[SSE] 재접속 시도 중 (Attempt ${retryCount}, Delay: ${Math.round(retryDelay)}ms)`
              )
              connect()
            }, retryDelay)
          } else {
            console.error('[SSE] 재접속 시도 최대 횟수 초과')
            setError(new Error('SSE connection failed after max retries'))
            setIsLoading(false)
          }
        } else {
          console.log(
            '[SSE] EventSource is attempting to reconnect automatically.'
          )
          setIsLoading(true)
        }
      }

      eventSourceRef.current = eventSource
    }

    // 화면이 다시 보일 때 연결이 끊겨있으면 재연결
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (
          !eventSourceRef.current ||
          eventSourceRef.current.readyState === EventSource.CLOSED
        ) {
          console.log('[SSE] App came to foreground, reconnecting...')
          connect()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 최초 연결
    connect()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (retryTimeout) clearTimeout(retryTimeout)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [chatroomId, userId, accessToken, retryKey])

  return { isLoading, error }
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getSseUrl } from '../../api'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { App } from '@capacitor/app'
import { tokenService } from '../../api/tokenService'

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
  onError?: (event: Event | unknown) => void,
  onOpen?: () => void,
  retryKey: number = 0
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
    if (!chatroomId) {
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
      let sseUrl = getSseUrl(chatroomId, userId)
      const currentToken = tokenService.access || accessToken

      if (isConnectingRef.current) return
      isConnectingRef.current = true

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      // iOS 강제 캐싱 방지용 찌꺼기 값 추가 (CORS 실패 캐싱 무력화용)
      const separator = sseUrl.includes('?') ? '&' : '?'
      sseUrl += `${separator}cb=${Date.now()}`

      // ✨ 다시 헤더에 토큰을 담도록 원복
      const fetchHeaders: Record<string, string> = {
        // Polyfill 환경에서도 캐시 컨트롤 추가
        'Cache-Control': 'no-cache',
      }

      if (currentToken) {
        fetchHeaders['Authorization'] = `Bearer ${currentToken}`
      }

      // EventSourcePolyfill 초기화
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

        let errorDetails = ''

        if (err instanceof Error) {
          errorDetails += `[Type: Error]\nName: ${err.name}\nMessage: ${err.message}\nStack: ${err.stack || 'none'}`
        } else if (err instanceof Event) {
          const targetObj = err.target as {
            constructor?: { name?: string }
          } | null
          errorDetails += `[Type: Event]\nType: ${err.type}\nBubbles: ${err.bubbles}\nCancelable: ${err.cancelable}\nTarget: ${targetObj?.constructor?.name || 'unknown'}`
        } else if (err instanceof Response) {
          errorDetails += `[Type: Response]\nStatus: ${err.status}\nStatusText: ${err.statusText}\nURL: ${err.url}\nRedirected: ${err.redirected}`
        } else if (typeof err === 'object' && err !== null) {
          const errObj = err as Record<string, unknown> & {
            constructor?: { name?: string }
          }
          errorDetails += `[Type: Object (${errObj.constructor?.name || 'unknown'})]\n`

          try {
            const cache = new Set()
            const jsonString = JSON.stringify(
              errObj,
              (_, value) => {
                if (typeof value === 'object' && value !== null) {
                  if (cache.has(value)) return '[Circular]'
                  cache.add(value)
                }
                return value
              },
              2
            )
            errorDetails += `JSON Dump: ${jsonString.substring(0, 300)}...\n`
          } catch {
            errorDetails += `JSON Dump Failed.\n`
          }

          try {
            const propDump: string[] = []
            for (const propKey in errObj) {
              if (typeof errObj[propKey] !== 'function') {
                propDump.push(`${propKey}: ${String(errObj[propKey])}`)
              }
            }
            errorDetails += `Props:\n${propDump.slice(0, 10).join('\n')}...`
          } catch {
            errorDetails += 'Prop iteration failed.'
          }
        } else {
          errorDetails += `[Type: ${typeof err}]\nValue: ${String(err)}`
        }

        alert(`[SSE 연결 실패 디버깅]\n\n${errorDetails.substring(0, 800)}`)

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
  }, [chatroomId, userId, accessToken, retryKey])

  return { isLoading, error }
}

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
  const isConnectingRef = useRef(false) // 연결 상태 플래그

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

      if (isConnectingRef.current) return // 이미 연결 시도 중이면 중복 실행 방지
      isConnectingRef.current = true

      // 새 연결을 맺기 전 이전 연결 및 타이머가 있다면 취소
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      // Preflight(OPTIONS) 우회를 위해 토큰을 헤더 대신 URL에 파라미터로 붙임
      if (currentToken) {
        const separator = sseUrl.includes('?') ? '&' : '?'
        // 서버에서 토큰을 읽을 파라미터명
        sseUrl += `${separator}token=${currentToken}`
      }
      // iOS 강제 캐싱 방지용
      sseUrl += `&cb=${Date.now()}`

      // EventSourcePolyfill 초기화
      const es = new EventSourcePolyfill(sseUrl, {
        headers: {},
        heartbeatTimeout: 60000, // 연결 끊김 감지 타임아웃
      })

      eventSourceRef.current = es

      // 연결 성공 시
      es.onopen = () => {
        console.log('[SSE] Connection opened')
        setIsLoading(false)
        setError(null)
        isConnectingRef.current = false // 완료되었으므로 false

        if (onOpenRef.current) {
          onOpenRef.current()
        }
        retryCount = 0
      }

      // 일반 메시지 수신
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

      // 커스텀 이벤트 수신
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

      // 에러 발생
      es.onerror = (err: unknown) => {
        isConnectingRef.current = false
        console.error('[SSE Error]', err)

        es.close()

        // iOS 디버그
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

        // 재연결
        retryCount++
        if (retryCount >= maxRetries) {
          console.error('[SSE] 재접속 시도 최대 횟수 초과')
          setError(
            err instanceof Error
              ? err
              : new Error('SSE connection failed after max retries')
          )
          setIsLoading(false)
          return // 최대 횟수 초과 시 재연결 중단
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

    // 백그라운드/포그라운드 상태 감지
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

    // 최초 연결
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
  }, [chatroomId, userId, accessToken, retryKey])

  return { isLoading, error }
}

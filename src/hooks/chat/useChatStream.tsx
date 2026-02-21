import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getSseUrl } from '../../api'
import { fetchEventSource } from '@microsoft/fetch-event-source'
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
  const abortControllerRef = useRef<AbortController | null>(null)

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
      const baseUrl = getSseUrl(chatroomId, userId)

      // iOS CORS 실패 캐싱 무력화 (Cache-Busting)
      const sseUrl =
        baseUrl + (baseUrl.includes('?') ? '&' : '?') + `cb=${Date.now()}`

      const currentToken = tokenService.access || accessToken

      if (isConnectingRef.current) return // 이미 연결 시도 중이면 중복 실행 방지
      isConnectingRef.current = true

      // 새 연결을 맺기 전 이전 컨트롤러가 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const fetchHeaders: Record<string, string> = {
        Accept: 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
      }

      if (currentToken) {
        fetchHeaders['Authorization'] = `Bearer ${currentToken}`
      }

      fetchEventSource(sseUrl, {
        method: 'GET',
        headers: fetchHeaders,
        signal: abortControllerRef.current.signal,
        async onopen(response) {
          if (response.ok) {
            console.log('[SSE] Connection opened')
            setIsLoading(false)
            setError(null)

            if (onOpenRef.current) {
              onOpenRef.current()
            }

            retryCount = 0
          } else {
            throw new Error(`Failed to connect: ${response.status}`)
          }
        },
        onmessage(msg) {
          isConnectingRef.current = false
          if (!msg.data) return // 빈 하트비트 메시지 등 무시

          const parsedData = JSON.parse(msg.data)

          // 커스텀 이벤트인 경우
          if (msg.event && eventNames.includes(msg.event)) {
            console.log(`[SSE Event: ${msg.event}]`, parsedData)
            if (onEventReceivedRef.current) {
              onEventReceivedRef.current(msg.event, parsedData)
            }
          }
          // 일반 메시지인 경우
          else if (!msg.event || msg.event === 'message') {
            console.log('[SSE Message]', parsedData)
            if (onEventReceivedRef.current) {
              onEventReceivedRef.current('message', parsedData)
            }
          }
        },
        onclose() {
          isConnectingRef.current = false
          console.log('[SSE] Connection closed by server.')
        },
        onerror(err) {
          isConnectingRef.current = false
          console.error('[SSE Error]', err)
          // ios 디버그
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
            throw err
          }

          setIsLoading(true)
          const jitter = Math.random() * 1000
          return (
            Math.min(retryDelayInitial * Math.pow(2, retryCount), 30000) +
            jitter
          )
        },
      })
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
          if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
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

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      isConnectingRef.current = false
    }
  }, [chatroomId, userId, accessToken, retryKey])

  return { isLoading, error }
}

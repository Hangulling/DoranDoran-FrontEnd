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
      const sseUrl = getSseUrl(chatroomId, userId)
      const currentToken = tokenService.access || accessToken

      alert(
        `[토큰 확인]\n토큰: ${accessToken ? accessToken.substring(0, 10) + '...' : '없음(비어있음)'}`
      )

      // 새 연결을 맺기 전 이전 컨트롤러가 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      fetchEventSource(sseUrl, {
        method: 'GET',
        headers: {
          Authorization: currentToken ? `Bearer ${currentToken}` : '',
          Accept: 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache', // ios 강제 차단 방지
        },
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
          console.log('[SSE] Connection closed by server.')
        },
        onerror(err) {
          console.error('[SSE Error]', err)
          // ios 디버그
          let errorDetails = ''
          if (err instanceof Error) {
            errorDetails = `Type: Error\nName: ${err.name}\nMessage: ${err.message}\nStack: ${err.stack}`
          } else if (err instanceof Event) {
            // XMLHttpRequest나 Fetch 실패 시 Event 객체로 넘어오는 경우
            errorDetails = `Type: Event\nType: ${err.type}\nTarget: ${err.target ? err.target.constructor.name : 'unknown'}`
          } else if (typeof err === 'object' && err !== null) {
            try {
              // 객체의 모든 key를 순회
              const props = Object.getOwnPropertyNames(err).map(
                key => `${key}: ${err[key]}`
              )
              errorDetails = `Type: Object\nProps:\n${props.join('\n')}`
            } catch {
              errorDetails = 'Object (Could not parse)'
            }
          } else {
            errorDetails = `Type: ${typeof err}\nValue: ${String(err)}`
          }

          // 상세 알림창 띄우기
          alert(`[SSE 에러]\n\n${errorDetails}`)

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
    }
  }, [chatroomId, userId, accessToken, retryKey])

  return { isLoading, error }
}

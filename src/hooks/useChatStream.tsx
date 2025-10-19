import { useEffect, useRef, useState } from 'react'
import { getSseUrl } from '../api'
import { EventSourcePolyfill } from 'event-source-polyfill'

const eventNames = [
  'intimacy_analysis',
  'vocabulary_extracted',
  'vocabulary_translated',
  'conversation_chunk',
  'conversation_complete',
  'aggregated_complete',
]

export function useChatStream<T = unknown>(
  chatroomId: string,
  userId?: string,
  accessToken?: string,
  onEventReceived?: (eventType: string, data: T) => void,
  onError?: (event: Event) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!chatroomId) return

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
      })

      eventSource.onmessage = event => {
        if (onEventReceived) {
          onEventReceived('message', JSON.parse(event.data))
        }
      }

      eventNames.forEach(name => {
        eventSource.addEventListener(name, (event: MessageEvent) => {
          if (onEventReceived) {
            onEventReceived(name, JSON.parse(event.data))
          }
        })
      })

      eventSource.onerror = event => {
        setError(new Error('SSE connection error'))
        if (onError) {
          onError(event)
        }
        console.error('[SSE Error]', event)

        eventSource.close()

        if (retryCount < maxRetries) {
          retryTimeout = setTimeout(() => {
            retryCount++
            retryDelay *= 2 // 지수 백오프(Exponential backoff)
            connect()
          }, retryDelay)
        } else {
          console.error('[SSE] 재접속 시도 최대 횟수 초과')
        }
      }

      eventSourceRef.current = eventSource
      retryCount = 0
      retryDelay = retryDelayInitial
    }

    connect()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [chatroomId, userId, onEventReceived, onError, accessToken, error])
}

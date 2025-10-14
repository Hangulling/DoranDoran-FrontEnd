import { useEffect } from 'react'
import { getMessageStream } from '../api'
import { useMessageStore } from '../stores/useMessageStore'

export function useMessageStream(chatroomId: string, userId?: string) {
  const addMessage = useMessageStore(state => state.addMessage)
  const setConnected = useMessageStore(state => state.setConnected)
  const setError = useMessageStore(state => state.setError)

  useEffect(() => {
    const eventSource = getMessageStream(chatroomId, userId)

    eventSource.onopen = () => {
      setConnected(true)
      setError(null)
    }

    eventSource.onmessage = event => {
      try {
        const message = JSON.parse(event.data)
        addMessage(message)
      } catch (e) {
        console.error('메시지 파싱 실패', e)
      }
    }

    eventSource.onerror = () => {
      setError('SSE 연결 오류')
      setConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [chatroomId, userId, addMessage, setConnected, setError])
}

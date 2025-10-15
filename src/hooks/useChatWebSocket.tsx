import { useCallback, useEffect, useRef, useState } from 'react'
import { getWebSocketUrl } from '../api'

export function useChatWebSocket(
  chatroomId: string,
  userId?: string,
  onMessage?: (data: string) => void, // 메시지 수신 콜백
  onOpen?: () => void, // 연결 성공 콜백
  onClose?: () => void, // 연결 해제 콜백
  onError?: (event: Event) => void // 에러 발생 콜백
) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!chatroomId) return

    const wsUrl = getWebSocketUrl(chatroomId, userId)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      setConnected(true)
      if (onOpen) {
        onOpen()
      }
    }

    socket.onmessage = event => {
      if (onMessage) {
        onMessage(event.data)
      }
    }

    socket.onerror = event => {
      if (onError) {
        onError(event)
      }
    }

    socket.onclose = () => {
      setConnected(false)
      if (onClose) {
        onClose()
      }
    }

    socketRef.current = socket

    return () => {
      socket.close()
    }
  }, [chatroomId, userId, onMessage, onOpen, onClose, onError])

  const sendMessage = useCallback((senderId: string, senderType: string, content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const msg = `${senderId}|${senderType}|${content}`
      socketRef.current.send(msg)
    } else {
      console.warn('WebSocket is not connected.')
    }
  }, [])

  return { connected, sendMessage }
}

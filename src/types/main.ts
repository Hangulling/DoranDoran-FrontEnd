export interface ChatRoomWithMessage {
  roomRouteId: number | string
  roomName: string
  concept: string
  avatar: string
  message?: string
  chatroomId?: string | null // 푸시로 받는
  hasNewMessage?: boolean
}

export interface ChatRoomItemProps {
  room: ChatRoomWithMessage
  onClick: (id: number | string, roomName: string) => void
  isLoading?: boolean
}

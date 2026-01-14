export interface ChatRoomWithMessage {
  roomRouteId: number | string
  roomName: string
  concept: string
  avatar: string
  message: string
}

export interface ChatRoomItemProps {
  room: ChatRoomWithMessage
  onClick: (id: number | string, roomName: string) => void
}

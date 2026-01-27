import React from 'react'
import type { ChatRoomWithMessage } from '../../types/main'
import ChatRoomItem from './ChatRoomItem'
import { MAIN_DATA, MANAGER_ROOM } from '../../constants/mainData'

interface ChatRoomListProps {
  isLoading: boolean
  chatMsg: ChatRoomWithMessage[]
  onRoomClick: (id: number, roomName: string) => void
}

const ChatRoomList = ({
  isLoading,
  chatMsg,
  onRoomClick,
}: ChatRoomListProps) => {
  const displayData = isLoading ? MAIN_DATA : chatMsg // 스켈레톤 중 구조 먼저 표시

  return (
    <div className="flex w-full flex-col">
      {displayData.map(room => (
        <React.Fragment key={room.roomRouteId}>
          <ChatRoomItem
            room={room}
            onClick={(id, name) => onRoomClick(Number(id), name)}
            isLoading={isLoading}
          />
          <div className="my-[6px] h-[1px] w-full bg-gray-80" />
        </React.Fragment>
      ))}

      <ChatRoomItem
        room={MANAGER_ROOM}
        onClick={(id, name) => onRoomClick(Number(id), name)}
        isLoading={isLoading}
      />
    </div>
  )
}

export default ChatRoomList

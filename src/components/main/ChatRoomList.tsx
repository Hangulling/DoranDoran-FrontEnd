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
  const baseData = isLoading ? MAIN_DATA : chatMsg

  const displayData = [...baseData, MANAGER_ROOM]

  return (
    <div className="flex w-full flex-col">
      {displayData.map((room, index) => (
        <React.Fragment key={room.roomRouteId}>
          <ChatRoomItem
            room={room}
            onClick={(id, name) => onRoomClick(Number(id), name)}
            isLoading={isLoading}
          />

          {index < displayData.length - 1 && (
            <div className="my-[6px] h-[1px] w-full bg-gray-80" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default ChatRoomList

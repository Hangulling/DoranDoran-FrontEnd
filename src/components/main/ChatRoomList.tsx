import React from 'react'
import type { ChatRoomWithMessage } from '../../types/main'
import LoadingSpinner from '../common/LoadingSpinner'
import ChatRoomItem from './ChatRoomItem'
import { MANAGER_ROOM } from '../../constants/mainData'

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
  return (
    <div className="flex w-full flex-col">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {chatMsg.map(room => (
            <React.Fragment key={room.roomRouteId}>
              <ChatRoomItem
                room={room}
                onClick={(id, name) => onRoomClick(Number(id), name)}
              />
              <div className="my-[6px] h-[1px] w-full bg-gray-80" />
            </React.Fragment>
          ))}

          <ChatRoomItem
            room={MANAGER_ROOM}
            onClick={(id, name) => onRoomClick(Number(id), name)}
          />
        </>
      )}
    </div>
  )
}

export default ChatRoomList

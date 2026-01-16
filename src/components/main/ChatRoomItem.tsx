import type { ChatRoomItemProps } from '../../types/main'
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter'
import { MAIN_DATA, MANAGER_ROOM } from '../../constants/mainData'

const ChatRoomItem = ({ room, onClick }: ChatRoomItemProps) => {
  const targetData =
    MAIN_DATA.find(data => data.roomName === room.roomName) ||
    (room.roomName === MANAGER_ROOM.roomName ? MANAGER_ROOM : null)

  if (!targetData) return null

  return (
    <button
      onClick={() => onClick(targetData.roomRouteId, targetData.roomName)}
      className="flex items-center gap-x-3 w-full h-[57px] bg-gray-0 py-[6px]"
    >
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden">
        <img
          src={targetData.avatar}
          alt={targetData.roomName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-title text-[16px]">
          {capitalizeFirstLetter(targetData.roomName)}
        </span>
        <span className="text-gray-800 text-[14px]">{room.message}</span>
      </div>
    </button>
  )
}

export default ChatRoomItem

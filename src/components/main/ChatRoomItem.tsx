import type { ChatRoomItemProps } from '../../types/main'
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter'
import { MAIN_DATA, MANAGER_ROOM } from '../../constants/mainData'
import useUnreadStore, { DAILY_UNREAD_KEY } from '../../stores/useUnreadStore'

const ChatRoomItem = ({ room, onClick, isLoading }: ChatRoomItemProps) => {
  const { unreadMap } = useUnreadStore()
  const targetData =
    MAIN_DATA.find(data => data.roomName === room.roomName) ||
    (room.roomName === MANAGER_ROOM.roomName ? MANAGER_ROOM : null)

  if (!targetData) return null

  const dailyGreeting = unreadMap[DAILY_UNREAD_KEY]

  const isTargetOfDailyPush =
    dailyGreeting?.hasUnread &&
    dailyGreeting.concept?.toLowerCase() === room.roomName.toLowerCase()

  const displayMessage = isTargetOfDailyPush
    ? dailyGreeting.message
    : room.message
  const showUnreadDot = isTargetOfDailyPush || room.hasNewMessage

  const Skeleton = () => (
    <div className="h-4.5 w-52.5 bg-primary-30 rounded-sm animate-pulse" />
  )

  return (
    <button
      onClick={() => onClick(targetData.roomRouteId, targetData.roomName)}
      className="flex items-center gap-x-3 w-full h-14.25 bg-gray-0 py-1.5"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
        <img
          src={targetData.avatar}
          alt={targetData.roomName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col items-start flex-1 min-w-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-title text-[16px]">
            {capitalizeFirstLetter(targetData.roomName)}
          </span>

          {/* 보라색 점 표시 */}
          {showUnreadDot && (
            <div className="w-2 h-2 rounded-full bg-purple-300 mr-2" />
          )}
        </div>
        {isLoading ? (
          <Skeleton />
        ) : (
          <span
            className={`text-[14px] truncate w-full text-left ${
              showUnreadDot ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            {displayMessage}
          </span>
        )}
      </div>
    </button>
  )
}

export default ChatRoomItem

import { chatRooms } from '../../mocks/db/chat'
import useClosenessStore from '../../stores/useClosenessStore'

interface ClosenessBarProps {
  chatRoomId: string
}

const ClosenessBar: React.FC<ClosenessBarProps> = ({ chatRoomId }) => {
  const closeness = useClosenessStore(state => state.closenessMap[chatRoomId] ?? 1)

  const room = chatRooms.find(room => room.roomId === Number(chatRoomId))
  const chatRoomLabel = room ? room.roomName : `ChatRoom ${chatRoomId}`

  const closenessText = closeness == 1 ? 'casual' : closeness == 2 ? 'friendly' : 'close'

  return (
    <div className="mx-auto w-full max-w-md left-1/2 translate-x-[-50%] h-[33px] bg-green-350 overflow-hidden relative flex items-center justify-center text-white text-[14px] select-none">
      Chatting with a {closenessText} {chatRoomLabel.toLowerCase()}
    </div>
  )
}

export default ClosenessBar

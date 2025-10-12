import { chatRooms } from '../../mocks/db/chat'
import useClosenessStore from '../../stores/useClosenessStore'

interface ClosenessBarProps {
  chatRoomId: string
}

const BG_COLORS: Record<string, string> = {
  casual: 'bg-[#86ABFB]',
  friendly: 'bg-[#F1C749]',
  close: 'bg-[#F68A8C]',
}

const ClosenessBar: React.FC<ClosenessBarProps> = ({ chatRoomId }) => {
  const closeness = useClosenessStore(state => state.closenessMap[chatRoomId] ?? 1)

  const room = chatRooms.find(room => room.roomId === Number(chatRoomId))
  const chatRoomLabel = room ? room.roomName : `ChatRoom ${chatRoomId}`

  const closenessText = closeness == 1 ? 'casual' : closeness == 2 ? 'friendly' : 'close'

  const bgClass = BG_COLORS[closenessText] || 'bg-green-350'

  return (
    <div
      className={`mx-auto w-full max-w-md h-[33px] ${bgClass} overflow-hidden relative flex items-center justify-center text-white text-[14px] select-none shadow-[0_1px_2px_rgba(0,0,0,0.12)]`}
    >
      Chatting with a {closenessText} {chatRoomLabel.toLowerCase()}
    </div>
  )
}

export default ClosenessBar

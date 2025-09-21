const rooms = [
  { id: 1, name: '회사방', msg: '추천 프롬프트' },
  { id: 2, name: '학교 선배방', msg: '추천 프롬프트' },
  { id: 3, name: '거래처방', msg: '추천 프롬프트' },
  { id: 4, name: '애인방', msg: '추천 프롬프트' },
]

const ListPage = () => {
  const handleRoomClick = (roomId: number) => {
    console.log('채팅방 클릭: ', roomId)
  }

  return (
    <div className="bg-base-200 min-h-screen py-4 px-3">
      {/* 사용자 정보 */}
      <div className="flex items-center mb-4">
        <div className="avatar">
          <div className="w-16 rounded-full bg-neutral" />
        </div>
        <div className="ml-4">
          <span className="text-lg font-bold">User name</span>
        </div>
      </div>
      {/* 채팅방 리스트 */}
      <div className="space-y-3">
        {rooms.map(room => (
          <button
            key={room.id}
            type="button"
            onClick={() => handleRoomClick(room.id)}
            className="flex items-center bg-base-100 rounded-lg shadow p-4 w-full text-left hover:bg-base-300 transition"
          >
            <div className="avatar">
              <div className="w-12 rounded-full bg-neutral" />
            </div>
            <div className="ml-4 flex-1">
              <div className="font-semibold">{room.name}</div>
              <div className="text-sm text-gray-500">{room.msg}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ListPage

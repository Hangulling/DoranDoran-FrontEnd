const chatRooms = [
  { id: 'school', label: '학교 선배', avatarBg: 'bg-yellow-100', message: '밥 먹었어?' },
  { id: 'lover', label: '애인', avatarBg: 'bg-rose-200', message: '밥 먹었어?' },
  { id: 'company', label: '회사', avatarBg: 'bg-orange-200', message: '밥 먹었어?' },
  { id: 'client', label: '거래처', avatarBg: 'bg-sky-200', message: '밥 먹었어?' },
]

const MainPage = () => {
  const handleRoomClick = (id: string) => {
    console.log(id + ' 채팅방 이동')
  }
  return (
    <>
      {/* 상단 환영 메시지 */}
      <div className="w-full bg-[#9ADAD5] h-[78px]">
        <div className="flex items-center justify-between max-w-md mx-auto px-6 py-4">
          <div>
            <div className="text-sm mb-0.5">반가워요,</div>
            <div className="font-bold text-base">
              <span className="text-black">John Smith 님 :)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pb-16">
        {/* 안내문구 */}
        <div className="bg-[#F1F1F1] rounded-lg text-center h-14 px-1 py-2 text-[#666666] text-sm mb-3 mt-3">
          대화를 나누며 상황과 관계에
          <br />
          알맞은 한국어 표현을 익혀보세요
        </div>
        {/* 채팅방 목록 */}
        <div>
          <div className="font-bold mb-2">채팅방</div>
          <div className="flex flex-col gap-[10px]">
            {chatRooms.map(room => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className="flex items-center gap-4 w-full h-21 bg-white rounded-2xl shadow py-3 px-4 active:bg-gray-100"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center ${room.avatarBg}`}
                ></div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">{room.label}</span>
                  <span className="text-gray-600 text-sm">{room.message}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default MainPage

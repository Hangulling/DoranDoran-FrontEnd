import Character from '../assets/mainCharacter.svg'
import SchoolAvatar from '/chat/school.svg'
import LoverAvatar from '/chat/lover.svg'
import CompanyAvatar from '/chat/company.svg'
import ClientAvatar from '/chat/client.svg'
import { useNavigate } from 'react-router-dom'

const chatRooms = [
  { id: 'school', label: '학교 선배', avatar: SchoolAvatar, message: '밥 먹었어?' },
  { id: 'lover', label: '애인', avatar: LoverAvatar, message: '밥 먹었어?' },
  { id: 'company', label: '회사', avatar: CompanyAvatar, message: '밥 먹었어?' },
  { id: 'client', label: '거래처', avatar: ClientAvatar, message: '밥 먹었어?' },
]

const MainPage = () => {
  const navigate = useNavigate()

  const handleRoomClick = (id: string) => {
    navigate('/chat')
    console.log(id + ' 채팅방 이동')
  }
  return (
    <>
      {/* 상단 환영 메시지 */}
      <div className="w-full bg-[#9ADAD5] h-[94px] relative max-w-md mx-auto">
        <div className="absolute top-[22px] left-6">
          <div className="text-[16px] mb-0.5">반가워요,</div>
          <div className="font-bold text-[16px]">
            <span className="text-gray-800">John Smith 님 :)</span>
          </div>
        </div>
        <img src={Character} alt="캐릭터 이미지" className="absolute top-[10px] left-[210px]" />
      </div>

      <div className="max-w-md mx-auto px-5 pb-16">
        {/* 안내문구 */}
        <div className="bg-[#EAEBEB] rounded-lg text-center px-1 py-2 text-gray-600 text-[14px] mb-[25px] mt-[30px]">
          대화를 나누며 상황과 관계에
          <br />
          알맞은 한국어 표현을 익혀보세요
        </div>
        {/* 채팅방 목록 */}
        <div>
          <div className="font-bold mb-4 text-[20px] text-gray-800 border-b border-[#EAEBEB] pb-2">
            채팅방
          </div>
          <div className="flex flex-col gap-[10px]">
            {chatRooms.map(room => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className="flex items-center gap-4 w-full h-21 bg-white rounded-lg shadow-[1px_1px_10px_rgba(0,0,0,0.1)] py-3 px-4 active:bg-gray-100"
              >
                <div className="w-13 h-13 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                  <img src={room.avatar} alt={room.label} className="w-full h-full object-cover" />
                </div>
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

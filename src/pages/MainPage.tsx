import Character from '../assets/mainCharacter.svg'
import SchoolAvatar from '/chat/school.svg'
import LoverAvatar from '/chat/lover.svg'
import CompanyAvatar from '/chat/company.svg'
import ClientAvatar from '/chat/client.svg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CommonModal from '../components/common/CommonModal'

const chatRooms = [
  { id: 'school', label: '학교 선배', avatar: SchoolAvatar, message: '밥 먹었어?' },
  { id: 'lover', label: '애인', avatar: LoverAvatar, message: '밥 먹었어?' },
  { id: 'company', label: '회사', avatar: CompanyAvatar, message: '밥 먹었어?' },
  { id: 'client', label: '거래처', avatar: ClientAvatar, message: '밥 먹었어?' },
]

const LOGOUT_DESC = ['로그아웃 하시겠어요?', '다음에 또 만나요!']
const SIGNOUT_DESC = ['회원 탈퇴 시 복구가 어려워요.', '그래도 진행하시겠어요?']

const MainPage = () => {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'logout' | 'signout' | null>(null)

  const handleRoomClick = (id: string) => {
    navigate('/chat', { state: { showCoachMark: true, roomId: id } })
    console.log(id + ' 채팅방 이동')
  }

  // 로그아웃 버튼 클릭 시
  const openLogoutModal = () => {
    setModalType('logout')
    setModalOpen(true)
  }
  // 회원탈퇴 버튼 클릭 시
  const openSignoutModal = () => {
    setModalType('signout')
    setModalOpen(true)
  }

  const handleConfirm = () => {
    if (modalType === 'logout') {
      console.log('로그아웃')
    } else if (modalType === 'signout') {
      console.log('회원탈퇴')
    }
    setModalOpen(false)
  }

  const handleCancel = () => {
    setModalOpen(false)
  }

  return (
    <>
      {/* 상단 환영 메시지 */}
      <div className="w-full bg-[#5ac0b7] h-[94px] relative max-w-md mx-auto">
        <div className="absolute top-[22px] left-6">
          <div className="text-[16px] mb-0.5">반가워요,</div>
          <div className="text-[16px]">
            <span className="text-title">John Smith</span>
            <span> 님 :)</span>
          </div>
        </div>
        <img src={Character} alt="캐릭터 이미지" className="absolute top-[10px] left-[210px]" />
      </div>

      <div className="max-w-md mx-auto px-5 pb-16">
        {/* 안내문구 */}
        <div className="bg-gray-80 rounded-lg text-center px-1 py-2 text-gray-600 text-[14px] mb-[25px] mt-[30px]">
          대화를 나누며 상황과 관계에
          <br />
          알맞은 한국어 표현을 익혀보세요
        </div>
        {/* 채팅방 목록 */}
        <div>
          <div className="text-title mb-4 text-[20px] border-b border-gray-80 pb-2">채팅방</div>
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
                  <span className="text-title text-[16px]">{room.label}</span>
                  <span className="text-gray-600 text-[14px]">{room.message}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 로그아웃 탈퇴 */}
          <div className="flex justify-center gap-2 mt-[60px] text-gray-600 text-[14px]">
            <button onClick={openLogoutModal}>로그아웃</button>
            <span className="text-gray-200">|</span>
            <button onClick={openSignoutModal}>회원탈퇴</button>
          </div>

          <CommonModal
            open={modalOpen}
            title={modalType === 'logout' ? '로그아웃' : '회원탈퇴'}
            description={modalType === 'logout' ? LOGOUT_DESC : SIGNOUT_DESC}
            confirmText="확인"
            cancelText="닫기"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  )
}

export default MainPage

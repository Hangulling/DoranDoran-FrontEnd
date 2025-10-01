import Character from '../assets/main/mainCharacter.svg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import CommonModal from '../components/common/CommonModal'
import { chatRooms } from '../mocks/chat'

const LOGOUT_DESC = ['You can log in again anytime.']
const SIGNOUT_DESC = ['This action cannot be undone.', 'Are you sure you want to continue?']

const MainPage = () => {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'logout' | 'signout' | null>(null)

  const handleRoomClick = (id: number) => {
    navigate(`/chat/${id}`, { state: { showCoachMark: true, roomId: id } })
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
      <div className="w-full bg-[#9ADAD5] h-[99px] relative max-w-md mx-auto overflow-hidden">
        <div className="absolute top-[14px] left-[20px]">
          <div className="text-[14px]">Welcome,</div>
          <div className="text-[16px]">
            {/* 이름 변경할 것 */}
            <span className="text-title">John Smith</span>
            <span>:)</span>
          </div>
          <p className="mt-[8px] text-[12px] text-gray-600">Learn Korean expressions by chat!</p>
        </div>
        <img src={Character} alt="캐릭터 이미지" className="absolute top-[23px] right-[20.16px]" />
      </div>

      <div className="max-w-md mx-auto px-5 pb-16 mt-[30px]">
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
          <div className="flex justify-center gap-2 mt-[180px] text-gray-400 text-[14px]">
            <button onClick={openLogoutModal}>Log Out</button>
            <span className="text-gray-200">|</span>
            <button onClick={openSignoutModal}>Delete account</button>
          </div>

          <p className="text-center text-gray-300 text-[12px] mt-[20px]">
            Copyright 2025.dorandoran all rights reserved.
          </p>

          <CommonModal
            open={modalOpen}
            title={modalType === 'logout' ? 'Logout' : 'Delete Account'}
            description={modalType === 'logout' ? LOGOUT_DESC : SIGNOUT_DESC}
            confirmText={modalType === 'logout' ? 'Log out' : 'Delete'}
            cancelText="keep"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  )
}

export default MainPage

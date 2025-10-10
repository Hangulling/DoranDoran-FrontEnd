import React, { useEffect, useState } from 'react'
import CloseIcon from '../../assets/icon/blackClose.svg?react'
import RightArrowIcon from '../../assets/icon/blackArrowRight.svg'
import LogoutIcon from '../../assets/icon/logout.svg?react'
import SignupIcon from '../../assets/icon/signup.svg?react'
import type { SidebarProps } from '../../types/common'
import CommonModal from './CommonModal'

const LOGOUT_DESC = ['You can log in again anytime.']
const SIGNOUT_DESC = ['This action cannot be undone.', 'Are you sure you want to continue?']

const menuBtn =
  'flex items-center justify-between px-5 py-4 w-full focus:bg-green-80 hover:bg-green-80'
const iconBtn =
  'flex items-center gap-x-[6px] text-gray-400 text-[14px] hover:text-gray-800 focus:text-gray-800'

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'logout' | 'signup' | null>(null)
  const [visible, setVisible] = useState(isOpen)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      // 마운트 후 약간 지연 후 슬라이드 인
      setTimeout(() => setIsActive(true), 10)
    } else {
      // 닫힐 때
      setIsActive(false)
      // 300ms 후 언마운트
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // 로그아웃 버튼 클릭 시
  const openLogoutModal = () => {
    setModalType('logout')
    setModalOpen(true)
  }
  // 회원탈퇴 버튼 클릭 시
  const openSignupModal = () => {
    setModalType('signup')
    setModalOpen(true)
  }

  const handleConfirm = () => {
    if (modalType === 'logout') {
      console.log('로그아웃')
    } else if (modalType === 'signup') {
      console.log('회원탈퇴')
    }
    setModalOpen(false)
  }

  const handleCancel = () => {
    setModalOpen(false)
  }

  return (
    <>
      {visible && (
        <>
          <div
            className={`fixed inset-0 z-50 h-screen bg-black transition-opacity duration-300 ${
              isActive ? 'opacity-60' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* 사이드바 */}
          <div
            className={`fixed top-0 left-0 z-60 bg-[#fafafa] h-screen w-[303px] transform transition-transform duration-300 ease-in-out ${
              isActive ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* 닫기 버튼 */}
            <button className="absolute top-6 right-6" onClick={onClose} aria-label="닫기">
              <CloseIcon />
            </button>
            {/* 컨텐츠 */}
            <div className="flex flex-col h-full">
              {/* 메뉴 리스트 */}
              <div className="flex flex-col gap-y-1 mt-20 py-2 text-[14px] border-t border-b border-gray-80">
                <button className={menuBtn}>
                  About the Service
                  <img src={RightArrowIcon} />
                </button>
                <button className={menuBtn}>
                  Terms of Service
                  <img src={RightArrowIcon} />
                </button>
                <button className={menuBtn}>
                  Privacy Policy
                  <img src={RightArrowIcon} />
                </button>
              </div>

              {/* 하단 */}
              <div className="mt-auto mb-[34px] ml-5 flex flex-col gap-5">
                <button className={iconBtn} onClick={openLogoutModal}>
                  <LogoutIcon />
                  Log out
                </button>
                <button className={iconBtn} onClick={openSignupModal}>
                  <SignupIcon />
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <CommonModal
        open={modalOpen}
        title={modalType === 'logout' ? 'Logout' : 'Delete Account'}
        description={modalType === 'logout' ? LOGOUT_DESC : SIGNOUT_DESC}
        confirmText={modalType === 'logout' ? 'Log out' : 'Delete'}
        cancelText="keep"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  )
}

export default Sidebar

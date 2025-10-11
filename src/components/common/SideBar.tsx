import React, { useState } from 'react'
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

  if (!isOpen) return null

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
      {isOpen && (
        <div
          className="absolute inset-0 bg-black opacity-80 z-50 h-screen"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* 사이드바 패널 */}
      <div
        className={`
          absolute top-0 left-0 z-900 bg-[#fafafa] h-dvh w-[303px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 닫기 버튼 */}
        <button className="absolute top-6 right-6" onClick={onClose} aria-label="닫기">
          <CloseIcon />
        </button>
        {/* 컨텐츠 */}
        <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
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

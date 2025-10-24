import React, { useState, useEffect } from 'react'
import CloseIcon from '../../assets/icon/blackClose.svg?react'
import RightArrowIcon from '../../assets/icon/blackArrowRight.svg'
import LogoutIcon from '../../assets/icon/logout.svg?react'
import SignupIcon from '../../assets/icon/signup.svg?react'
import type { SidebarProps } from '../../types/common'
import CommonModal from './CommonModal'
import { useNavigate } from 'react-router-dom'
import { deleteUser, logout } from '../../api'
import { useUserStore } from '../../stores/useUserStore'
import showToast from './CommonToast'
import useClosenessStore from '../../stores/useClosenessStore'
import useRoomIdStore from '../../stores/useRoomIdStore'
import { useCoachStore, useModalStore } from '../../stores/useUiStateStore'

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
  const userId = useUserStore(state => state.id)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      // 마운트 후 약간 딜레이 후 애니메이션 시작
      setTimeout(() => setIsActive(true), 150)
    } else {
      setIsActive(false)
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!visible) return null

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

  const handleConfirm = async () => {
    if (modalType === 'logout') {
      try {
        await logout()
        useUserStore.getState().reset() // 상태 초기화
        useClosenessStore.getState().reset()
        useRoomIdStore.getState().reset()
        useCoachStore.getState().reset()
        useModalStore.getState().reset()
        onClose()
        navigate('/login')
      } catch (error) {
        showToast({ message: 'Failed to log out. Please try again', iconType: 'error' })
        console.error('로그아웃 실패:', error)
      }
    } else if (modalType === 'signup') {
      try {
        await deleteUser(userId)
        useUserStore.getState().reset()
        useClosenessStore.getState().reset()
        useRoomIdStore.getState().reset()
        useCoachStore.getState().reset()
        useModalStore.getState().reset()
        onClose()
        navigate('/login')
      } catch (error) {
        showToast({ message: 'Failed to delete account. Please try again', iconType: 'error' })
        console.error('회원 탈퇴 실패:', error)
      }
    }
    setModalOpen(false)
  }

  const handleCancel = () => {
    setModalOpen(false)
  }

  const openAboutPdf = () => {
    onClose()
    const pdfUrl = `${import.meta.env.BASE_URL}docs/${encodeURIComponent('도란도란 서비스 소개서.pdf')}`
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const goPolicy = (term: 'service' | 'privacy') => {
    onClose()
    navigate(`/policy/${term}`, {
      state: { hideConfirm: true, from: 'sidebar' },
    })
  }

  const goForm = () => {
    onClose()
    window.open('https://forms.gle/dRBuvgKjwK7enscy6', '_blank')
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 z-50 h-screen bg-black transition-opacity duration-300 ${
          isActive ? 'opacity-80' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 사이드바 */}
      <div
        className={`absolute top-0 left-0 z-60 bg-[#fafafa] h-full w-[303px] transform transition-transform duration-300 ease-in-out ${
          isActive ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 닫기 버튼 */}
        <button className="absolute top-6 right-6" onClick={onClose} aria-label="닫기">
          <CloseIcon />
        </button>
        {/* 컨텐츠 */}
        <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
          {/* 메뉴 리스트 */}
          <div className="flex flex-col gap-y-1 mt-20 py-2 text-[14px] border-t border-b border-gray-80">
            <button className={menuBtn} onClick={openAboutPdf}>
              About the Service
              <img src={RightArrowIcon} />
            </button>
            <button className={menuBtn} onClick={() => goPolicy('service')}>
              Terms of Service
              <img src={RightArrowIcon} />
            </button>
            <button className={menuBtn} onClick={() => goPolicy('privacy')}>
              Privacy Policy
              <img src={RightArrowIcon} />
            </button>
            <button className={menuBtn} onClick={() => goForm()}>
              Contact Us
              <img src={RightArrowIcon} />
            </button>
          </div>

          {/* 하단 버튼 그룹 */}
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

      {/* 모달 */}
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

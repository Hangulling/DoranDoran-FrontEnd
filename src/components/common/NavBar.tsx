import type React from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg'
import CloseIcon from '../../assets/icon/close.svg'
import BookmarkIcon from '../../assets/icon/bookmark.svg?react'
import MainLogo from '../../assets/main/mainLogo.svg'
import Hamburger from '../../assets/icon/hamburger.svg?react'
import useArchiveStore from '../../stores/useArchiveStore'
import Button from './Button'
import { useState } from 'react'
import type { NavBarProps } from '../../types/common'
import { useModalStore } from '../../stores/useUiStateStore'
import ExitModal from '../chat/ExitModal'

const NavBar: React.FC<NavBarProps & { onToggleSidebar?: () => void }> = ({
  title,
  isMain,
  showBookmark,
  showDelete,
  onToggleSidebar,
}) => {
  const navigate = useNavigate()
  const { selectionMode, deleteMode, enterSelectionMode, exitSelectionMode, selectAll, delectAll } =
    useArchiveStore()
  const noShowAgain = useModalStore(state => state.noShowAgain)
  const [modalOpen, setModalOpen] = useState(false)
  const chatMatch = useMatch('/chat/:id')
  const isChatPage = Boolean(chatMatch) // 채팅페이지인지 확인
  const closenessMatch = useMatch('/closeness/:id')
  const archiveMatch = useMatch('/archive/:id')
  const currentId = chatMatch?.params.id ?? closenessMatch?.params.id ?? archiveMatch?.params.id
  console.log(currentId, 'currentId')
  // 뒤로가기
  const goBack = () => {
    if (chatMatch) {
      if (noShowAgain) {
        navigate('/')
      } else {
        setModalOpen(true)
      }
    } else {
      navigate(-1)
    }
  }

  // 채팅창 뒤로가기 확인 모달
  const handleConfirm = () => {
    setModalOpen(false)
    navigate('/')
  }

  const handleCancel = () => {
    setModalOpen(false)
  }

  // 북마크 바로가기
  const handleBookmarkClick = () => {
    if (!currentId) {
      navigate('/archive/2')
      return
    }

    if (chatMatch || closenessMatch) {
      navigate(`/archive/${currentId}`, { state: { from: 'chat' } })
    } else {
      navigate(`/chat/${currentId}`)
    }
    // if (chatMatch) {
    //   navigate(`/archive/${currentId}`, { state: { from: 'chat' } })
    // } else if (closenessMatch) {
    //   navigate(`/archive/${currentId}`)
    // } else {
    //   navigate(`/chat/${currentId}`)
    // }
  }

  return (
    <>
      <div
        className={`mx-auto w-full max-w-md inset-x-0 navbar bg-white h-15 min-h-15 p-0 z-50
        ${isChatPage ? '' : 'shadow-[0_1px_2px_rgba(0,0,0,0.12)]'}
      `}
      >
        <div className="navbar-start ml-5">
          {/* 뒤로가기 */}
          {!isMain && !selectionMode && (
            <button onClick={goBack}>
              <img src={LeftArrowIcon} alt="뒤로가기" />
            </button>
          )}

          {selectionMode && (
            <Button onClick={exitSelectionMode}>
              <img src={CloseIcon} />
            </Button>
          )}

          {/* 햄버거 */}
          {isMain && !selectionMode && (
            <button onClick={onToggleSidebar}>
              <Hamburger />
            </button>
          )}
        </div>

        {/* 로고 및 페이지이름 */}
        <div className="navbar-center">
          {/* 임시 Link */}
          {isMain ? (
            <Link to="/login">
              <img src={MainLogo} alt="메인로고" />
            </Link>
          ) : (
            <a className="text-title text-[16px] normal-case">{title}</a>
          )}
        </div>

        <div className="navbar-end mr-5">
          {/* 북마크 */}
          {showBookmark && (
            <button onClick={handleBookmarkClick}>
              <BookmarkIcon />
            </button>
          )}

          {/* 보관함 삭제 버튼 */}
          {showDelete && !selectionMode && (
            <Button variant="archive" className=" mr-1" onClick={enterSelectionMode}>
              Delete
            </Button>
          )}
          {selectionMode && !deleteMode && (
            <Button variant="archive" onClick={selectAll}>
              Select all{' '}
            </Button>
          )}
          {selectionMode && deleteMode && (
            <Button variant="archive" onClick={delectAll}>
              Deselect All
            </Button>
          )}
        </div>
      </div>
      {/* 나가기 확인 모달 */}
      <ExitModal open={modalOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
    </>
  )
}

export default NavBar

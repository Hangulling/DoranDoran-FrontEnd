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
import Sidebar from './SideBar'
import type { NavBarProps } from '../../types/common'

const NavBar: React.FC<NavBarProps> = ({ title, isMain, showBookmark, showDelete }) => {
  const navigate = useNavigate()
  const { selectionMode, deleteMode, enterSelectionMode, exitSelectionMode, selectAll, delectAll } =
    useArchiveStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chatMatch = useMatch('/chat/:id')
  const closenessMatch = useMatch('/closeness/:id')
  const archiveMatch = useMatch('/archive/:id')
  const currentId = chatMatch?.params.id ?? closenessMatch?.params.id ?? archiveMatch?.params.id

  // 뒤로가기
  const goBack = () => {
    navigate(-1)
  }

  const handleBookmarkClick = () => {
    if (!currentId) {
      navigate('/archive/2')
      return
    }
    if (chatMatch) {
      navigate(`/archive/${currentId}`)
    } else if (closenessMatch) {
      navigate(`/archive/${currentId}`)
    } else {
      navigate(`/chat/${currentId}`)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(open => !open)
  }

  return (
    <div className="fixed top-0 mx-auto w-full max-w-md left-1/2 translate-x-[-50%] navbar bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] h-15 min-h-15 p-0 z-50">
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
          <button onClick={toggleSidebar}>
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
            Delete All
          </Button>
        )}
      </div>

      {/* 사이드바 표시 */}
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
    </div>
  )
}

export default NavBar

import type React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg'
import CloseIcon from '../../assets/icon/close.svg'
import BookmarkIcon from '../../assets/icon/bookmark.svg?react'
import MainLogo from '../../assets/main/mainLogo.svg'
import useArchiveStore from '../../stores/useArchiveStore'
import Button from './Button'

interface NavBarProps {
  title?: string
  isMain?: boolean
  showBookmark?: boolean
  showDelete?: boolean
}

const NavBar: React.FC<NavBarProps> = ({ title, isMain, showBookmark, showDelete }) => {
  const navigate = useNavigate()
  const { selectionMode, deleteMode, enterSelectionMode, exitSelectionMode, selectAll, delectAll } =
    useArchiveStore()
  // 뒤로가기
  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="mx-auto w-full max-w-md left-1/2 navbar bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] h-15 min-h-15 p-0">
      {/* 뒤로가기 */}
      <div className="navbar-start ml-5">
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
          <button>
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
    </div>
  )
}

export default NavBar

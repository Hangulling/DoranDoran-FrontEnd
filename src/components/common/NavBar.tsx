import type React from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg?react'
import CloseIcon from '../../assets/icon/close.svg'
import BookmarkIcon from '../../assets/icon/bookmark.svg?react'
import MainLogo from '../../assets/main/mainLogo.svg'
import Hamburger from '../../assets/icon/hamburger.svg?react'
import useArchiveStore from '../../stores/useArchiveStore'
import Button from './Button'
import type { NavBarProps } from '../../types/common'
import { BOT_TO_ROOM } from '../../types/archive'

const NavBar: React.FC<NavBarProps & { onToggleSidebar?: () => void }> = ({
  title,
  isMain,
  showBookmark,
  showDelete,
  onToggleSidebar,
}) => {
  const navigate = useNavigate()

  const {
    items,
    activeRoom,
    selectionMode,
    deleteMode,
    enterSelectionMode,
    exitSelectionMode,
    selectAll,
    deselectAll,
  } = useArchiveStore()

  const chatMatch = useMatch('/chat/:id')
  const isChatPage = Boolean(chatMatch)
  const closenessMatch = useMatch('/closeness/:id')
  const archiveMatch = useMatch('/archive/:id')
  const currentId = chatMatch?.params.id ?? closenessMatch?.params.id ?? archiveMatch?.params.id

  // 뒤로가기
  const goBack = () => {
    navigate(-1)
  }

  // 북마크 바로가기
  const handleBookmarkClick = () => {
    if (!currentId) {
      navigate('/archive/1')
      return
    }
    if (chatMatch || closenessMatch) {
      navigate(`/archive/${currentId}`, { state: { from: 'chat' } })
    }
  }

  const hasAnyInRoom = items.some(i => BOT_TO_ROOM[i.botType] === activeRoom)

  return (
    <>
      <div
        className={`mx-auto w-full max-w-md inset-x-0 navbar bg-white h-15 min-h-15 p-0
        ${isChatPage ? '' : 'shadow-[0_1px_2px_rgba(0,0,0,0.12)]'}`}
      >
        <div className="navbar-start ml-5">
          {/* 뒤로가기 */}
          {!isMain && !selectionMode && (
            <button onClick={goBack}>
              <LeftArrowIcon className="gray-400" />
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
          {isMain ? (
            <img src={MainLogo} alt="메인로고" />
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
          {showDelete && !selectionMode && hasAnyInRoom && (
            <Button variant="archive" className="mr-1" onClick={enterSelectionMode}>
              Delete
            </Button>
          )}

          {selectionMode && !deleteMode && hasAnyInRoom && (
            <Button variant="archive" onClick={selectAll}>
              Select all
            </Button>
          )}

          {selectionMode && deleteMode && hasAnyInRoom && (
            <Button variant="archive" onClick={deselectAll}>
              Deselect All
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default NavBar

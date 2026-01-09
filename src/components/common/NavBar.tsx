import React from 'react'
import { useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg?react'
import CloseIcon from '../../assets/icon/close.svg'
import HomeIcon from '../../assets/icon/home.svg?react'
import MyIcon from '../../assets/icon/my.svg?react'
import SavedIcon from '../../assets/icon/saved.svg?react'
import useArchiveStore from '../../stores/useArchiveStore'
import Button from './Button'
import type { NavBarProps } from '../../types/common'
import { BOT_TO_ROOM } from '../../types/archive'
import { useNavBar } from '../../hooks/useNavBarAction'

const NavBar: React.FC<NavBarProps & { position?: 'top' | 'bottom' }> = ({
  title,
  isMain,
  showDelete,
  position = 'bottom',
}) => {
  const navigate = useNavigate()
  const { goBack, isChatPage } = useNavBar()

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

  const hasAnyInRoom = items.some(i => BOT_TO_ROOM[i.botType] === activeRoom)

  const positionStyle =
    position === 'top'
      ? 'shadow-[0_1px_2px_rgba(0,0,0,0.08)] border-b border-gray-100 h-15 min-h-15' // 상단
      : 'shadow-[0_-1px_4px_0_rgba(0,0,0,0.06)] border-t border-gray-100 h-[62px] min-h-[62px]' // 하단

  const iconColor = (path: string) => {
    const isActive =
      path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(path)

    return isActive
      ? 'text-gray-800 fill-current'
      : 'text-gray-300 fill-none active:text-gray-800 fill-current transition-colors'
  }

  return (
    <>
      <div
        className={`mx-auto w-full max-w-md inset-x-0 navbar bg-gray-0 p-0
        ${isChatPage ? '' : positionStyle}`}
      >
        {position === 'bottom' ? (
          <div className="flex w-full justify-between items-center px-[40px] h-full">
            <button
              onClick={() => navigate('/archive')}
              className={iconColor('/archive')}
            >
              <SavedIcon />
            </button>

            <button onClick={() => navigate('/')} className={iconColor('/')}>
              <HomeIcon />
            </button>

            <button
              onClick={() => navigate('/mypage')}
              className={iconColor('/mypage')}
            >
              <MyIcon />
            </button>
          </div>
        ) : (
          <>
            <div className="navbar-start ml-5">
              {/* 뒤로가기 */}
              {!isMain && !selectionMode && (
                <button onClick={goBack}>
                  <LeftArrowIcon className="gray-400" />
                </button>
              )}

              {/* 선택 모드 */}
              {selectionMode && (
                <Button onClick={exitSelectionMode}>
                  <img src={CloseIcon} />
                </Button>
              )}
            </div>

            {/* 로고 및 페이지이름 */}
            <div className="navbar-center">
              {<a className="text-title text-[16px] normal-case">{title}</a>}
            </div>

            <div className="navbar-end mr-5">
              {/* 보관함 삭제 버튼 */}
              {showDelete && !selectionMode && hasAnyInRoom && (
                <Button
                  variant="archive"
                  className="mr-1"
                  onClick={enterSelectionMode}
                >
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
          </>
        )}
      </div>
    </>
  )
}

export default NavBar

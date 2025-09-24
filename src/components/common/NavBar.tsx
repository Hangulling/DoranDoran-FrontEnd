import type React from 'react'
import { useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/icon/leftArrow.svg'
import BookMarkIcon from '../../assets/icon/bookMark.svg'

interface NavBarProps {
  title?: string
  isMain?: boolean
}

const NavBar: React.FC<NavBarProps> = ({ title, isMain }) => {
  const navigate = useNavigate()

  // 뒤로가기
  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="navbar bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] h-15 min-h-15 p-0">
      {/* 뒤로가기 */}
      <div className="navbar-start ml-[20px]">
        {!isMain && (
          <button onClick={goBack}>
            <img src={LeftArrowIcon} alt="뒤로가기" />
          </button>
        )}
      </div>

      {/* 로고 및 페이지이름 */}
      <div className="navbar-center">
        <a className="text-title text-[16px] normal-case">{title || '채팅방이름'}</a>
      </div>

      {/* 북마크 */}
      <div className="navbar-end mr-[20px]">
        <button>
          <img src={BookMarkIcon} alt="북마크" />
        </button>
      </div>
    </div>
  )
}

export default NavBar

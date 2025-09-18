import type React from 'react'
import { useNavigate } from 'react-router-dom'
import LeftArrowIcon from '../../assets/leftArrowIcon.svg'
import BookMarkIcon from '../../assets/bookMarkIcon.svg'

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
    <div className="navbar bg-base-100 shadow-sm">
      {/* 뒤로가기 */}
      <div className="navbar-start">
        {!isMain && (
          <button onClick={goBack} className="btn btn-ghost btn-circle">
            <img src={LeftArrowIcon} alt="Left Arrow" />
          </button>
        )}
      </div>

      {/* 로고 및 페이지이름 */}
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl normal-case">{title || '채팅방이름'}</a>
      </div>

      {/* 북마크 */}
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <img src={BookMarkIcon} alt="Book Mark" />
        </button>
      </div>
    </div>
  )
}

export default NavBar

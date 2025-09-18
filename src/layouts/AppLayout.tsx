import type React from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from '../components/common/NavBar'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const skipNavPaths = ['/login', '/signup'] // 로그인 회원가입 경로 추후 수정

  const hideNavBar = skipNavPaths.includes(location.pathname)

  const { pathname } = location
  const isMain = pathname === '/'

  // 메인페이지에서 로고 표시, 뒤로가기 미표시
  return (
    <div>
      {!hideNavBar && (
        <NavBar isMain={isMain} title={isMain ? 'Logo' : pathname.replace('/', '')} />
      )}
      <main>{children}</main>
    </div>
  )
}

export default AppLayout

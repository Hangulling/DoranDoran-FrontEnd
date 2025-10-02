import type React from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from '../components/common/NavBar'
import useArchiveStore from '../stores/useArchiveStore'

interface AppLayoutProps {
  children: React.ReactNode
}

const pageTitles: Record<string, string> = {
  '/': '',
  '/signup': 'Sign Up',
  '/archive': 'Archive',
}

const chatRoomNames: Record<string, string> = {
  '1': 'Senior',
  '2': 'Honey',
  '3': 'Coworker',
  '4': 'Client',
}

const showBookmarkPaths = ['/', '/chat']
const showDeletePaths = ['/archive']

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const skipNavPaths = ['/login'] // 로그인 경로 추후 수정
  const pathname = location.pathname

  const isMain = pathname === '/'
  const hideNavBar = skipNavPaths.includes(pathname)
  const showBookmark = showBookmarkPaths.includes(pathname)
  const showDelete = showDeletePaths.includes(pathname)

  // 채팅방 id
  const chatRoomMatch = pathname.match(/^\/chat\/(\d+)$/)
  const chatRoomId = chatRoomMatch ? chatRoomMatch[1] : null

  const { selectionMode } = useArchiveStore()

  // 타이틀
  let title = ''
  if (chatRoomId) {
    title = chatRoomNames[chatRoomId] || `채팅방 ${chatRoomId}`
  } else {
    title = pageTitles[pathname] || '페이지'
  }

  if (selectionMode) {
    title = 'Delete'
  }

  return (
    <div className="mx-auto w-full max-w-md pt-15">
      {!hideNavBar && (
        <NavBar isMain={isMain} title={title} showBookmark={showBookmark} showDelete={showDelete} />
      )}
      <main>{children}</main>
    </div>
  )
}

export default AppLayout

import type React from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import NavBar from '../components/common/NavBar'
import useArchiveStore from '../stores/useArchiveStore'

interface AppLayoutProps {
  children: React.ReactNode
}

const pageTitles: Record<string, string> = {
  '/': '',
  '/chat': 'Chat', // 추후 삭제
  '/signup': 'Sign Up',
  '/archive': 'Archive',
}

const chatRoomNames: Record<string, string> = {
  '1': 'Senior',
  '2': 'Honey',
  '3': 'Coworker',
  '4': 'Client',
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const skipNavPaths = ['/login'] // 로그인 경로 추후 수정
  const pathname = location.pathname
  const isMain = pathname === '/'
  const onChat = !!useMatch('/chat/:id')
  const onArchive = !!useMatch('/archive/:id')
  const showBookmark = isMain || onChat
  const showDelete = onArchive
  const hideNavBar = skipNavPaths.includes(pathname)

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

  if (onArchive) {
    title = 'Archive'
  }

  if (selectionMode) {
    title = 'Delete'
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {!hideNavBar && (
        <NavBar isMain={isMain} title={title} showBookmark={showBookmark} showDelete={showDelete} />
      )}
      <main>{children}</main>
    </div>
  )
}

export default AppLayout

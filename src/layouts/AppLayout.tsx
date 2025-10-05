import type React from 'react'
import { useLocation, useMatch } from 'react-router-dom'
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

const showBookmarkPaths = ['/']

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const skipNavPaths = ['/login']
  const pathname = location.pathname

  const isMain = pathname === '/'
  const onArchive = !!useMatch('/archive/:id')
  const showDelete = onArchive
  const hideNavBar = skipNavPaths.includes(pathname)

  // 채팅방 id
  const chatRoomMatch = pathname.match(/^\/(chat|closeness)\/(\d+)$/)
  const chatRoomId = chatRoomMatch ? chatRoomMatch[2] : null

  const showBookmark = showBookmarkPaths.includes(pathname) || chatRoomId !== null

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
    <div className="mx-auto flex h-screen w-full max-w-md flex-col">
      {!hideNavBar && (
        <header className="flex-shrink-0">
          <NavBar
            isMain={isMain}
            title={title}
            showBookmark={showBookmark}
            showDelete={showDelete}
          />
          <div className="h-14" />
        </header>
      )}
      <main className="flex-grow overflow-y-auto min-h-0">{children}</main>
    </div>
  )
}

export default AppLayout

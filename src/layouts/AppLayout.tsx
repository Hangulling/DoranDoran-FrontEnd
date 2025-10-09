import type React from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import NavBar from '../components/common/NavBar'
import useArchiveStore from '../stores/useArchiveStore'
import ClosenessBar from '../components/chat/ClosenessBar'

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

  // 친밀도 바(채팅에서만)
  const closenessMatch = pathname.match(/^\/chat\/(\d+)$/)
  const closenessId = closenessMatch ? closenessMatch[1] : null

  // 북마크(채팅/친밀)
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
    <div className="mx-auto flex h-vdh w-full max-w-md flex-col">
      {!hideNavBar && (
        <>
          <header className="flex-shrink-0">
            <NavBar
              isMain={isMain}
              title={title}
              showBookmark={showBookmark}
              showDelete={showDelete}
            />
            <div className="h-15" />
          </header>
          {/* 친밀도 바 */}
          {closenessId && <ClosenessBar chatRoomId={closenessId} />}
        </>
      )}
      <main className="flex-grow min-h-0">{children}</main>
    </div>
  )
}

export default AppLayout

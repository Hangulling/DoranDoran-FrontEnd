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

  const navBarHeight = 60
  const closenessBarHeight = closenessId ? 33 : 0

  return (
    <div className="mx-auto w-full max-w-md flex flex-col h-screen relative">
      {!hideNavBar && (
        <>
          <header className="fixed top-0 left-0 right-0 z-50" style={{ height: navBarHeight }}>
            <NavBar
              isMain={isMain}
              title={title}
              showBookmark={showBookmark}
              showDelete={showDelete}
            />
          </header>

          {closenessId && (
            <div
              className="fixed left-0 right-0 z-50"
              style={{ top: navBarHeight, height: closenessBarHeight }}
            >
              <ClosenessBar chatRoomId={closenessId} />
            </div>
          )}

          {/* NavBar + 친밀도 바 높이만큼 공간 확보용 빈 div */}
          <div style={{ height: navBarHeight + closenessBarHeight }} />
        </>
      )}

      <main className="flex-grow overflow-y-auto min-h-0">{children}</main>
    </div>
  )
}

export default AppLayout

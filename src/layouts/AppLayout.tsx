import type React from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import NavBar from '../components/common/NavBar'
import useArchiveStore from '../stores/useArchiveStore'
import ClosenessBar from '../components/chat/ClosenessBar'
import { useState } from 'react'
import Sidebar from '../components/common/SideBar'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen(open => !open)
  const location = useLocation()
  const pathname = location.pathname
  const skipNavPaths = ['/login']

  const isMain = pathname === '/'

  const archiveMatch = useMatch('/archive/:id')
  const onArchive = !!archiveMatch
  const archiveId = archiveMatch?.params.id

  const showDelete = onArchive
  const hideNavBar = skipNavPaths.includes(pathname)

  // 친밀도 바(채팅에서만)
  const closenessMatch = pathname.match(/^\/chat\/(\d+)$/)
  const closenessId = closenessMatch ? closenessMatch[1] : null

  // 북마크(채팅/친밀)
  const chatRoomMatch = pathname.match(/^\/(chat|closeness)\/(\d+)$/)
  const chatRoomId = chatRoomMatch ? chatRoomMatch[2] : null
  const showBookmark = showBookmarkPaths.includes(pathname) || chatRoomId !== null

  const fromChat = (location.state as { from?: string } | null)?.from === 'chat'

  const { selectionMode } = useArchiveStore()

  const isChatPage = /^\/chat\//.test(location.pathname)

  // 타이틀
  let title = ''
  if (selectionMode) {
    title = 'Delete'
  } else if (onArchive) {
    title =
      (fromChat && archiveId && (chatRoomNames[archiveId] || `채팅방 ${archiveId}`)) || 'Archive'
  } else if (chatRoomId) {
    title = chatRoomNames[chatRoomId] || `채팅방 ${chatRoomId}`
  } else {
    title = pageTitles[pathname] || '페이지'
  }

  return (
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      {!hideNavBar && (
        <>
          <NavBar
            isMain={isMain}
            title={title}
            showBookmark={showBookmark}
            showDelete={showDelete}
            onToggleSidebar={toggleSidebar}
          />
          {closenessId && <ClosenessBar chatRoomId={closenessId} />}
        </>
      )}
      <main
        className={`flex flex-col flex-grow min-h-0 ${
          isChatPage ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export default AppLayout

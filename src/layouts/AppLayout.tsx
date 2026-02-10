import type React from 'react'
import { useLocation, useMatch } from 'react-router-dom'
import NavBar from '../components/common/NavBar'
import useArchiveStore from '../stores/useArchiveStore'
import { useEffect } from 'react'
import { startIdleTimer, stopIdleTimer } from '../utils/idleTimer'
import { isNativeApp } from '../utils/isNativeApp'

interface AppLayoutProps {
  children: React.ReactNode
}

const pageTitles: Record<string, string> = {
  '/': '',
  '/signup': 'Sign Up',
  '/login/email': 'Continue with Email',
  '/archive/sentences': 'Sentences',
  '/archive/words': 'Words',
}

const chatRoomNames: Record<string, string> = {
  '1': 'Friend',
  '2': 'Honey',
  '3': 'Coworker',
  '4': 'Senior',
}

const agreementTitles: Record<string, string> = {
  service: 'Terms of Service',
  privacy: 'Privacy Policy',
}

const showBookmarkPaths = ['/']

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const pathname = location.pathname
  const native = isNativeApp()

  // 알 수 없는 페이지 (*)
  const knownPatterns = [
    /^\/$/,
    /^\/signup(?:\/|$)/,
    /^\/login(?:\/|$)/,
    /^\/archive(?:\/|$)/,
    /^\/chat(?:\/|$)/,
    /^\/closeness(?:\/|$)/,
    /^\/policy(?:\/|$)/,
    /^\/error(?:\/|$)/,
    /^\/onboarding(?:\/|$)/,
    /^\/find-email(?:\/|$)/,
    /^\/find-password(?:\/|$)/,
    /^\/mypage(?:\/|$)/,
    /^\/insta(?:\/|$)/,
  ]
  const isKnownPath = knownPatterns.some(rx => rx.test(pathname))
  const isUnknownPath = !isKnownPath

  const skipNavPaths = ['/error', '/onboarding', '/chat']

  // 로그인 필요없는 페이지
  const isPublicPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/policy') ||
    pathname.startsWith('/error') ||
    pathname.startsWith('/find-email') ||
    pathname.startsWith('/find-password') ||
    isUnknownPath

  // 비활성 타이머 로직
  useEffect(() => {
    if (isPublicPage || native) {
      stopIdleTimer()
    } else {
      startIdleTimer()
    }
    return () => {
      stopIdleTimer()
    }
  }, [isPublicPage, native]) // 경로가 바뀔 때마다 실행

  const isMain = pathname === '/'

  const archiveMatch = useMatch('/archive/sentences')
  const wordMatch = useMatch('/archive/words')
  const onArchive = !!archiveMatch || !!wordMatch
  const agreementMatch = useMatch('/policy/:id')
  const agreementId = agreementMatch?.params.id

  const showDelete = onArchive
  const state = location.state as { from?: string } | null

  const hideNavBar =
    skipNavPaths.some(p => pathname.startsWith(p)) ||
    isUnknownPath ||
    (pathname.startsWith('/error') && state?.from === 'signup') ||
    pathname === '/login'

  // navbar 상단 고정 경로
  const topNavPaths = [
    '/signup',
    '/login/email',
    '/find-email',
    '/find-password',
    '/archive/sentences',
    '/archive/words',
    '/mypage/profile',
    '/insta',
    '/policy/service',
    '/policy/privacy',
  ]

  const isTopNav = topNavPaths.some(path => pathname.startsWith(path))

  // 북마크(채팅/친밀)
  const chatRoomMatch = pathname.match(/^\/(chat|closeness)\/(\d+)$/)
  const chatRoomId = chatRoomMatch ? chatRoomMatch[2] : null
  const showBookmark =
    showBookmarkPaths.includes(pathname) || chatRoomId !== null

  const { selectionMode } = useArchiveStore()

  // 타이틀
  let title = ''
  if (selectionMode) {
    title = 'Delete'
  } else if (chatRoomId) {
    title = chatRoomNames[chatRoomId] || `채팅방 ${chatRoomId}`
  } else if (agreementId) {
    title = agreementTitles[agreementId]
  } else if (pathname.startsWith('/find-email')) {
    title = 'Find your Email'
  } else if (pathname.startsWith('/find-password')) {
    title = 'Reset Password'
  } else if (pathname.startsWith('/signup')) {
    title = 'Sign Up'
  } else if (pathname.startsWith('/login')) {
    title = pathname === '/login' ? '' : 'Continue with Email'
  } else if (pathname.startsWith('/mypage')) {
    title = pathname === '/mypage' ? '' : 'My Profile'
  } else if (pathname.startsWith('/insta')) {
    title = 'Learning from Instagram'
  } else {
    title = pageTitles[pathname] || '페이지'
  }

  return (
    <div
      className={`relative mx-auto flex h-full w-full flex-col overflow-x-hidden ${'max-w-app md:max-w-tablet lg:max-w-desktop transition-all duration-300'} ${isMain ? 'pt-0' : 'pt-[env(safe-area-inset-top)]'}`}
    >
      {/* 상단 네비게이션 바 */}
      {!hideNavBar && isTopNav && (
        <header className="sticky top-0 shrink-0 z-40 bg-white">
          <NavBar
            position="top"
            isMain={isMain}
            title={title}
            showBookmark={showBookmark}
            showDelete={showDelete}
          />
        </header>
      )}

      <main id="app-scroll" className={'flex-grow min-h-0 overflow-y-auto'}>
        {children}
      </main>

      {/* 하단 네비게이션 바 */}
      {!hideNavBar && !isTopNav && (
        <footer
          className={
            'sticky bottom-0 shrink-0 z-40 bg-white pb-[env(safe-area-inset-bottom)]'
          }
        >
          <NavBar
            position="bottom"
            isMain={isMain}
            title={title}
            showBookmark={showBookmark}
            showDelete={showDelete}
          />
        </footer>
      )}
    </div>
  )
}

export default AppLayout
